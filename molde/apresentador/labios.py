"""Sincronia labial sem baixar nada: a forma da boca em cada quadro (24 fps), a partir da voz do molde.
uso:   python labios.py <pasta voices> <saida labios.json> [--fps 24]
teste: python labios.py --teste
Lê <voices>/words.json e <id>.wav (gerados por molde/tools/tts_words.py) e escreve
  {"fps": 24, "falas": {"L01": {"v": "RRMAAEE...", "a": [0, 0, 0, 62, 85, ...]}, ...}}
v: uma letra por quadro: A E I O U, M (fechada: M, B, P) ou R (repouso). a: abertura 0-100.
A energia do áudio abre e fecha a boca; a vogal da palavra que está sendo dita dá a forma."""

import argparse
import json
import os
import re

import numpy as np
import soundfile as sf

VOG = dict(zip("aáàâãeéêiíyoóôõuúü", "AAAAAEEEIIIOOOOUUU"))
FECHA = 0.12  # abertura abaixo disso = boca em repouso


def fonemas(palavra):
    """Palavra → [(visema, peso)]. Vogal pesa 1, consoante 0,5. M/B/P fecham a boca (o m nasal de "bem", "campo" não);
    as outras consoantes herdam a vogal seguinte. O e E átonos no fim viram U e I, como se fala ("carro" → carru)."""
    w = re.sub(r"[^a-zà-ÿ]", "", palavra.lower())
    vogais = [i for i, c in enumerate(w) if c in VOG]
    ult = vogais[-1] if vogais else -1
    seq = []
    for i, c in enumerate(w):
        prv, nxt = w[i - 1] if i else "", w[i + 1] if i + 1 < len(w) else ""
        if c in VOG:
            if c in "uü" and prv in "qg" and nxt and nxt in "eiéêí":
                continue  # "que", "guia": u mudo
            v = VOG[c]
            if i == ult and w[i + 1 :] in ("", "s") and c in "oe":
                v = "U" if c == "o" else "I"
            seq.append([v, 1.0])
        elif c in "bp" or (c == "m" and nxt in VOG):
            seq.append(["M", 0.6])
        elif c not in "hm":
            seq.append([None, 0.5])
    for k in range(
        len(seq)
    ):  # consoante: vogal seguinte; no fim da palavra, a anterior
        if seq[k][0] is None:
            nxt = next((v for v, _ in seq[k:] if v not in (None, "M")), None)
            prv = next((v for v, _ in reversed(seq[:k]) if v not in (None, "M")), None)
            seq[k][0] = nxt or prv or "E"
    return [tuple(x) for x in seq]


def abertura(y, sr, n, fps):
    """Energia RMS por quadro (janela de 1 quadro) → 0..1, relativa ao pico da própria fala.
    A voz do edge-tts é comprimida: quase tudo fica a até 10 dB do pico, por isso a faixa é curta (16 dB → 2 dB)."""
    hop, half = sr / fps, int(sr / fps / 2)
    rms = np.zeros(n)
    for f in range(n):
        c = int((f + 0.5) * hop)
        s = y[max(0, c - half) : c + half]
        rms[f] = np.sqrt(np.mean(s * s)) if len(s) else 0.0
    db = 20 * np.log10(rms + 1e-9)
    ref = np.percentile(db, 95)
    o = np.clip(
        (db - (ref - 16)) / 14, 0, 1
    )  # 16 dB abaixo do pico = fechada; 2 dB abaixo = toda aberta
    o[o < 0.15] = 0
    return o


def suaviza(o):
    """Abre rápido, fecha um pouco mais devagar e passa um filtro de 3 quadros: a boca não treme."""
    s, x = np.zeros_like(o), 0.0
    for i, v in enumerate(o):
        x += (v - x) * (0.65 if v > x else 0.4)
        s[i] = x
    return np.convolve(np.pad(s, 1, mode="edge"), [0.25, 0.5, 0.25], "valid")


def runs(v):
    out, i = [], 0
    while i < len(v):
        j = i
        while j < len(v) and v[j] == v[i]:
            j += 1
        out.append((i, j))
        i = j
    return out


def labios(y, sr, words, fps=24):
    n = max(1, int(np.ceil(len(y) / sr * fps)))
    vis = [None] * n
    closes = []
    for wd in words:
        seq = fonemas(wd["w"])
        if not seq:
            continue
        t0 = max(0.0, wd["t0"])
        t1 = max(t0 + 1 / fps, wd["t1"])
        tot, acc = sum(p for _, p in seq), t0
        for v, p in seq:
            d = (t1 - t0) * p / tot
            if v == "M":
                closes.append(acc + d / 2)
            else:
                for f in range(
                    int(round(acc * fps)),
                    max(int(round(acc * fps)) + 1, int(round((acc + d) * fps))),
                ):
                    if 0 <= f < n:
                        vis[f] = v
            acc += d
    for tc in (
        closes
    ):  # o fechamento de M/B/P é carimbado por cima, para não sumir entre duas vogais
        f = min(n - 1, int(tc * fps))
        vis[f] = "M"
    a = suaviza(abertura(y, sr, n, fps))
    out, last = [], "E"
    for f in range(n):
        v = vis[f]
        if v == "M":
            out.append("M")
            a[f] = 0
        elif a[f] < FECHA:
            out.append("R")
            a[f] = 0
        else:
            if not v:  # som sem palavra marcada (a boca abre ~1 quadro antes): forma da próxima vogal
                v = next((x for x in vis[f + 1 : f + 6] if x and x != "M"), last)
            out.append(v)
            last = v
    for i, j in runs(
        out
    ):  # sem forma de 1 quadro só: M dura 2 quadros, as outras herdam a anterior
        if j - i == 1:
            if out[i] == "M":
                if j < n:
                    out[j], a[j] = "M", 0
            elif i > 0:
                out[i] = out[i - 1]
                if out[i] in "MR":
                    a[i] = 0
    return out, a


def _teste():
    assert [v for v, _ in fonemas("campo")] == ["A", "A", "M", "U"], fonemas("campo")
    assert [v for v, _ in fonemas("que")] == ["I", "I"], fonemas("que")
    assert [v for v, _ in fonemas("bem")] == ["M", "E"], fonemas("bem")
    assert [v for v, _ in fonemas("Pê")][:1] == ["M"]
    sr, fps = 48000, 24
    t = np.arange(int(1.4 * sr)) / sr
    y = np.where((t > 0.3) & (t < 0.8), 0.3 * np.sin(2 * np.pi * 220 * t), 0.0)
    v, a = labios(y, sr, [{"w": "mamãe", "t0": 0.3, "t1": 0.8}], fps)
    assert set(v[:5]) == {"R"}, v[
        :5
    ]  # silêncio = repouso (a boca pode abrir 1 quadro antes do som)
    assert set(v[-8:]) == {"R"}, v[-8:]
    assert "M" in v[7:12] and "A" in v, "".join(v)
    assert max(a) > 0.5 and all(a[i] == 0 for i, x in enumerate(v) if x in "MR")
    assert all(j - i >= 2 for i, j in runs(v)), "".join(v)  # nada pisca por 1 quadro
    print("labios.py: teste ok ·", "".join(v))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("voices", nargs="?")
    ap.add_argument("saida", nargs="?")
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--teste", action="store_true")
    o = ap.parse_args()
    if o.teste:
        return _teste()
    if not (o.voices and o.saida):
        ap.error("faltou <pasta voices> <saida labios.json>")
    words = json.load(open(os.path.join(o.voices, "words.json"), encoding="utf-8"))
    res = {"fps": o.fps, "falas": {}}
    for lid, ws in words.items():
        y, sr = sf.read(os.path.join(o.voices, lid + ".wav"), always_2d=True)
        v, a = labios(y.mean(axis=1), sr, ws, o.fps)
        res["falas"][lid] = {"v": "".join(v), "a": [int(round(x * 100)) for x in a]}
        cont = " ".join(f"{k}{''.join(v).count(k)}" for k in "AEIOUMR")
        print(f"{lid} {len(v):4d} quadros  {cont}")
    json.dump(res, open(o.saida, "w", encoding="utf-8"), separators=(",", ":"))
    print("labios.json:", len(res["falas"]), "falas →", o.saida)


if __name__ == "__main__":
    main()

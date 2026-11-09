"""Monta a demo do apresentador sem mexer no molde.
uso: python montar.py [pasta do vídeo, padrão molde/saida/01-calibragem-pneu]
1. Copia (só lê) o filme do molde (film.js, carro.js, models.js, engine/, fonts/) e o apresentador para esta pasta.
2. Aplica no film.js copiado as mesmas 3 trocas da integração (APRESENTADOR.md); para com erro se o film.js mudou e uma troca não encaixa.
3. Copia os dados do vídeo (timeline, cena, voices/*.json), gera dados/labios.json e o áudio do clipe (dados/clipe.wav):
   gancho + 2 falas, corte, última fala + final com a ambulância (cortes em dados/cortes.json)."""

import json
import os
import shutil
import sys

import numpy as np
import soundfile as sf

AQUI = os.path.dirname(os.path.abspath(__file__))
AP = os.path.dirname(AQUI)
MOLDE = os.path.dirname(AP)
sys.path.insert(0, AP)
from labios import labios  # noqa: E402

TROCAS = [  # (texto do film.js do molde, texto com o apresentador): exatamente uma ocorrência cada
    (
        "export function makeFilm(TL, cena, dur, words, lines) {",
        "export function makeFilm(TL, cena, dur, words, lines, AP = null) {",
    ),
    (
        "fov: 0.8, cx: 540, cy: CY };",
        "fov: 0.8, cx: 540 + (AP ? AP.dx(t) : 0), cy: CY };",
    ),
    (
        "    if (!opt.nosub) drawSub(ctx, red ? TRd : T, t);",
        "    if (AP) TX.push(AP.draw(ctx, t));\n    if (!opt.nosub) drawSub(ctx, red ? TRd : T, t);",
    ),
]


def main():
    src = os.path.abspath(
        sys.argv[1]
        if len(sys.argv) > 1
        else os.path.join(MOLDE, "saida", "01-calibragem-pneu")
    )
    for f in ("film.js", "carro.js", "models.js"):
        shutil.copy2(os.path.join(MOLDE, f), AQUI)
    for d in ("engine", "fonts"):
        shutil.copytree(
            os.path.join(MOLDE, d), os.path.join(AQUI, d), dirs_exist_ok=True
        )
    os.makedirs(os.path.join(AQUI, "apresentador"), exist_ok=True)
    shutil.copy2(
        os.path.join(AP, "apresentador.js"), os.path.join(AQUI, "apresentador")
    )
    fp = os.path.join(AQUI, "film.js")
    s = open(fp, encoding="utf-8", newline="").read()
    for a, b in (
        [] if "AP = null" in s else TROCAS
    ):  # o film.js do molde já vem integrado desde 2026-11-09
        if s.count(a) != 1:
            sys.exit(
                f"montar.py: o film.js do molde mudou; não achei (1 vez) o trecho:\n  {a}\nveja a integração em APRESENTADOR.md"
            )
        s = s.replace(a, b)
    open(fp, "w", encoding="utf-8", newline="").write(s)

    D = os.path.join(AQUI, "dados")
    os.makedirs(os.path.join(D, "voices"), exist_ok=True)
    for f in ("timeline.json", "cena.json"):
        shutil.copy2(os.path.join(src, f), D)
    for f in ("dur.json", "words.json", "lines.json"):
        shutil.copy2(os.path.join(src, "voices", f), os.path.join(D, "voices"))
    words = json.load(open(os.path.join(src, "voices", "words.json"), encoding="utf-8"))
    res = {"fps": 24, "falas": {}}
    for lid, ws in words.items():
        y, sr = sf.read(os.path.join(src, "voices", lid + ".wav"), always_2d=True)
        v, a = labios(y.mean(axis=1), sr, ws)
        res["falas"][lid] = {"v": "".join(v), "a": [int(round(x * 100)) for x in a]}
    json.dump(
        res,
        open(os.path.join(D, "labios.json"), "w", encoding="utf-8"),
        separators=(",", ":"),
    )

    TL = json.load(open(os.path.join(src, "timeline.json"), encoding="utf-8"))
    ids, vo, body = (
        TL["ids"],
        TL["vo"],
        [i for i in TL["ids"] if TL["vo"][i] < TL["outro"]],
    )
    cortes = [
        [0.0, round(vo[ids[3]] - 0.12, 3)],
        [round(vo[body[-1]] - 0.25, 3), TL["dur"]],
    ]
    json.dump(cortes, open(os.path.join(D, "cortes.json"), "w"))
    y, sr = sf.read(os.path.join(src, "mix.wav"), always_2d=True)
    xf = int(0.015 * sr)  # 15 ms de cruzamento no corte
    partes = [y[int(a * sr) : int(b * sr)] for a, b in cortes]
    ramp = np.linspace(0, 1, xf)[:, None]
    junto = np.concatenate(
        [
            partes[0][:-xf],
            partes[0][-xf:] * (1 - ramp) + partes[1][:xf] * ramp,
            partes[1][xf:],
        ]
    )
    sf.write(os.path.join(D, "clipe.wav"), junto, sr)
    dur = sum(b - a for a, b in cortes)
    print(
        f"demo montada: {len(res['falas'])} falas com boca, cortes {cortes}, clipe {dur:.2f} s ({len(junto) / sr:.2f} s de áudio)"
    )


if __name__ == "__main__":
    main()

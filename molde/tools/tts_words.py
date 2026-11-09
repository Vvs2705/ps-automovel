"""edge-tts com tempo de cada palavra (WordBoundary), para legenda karaokê e cues.
uso: python tools/tts_words.py voices/lines.json voices [--voice pt-BR-AntonioNeural] [--rate +0%]
Escreve voices/<id>.wav (48 kHz mono, silêncio das pontas cortado), voices/dur.json e voices/words.json
(words: {id: [{w, t0, t1}]} em segundos, relativos ao início do wav cortado)."""

import argparse, asyncio, json, os, subprocess, sys
import numpy as np, soundfile as sf
import edge_tts


async def synth(text, voice, rate):
    c = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    audio, words = bytearray(), []
    async for ch in c.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            t0 = ch["offset"] / 1e7
            words.append({"w": ch["text"], "t0": t0, "t1": t0 + ch["duration"] / 1e7})
    return bytes(audio), words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lines")
    ap.add_argument("out")
    ap.add_argument("--voice", default="pt-BR-AntonioNeural")
    ap.add_argument("--rate", default="+0%")
    ap.add_argument(
        "--rate-assinatura", default="+20%"
    )  # molde: a assinatura final cabe nos 3–4 s da ambulância
    a = ap.parse_args()
    lines = json.load(open(a.lines, encoding="utf-8"))
    fim = "".join(c for c in lines[-1]["text"].lower() if c.isalpha())
    if "automóvel" in fim and "boasmãos" in fim:
        lines[-1].setdefault("rate", a.rate_assinatura)
    os.makedirs(a.out, exist_ok=True)
    dur, allw = {}, {}
    for L in lines:
        mp3 = os.path.join(a.out, L["id"] + ".mp3")
        wav = os.path.join(a.out, L["id"] + ".wav")
        data, words = asyncio.run(
            synth(
                L.get("say", L["text"]), L.get("voice", a.voice), L.get("rate", a.rate)
            )
        )
        if not data or not words:
            sys.exit(f"{L['id']}: edge-tts não devolveu áudio/palavras")
        open(mp3, "wb").write(data)
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", "48000", wav],
            check=True,
        )
        y, sr = sf.read(wav)
        nz = np.flatnonzero(np.abs(y) > 10 ** (-45 / 20))
        a0 = max(0, nz[0] - int(0.03 * sr))
        a1 = nz[-1] + int(0.10 * sr)
        sf.write(wav, y[a0:a1], sr)
        os.remove(mp3)
        off = a0 / sr
        allw[L["id"]] = [
            {"w": w["w"], "t0": round(w["t0"] - off, 3), "t1": round(w["t1"] - off, 3)}
            for w in words
        ]
        dur[L["id"]] = round((a1 - a0) / sr, 3)
        print(f"{L['id']} {dur[L['id']]:5.2f}s  {len(words)} palavras")
    json.dump(dur, open(os.path.join(a.out, "dur.json"), "w"), indent=1)
    json.dump(
        allw,
        open(os.path.join(a.out, "words.json"), "w", encoding="utf-8"),
        ensure_ascii=False,
        indent=1,
    )
    print("total", round(sum(dur.values()), 2), "s")


if __name__ == "__main__":
    main()

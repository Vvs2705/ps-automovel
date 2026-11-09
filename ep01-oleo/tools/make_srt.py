"""Legenda .srt com os mesmos tempos da legenda queimada no vídeo (film.js, subOf).
uso: python tools/make_srt.py saida.srt"""

import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
dur = json.load(open(os.path.join(ROOT, "voices", "dur.json")))
lines = {
    l["id"]: l["text"]
    for l in json.load(
        open(os.path.join(ROOT, "voices", "lines.json"), encoding="utf-8")
    )
}
vo = TL["vo"]
ids = sorted(vo, key=vo.get)


def ts(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


out, n = [], 0
for i, lid in enumerate(ids):
    nxt = vo[ids[i + 1]] - 0.12 if i + 1 < len(ids) else TL["dur"]
    s0, s1 = vo[lid] - 0.1, min(nxt, vo[lid] + dur[lid] + 0.6)
    n += 1
    out.append(f"{n}\n{ts(max(0, s0))} --> {ts(s1)}\n{lines[lid]}\n")
open(sys.argv[1], "w", encoding="utf-8").write("\n".join(out))

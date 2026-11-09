"""Legenda .srt com os mesmos tempos da legenda queimada no vídeo (film.js, subOf). A assinatura final não entra.
uso: python tools/make_srt.py saida/<nome> saida/<nome>/<nome>.srt"""

import json, os, sys

D, OUT = sys.argv[1], sys.argv[2]
J = lambda *p: json.load(open(os.path.join(D, *p), encoding="utf-8"))
TL, dur, cena = J("timeline.json"), J("voices", "dur.json"), J("cena.json")
text = {l["id"]: l["text"] for l in J("voices", "lines.json")}
falas, vo = cena.get("falas", {}), TL["vo"]
ids = [i for i in TL["ids"] if i != TL["assina"]]


def ts(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


out = []
for n, lid in enumerate(ids):
    nxt = vo[ids[n + 1]] - 0.12 if n + 1 < len(ids) else TL["outro"] - 0.2
    s0, s1 = vo[lid] - 0.1, min(nxt, vo[lid] + dur[lid] + 0.6)
    out.append(
        f"{n + 1}\n{ts(max(0, s0))} --> {ts(s1)}\n{falas.get(lid, {}).get('legenda', text[lid])}\n"
    )
open(OUT, "w", encoding="utf-8").write("\n".join(out))
print("srt:", len(out), "legendas")

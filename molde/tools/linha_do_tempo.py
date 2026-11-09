"""Linha do tempo automática: cada fala começa quando a anterior termina + uma pausa curta.
uso: python tools/linha_do_tempo.py saida/<nome>
Lê voices/lines.json, voices/dur.json e cena.json; escreve timeline.json {dur, ids, vo, outro, assina, semente}.
A última fala, se for a assinatura ("Pê Ésse Automóvel ... boas mãos"), toca sobre o final da ambulância."""

import json, os, sys, unicodedata, zlib


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if c.isalnum() and not unicodedata.combining(c))


D = sys.argv[1]
J = lambda *p: json.load(open(os.path.join(D, *p), encoding="utf-8"))
lines, dur, cena = J("voices", "lines.json"), J("voices", "dur.json"), J("cena.json")
falas = cena.get("falas", {})
ids = [l["id"] for l in lines]
last = norm(lines[-1]["text"])
sign = ids[-1] if "automovel" in last and "boasmaos" in last else None

t, vo = float(cena.get("inicio", 0.3)), {}
for i, lid in enumerate(ids):
    vo[lid] = round(t, 3)
    nxt = ids[i + 1] if i + 1 < len(ids) else None
    pausa = falas.get(lid, {}).get(
        "pausa", 0.5 if nxt == sign else 0.3
    )  # antes da assinatura, tempo para a troca de cena
    t += dur[lid] + pausa
if sign:
    outro = vo[sign] - 0.15
    total = max(vo[sign] + dur[sign] + 0.45, outro + 3.2)  # final de 3–4 s
else:
    outro = vo[ids[-1]] + dur[ids[-1]] + 0.4
    total = outro + 3.5
semente = int(
    cena.get(
        "semente", zlib.crc32(os.path.basename(os.path.normpath(D)).encode()) % 10000
    )
)
poster = cena.get(
    "poster"
)  # segundos; sem valor: logo depois do 1º cartão travar, ou no meio do gancho
if poster is None:
    card = next((i for i in ids if falas.get(i, {}).get("cartao")), None)
    poster = (
        vo[card] + 0.45 * dur[card] + 1.0
        if card
        else vo[ids[0]] + min(2.0, 0.8 * dur[ids[0]])
    )
TL = {
    "poster": round(min(float(poster), outro - 0.6), 2),
    "dur": round(total, 3),
    "ids": ids,
    "vo": vo,
    "outro": round(outro, 3),
    "assina": sign,
    "semente": semente,
}
json.dump(TL, open(os.path.join(D, "timeline.json"), "w", encoding="utf-8"), indent=1)
print(
    f"linha do tempo: {len(ids)} falas, {total:.1f} s (final da ambulância: {outro:.1f} s, dura {total - outro:.1f} s), semente {semente}"
)
if total > 120:
    sys.exit(
        f"ERRO: {total:.1f} s passa do limite de 2 min do Short: corte falas no roteiro"
    )

"""Rascunho do cena.json a partir da tabela do ROTEIRO.md (colunas: id | fala | o que o holograma mostra | etiqueta).
uso: python tools/rascunho_cena.py <pasta-do-roteiro> saida/<nome>/cena.json
É um ponto de partida por palavras-chave: revise zona, estado, cartões e etiquetas antes de publicar (ver README.md).
Só lê a pasta do roteiro; escreve apenas o cena.json de saída."""

import json, os, re, sys, unicodedata

SRC, OUT = sys.argv[1], sys.argv[2]


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if not unicodedata.combining(c))


# ordem importa: o primeiro que casar no texto do holograma (depois na fala) vence
ZONAS = [
    ("estepe", ["estepe"]),
    ("lanternas", ["lanterna", "luz traseira", "luz de freio"]),
    ("farois", ["farol", "farois"]),
    ("eletrica", ["bateria", "eletric", "alternador", "fusivel", "chicote"]),
    ("painel", ["painel", "luz da injecao", "luz de", "luzes", "spia", "acende no"]),
    (
        "arrefecimento",
        [
            "radiador",
            "arrefec",
            "temperatura",
            "aquec",
            "superaquec",
            "agua",
            "ventoinha",
        ],
    ),
    ("escapamento", ["escapamento", "fumaca", "catalisador"]),
    ("cambio", ["cambio", "embreagem", "marcha", "ponto morto"]),
    ("susp_dianteira", ["suspens", "amortecedor", "mola", "bandeja"]),
    ("freios", ["freio", "pastilha", "disco", "fluido"]),
    ("pneus", ["pneu", "calibr", "banda de rodagem", "sulco", "roda"]),
    ("motor", [r"motor(?!ista)", "oleo", "vela", "injecao", "correia"]),
    ("tanque", ["tanque", "combustivel"]),
]
PONTOS = ["porta", "coluna", "tanque", "estepe", "painel", "volante", "capo", "chassi"]
ALERTA = [
    "vermelho",
    "risco",
    "estour",
    "falha",
    "defeito",
    "perigo",
    "trava",
    "alerta",
    "dano",
]
ATENCAO = ["laranja", "quente", "atencao", "cuidado", "pendente"]

rot = open(os.path.join(SRC, "ROTEIRO.md"), encoding="utf-8").read()
lines = json.load(open(os.path.join(SRC, "lines.json"), encoding="utf-8"))
rows = {}
for ln in rot.splitlines():
    m = re.match(r"\|\s*(L\d+)\s*\|(.*)\|\s*$", ln)
    if m:
        cols = [c.strip() for c in m.group(2).split("|")]
        if len(cols) >= 3:
            rows[m.group(1)] = cols


def zona_de(*txts):
    for t in txts:
        n = norm(t)
        for z, kws in ZONAS:
            if any(
                re.search(r"\b" + k, n) for k in kws
            ):  # palavra começando com a chave
                return z
    return None


def etiqueta(s):  # até 3 palavras; se passar, corta nos " · " ou nas 3 primeiras
    s = s.strip().strip("*").upper()
    nw = lambda x: len([w for w in x.split() if re.search(r"\w", w)])
    if nw(s) <= 3:
        return s
    parts, out = [p.strip() for p in s.split("·")], []
    for p in parts:
        if nw(" · ".join(out + [p])) <= 3:
            out.append(p)
        else:
            break
    return " · ".join(out) if out else " ".join(s.split()[:3])


cena = {"carro": "hatch", "falas": {}}
serie = re.search(r"^#\s*Falando de\s+(.+?)\s*#(\d+)", rot, re.M)
if serie:
    cena["serie"] = "FALANDO DE " + serie.group(1).upper()
    cena["titulo"] = f"FALANDO DE {serie.group(1).upper()} #{serie.group(2)}"
else:
    t = re.search(r"^#\s*ROTEIRO\s*\d+\s*·\s*(.+)$", rot, re.M)
    cena["serie"] = t.group(1).strip().upper() if t else "DICA"
cl = re.search(r"Classifica[çc][ãa]o:\*\*\s*([^\n(]+)", rot)
if cl:
    cena["selo"] = (
        "FATO DOCUMENTADO" if "fato" in norm(cl.group(1)) else "RELATO DE DONOS"
    )
fo = re.search(r"\*\*Fontes?:\*\*[^(\n]*\(([^)]+)\)", rot)
if fo:
    cena["fonte"] = "Fonte: " + fo.group(1).strip()
else:  # 1º link do FACTS.md: "[gov.br/mj, alerta ...](url) (órgão oficial, 30/11/2015)"
    try:
        fa = open(os.path.join(SRC, "FACTS.md"), encoding="utf-8").read()
        m = re.search(
            r"\[([^\],]+)[^\]]*\]\([^)]+\)\s*\(([^)]*?)(\d{2}/\d{2}/\d{4})?\)", fa
        )
        if m:
            cena["fonte"] = (
                "Fonte: "
                + m.group(1).strip()
                + (", " + m.group(3) if m.group(3) else "")
            )
    except OSError:
        pass
if len(cena.get("fonte", "")) > 52:
    cena["fonte"] = cena["fonte"][:49].rsplit(" ", 1)[0].rstrip(",;") + "…"

zprev = "carro"
for L in lines:
    lid = L["id"]
    if "automovel" in norm(L["text"]) and "boas maos" in norm(L["text"]):
        continue  # assinatura: vai no final da ambulância
    fala, holo, tag = (rows.get(lid, ["", "", ""]) + ["", "", ""])[:3]
    f = {}
    z = zona_de(holo, fala or L["text"]) or zprev
    if z != zprev or not cena["falas"]:
        f["zona"] = z
    zprev = z
    h = norm(holo)
    if any(k in h for k in ALERTA):
        f["estado"] = "alerta"
    elif any(k in h for k in ATENCAO):
        f["estado"] = "atencao"
    if tag:
        e = etiqueta(tag)
        num = re.search(r"\d[\d.,/–-]*", e)
        if (
            num and len(num.group(0)) <= 7
        ):  # número curto vira cartão (o valor precisa caber a 130 px)
            resto = (e[: num.start()] + e[num.end() :]).replace("·", " ").split()
            f["cartao"] = {
                "rotulo": " ".join(w for w in resto if not w.isupper() or len(w) > 3)
                or "Valor",
                "valor": num.group(0),
                "unidade": " ".join(w for w in resto if w.isupper() and len(w) <= 3),
            }
        else:
            f["etiqueta"] = e
    pts = [p for p in PONTOS if re.search(r"\b" + p, norm(L["text"]))]
    if len(pts) >= 2:
        f["pontos"] = pts
    if "lupa" in h and "cartao" not in f:
        f["lupa"] = True
    if holo:
        f["nota"] = holo  # o que o roteiro pede (o filme ignora; serve para revisar)
    cena["falas"][lid] = f
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
json.dump(cena, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(
    f"rascunho do cena.json: {len(cena['falas'])} falas → {OUT} (revise antes de publicar)"
)

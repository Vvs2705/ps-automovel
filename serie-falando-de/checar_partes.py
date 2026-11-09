#!/usr/bin/env python3
"""Confere a parte mecânica das partes da série. Uso: python checar_partes.py [carros/<slug>]
Checa: título (1ª linha do ROTEIRO.md, <=60), ids L01.., última linha fixa,
palavras e duração (aviso abaixo de 190 palavras; erro acima de 120 s pela conta palavras/2,2), etiquetas <=3 palavras,
e cada id do lines.json citado no FACTS.md."""

import json, re, sys, pathlib

FIXA = "Pê Ésse Automóvel. Seu carro sempre em boas mãos."
raiz = pathlib.Path(__file__).parent
alvo = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else raiz / "carros"
if not alvo.is_absolute():
    alvo = raiz / alvo
partes = sorted(p for p in alvo.rglob("parte-*") if p.is_dir())
erros = avisos = 0


def err(p, m):
    global erros
    erros += 1
    print(f"ERRO  {p.relative_to(raiz)}: {m}")


def aviso(p, m):
    global avisos
    avisos += 1
    print(f"aviso {p.relative_to(raiz)}: {m}")


for p in partes:
    lj, ro, fa = p / "lines.json", p / "ROTEIRO.md", p / "FACTS.md"
    for f in (lj, ro, fa):
        if not f.exists():
            err(p, f"falta {f.name}")
    if not (lj.exists() and ro.exists() and fa.exists()):
        continue
    linhas = json.loads(lj.read_text(encoding="utf-8"))
    ids = [l["id"] for l in linhas]
    if ids != [f"L{i:02d}" for i in range(1, len(ids) + 1)]:
        err(p, f"ids fora de sequência: {ids}")
    if linhas[-1]["text"] != FIXA:
        err(p, "última linha não é a fixa")
    palavras = sum(len(l["text"].split()) for l in linhas)
    dur = palavras / 2.2
    msg = f"{palavras} palavras, {dur:.0f} s"
    # regra de 2026-11-09: vídeo final >= 70 s (o molde completa com pausas e final), fala >= 190 palavras, até 2 min
    if dur > 120:
        err(p, msg + " (passa de 2 min)")
    elif palavras < 190:
        aviso(
            p, msg + " (menos de 190 palavras: o molde estica pausas e final até 70 s)"
        )
    else:
        print(f"ok    {p.relative_to(raiz)}: {msg}")
    texto = ro.read_text(encoding="utf-8")
    titulo = texto.splitlines()[0].lstrip("# ").strip()
    if len(titulo) > 60 or not re.match(r"Falando de .+ #\d+: .+", titulo):
        err(p, f"título inválido ({len(titulo)} car.): {titulo}")
    for linha in texto.splitlines():
        if re.match(r"\|\s*L\d\d\s*\|", linha):
            etiqueta = linha.strip().strip("|").split("|")[-1].strip()
            if len(etiqueta.split()) > 3:
                err(p, f"etiqueta com mais de 3 palavras: {etiqueta}")
    facts = fa.read_text(encoding="utf-8")
    for i in ids:
        if i not in facts and i != "L01":
            err(p, f"{i} não aparece no FACTS.md")

print(f"\n{len(partes)} partes, {erros} erros, {avisos} avisos")
sys.exit(1 if erros else 0)

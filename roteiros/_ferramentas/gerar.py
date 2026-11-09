#!/usr/bin/env python3
"""Gera lines.json a partir da tabela de falas do ROTEIRO.md e confere as regras do canal.

Uso:  python gerar.py <pasta-do-roteiro> [<outra> ...]
Fonte única da verdade = ROTEIRO.md. Não edite lines.json à mão.

O que confere:
- título com no máximo 60 caracteres (linha "**Título do vídeo:** ...")
- cada etiqueta de tela com no máximo 3 palavras (separe várias por " · ")
- fala sem dígitos nem siglas em maiúsculas (devem estar escritas como se fala)
- 45 a 90 s de fala (palavras ÷ 2,2), nunca mais de 120 s
- última fala = "Pê Ésse Automóvel. Seu carro sempre em boas mãos."
Atualiza a linha "**Duração estimada:**" do ROTEIRO.md.
"""

import json
import re
import sys
from pathlib import Path

VELOCIDADE = 2.2  # palavras por segundo (edge-tts pt-BR-AntonioNeural)
FECHO = "Pê Ésse Automóvel. Seu carro sempre em boas mãos."
PALAVRA = re.compile(r"\w+(?:[-']\w+)*")


def palavras(texto):
    return len(PALAVRA.findall(texto))


def processa(pasta):
    pasta = Path(pasta)
    md_path = pasta / "ROTEIRO.md"
    md = md_path.read_text(encoding="utf-8")
    avisos = []

    m = re.search(r"^\*\*Título do vídeo:\*\*\s*(.+)$", md, re.M)
    titulo = m.group(1).strip().strip("`") if m else ""
    if not titulo:
        avisos.append("sem título")
    elif len(titulo) > 60:
        avisos.append(f"título com {len(titulo)} caracteres (máx. 60)")

    falas = []
    for linha in md.splitlines():
        if not re.match(r"^\|\s*L\d+\s*\|", linha):
            continue
        col = [c.strip() for c in linha.strip().strip("|").split("|")]
        if len(col) < 4:
            avisos.append(f"linha de tabela incompleta: {linha[:40]}")
            continue
        falas.append(col[:4])

    if not falas:
        avisos.append("nenhuma fala encontrada")

    lines = []
    total = 0
    for id_, texto, _holo, etiqueta in falas:
        n = palavras(texto)
        total += n
        lines.append({"id": id_, "text": texto})
        if re.search(r"\d", texto):
            avisos.append(f"{id_}: dígito na fala (escreva por extenso)")
        if re.search(r"\b[A-ZÁÉÍÓÚ]{2,}\b", texto):
            avisos.append(f"{id_}: sigla em maiúsculas (escreva como se fala)")
        if n > 22:
            avisos.append(f"{id_}: {n} palavras (frase longa; quebre)")
        for chip in re.split(r"\s*·\s*", etiqueta):
            if chip and len(chip.split()) > 3:
                avisos.append(f"{id_}: etiqueta '{chip}' com mais de 3 palavras")

    if lines and lines[-1]["text"] != FECHO:
        avisos.append("última fala não é o fecho do canal")

    seg = total / VELOCIDADE
    if seg < 45:
        avisos.append(f"{seg:.0f} s: abaixo de 45 s")
    if seg > 90:
        avisos.append(f"{seg:.0f} s: acima de 90 s")
    if seg > 120:
        avisos.append("ACIMA DE 2 MIN")

    dur = f"{total} palavras ÷ 2,2 = {seg:.0f} s ({int(seg // 60)}:{int(seg % 60):02d})"
    md2 = re.sub(
        r"^\*\*Duração estimada:\*\*.*$", f"**Duração estimada:** {dur}", md, flags=re.M
    )
    if md2 != md:
        md_path.write_text(md2, encoding="utf-8", newline="\n")

    corpo = ",\n".join("  " + json.dumps(x, ensure_ascii=False) for x in lines)
    (pasta / "lines.json").write_text(
        "[\n" + corpo + "\n]\n", encoding="utf-8", newline="\n"
    )

    print(f"{pasta.name}: {len(lines)} falas, {dur}, título {len(titulo)} car.")
    for a in avisos:
        print("  AVISO:", a)
    return not avisos


if __name__ == "__main__":
    ok = all([processa(p) for p in sys.argv[1:]])
    sys.exit(0 if ok else 1)

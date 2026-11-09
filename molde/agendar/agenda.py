# Lê VIDEOS PRONTOS/PUBLICAR.md e monta a agenda de envio (arquivo, título, descrição, data, hora) em agenda.json
import json
import re
import sys
from pathlib import Path

pub = Path(sys.argv[1]).read_text(encoding="utf-8")
out = Path(sys.argv[2])
secoes = re.split(r"\n## \d+\. ", pub)[1:]
itens = {}
for s in secoes:
    arq = re.search(r"- Arquivo: `([^`]+)`", s)[1]
    blocos = re.findall(r"```\n(.*?)\n```", s, re.S)  # título, descrição, hashtags
    titulo, desc, tags = blocos[0].strip(), blocos[1].strip(), blocos[2].strip()
    desc = (
        desc
        + "\n\nNarração com voz sintética; animação desenhada em código.\n\n"
        + tags
    )
    itens[arq] = {"arquivo": arq, "titulo": titulo, "descricao": desc}
# 4 por semana (ter, qui, sex, sáb), horários de teste da estratégia; D1 = terça 10/11/2026
agenda = [
    ("Informativos/00 - Por que trocar o óleo.mp4", "10/11/2026", "12:00"),
    ("Informativos/03 - Luz da injeção.mp4", "12/11/2026", "18:00"),
    ("Falando de Gol/Gol 01 - Consumo de óleo no 1.0.mp4", "13/11/2026", "18:00"),
    ("Informativos/06 - Barulho ao frear.mp4", "14/11/2026", "12:00"),
    ("Informativos/04 - Motor esquentando.mp4", "17/11/2026", "20:00"),
    ("Informativos/09 - Bateria.mp4", "19/11/2026", "12:00"),
    ("Falando de Gol/Gol 02 - Falha de ignição.mp4", "20/11/2026", "18:00"),
    ("Informativos/05 - Fumaça do escapamento.mp4", "21/11/2026", "20:00"),
    ("Informativos/01 - Calibragem do pneu.mp4", "24/11/2026", "18:00"),
    ("Falando de Gol/Gol 03 - Partida difícil no frio.mp4", "26/11/2026", "20:00"),
    ("Informativos/08 - Pneu sulco e data.mp4", "27/11/2026", "18:00"),
    ("Informativos/02 - Cores das luzes do painel.mp4", "28/11/2026", "18:00"),
    ("Informativos/07 - Fluido de freio.mp4", "01/12/2026", "12:00"),
    ("Falando de Gol/Gol 04 - Vazamento na termostática.mp4", "03/12/2026", "18:00"),
    ("Informativos/10 - Ponto morto na descida.mp4", "04/12/2026", "18:00"),
    ("Falando de Gol/Gol 05 - Câmbio I-Motion com tranco.mp4", "05/12/2026", "20:00"),
    ("Falando de Gol/Gol 06 - Lanterna traseira (recall).mp4", "08/12/2026", "20:00"),
    ("Falando de Gol/Gol 07 - Alternador e polia (recalls).mp4", "10/12/2026", "18:00"),
    ("Falando de Gol/Gol 08 - Cinto traseiro (recall).mp4", "11/12/2026", "18:00"),
    ("Falando de Gol/Gol 09 - Rolamento da roda traseira.mp4", "12/12/2026", "12:00"),
]
res = []
for i, (arq, d, h) in enumerate(agenda, 1):
    it = dict(itens[arq], n=i, data=d, hora=h)
    assert len(it["titulo"]) <= 100 and len(it["descricao"]) <= 5000, arq
    res.append(it)
out.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
sys.stdout.write(
    f"{len(res)} itens; maior descrição {max(len(r['descricao']) for r in res)} caracteres\n"
)

#!/bin/sh
# Manda um lote para renderizar no GitHub Actions (vários vídeos ao mesmo tempo). Rode de um clone do repositório.
#   sh molde/nuvem.sh                 os 5 primeiros da molde/fila.txt sem cena.json no repositório (LOTE=n muda; até 20)
#   sh molde/nuvem.sh todas           sem fila: toda pasta de roteiro com lines.json sem cena.json, em qualquer estilo
#   sh molde/nuvem.sh "roteiros/02-luzes-cores blueprint" serie-falando-de/carros/gol/parte-03   exatamente estes (refaz)
# O GitHub renderiza o que está no repositório: commite antes; este script atualiza o clone (pull) e faz o push.
# No fim do lote o GitHub commita os cena.json novos (rascunho automático, a revisar) e deixa o artifact "videos";
# sh molde/baixar.sh traz para VIDEOS PRONTOS/ e apaga os artifacts.
set -e
cd "$(dirname "$0")/.."
S=$(git status --porcelain)
[ -z "$S" ] || { echo "mudanças sem commit (o GitHub não vê):"; echo "$S"; echo "commite e rode de novo"; exit 1; }
git pull -q --rebase
git push -q
L=$(printf '%s,' "$@"); L=${L%,}
gh workflow run render.yml -f pastas="$L" -f lote="${LOTE:-5}"
echo "lote enviado: ${L:-fila} (até ${LOTE:-5} da fila/todas)"
echo "acompanhar: gh run watch     trazer os vídeos: sh molde/baixar.sh"

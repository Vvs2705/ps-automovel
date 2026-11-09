#!/bin/sh
# Manda vídeos para renderizar no GitHub Actions, vários ao mesmo tempo (até 20 por lote). O PC fica livre.
#   sh molde/nuvem.sh                                    o que da molde/fila.txt ainda não tem vídeo em molde/saida/
#   sh molde/nuvem.sh "roteiros/02-luzes-cores blueprint" serie-falando-de/carros/gol/parte-03
# O GitHub renderiza o que está no repositório: commite antes (roteiro novo, cena.json revisado); este script faz o push.
# Depois: sh molde/baixar.sh (espera o lote, traz para molde/saida/, atualiza VIDEOS PRONTOS/ e apaga os artifacts).
set -e
cd "$(dirname "$0")/.."
if [ $# -gt 0 ]; then L=$(printf '%s,' "$@")
else
  L=$(grep -vE '^[[:space:]]*(#|$)' molde/fila.txt | tr -d '\r' | while read -r pasta estilo; do
    b=$(basename "$pasta"); case "$b" in parte-*) b="$(basename "$(dirname "$pasta")")-$b" ;; esac
    nome=$b; [ -n "$estilo" ] && [ "$estilo" != hologram-hud ] && nome=$b-$estilo
    [ -f "molde/saida/$nome/$nome.mp4" ] || printf '%s %s,' "$pasta" "$estilo"
  done)
fi
L=${L%,}
[ -n "$L" ] || { echo "nada a mandar: a fila inteira já tem vídeo em molde/saida/"; exit 0; }
S=$(git status --porcelain -- roteiros serie-falando-de molde .github)
if [ -n "$S" ] && [ -z "$FORCAR" ]; then
  echo "mudanças sem commit (o GitHub não vê; um cena.json revisado ficaria de fora):"; echo "$S"
  echo "commite e rode de novo, ou FORCAR=1 sh molde/nuvem.sh para mandar assim mesmo"; exit 1
fi
git push -q
gh workflow run render.yml -f pastas="$L"
echo "lote enviado: $L" | sed 's/,/\n    /g'
echo "acompanhar: gh run watch     trazer os vídeos: sh molde/baixar.sh"

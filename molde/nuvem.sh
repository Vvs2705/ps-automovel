#!/bin/sh
# Manda vídeos para renderizar no GitHub Actions, vários ao mesmo tempo. O PC fica livre.
#   sh molde/nuvem.sh                 os 5 primeiros da molde/fila.txt que ainda não têm vídeo em molde/saida/
#   sh molde/nuvem.sh todas           sem fila: toda pasta de roteiro com lines.json sem vídeo (estilo do cena.json ou padrão)
#   LOTE=20 sh molde/nuvem.sh         lote maior (até 20; ~12 cabem nos 500 MB de artifacts de repositório privado)
#   sh molde/nuvem.sh "roteiros/02-luzes-cores blueprint" serie-falando-de/carros/gol/parte-03   exatamente estes
# O GitHub renderiza o que está no repositório: commite antes (roteiro novo, cena.json revisado); este script faz o push.
# Depois: sh molde/baixar.sh (espera o lote, traz para molde/saida/, atualiza VIDEOS PRONTOS/ e apaga os artifacts).
set -e
cd "$(dirname "$0")/.."
if [ $# -gt 0 ] && [ "$1" != todas ]; then L=$(printf '%s,' "$@")
else
  L=$( { if [ "$1" = todas ]; then ls roteiros/*/lines.json serie-falando-de/carros/*/parte-*/lines.json | sed 's,/lines.json$,,'
         else grep -vE '^[[:space:]]*(#|$)' molde/fila.txt; fi; } | tr -d '\r' | while read -r pasta estilo; do
    b=$(basename "$pasta"); case "$b" in parte-*) b="$(basename "$(dirname "$pasta")")-$b" ;; esac
    nome=$b; [ -n "$estilo" ] && [ "$estilo" != hologram-hud ] && nome=$b-$estilo
    if [ "$1" = todas ]; then ls molde/saida/"$b"/*.mp4 molde/saida/"$b"-*/*.mp4 2>/dev/null | grep -q . && continue   # qualquer estilo conta
    else [ ! -f "molde/saida/$nome/$nome.mp4" ] || continue; fi
    echo "$pasta $estilo"
  done | head -n "${LOTE:-5}" | tr '\n' ',')
fi
L=${L%,}
[ -n "$L" ] || { echo "nada a mandar: tudo já tem vídeo em molde/saida/"; exit 0; }
[ -z "$SECO" ] || { echo "$L" | tr ',' '\n'; exit 0; }   # SECO=1: só mostra o lote
S=$(git status --porcelain -- roteiros serie-falando-de molde .github)
if [ -n "$S" ] && [ -z "$FORCAR" ]; then
  echo "mudanças sem commit (o GitHub não vê; um cena.json revisado ficaria de fora):"; echo "$S"
  echo "commite e rode de novo, ou FORCAR=1 sh molde/nuvem.sh para mandar assim mesmo"; exit 1
fi
git push -q
gh workflow run render.yml -f pastas="$L"
echo "lote enviado:"; echo "$L" | tr ',' '\n' | sed 's/^ */    /'
echo "acompanhar: gh run watch     trazer os vídeos: sh molde/baixar.sh"

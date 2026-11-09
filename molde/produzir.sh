#!/bin/sh
# Produz a fila (molde/fila.txt), um vídeo por vez (o PC só aguenta um render), e atualiza "VIDEOS PRONTOS/".
# Linha da fila: <pasta-do-roteiro> [estilo]. Pula o que já tem vídeo em molde/saida/; para no primeiro erro.
# Uso, da pasta Parafuso Solto:  sh molde/produzir.sh        REFAZER=1 sh molde/produzir.sh  (refaz tudo da fila)
set -e
cd "$(dirname "$0")/.."
LIB=${LIB:-$HOME/lemo-opuscar}; PY=$LIB/.venv/Scripts/python.exe; [ -x "$PY" ] || PY=$LIB/.venv/bin/python
grep -vE '^[[:space:]]*(#|$)' molde/fila.txt | tr -d '\r' | while read -r pasta estilo; do
  b=$(basename "$pasta"); case "$b" in parte-*) b="$(basename "$(dirname "$pasta")")-$b" ;; esac
  nome=$b; [ -n "$estilo" ] && [ "$estilo" != hologram-hud ] && nome=$b-$estilo
  if [ -z "$REFAZER" ] && [ -f "molde/saida/$nome/$nome.mp4" ]; then echo "já pronto: $nome"; continue; fi
  echo "== produzindo $nome ($(date +%H:%M))"
  ESTILO=$estilo sh molde/build.sh "$pasta" < /dev/null
done
PYTHONIOENCODING=utf-8 "$PY" molde/prontos.py

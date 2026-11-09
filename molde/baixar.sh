#!/bin/sh
# Traz um lote do GitHub Actions (render.yml) para molde/saida/<nome>/, atualiza "VIDEOS PRONTOS/" e apaga os artifacts
# do lote no GitHub (o plano Free tem 500 MB para eles). Se o lote ainda estiver rodando, espera terminar.
#   sh molde/baixar.sh               último lote          sh molde/baixar.sh <id-do-lote>   (ids: gh run list -w render.yml)
# Um cena.json que já existe em molde/saida/<nome>/ não é trocado (sua revisão fica); o do GitHub só entra se faltar.
set -e
cd "$(dirname "$0")/.."
LIB=${LIB:-$HOME/lemo-opuscar}; PY=$LIB/.venv/Scripts/python.exe; [ -x "$PY" ] || PY=$LIB/.venv/bin/python
RUN=${1:-$(gh run list -w render.yml -L 1 --json databaseId -q '.[0].databaseId')}
[ -n "$RUN" ] || { echo "nenhum lote no GitHub ainda (sh molde/nuvem.sh)"; exit 1; }
if [ "$(gh run view "$RUN" --json status -q .status)" != completed ]; then
  echo "lote $RUN rodando; esperando terminar (Ctrl+C para sair; rode de novo depois)"
  gh run watch "$RUN" --interval 30 > /dev/null
fi
gh run view "$RUN" --json jobs -q '.jobs[] | select(.name != "preparar") | "    \(.conclusion)\t\(.name)"'
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
gh run download "$RUN" -D "$(cygpath -m "$T" 2>/dev/null || echo "$T")"
for a in "$T"/*/; do
  [ -d "$a" ] || { echo "o lote $RUN não tem artifacts (já baixado, apagado ou expirado)"; exit 1; }
  n=$(basename "$a"); d=molde/saida/$n
  mkdir -p "$d"
  [ ! -f "$d/cena.json" ] || rm -f "$a/cena.json"
  cp -r "$a". "$d/"
  rm -f "$d/$n-celular.mp4"   # a cópia leve antiga não bate com o vídeo novo (o GitHub não manda cópia leve)
  echo "baixado: $d/$n.mp4"
done
PYTHONIOENCODING=utf-8 "$PY" molde/prontos.py
for id in $(gh api "repos/{owner}/{repo}/actions/runs/$RUN/artifacts" -q '.artifacts[].id'); do
  gh api -X DELETE "repos/{owner}/{repo}/actions/artifacts/$id"
done
echo "artifacts do lote $RUN apagados no GitHub"

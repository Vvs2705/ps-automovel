#!/bin/sh
# Traz os vídeos de um lote do GitHub Actions (render.yml) direto para "VIDEOS PRONTOS/" (Informativos/, Falando de <Carro>/)
# e apaga os artifacts do lote no GitHub. Não precisa do projeto: roda de qualquer pasta, até sem clone:
#   gh api -H "Accept: application/vnd.github.raw" repos/Vvs2705/ps-automovel/contents/molde/baixar.sh | sh
#   sh molde/baixar.sh [id-do-lote] [pasta-destino]      padrão: último lote; ~/Videos/MEUS PROJETOS/Parafuso Solto/VIDEOS PRONTOS
# Se o lote ainda estiver rodando, espera terminar. Um vídeo que já existe é trocado pelo novo.
# Para revisar antes de apagar (folha.jpg, cena.json, log): gh run download <id> -R Vvs2705/ps-automovel -p 'dados-*'
set -e
R=${REPO:-Vvs2705/ps-automovel}
RUN=${1:-$(gh run list -R "$R" -w render.yml -L 1 --json databaseId -q '.[0].databaseId')}
DEST=${2:-$HOME/Videos/MEUS PROJETOS/Parafuso Solto/VIDEOS PRONTOS}
[ -n "$RUN" ] || { echo "nenhum lote no GitHub ainda"; exit 1; }
if [ "$(gh run view -R "$R" "$RUN" --json status -q .status)" != completed ]; then
  echo "lote $RUN rodando; esperando terminar (Ctrl+C sai; rode de novo depois)"
  gh run watch -R "$R" "$RUN" --interval 30 > /dev/null
fi
gh run view -R "$R" "$RUN" --json jobs -q '.jobs[] | select(.name != "preparar" and .name != "juntar") | "    \(.conclusion)\t\(.name)"'
# baixa numa pasta temporária e copia por cima, para um vídeo refeito trocar o antigo
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
gh run download -R "$R" "$RUN" -n videos -D "$(cygpath -m "$T" 2>/dev/null || echo "$T")"
mkdir -p "$DEST"
(cd "$T" && find . -name '*.mp4' | sed 's,^\./,    ,')
cp -r "$T"/. "$DEST"/
echo "em: $DEST"
for id in $(gh api "repos/$R/actions/runs/$RUN/artifacts" -q '.artifacts[].id'); do
  gh api -X DELETE "repos/$R/actions/artifacts/$id"
done
echo "artifacts do lote $RUN apagados no GitHub"

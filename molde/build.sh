#!/bin/sh
# Molde PS Automóvel: pasta de roteiro → Short pronto, com um comando.
#   sh molde/build.sh <pasta-do-roteiro> [nome]        ex.: sh molde/build.sh roteiros/01-calibragem-pneu
# A pasta do roteiro só é lida (lines.json, ROTEIRO.md, FACTS.md). Tudo sai em molde/saida/<nome>/.
# Sem saida/<nome>/cena.json, gera um rascunho a partir do ROTEIRO.md (revise e rode de novo).
# A voz (edge-tts, online) só é refeita quando o lines.json muda, ou com VOZ=1. WORKERS=3 por padrão (máximo neste PC).
# Estilo visual: "estilo" no cena.json, ou ESTILO=<nome> (molde/estilos/ESTILOS.md). Com ESTILO e sem [nome], sai em saida/<nome>-<estilo>/,
# partindo do cena.json e da voz de saida/<nome>/ (o original fica como está). Sem nenhum dos dois: hologram-hud.
# Ordem: voz → cena → linha do tempo → eventos → checagem de texto → trilha → mix → .srt → render → mux (−14 LUFS) → poster → celular → folha.
set -e
M=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}; PY=$LIB/.venv/Scripts/python.exe; [ -x "$PY" ] || PY=$LIB/.venv/bin/python
export PYTHONIOENCODING=utf-8 LIB
[ -n "$1" ] || { echo "uso: sh molde/build.sh <pasta-do-roteiro> [nome]"; exit 2; }
SRC=$(cd "$1" && pwd)
[ -f "$SRC/lines.json" ] && [ -f "$SRC/ROTEIRO.md" ] || { echo "faltou lines.json ou ROTEIRO.md em $SRC"; exit 2; }
B=$(basename "$SRC"); case "$B" in parte-*) B="$(basename "$(dirname "$SRC")")-$B" ;; esac   # carros/gol/parte-06 → gol-parte-06
NOME=${2:-$B}
if [ -n "$ESTILO" ] && [ "$ESTILO" != hologram-hud ]; then
  [ -f "$M/estilos/$ESTILO.js" ] || { echo "estilo \"$ESTILO\" não existe (veja molde/estilos/ESTILOS.md)"; exit 2; }
  [ -n "$2" ] || NOME=$B-$ESTILO
fi
D=$M/saida/$NOME; Q="d=saida/$NOME${ESTILO:+&estilo=$ESTILO}"
mkdir -p "$D/voices" "$D/out"
if [ -n "$ESTILO" ] && [ "$NOME" != "$B" ] && [ ! -f "$D/cena.json" ] && [ -f "$M/saida/$B/cena.json" ]; then   # versão em outro estilo
  sed '1s/^{\r\?$/{\n "estilo": "'"$ESTILO"'",/' "$M/saida/$B/cena.json" > "$D/cena.json"
  [ -f "$M/saida/$B/voices/words.json" ] && cp "$M/saida/$B/voices/"*.json "$M/saida/$B/voices/"*.wav "$D/voices/" 2>/dev/null || true
fi
LOG=$D/build.log; : > "$LOG"
T0=$(date +%s)
el() { echo $(( $(date +%s) - T0 )); }
step() { echo "[$(el)s] $*"; echo "== [$(el)s] $*" >> "$LOG"; }
run() { "$@" >> "$LOG" 2>&1 || { echo "FALHOU: $1 (fim do log abaixo; inteiro em $LOG)"; tail -12 "$LOG"; exit 1; }; }
say() { run "$@"; tail -1 "$LOG" | sed 's/^/    /'; }   # roda e mostra a última linha
W() { cygpath -m "$1" 2>/dev/null || echo "$1"; }          # caminho do Windows para node/python/ffmpeg
MW=$(W "$M"); DW=$(W "$D")
cd "$M"
echo "molde: $SRC → saida/$NOME, estilo ${ESTILO:-do cena.json (padrão hologram-hud)} (log: saida/$NOME/build.log)"

step "voz"
if [ -n "$VOZ" ] || [ ! -f "$D/voices/words.json" ] || ! cmp -s "$SRC/lines.json" "$D/voices/lines.json"; then
  cp "$SRC/lines.json" "$D/voices/lines.json"
  say "$PY" tools/tts_words.py "$DW/voices/lines.json" "$DW/voices"
else echo "    reaproveitada (lines.json igual; VOZ=1 refaz)"; fi

step "lábios do apresentador"; say "$PY" apresentador/labios.py "$DW/voices" "$DW/labios.json"

step "cena"
say "$PY" tools/rascunho_cena.py "$(W "$SRC")" "$DW/cena.json"   # sem cena.json: rascunho; com ele: só completa falas novas

step "linha do tempo"; say "$PY" tools/linha_do_tempo.py "$DW"
step "eventos de som"; (cd "$LIB" && say node core/render/events.mjs "$MW" --q "$Q" --size 1080x1920 --out "$DW/events.json")
step "checagem de texto (sobreposição, legenda entre y 1350 e 1500, avisos do cena.json)"
CHK=0; node tools/checar.mjs "$MW" "$Q" > "$D/out/checagem.txt" 2>&1 || CHK=1
cat "$D/out/checagem.txt" >> "$LOG"; head -20 "$D/out/checagem.txt" | sed 's/^/    /'
step "trilha"; say "$PY" music/score.py "$DW"
step "mix"; say "$PY" mix.py "$DW"
step "legenda .srt"; say "$PY" tools/make_srt.py "$DW" "$DW/$NOME.srt"
step "render 1080×1920 24 fps"; (cd "$LIB" && say node core/render/video.mjs "$MW" --q "$Q" --fps 24 --workers "${WORKERS:-3}" --size 1080x1920 --out "$DW/out/video24.mp4")
step "mux (−14 LUFS)"; (cd "$LIB" && run sh core/render/mux.sh "$D/out/video24.mp4" "$D/mix.wav" "$D/$NOME.mp4" 24 0); grep -E "^\s+(I|Peak):|warning" "$LOG" | tail -3 | sed 's/^ */    /'
step "poster"
PT=$("$PY" -c "import json,sys; print(json.load(open(sys.argv[1]))['poster'])" "$DW/timeline.json")
rm -f "$D/out"/poster_*.jpg
(cd "$LIB" && run node core/render/still.mjs "$MW" "$PT" --q "$Q&nosub=1" --size 1080x1920 --out "$DW/out" --prefix poster_)
cp "$(ls "$D/out"/poster_*.jpg | head -1)" "$D/poster.jpg"; echo "    poster.jpg em ${PT} s"
step "cópia leve para celular (2400 kbps, duas passadas)"
run ffmpeg -y -loglevel error -i "$D/$NOME.mp4" -c:v libx264 -preset slow -b:v 2400k -pass 1 -passlogfile "$D/out/2pass" -an -f null -
run ffmpeg -y -loglevel error -i "$D/$NOME.mp4" -c:v libx264 -preset slow -b:v 2400k -pass 2 -passlogfile "$D/out/2pass" -c:a aac -b:a 160k -movflags +faststart "$D/$NOME-celular.mp4"
rm -f "$D/out"/2pass*
step "folha de contato (baixa resolução)"
DUR=$("$PY" -c "import json,sys; print(json.load(open(sys.argv[1]))['dur'])" "$DW/timeline.json")
RG=$(awk -v d="$DUR" 'BEGIN { printf "0.8:%.2f:%.2f", d - 0.3, int((d - 1.1) / 17 * 100) / 100 }')   # passo para baixo: o 18º quadro (o final) não cai fora
rm -rf "$D/out/folha"; (cd "$LIB" && run node core/render/still.mjs "$MW" --range "$RG" --q "$Q" --size 1080x1920 --out "$DW/out/folha" --prefix f_)
run "$PY" tools/folha.py "$DW/out/folha" "$DW/folha.jpg"
rm -f "$D/out/video24.mp4"
step "pronto em $(el) s"
for f in "$NOME.mp4" "$NOME-celular.mp4" "$NOME.srt" poster.jpg folha.jpg cena.json; do
  [ -f "$D/$f" ] && printf '    %-28s %s\n' "$f" "$(du -h "$D/$f" | cut -f1)"
done
printf '    duração: %s s\n' "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/$NOME.mp4" | cut -c1-5)"
[ "$CHK" = 0 ] || echo "ATENÇÃO: a checagem de texto acusou problemas (saida/$NOME/out/checagem.txt)."

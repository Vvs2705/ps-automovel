#!/bin/sh
# Demo do apresentador → demo/out/: apresentador-demo.mp4 (1080×1920, 24 fps, −14 LUFS), apresentador-demo-celular.mp4 (2400 kbps,
# duas passadas), folha.jpg; e ../conceitos.jpg. Só lê o molde (montar.py copia o que precisa). Log: demo/out/render.log
#   sh molde/apresentador/demo/render.sh            (da pasta Parafuso Solto; WORKERS=3 no máximo neste PC)
set -e
H=$(cd "$(dirname "$0")" && pwd); M=$(cd "$H/../.." && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}; PY=$LIB/.venv/Scripts/python.exe; [ -x "$PY" ] || PY=$LIB/.venv/bin/python
export PYTHONIOENCODING=utf-8 LIB
W() { cygpath -m "$1" 2>/dev/null || echo "$1"; }
O=$H/out; mkdir -p "$O"; LOG=$O/render.log; : > "$LOG"
run() { echo "== $*" >> "$LOG"; "$@" >> "$LOG" 2>&1 || { echo "FALHOU: $1 (fim de $LOG)"; tail -8 "$LOG"; exit 1; }; }
if wmic process where "name='node.exe'" get commandline 2>/dev/null | grep -q "video.mjs"; then
  echo "já há um render (video.mjs) rodando: espere terminar (um processo pesado por vez)"; exit 1; fi
HW=$(W "$H")
echo "1/6 montar (cópia do molde + dados do vídeo)"; run "$PY" "$H/montar.py"; tail -1 "$LOG"
echo "2/6 teste do labios.py"; run "$PY" "$H/../labios.py" --teste
echo "3/6 checagem de texto do molde, com o apresentador"; run node "$M/tools/checar.mjs" "$HW" "" 0.05; tail -1 "$LOG"
echo "4/6 conceitos.jpg"
rm -rf "$O/c"; (cd "$LIB" && run node core/render/still.mjs "$HW" 0 --q conceitos=1 --size 2400x1500 --out "$(W "$O/c")" --prefix c_)
cp "$O/c/c_0.jpg" "$H/../conceitos.jpg"; rm -rf "$O/c"
echo "5/6 render 1080×1920 24 fps + mux (−14 LUFS)"
(cd "$LIB" && run node core/render/video.mjs "$HW" --fps 24 --workers "${WORKERS:-3}" --size 1080x1920 --out "$(W "$O/video24.mp4")")
(cd "$LIB" && run sh core/render/mux.sh "$O/video24.mp4" "$H/dados/clipe.wav" "$O/apresentador-demo.mp4" 24 0)
grep -E "^\s+(I|Peak):" "$LOG" | tail -2
echo "6/6 cópia para celular (2400 kbps, duas passadas) + folha"
run ffmpeg -y -loglevel error -i "$O/apresentador-demo.mp4" -c:v libx264 -preset slow -b:v 2400k -pass 1 -passlogfile "$O/2pass" -an -f null -
run ffmpeg -y -loglevel error -i "$O/apresentador-demo.mp4" -c:v libx264 -preset slow -b:v 2400k -pass 2 -passlogfile "$O/2pass" -c:a aac -b:a 160k -movflags +faststart "$O/apresentador-demo-celular.mp4"
rm -f "$O"/2pass* "$O/video24.mp4"
rm -rf "$O/folha"; (cd "$LIB" && run node core/render/still.mjs "$HW" --range 0.5:17.5:1.0 --size 1080x1920 --out "$(W "$O/folha")" --prefix f_)
run "$PY" "$M/tools/folha.py" "$(W "$O/folha")" "$(W "$O/folha.jpg")"; rm -rf "$O/folha"
for f in apresentador-demo.mp4 apresentador-demo-celular.mp4 folha.jpg; do printf '    %-32s %s\n' "$f" "$(du -h "$O/$f" | cut -f1)"; done
printf '    duração: %s s\n' "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$O/apresentador-demo.mp4" | cut -c1-5)"

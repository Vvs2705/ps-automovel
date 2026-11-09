#!/bin/sh
# Refaz o EP01 do zero: sh build.sh   (precisa da biblioteca em ~/lemo-opuscar com "setup.sh deps" e edge-tts no .venv)
# Ordem: voz → eventos → trilha → mix → legenda → render → mux. A voz só é refeita com VOZ=1 (edge-tts é online).
set -e
P=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-$HOME/lemo-opuscar}; PY=$LIB/.venv/Scripts/python.exe; [ -x "$PY" ] || PY=$LIB/.venv/bin/python
export PYTHONIOENCODING=utf-8
cd "$P"
[ -n "$VOZ" ] && "$PY" tools/tts_words.py voices/lines.json voices
(cd "$LIB" && node core/render/events.mjs "$P" --size 1080x1920 --out "$P/events.json")
"$PY" music/score.py
"$PY" mix.py
"$PY" tools/make_srt.py ps-automovel-ep01.srt
(cd "$LIB" && node core/render/video.mjs "$P" --fps 24 --workers 3 --size 1080x1920 --out "$P/out/video24.mp4")
(cd "$LIB" && sh core/render/mux.sh "$P/out/video24.mp4" "$P/mix.wav" "$P/ps-automovel-ep01.mp4" 24 0)
(cd "$LIB" && node core/render/still.mjs "$P" 9.2 --size 1080x1920 --q nosub=1 --out "$P/out" --prefix poster_) && cp "$P/out/poster_9.2.jpg" "$P/poster.jpg"

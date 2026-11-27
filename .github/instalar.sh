#!/bin/sh
# Prepara a máquina Linux do GitHub para o molde: ffmpeg 7+ estático, biblioteca Lemo-Opuscar na versão $LIB_SHA
# (a mesma do notebook), pacotes Node e Python, Chromium do Playwright e edge-tts. Com o cache restaurado só confere.
# Chamado por .github/workflows/render.yml.
set -e
F=$HOME/ffmpeg   # o Ubuntu 24.04 traz ffmpeg 6.1; a biblioteca pede 7+
if [ ! -x "$F/ffmpeg" ]; then
  mkdir -p "$F"; T=$(mktemp)
  # 1º johnvansickle (estático 7.x); se vier quebrado (em 2026-11-27 não veio um .xz), BtbN master (7+), release do GitHub
  if curl -fsSL -o "$T" https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && xz -t "$T" 2>/dev/null; then
    tar -xJf "$T" -C "$F" --strip-components=1 --wildcards '*/ffmpeg' '*/ffprobe'
  else
    curl -fsSL -o "$T" https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz
    tar -xJf "$T" -C "$F" --strip-components=2 --wildcards '*/bin/ffmpeg' '*/bin/ffprobe'
  fi
  rm -f "$T"
fi
export PATH=$F:$PATH; echo "$F" >> "$GITHUB_PATH"
L=$HOME/lemo-opuscar
if [ "$(git -C "$L" rev-parse HEAD 2>/dev/null)" != "$LIB_SHA" ]; then
  rm -rf "$L"
  git clone -q --filter=blob:none --no-checkout https://github.com/lemomo-ai/lemo-opuscar.git "$L"
  git -C "$L" config core.sparseCheckout true   # sem os demos e imagens grandes, como o setup.sh da biblioteca
  printf '%s\n' '/*' '!/styles/*/demo/' '!/styles/*/poster.jpg' '!/styleboard/' '!/docs/' > "$L/.git/info/sparse-checkout"
  git -C "$L" checkout -q "$LIB_SHA"
fi
LEMO_OPUSCAR_HOME=$L sh "$L/plugin/skills/lemo-opuscar/scripts/setup.sh" deps
PY=$L/.venv/bin/python
# ponytail: só o edge-tts do nível "voice" (o resto, Kokoro e Whisper, o molde não usa)
"$PY" -c 'import edge_tts' 2>/dev/null || if command -v uv >/dev/null; then uv pip install -q --python "$PY" edge-tts
else "$PY" -m pip install -q --disable-pip-version-check edge-tts; fi
ffmpeg -version | head -1; node -v; "$PY" -V

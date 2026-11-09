#!/bin/sh
# Prepara a máquina Linux do GitHub para o molde: ffmpeg 7+ estático, biblioteca Lemo-Opuscar na versão $LIB_SHA
# (a mesma do notebook), pacotes Node e Python, Chromium do Playwright e edge-tts. Com o cache restaurado só confere.
# Chamado por .github/workflows/render.yml.
set -e
F=$HOME/ffmpeg   # o Ubuntu 24.04 traz ffmpeg 6.1; a biblioteca pede 7+
if [ ! -x "$F/ffmpeg" ]; then
  mkdir -p "$F"
  curl -fsSL https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz |
    tar -xJ -C "$F" --strip-components=1 --wildcards '*/ffmpeg' '*/ffprobe'
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

"""Folha de contato em baixa resolução dos quadros de uma pasta (usa core/render/sheet.py da biblioteca).
uso: python tools/folha.py <pasta-dos-quadros> <saida.jpg>"""

import glob, os, re, runpy, sys

src, out = sys.argv[1], sys.argv[2]
fs = sorted(
    glob.glob(os.path.join(src, "*.jpg")),
    key=lambda f: float(re.findall(r"[\d.]+(?=\.jpg$)", f)[0]),
)
sys.argv = ["sheet.py", out, *fs, "--cols", "6", "--w", "240"]
runpy.run_path(
    os.path.join(
        os.environ.get("LIB", os.path.expanduser("~/lemo-opuscar")),
        "core",
        "render",
        "sheet.py",
    ),
    run_name="__main__",
)

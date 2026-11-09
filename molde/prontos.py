# Monta "VIDEOS PRONTOS/" só com os vídeos finais:
#   Informativos/          tudo que não é de um carro específico (EP01 + roteiros/)
#   Falando de <Carro>/    uma pasta por carro (serie-falando-de/carros/<carro>/parte-NN)
# Quando um roteiro tem mais de uma versão em molde/saida/ (ex.: 03-luz-da-injecao e 03-luz-da-injecao-chalkboard),
# vale a renderizada por último. Rodar de novo é seguro: só copia o que mudou.
# Uso (da pasta Parafuso Solto):  python molde/prontos.py
import re
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SAIDA, DEST = RAIZ / "molde" / "saida", RAIZ / "VIDEOS PRONTOS"
ESTILOS = {p.stem for p in (RAIZ / "molde" / "estilos").glob("*.js")} - {"base"}
PROIBIDO = re.compile(r'[<>:"/\\|?*]')


def titulo(roteiro: Path) -> str:
    h1 = next(
        (
            ln[1:].strip()
            for ln in roteiro.read_text(encoding="utf-8").splitlines()
            if ln.startswith("# ")
        ),
        roteiro.parent.name,
    )
    return h1


def alvo(chave: str):
    """(pasta de destino, nome do arquivo) para a chave do roteiro, ou None se o roteiro não for achado."""
    m = re.fullmatch(r"(.+)-parte-(\d+)", chave)
    if m:
        rot = (
            RAIZ / "serie-falando-de" / "carros" / m[1] / f"parte-{m[2]}" / "ROTEIRO.md"
        )
        if not rot.exists():
            return None
        t = titulo(rot)  # "Falando de Gol #1: Consumo de óleo no 1.0"
        mm = re.match(r"Falando de (.+?) #\d+\s*:\s*(.+)", t)
        carro, prob = (mm[1], mm[2]) if mm else (m[1].capitalize(), t)
        return f"Falando de {carro}", f"{carro} {int(m[2]):02d} - {prob}"
    rot = RAIZ / "roteiros" / chave / "ROTEIRO.md"
    if not rot.exists():
        return None
    t = titulo(rot).split("·")[-1].strip()  # "ROTEIRO 01 · Calibragem do pneu"
    n = re.match(r"(\d+)", chave)
    return "Informativos", f"{n[1] if n else '99'} - {t}"


def sem_estilo(nome: str) -> str:
    """03-luz-da-injecao-chalkboard -> 03-luz-da-injecao (a chave do roteiro)."""
    for e in ESTILOS:
        if nome.endswith("-" + e):
            nome = nome[: -len(e) - 1]
    return nome


def arquivo(pasta: str, nome: str) -> str:
    """Caminho do vídeo dentro de VIDEOS PRONTOS/."""
    return f"{pasta}/{PROIBIDO.sub('', nome).strip()}.mp4"


def main():
    escolha = {}  # chave do roteiro -> mp4 mais recente
    for d in sorted(p for p in SAIDA.iterdir() if p.is_dir()):
        mp4 = d / f"{d.name}.mp4"
        if not mp4.exists():
            continue
        chave = sem_estilo(d.name)
        if chave not in escolha or mp4.stat().st_mtime > escolha[chave].stat().st_mtime:
            escolha[chave] = mp4
    itens = [
        (
            ("Informativos", "00 - Por que trocar o óleo"),
            RAIZ / "ep01-oleo" / "ps-automovel-ep01.mp4",
        )
    ]
    for chave, mp4 in sorted(escolha.items()):
        a = alvo(chave)
        if a is None:
            sys.stderr.write(f"aviso: roteiro de {chave} não encontrado, pulei\n")
            continue
        itens.append((a, mp4))
    novos = 0
    for (pasta, nome), mp4 in itens:
        if not mp4.exists():
            sys.stderr.write(f"aviso: falta {mp4}\n")
            continue
        out = DEST / arquivo(pasta, nome)
        out.parent.mkdir(parents=True, exist_ok=True)
        # só o mais novo entra: um vídeo vindo do GitHub (baixar.sh) não é trocado pelo antigo de molde/saida/
        if not out.exists() or out.stat().st_mtime < mp4.stat().st_mtime:
            shutil.copy2(mp4, out)
            novos += 1
        sys.stdout.write(f"{pasta}/{out.name}  <-  {mp4.relative_to(RAIZ)}\n")
    sys.stdout.write(f"{len(itens)} vídeos em '{DEST.name}' ({novos} copiados agora)\n")


if __name__ == "__main__":
    # GitHub Actions: python molde/prontos.py --destino <nome em saida/>
    if sys.argv[1:2] == ["--destino"]:
        a = alvo(sem_estilo(sys.argv[2]))
        if a is None:
            sys.exit(f"roteiro de {sys.argv[2]} não encontrado")
        sys.stdout.write(arquivo(*a) + "\n")
    else:
        main()

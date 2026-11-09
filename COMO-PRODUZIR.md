# PS Automóvel · como produzir (mapa de uma página)

O projeto vive no GitHub: [Vvs2705/ps-automovel](https://github.com/Vvs2705/ps-automovel) (público por enquanto). No PC fica só `VIDEOS PRONTOS/`. Comandos no Git Bash; os de `molde/` rodam de um clone do repositório.

## O caminho de um vídeo

| Etapa | Onde | Como | Tempo |
|---|---|---|---|
| 1. Pauta | `roteiros/PAUTA.md`, `serie-falando-de/CARROS.md` | escolher o tema ou o carro | — |
| 2. Roteiro verificado | clone temporário (seção abaixo): `roteiros/NN-slug/` ou `serie-falando-de/carros/<carro>/parte-NN/` | `ROTEIRO.md` + `FACTS.md` (fonte de cada afirmação) + `lines.json`, commit e push. Regras: `serie-falando-de/METODO.md` e a seção "Regras" dos roteiros | 15–30 min por roteiro (pesquisa) |
| 3. Fila | `molde/fila.txt` (só o coordenador edita) | uma linha por vídeo: `<pasta do roteiro> [estilo]` | — |
| 4. Produzir | GitHub Actions | `sh molde/nuvem.sh` (seção "Produzir no GitHub") | ~3,5 min por vídeo, vários ao mesmo tempo |
| 5. Baixar | PC, qualquer pasta | um comando traz o lote para `VIDEOS PRONTOS/Informativos/` e `VIDEOS PRONTOS/Falando de <Carro>/` | segundos |
| 6. Revisar | artifact `dados-<nome>` (folha.jpg, log) e `molde/saida/<nome>/cena.json` no repositório | o 1º render usa um `cena.json` de rascunho automático; ajuste no clone, commit, push e `sh molde/nuvem.sh "<pasta> [estilo]"` | 10–15 min por vídeo |
| 7. Agendar | YouTube Studio (login do Vinicius) | título, descrição e hashtags em `molde/ESTOQUE.md` | 2–3 min por vídeo |

## Produzir no GitHub
- **Mandar** (de um clone, sem mudança pendente; o script faz pull, push e dispara):
  - `sh molde/nuvem.sh`: os 5 primeiros da `fila.txt` que ainda não têm `molde/saida/<nome>/cena.json` no repositório (`LOTE=10 sh molde/nuvem.sh` para mais, até 20).
  - `sh molde/nuvem.sh todas`: sem fila, toda pasta de roteiro com `lines.json` sem `cena.json` em nenhum estilo (sai em hologram-hud).
  - `sh molde/nuvem.sh "roteiros/02-luzes-cores blueprint" serie-falando-de/carros/gol/parte-03`: exatamente estes (refaz, mesmo com `cena.json`).
  - Sem clone: no site, Actions > render > Run workflow (mesmas opções), ou `gh workflow run render.yml -R Vvs2705/ps-automovel -f pastas="..."`.
- **O que o GitHub faz** (`.github/workflows/render.yml`): um job por vídeo, em paralelo, com `sh molde/build.sh` (voz edge-tts, render, mux, checagem). No fim, o job "juntar" deixa um artifact `videos` já no formato de `VIDEOS PRONTOS/`, um `dados-<nome>` por vídeo (srt, `cena.json`, folha, poster, log) e commita os `cena.json` novos. Artifacts expiram em 1 dia. Um lote por vez; o próximo espera.
- **Baixar no PC** (de qualquer pasta, sem o projeto; espera o lote terminar, traz para `~/Videos/MEUS PROJETOS/Parafuso Solto/VIDEOS PRONTOS` e apaga os artifacts):

  ```bash
  gh api -H "Accept: application/vnd.github.raw" repos/Vvs2705/ps-automovel/contents/molde/baixar.sh | sh
  ```

  Só baixar, sem apagar: `gh run download <id> -R Vvs2705/ps-automovel -n videos -D "<pasta VIDEOS PRONTOS>"` (ids: `gh run list -R Vvs2705/ps-automovel -w render.yml`). Serve só para vídeo novo: o `gh` não sobrescreve arquivo que já existe (erro "O arquivo já existe"); vídeo refeito, use o `baixar.sh`, que baixa numa pasta temporária e copia por cima. Revisar antes de apagar: `gh run download <id> -R Vvs2705/ps-automovel -p 'dados-*'`.
- **Tempo medido (2026-11-09, repositório público, máquina de 4 vCPU e 16 GB):** build de 2 min 48 s a 3 min 18 s por vídeo (voz 15–19 s, render 68–75 s, mux 31–41 s, cópia de celular 30–36 s); job inteiro ~3,5 min; instalação com cache 1 s. Se o repositório virar **privado**, a máquina cai para 2 vCPU e 8 GB (o render, que roda em software no SwiftShader, deve levar perto do dobro; não medido) e o plano Free dá ~2.000 min/mês e 500 MB de artifacts (~12 vídeos de 31–40 MB por lote).
- **Atenção, repositório público:** qualquer pessoa logada no GitHub pode baixar os artifacts enquanto existem; por isso 1 dia de validade e o `baixar.sh` apaga logo depois.
- **Biblioteca:** o GitHub usa a Lemo-Opuscar na versão `LIB_SHA` do `render.yml` (a mesma do notebook). Atualizou a biblioteca? Troque `LIB_SHA` e `CACHE_KEY`.

## Roteiros num clone temporário
Quem escreve roteiro não precisa do projeto no PC nem da biblioteca:

```bash
git clone -q https://github.com/Vvs2705/ps-automovel.git "$TEMP/wt/<curto>" && cd "$TEMP/wt/<curto>"
```

1. Escreva só nas suas pastas (`roteiros/NN-slug/`, `serie-falando-de/carros/<carro>/`); não mexa em `molde/fila.txt` (o coordenador põe na fila).
2. `git add <suas pastas>`, `git commit -m "<carro/tema>: roteiros NN–NN"`, `git pull --rebase` e `git push` (rejeitado? `git pull --rebase` e push de novo).
3. Antes de apagar o clone: `git status` sem pendência e `git log origin/main..` vazio. Então `cd ..` e `rm -rf "$TEMP/wt/<curto>"`.

## Regras que não mudam
- **Dados:** só afirmação com fonte; recall = "fato documentado", relato de donos = "relato de donos" (selo na tela).
- **Acessibilidade:** tamanhos mínimos em `ACESSIBILIDADE.md`.
- **Máquina:** render no GitHub. No PC (7,7 GB de RAM), se precisar: `sh molde/build.sh <pasta>` num clone com a biblioteca em `%USERPROFILE%\lemo-opuscar`, um render por vez.
- **Estilos:** informativos alternam estilo (`molde/estilos/ESTILOS.md`); "Falando de" fica em hologram-hud.
- **Apresentador:** o Doutor Graxa (mecânico de jaleco, boca sincronizada com a voz) entra em todo vídeo do molde, nos 5 estilos: grande no gancho, pequeno no canto na explicação, acenando no final. `"apresentador": false` no `cena.json` desliga; `"robo"` ou `"faisca"` troca (`molde/apresentador/APRESENTADOR.md`).
- **Frequência:** estratégia e calendário em `estrategia/` (começar com 4 por semana, estoque mínimo de 10).

## Onde está cada coisa
- `ep01-oleo/` EP01 feito à mão (molde de origem; a voz não está no git: refaça com `VOZ=1 sh build.sh`). `marca/` logo, banner, avatar e textos do canal (`CANAL.md`).
- `molde/` o molde: `build.sh` (um vídeo), `nuvem.sh` (lote no GitHub), `baixar.sh` (lote para o PC), `produzir.sh` + `fila.txt` (lote no PC), `prontos.py` (pasta de prontos), `estilos/`, `apresentador/` (Doutor Graxa), `saida/` (resultado de cada build; no git só o `cena.json` de cada vídeo).
- `.github/` o workflow `render.yml` e o `instalar.sh` da máquina do GitHub.
- `VIDEOS PRONTOS/` só os vídeos finais, para subir (fica no PC, fora do git).
- `STATUS.md` (raiz e de cada pasta): o "CONTINUAR DAQUI".

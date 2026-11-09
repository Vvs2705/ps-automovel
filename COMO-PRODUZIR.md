# PS Automóvel · como produzir (mapa de uma página)

Todos os comandos rodam da pasta `Parafuso Solto`, no Git Bash. Biblioteca em `%USERPROFILE%\lemo-opuscar`.

## O caminho de um vídeo

| Etapa | Onde | Como | Tempo |
|---|---|---|---|
| 1. Pauta | `roteiros/PAUTA.md`, `serie-falando-de/CARROS.md` | escolher o tema ou o carro | — |
| 2. Roteiro verificado | `roteiros/NN-slug/` ou `serie-falando-de/carros/<carro>/parte-NN/` | `ROTEIRO.md` + `FACTS.md` (fonte de cada afirmação) + `lines.json`. Regras: `serie-falando-de/METODO.md` e a seção "Regras" dos roteiros | 15–30 min por roteiro (pesquisa) |
| 3. Fila | `molde/fila.txt` | uma linha por vídeo: `<pasta do roteiro> [estilo]` | — |
| 4. Produzir | `sh molde/produzir.sh` | faz a fila inteira, um vídeo por vez, pula o que já existe | ~2 min de máquina por vídeo |
| 5. Revisar | `molde/saida/<nome>/folha.jpg` e `cena.json` | se algo não bate com o roteiro, ajusta o `cena.json` e roda `sh molde/build.sh <pasta>` de novo | 10–15 min por vídeo |
| 6. Prontos | `VIDEOS PRONTOS/Informativos/` e `VIDEOS PRONTOS/Falando de <Carro>/` | `produzir.sh` já atualiza; à mão: `python molde/prontos.py` | segundos |
| 7. Agendar | YouTube Studio (login do Vinicius) | título, descrição e hashtags em `molde/ESTOQUE.md` | 2–3 min por vídeo |

## Regras que não mudam
- **Dados:** só afirmação com fonte; recall = "fato documentado", relato de donos = "relato de donos" (selo na tela).
- **Acessibilidade:** tamanhos mínimos em `ACESSIBILIDADE.md`.
- **Máquina:** um render por vez (PC com 7,7 GB de RAM).
- **Estilos:** informativos alternam estilo (`molde/estilos/ESTILOS.md`); "Falando de" fica em hologram-hud.
- **Apresentador:** o Doutor Graxa (mecânico de jaleco, boca sincronizada com a voz) entra em todo vídeo do molde, nos 5 estilos: grande no gancho, pequeno no canto na explicação, acenando no final. `"apresentador": false` no `cena.json` desliga; `"robo"` ou `"faisca"` troca (`molde/apresentador/APRESENTADOR.md`).
- **Frequência:** estratégia e calendário em `estrategia/` (começar com 4 por semana, estoque mínimo de 10).

## Onde está cada coisa
- `ep01-oleo/` EP01 feito à mão (molde de origem). `marca/` logo, banner, avatar e textos do canal (`CANAL.md`).
- `molde/` o molde: `build.sh` (um vídeo), `produzir.sh` + `fila.txt` (lote), `prontos.py` (pasta de prontos), `estilos/`, `apresentador/` (Doutor Graxa), `saida/` (resultado de cada build: voz, `cena.json`, vídeo).
- `VIDEOS PRONTOS/` só os vídeos finais, para subir.
- `STATUS.md` (raiz e de cada pasta): o "CONTINUAR DAQUI".

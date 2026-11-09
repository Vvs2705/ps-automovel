# PS Automóvel (ex-Parafuso Solto) · STATUS (2026-11-09)

Canal dark (faceless: nenhum humano na tela) de mecânica: problemas, diagnóstico pelo som, modelos, curiosidades, conceitos. Público: homens e mulheres que gostam de carro. Nome trocado em 2026-11-09: "Parafuso Solto" já é um canal de humor com 6,7 mi de inscritos. Agora é **PS Automóvel** (@psautomovel, livre no YouTube, TikTok e Instagram), slogan "Seu carro sempre em boas mãos.", logo feito pelo Vinicius (vermelho, prata, fibra de carbono).

## Feito
- **EP01 piloto "Por que trocar o óleo?"** em `ep01-oleo/`: 1:20, vertical 1080×1920, 24 fps, −14 LUFS.
  - `parafuso-solto-ep01.mp4`, `.srt`, `poster.jpg`, `TREATMENT.md`, `FACTS.md` (fonte de cada afirmação), `CREDITS`.
  - Estilo-base: Sci-fi Hologram HUD (biblioteca Lemo-Opuscar, MIT), com enxertos de Dark Keynote (vermelho só enquanto o defeito existe), Iso-Infographic (cor fixa do óleo) e Visual Investigation (lupa).
  - Voz: edge-tts `pt-BR-AntonioNeural` (grátis, serviço não oficial). Trilha e efeitos sintetizados em numpy.
  - Refazer tudo: `sh build.sh` (voz nova só com `VOZ=1`). Render: ~45 s para 1.920 quadros.
- Biblioteca instalada em `%USERPROFILE%\lemo-opuscar` (core + edge-tts; venv com Python 3.14 porque o Python 3.12 do uv falhou).
- Análise dos 66 estilos: ~45 têm algo para o canal; plano de 7 quadros (Que barulho é esse?, Código de falha, Como funciona, No quadro, Versus, História do modelo, Shorts).

- **Marca PS Automóvel** em `marca/`: banner 2560×1440 (`ps.js`, `?a=ps`), avatar 800×800, textos do canal em `marca/CANAL.md`. O logo, o banner e o código antigos do Parafuso Solto foram para a Lixeira em 2026-11-09.

## Frentes paralelas (abertas em 2026-11-09, coordenadas pelo chat principal)
- PRONTO `estrategia/` (sessão ps-estrategia; API de upload marcada como "fontes oficiais em conflito"): YPP e monetização de Shorts com fonte oficial, posts/dia, horários, plano de 90 dias, calendário de 30 dias, como agendar.
- PRONTO `serie-falando-de/` (sessão ps-falando-de): CARROS.md/carros.csv (50; Gol e Onix empatados no topo; Ranger, Fit, BYD Song e Golf com fonte fraca), METODO.md, piloto do Gol com 10 partes. Falta o carro nº 2 em diante.
- PRONTO `roteiros/` (sessão ps-roteiros): PAUTA.md (30 temas) e 10 roteiros de 69 a 86 s. Pronúncia das siglas não ouvida.
- PRONTO `molde/` (sessão ps-molde): `sh molde/build.sh <pasta-do-roteiro>` gera o Short completo em `molde/saida/<nome>/` (~2 min de máquina + 10–15 min revisando o `cena.json`). Testes: `saida/01-calibragem-pneu` (63 s) e `saida/gol-parte-06` (58 s), −14,1 LUFS. Próximos passos em `molde/STATUS.md`.
- Acessibilidade: `ACESSIBILIDADE.md` (tamanhos mínimos). EP01 já refeito com legenda de 62 px.

## Não verificado
- Ninguém ouviu o vídeo ainda: o mix foi medido (loudness, silêncios), não escutado.
- Checagem de fala por reconhecimento de voz (Whisper) não rodou: o modelo não foi baixado.
- Zonas de botões do Shorts/Reels não conferidas num celular.

## CONTINUAR DAQUI
0. EP01 como PS Automóvel (`ps-automovel-ep01.mp4`, cópia leve em `out/ps-automovel-ep01-celular.mp4`). Vinheta e final trocados: em vez do parafuso, uma ambulância de arame (`buildAmbulance` em models.js) chega freando com o giroflex (4,7–6,5 s) e vai embora com o carro na maca e as portas abertas (75,6–80 s); o nome "PS AUTOMÓVEL / RESGATE AUTOMOTIVO" é pintado na lateral. Sons novos no mix.py: sirene, motor do furgão, chiado de pneu, freio a ar. L13 = "Pê Ésse Automóvel. Seu carro sempre em boas mãos." Falta ouvir (sirene, sigla "PS") e decidir se o HUD continua ciano. Ideias guardadas: mecânicos de jaleco levando o carro na maca, guincho com capa "PS Automóvel".
1. Vinicius assiste o EP01 e manda os ajustes (voz, ritmo, música, textos).
2. Decidir voz definitiva do canal (edge-tts grátis × ElevenLabs com licença comercial).
3. EP02: escolher o quadro e o tema; reaproveitar `ep01-oleo/engine`, `models.js`, `mix.py` e `music/score.py` como molde.
4. Para o quadro "Que barulho é esse?": conseguir gravações reais de defeitos (CC0/CC BY ou gravações próprias).

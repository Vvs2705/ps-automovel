# PS Automóvel · STATUS (fechado em 2026-11-09)

Canal "dark" (sem pessoa real na tela; personagem ilustrado pode) de mecânica no YouTube Shorts: **PS Automóvel** (@psautomovel), slogan "Seu carro sempre em boas mãos.". Ex-"Parafuso Solto" (nome trocado: já existe um canal de humor grande com esse nome). Repositório público: https://github.com/Vvs2705/ps-automovel (o Vinicius pode passar para privado; aí as máquinas do Actions ficam menores e com ~2.000 min/mês).

## Onde está cada coisa
- Mapa de produção de uma página: `COMO-PRODUZIR.md`. Acessibilidade (tamanhos mínimos de texto): `ACESSIBILIDADE.md`.
- `estrategia/`: regras do YouTube (YPP muda em 01/02/2027), frequência (começar com 4/semana, no máximo 1/dia), horários de teste, plano de 90 dias, calendário de 30 dias.
- `roteiros/`: série informativa. PAUTA.md com 30 temas; roteiros 01–20 escritos com fonte por afirmação.
- `serie-falando-de/`: 50 carros mais populares (CARROS.md), método (METODO.md, 2 fontes independentes por problema), 10 partes prontas de Gol, Palio e HB20; Strada e Onix em andamento.
- `molde/`: um roteiro vira Short com um comando; 5 estilos (hologram-hud, blueprint, chalkboard, swiss-motion, midcentury-toon); apresentador Doutor Graxa com boca sincronizada; `fila.txt` + `produzir.sh`; render no GitHub Actions em lotes de 5 (`nuvem.sh`).
- `ep01-oleo/`: EP01 feito à mão (origem do molde). `marca/`: logo, banner, avatar, `CANAL.md`.
- No PC fica só `VIDEOS PRONTOS/` (Informativos/ e Falando de <Carro>/) com `PUBLICAR.md` (ordem, títulos, descrições, hashtags).

## Fechamento do dia 2026-11-09
- Meta do dia: **20 episódios prontos** para começar a postar. Render no GitHub Actions; o Vinicius publica e agenda pelo YouTube Studio.
- Roteiros escritos que ainda não viraram vídeo: informativos 11–20, Gol 10, Palio 1–10, HB20 1–10 (e Strada/Onix quando fecharem).

## Não verificado
- Ninguém ouviu os vídeos com atenção ainda: siglas ("Pê Ésse"), sirene, ritmo da voz.
- Zonas de botões do Shorts não conferidas num celular real.
- Fontes dos roteiros: links testados por amostra; a checagem de cada afirmação foi feita pelas sessões que escreveram.

## CONTINUAR DAQUI (volta com métricas, alguns dias depois do 1º post)
1. Levantar as métricas no YouTube Studio de cada Short: visualizações, "vi × deslizei", duração média e % assistida, inscritos por vídeo, de onde veio o público, idade e gênero. Jeitos de trazer os dados: o Vinicius exporta ou manda print do Studio, ou liga a conta num conector de dados (YouTube Analytics) — ele faz o login.
2. Comparar por série (informativo × "Falando de"), por estilo visual, por duração e por horário; ver em que segundo as pessoas saem (curva de retenção) para ajustar gancho, ritmo e o tempo do Doutor Graxa na tela.
3. Decidir com base nisso: cadência (4/semana ou mais), mix de séries e estilos, próximos carros e temas. Só então voltar a produzir em escala (`sh molde/nuvem.sh` no modo "todas" faz tudo que já tem roteiro).
4. Pendências antigas: decidir a voz definitiva (edge-tts grátis × ElevenLabs com licença comercial) antes de produzir em escala; ideia guardada de vinheta com mecânicos de jaleco levando o carro na maca.

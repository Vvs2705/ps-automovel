# TREATMENT · Parafuso Solto EP01 "Por que trocar o óleo?"

Estilo: Sci-fi Hologram HUD (scene style, uso "teardown" + "upgrade"). 1080×1920, 24 fps, 80 s. Voz edge-tts pt-BR-AntonioNeural. Trilha e efeitos sintetizados em numpy. Canal dark: nenhum ser humano na tela.

## 1. Três estruturas
1. **Lista "5 funções do óleo"**: contagem de 5 a 1. Clara, mas é a cara de qualquer vídeo de oficina e não tem virada.
2. **Antes/depois lado a lado**: óleo novo × óleo velho no mesmo pad. Boa comparação, mas sem arco: tudo é dito em 10 s.
3. **A vida de uma película de óleo** (escolhida): o protagonista é o óleo. Nasce limpo, protege o motor, envelhece com os quilômetros, quebra, e o motor trava. Óleo novo entra e o parafuso, que se soltou na abertura, volta a apertar. Tem sujeito, objetivo, virada e um final que rima com a abertura.

## 2. Logline e arco
Uma película mais fina que um fio de cabelo segura um motor inteiro, até o dia em que ninguém troca o óleo.
- Gancho (0–4 s): flash do desastre, biela em alerta vermelho.
- Vinheta (4–10 s): parafuso se solta, cai, o nome do canal rola até travar.
- Setup (10–34 s): motor, rotação, a película e o que ela faz.
- Desgaste (34–50 s): quilômetros passam, o óleo escurece, vira borra.
- Virada (50–58 s): silêncio, a película rompe, metal no metal, o motor trava.
- Final (58–80 s): óleo novo, regra do manual e uso severo, o parafuso aperta de volta, nome do canal.

## 3. Benchmark
- **Aprender** com os cortes animados de motor do canal Animagraffs: cada fluido com uma cor fixa, um sistema por vez, o corte que mostra só o necessário. Com trailers de lançamento de hardware: ritmo de abre-rápido / fecha-mais-rápido.
- **Não pegar**: modelos, cores, layouts, ícones, fontes ou trilhas deles; nenhuma marca de óleo ou carro aparece.

## 4. Cor
Hue frio azul-gelo `#6ad8ff` (linhas, HUD). Acento laranja `#ff8a3d` só em valor travado. Exceção `keep`: o óleo tem cor própria, mel `#ffc94a` quando novo, marrom-escuro quando velho (a mudança de cor é a história). Vermelho `#ff3344` só enquanto o defeito existe (gancho e virada); depois do óleo novo ele nunca volta (enxerto do Dark Keynote).

## 5. Lista de planos
| # | t (s) | Plano | Câmera | Por quê |
|---|---|---|---|---|
| 1 | 0–4 | Close 3/4 da biela no virabrequim, caixa de alvo vermelha | push-in lento + glitch 3 quadros | o gancho é o defeito, grande na tela |
| 2 | 4–10 | Parafuso de cabeça sextavada, perfil | travada, depois tilt quando ele cai | o nome do canal vira objeto |
| 3 | 10–22 | Conjunto pistão-biela-virabrequim em corte, perfil | crane até o nível do olho, dolly lento | "metal contra metal" precisa ver o movimento |
| 4 | 22–34 | Lupa no anel do pistão contra a parede do cilindro | pull-back + lupa (quadro no quadro) | duas escalas: o motor e a película |
| 5 | 34–50 | O mesmo, odômetro rolando, óleo escurecendo, galerias entupindo | quase estático, drift 3/4 | tempo de leitura sem quadro morto |
| 6 | 50–58 | Close na película rompendo, faíscas brancas, virabrequim trava | whip até o mancal + parada seca | a virada pede o maior detalhe |
| 7 | 58–72 | Motor inteiro com óleo novo, cartões do manual | turntable lento | "está tudo bem de novo" |
| 8 | 72–80 | Parafuso aperta de volta; nome e tagline | push-in no parafuso | rima com a vinheta |

## 6. Mapa de cues (120 BPM, compasso = 2 s)
| Seção | Compassos | Música | Cue principal |
|---|---|---|---|
| Gancho | 0–1 | drone grave + batidas metálicas | lock vermelho no 1º tempo |
| Vinheta | 2–4 | riser → hit em 7,0 s → drop em 8,0 s | nome trava em 8,0 s |
| Setup | 5–16 | baixo em colcheias + arpejo, hats | "3.000 RPM" e "50/s" travam nas palavras |
| Funções | 11–16 | metade do tempo (leitura) | 5 chips entram palavra a palavra |
| Desgaste | 17–24 | sai o arpejo, filtro fecha, notas longas | odômetro gira; borra trava a 47 s |
| Silêncio | 25 | silêncio digital 50,0–50,6 s | — |
| Virada | 25–28 | só batida do mancal desacelerando | trava em "trava" (≈56 s) |
| Final | 29–39 | sobe um tom, groove cheio | drop em 58 s; nome em 76 s |

## 7. Som
| Seção | Ambiente | Foley | Música |
|---|---|---|---|
| Gancho | zumbido do projetor 40/80/120 Hz | batida de biela, lock | drone |
| Vinheta | ambiente | catraca do parafuso girando, tink da queda, rolagem do nome | riser, drop |
| Setup | ambiente | varredura do scan, servo, ticks do número | groove |
| Funções | ambiente | blip afinado por chip | half-time |
| Desgaste | ambiente + borbulha grave do óleo | ticks do odômetro, borbulha engrossando | escurece |
| Virada | silêncio, depois ambiente seco | raspagem metálica, batidas, power-down | quase nada |
| Final | ambiente | scan do óleo novo, locks, catraca apertando, clack final | groove +1 tom |

Pelo menos dois silêncios (50,0 s e 56,8 s). Som como transição: a catraca do parafuso entra antes do corte da vinheta (J-cut) e o ronco do motor atravessa o scan do óleo novo (L-cut).

## 8. Legenda e títulos
Legenda HUD (placa escura com cantoneiras e barras de voz), Rajdhani Medium caixa alta, palavra falada em branco quente, centralizada em y ≈ 1360 (fora da faixa de botões do Shorts). Nome "PARAFUSO SOLTO" em Rajdhani Light, tracking largo, rola de glifos até travar no acento laranja. Tagline em Share Tech Mono.

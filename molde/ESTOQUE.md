# Estoque de Shorts · PS Automóvel (10 vídeos)

Atualizado em 2026-11-09. Os 10 vídeos que a estratégia pede antes do primeiro post (`estrategia/ESTRATEGIA.md`): o EP01, os dois testes do molde já prontos e os 7 produzidos nesta rodada com `sh molde/build.sh <pasta-do-roteiro>`. Os roteiros e os FACTS não foram alterados.

- Todos: 1080×1920, 24 fps. Os 9 do molde saem a −14 LUFS (−14,1 a −14,2) com pico ≤ −1,2 dBFS e **0 problema de texto** na checagem (`saida/<nome>/out/checagem.txt`). A cópia de celular é a de 2400 kbps.
- Calendário (`estrategia/calendario-30-dias.csv`): D1 12:00, D3 18:00, D4 18:00, D5 12:00, D8 20:00, D10 12:00, D11 18:00, D12 20:00. Em cada dia o mesmo vídeo vai ao YouTube Shorts, ao TikTok e ao Reels.
- **Estilo visual** (`molde/estilos/ESTILOS.md`): no calendário a sequência é hologram-hud, chalkboard, hologram-hud, blueprint, hologram-hud, swiss-motion, hologram-hud, midcentury-toon: nenhum par de vídeos seguidos tem o mesmo estilo. Os 4 refeitos (D3, D5, D10, D12) usam o mesmo `cena.json` e a mesma voz do original, com outra trilha (a semente vem do nome); saíram com −14,1 LUFS, pico ≤ −1,4 dBFS e 0 problema de texto. Os originais em hologram-hud continuam em `molde/saida/<nome>/` (podem virar reserva). As reservas (01 e Gol #6) estão em hologram-hud: se entrarem no calendário, encaixe entre dois vídeos de outro estilo ou refaça com `ESTILO=<nome> sh molde/build.sh <pasta>`.
- **Ninguém ouviu nenhum dos vídeos**: voz, sirene, bipes de alerta, assinatura 20% mais rápida e a pronúncia de “Pê Ésse”, “é á cento e onze” (EA111) e “Á Bê Ésse” (ABS) não foram conferidos. Os 7 novos também não foram vistos em movimento: só a folha de contato de 18 quadros e a checagem automática.
- Os `cena.json` dos 7 novos foram revisados por Claude fala a fala contra o ROTEIRO, não pelo Vinicius. Para refazer um vídeo depois de mexer no `cena.json`, rode o build de novo (~1 min 45 s, a voz é reaproveitada).
- O que o molde não desenha (painel com luzes, termômetro, fumaça colorida, pastilha e bateria em corte, reservatório, mapa, manual, scanner) virou zona + etiqueta + cartão; o detalhe de cada vídeo está abaixo.

## Tabela

| Dia no calendário | Vídeo | Estilo | Duração | .mp4 | Cópia de celular | Título |
|---|---|---|---|---|---|---|
| D1 | EP01 | hologram-hud (EP01, feito à mão) | 80,0 s | `ep01-oleo/ps-automovel-ep01.mp4` | `ep01-oleo/out/ps-automovel-ep01-celular.mp4` | Por que trocar o óleo? |
| D3 | 03-luz-da-injecao | chalkboard | 64,4 s | `molde/saida/03-luz-da-injecao-chalkboard/03-luz-da-injecao-chalkboard.mp4` | `molde/saida/03-luz-da-injecao-chalkboard/03-luz-da-injecao-chalkboard-celular.mp4` | Luz da injeção acesa: fixa ou piscando? |
| D4 (Falando de [Carro 1] · parte 1) | gol-parte-01 | hologram-hud | 58,7 s | `molde/saida/gol-parte-01/gol-parte-01.mp4` | `molde/saida/gol-parte-01/gol-parte-01-celular.mp4` | Falando de Gol #1: Consumo de óleo no 1.0 |
| D5 | 06-barulho-ao-frear | blueprint | 58,6 s | `molde/saida/06-barulho-ao-frear-blueprint/06-barulho-ao-frear-blueprint.mp4` | `molde/saida/06-barulho-ao-frear-blueprint/06-barulho-ao-frear-blueprint-celular.mp4` | Barulho ao frear: chiado, raspagem ou vibração? |
| D8 (entra no lugar do “turbo”, que não tem roteiro) | 04-motor-esquentando | hologram-hud | 65,0 s | `molde/saida/04-motor-esquentando/04-motor-esquentando.mp4` | `molde/saida/04-motor-esquentando/04-motor-esquentando-celular.mp4` | Motor esquentando: o que fazer e o que nunca fazer |
| D10 | 09-bateria | swiss-motion | 63,7 s | `molde/saida/09-bateria-swiss-motion/09-bateria-swiss-motion.mp4` | `molde/saida/09-bateria-swiss-motion/09-bateria-swiss-motion-celular.mp4` | Bateria fraca: os sinais antes de o carro não pegar |
| D11 (Falando de [Carro 1] · parte 2) | gol-parte-02 | hologram-hud | 55,6 s | `molde/saida/gol-parte-02/gol-parte-02.mp4` | `molde/saida/gol-parte-02/gol-parte-02-celular.mp4` | Falando de Gol #2: Falha de ignição |
| D12 | 05-fumaca-escapamento | midcentury-toon | 67,2 s | `molde/saida/05-fumaca-escapamento-midcentury-toon/05-fumaca-escapamento-midcentury-toon.mp4` | `molde/saida/05-fumaca-escapamento-midcentury-toon/05-fumaca-escapamento-midcentury-toon-celular.mp4` | Fumaça no escapamento: o que cada cor indica |
| reserva (fora do calendário de 30 dias) | 01-calibragem-pneu | hologram-hud | 63,2 s | `molde/saida/01-calibragem-pneu/01-calibragem-pneu.mp4` | `molde/saida/01-calibragem-pneu/01-calibragem-pneu-celular.mp4` | O número do pneu NÃO é a pressão certa |
| reserva (fora do calendário de 30 dias; parte 6 da série) | gol-parte-06 | hologram-hud | 58,1 s | `molde/saida/gol-parte-06/gol-parte-06.mp4` | `molde/saida/gol-parte-06/gol-parte-06-celular.mp4` | Falando de Gol #6: Lanterna traseira (recall) |

## Por vídeo

### D1 · Por que trocar o óleo?

- Arquivos: `ep01-oleo/ps-automovel-ep01.mp4` e `ep01-oleo/out/ps-automovel-ep01-celular.mp4` · 80,0 s
- Hashtags: #PSAutomóvel #trocadeóleo #óleodomotor #dicasdecarro #mecânica #Shorts (RASCUNHO)

**Descrição:**

**[RASCUNHO: o TREATMENT.md do EP01 não traz descrição nem hashtags; este texto foi escrito agora a partir do vídeo e do `ep01-oleo/FACTS.md`. Revisar antes de postar.]**

Por que trocar o óleo do motor? Uma película de óleo separa as peças que se movem, ajuda a refrigerar, limpar e proteger contra a corrosão. Com calor e uso o óleo se degrada e acumula fuligem e resíduos; fora do prazo, pode virar borra e entupir passagens. Siga o prazo do manual do seu carro, e o prazo de uso severo se for o seu caso.

Fontes: ver `ep01-oleo/FACTS.md` (TotalEnergies, LIQUI MOLY, Revista Carros, IFSC, Castrol, Nakata).

Conteúdo informativo: não substitui o diagnóstico de um mecânico de confiança. Na dúvida, siga o manual do seu carro.

PS Automóvel: seu carro sempre em boas mãos.

**O que foi anotado:**

- Já pronto, **não foi refeito** e não passa pelo molde (feito à mão, 80 s).
- A cópia de celular está em `ep01-oleo/out/` (2400 kbps).
- Há também `ep01-oleo/parafuso-solto-ep01.mp4`, com o nome antigo do canal; o do estoque é o `ps-automovel-ep01.mp4`.

### D3 · Luz da injeção acesa: fixa ou piscando?

- Estilo **chalkboard**. Arquivos: `molde/saida/03-luz-da-injecao-chalkboard/03-luz-da-injecao-chalkboard.mp4` e `molde/saida/03-luz-da-injecao-chalkboard/03-luz-da-injecao-chalkboard-celular.mp4` (o original em hologram-hud continua em `molde/saida/03-luz-da-injecao/`) · 64,4 s
- Hashtags: #PSAutomóvel #luzdainjeção #checkengine #dicasdecarro #mecânica #Shorts

**Descrição:**

A luz da injeção (luz de falha do motor, "check engine") acende quando o carro detecta falha no controle de emissões ou em sensores importantes do motor. Fixa: vá à oficina o quanto antes, sem forçar o motor. Piscando é mais grave: o combustível que não queima pode superaquecer e destruir o catalisador, e os manuais mandam aliviar o acelerador e baixar a rotação até parar de piscar.

Fontes: manuais de fabricantes de carro (Fiat, Volkswagen, Chevrolet, Renault, Hyundai, Nissan), Resolução Conama 354/2004 e imprensa técnica. Para carros a gasolina, etanol ou flex.

Conteúdo informativo: não substitui o diagnóstico de um mecânico de confiança. Na dúvida, siga o manual do seu carro.

PS Automóvel: seu carro sempre em boas mãos.

**O que foi anotado:**

- Sem selo: o ROTEIRO não traz classificação. Linha `Fonte:` por fala: manuais Fiat/VW/Chevrolet/Renault (padrão), manual Nissan Kicks 2018 (L09-L10), IBAMA IN 126/2006 e manual Fiat (L11), Mecânica Online 03/11/2026 (L12), manual Fiat e IN 126 (L13), manuais de seis fabricantes (L14).
- Cor: âmbar na luz fixa (L01-L04, L07, L10, L13); vermelho só no piscando (L05, L06, L08), como pede a nota de produção. A luz do painel em si **não é desenhada**.
- **Faltou desenho** (virou zona + etiqueta): painel com o ícone do motor fixo/piscando (L01, L05, L09, L11, L13, L14), módulo de controle em corte (L02), mapa/oficina (L03, L08), odômetro com “?” (L04), catalisador em corte rachando (L06: zona escapamento + lupa), pedal e conta-giros (L07), bocal com tampa solta e ícones de chama/cigarro (L09-L10: zona tanque + ponto “TAMPA DO TANQUE”), scanner e lista de códigos (L11-L13), quatro ícones de luz e o manual abrindo (L14).
- L04: cartão “NENHUMA · Quilometragem segura · Nem em km, nem em dias” (sem nenhum número de km, como pede o ROTEIRO; apoio: FACTS 9a).
- L10: “SEM CHAMA” só na etiqueta; “cigarro” fica na legenda falada (“SEM CHAMA OU CIGARRO” tem 4 palavras).
- Fato/pronúncia: nada a corrigir; “Pê Ésse” é a única grafia fonética.

### D4 (Falando de [Carro 1] · parte 1) · Falando de Gol #1: Consumo de óleo no 1.0

- Arquivos: `molde/saida/gol-parte-01/gol-parte-01.mp4` e `molde/saida/gol-parte-01/gol-parte-01-celular.mp4` · 58,7 s
- Hashtags: #FalandoDeGol #Gol #VolkswagenGol #ConsumoDeOleo #MecanicaAutomotiva #PSAutomovel #Shorts

**Descrição:**

Consumo de óleo no Gol 1.0 com motor EA111: o que a Volkswagen admitiu em 2009, o que donos e mecânicos relatam hoje, como conferir e o que fazer. Dados e fontes na ficha de fatos. Na dúvida, procure uma oficina de confiança.

Fontes e data de acesso (2026-11-09): ver `FACTS.md`.

**O que foi anotado:**

- Selo RELATO DE DONOS e título “FALANDO DE GOL #1” (classificação do ROTEIRO). `Fonte:` por fala: Vrum 09/04/2026 (padrão), Mecânica Online 01/11/2009 (L04-L06), Vrum + OnlyCars (L07), OnlyCars (L08), Vrum + Mecânica Popular (L10).
- **Pronúncia**: o `lines.json` escreve “é á cento e onze” para EA111. Na tela a legenda foi trocada (campo `legenda`) por “EA111”, “2008 e 2013”, “2009”, “3 para 4 anos”. **Ninguém ouviu** como a voz lê “é á cento e onze”.
- Cartões: L02 EA111, L03 2008–2013, L04 2009, L05 3 PARA 4 ANOS, L10 1× POR SEMANA.
- **Faltou desenho**: vareta com nível descendo (L01, L08), linha do tempo com três Gol (L03), recorte de jornal e pistão/biela (L04), carimbo RECALL riscado (L06), anéis e retentores destacados (L07), fumaça azul saindo do escapamento (L09: zona escapamento + etiqueta), calendário semanal e manual aberto (L10), luz de pressão do óleo (L11: zona motor em vermelho + etiqueta).
- Fato: nada a corrigir. O período 2008–2013 tem uma só fonte (Vrum), e a fala já o atribui à imprensa.

### D5 · Barulho ao frear: chiado, raspagem ou vibração?

- Estilo **blueprint**. Arquivos: `molde/saida/06-barulho-ao-frear-blueprint/06-barulho-ao-frear-blueprint.mp4` e `molde/saida/06-barulho-ao-frear-blueprint/06-barulho-ao-frear-blueprint-celular.mp4` (o original em hologram-hud continua em `molde/saida/06-barulho-ao-frear/`) · 58,6 s
- Hashtags: #PSAutomóvel #freio #pastilhadefreio #dicasdecarro #mecânica #Shorts

**Descrição:**

Chiado agudo ao frear pode ser o indicador de desgaste da pastilha, mas poeira, areia e ferrugem também fazem chiar. Raspagem de ferro com ferro é sinal de troca urgente. Vibração no pedal ou no volante costuma apontar o disco, e o pedal vibrando numa freada forte de emergência é o ABS atuando.

Freio é item de segurança: na dúvida, procure a oficina. Fontes: Bosch, Fras-le, manuais de fabricantes de carro e imprensa técnica.

Conteúdo informativo: não substitui o diagnóstico de um mecânico de confiança. Na dúvida, siga o manual do seu carro.

PS Automóvel: seu carro sempre em boas mãos.

**O que foi anotado:**

- Sem selo (sem classificação no ROTEIRO). `Fonte:` Bosch, Fras-le e manuais de fabricantes (padrão); L10 manual Mazda MX-5 2025 (ABS); L11 Bosch Mobility; L12 Fras-le, Bosch e O Mecânico 2020.
- **Pronúncia**: “Á Bê Ésse” (L10); a legenda foi trocada por “ABS”. Ninguém ouviu como a voz lê.
- **Faltou desenho**: pastilha em corte com a lâmina (L02-L03: zona freios + lupa), ondas sonoras (L01, L03, L06), partículas entre disco e pastilha (L04), gotas na roda (L05), gráfico de frenagem e pedal afundando (L08), disco empenado e pedal tremendo (L09), painel com ícone de pastilha (L11), paquímetro (L12: virou cartão “LIMITE · VARIA”).
- Vermelho só nas falas de defeito (L01, L06, L07, L08); L10 (ABS normal) em branco.
- Fato: os manuais lidos são de versões internacionais (Mazda, Nissan, Kia), como o ROTEIRO já avisa. Não há som real de chiado: o “Que barulho é esse?” ainda depende de gravação.

### D8 (entra no lugar do “turbo”, que não tem roteiro) · Motor esquentando: o que fazer e o que nunca fazer

- Arquivos: `molde/saida/04-motor-esquentando/04-motor-esquentando.mp4` e `molde/saida/04-motor-esquentando/04-motor-esquentando-celular.mp4` · 65,0 s
- Hashtags: #PSAutomóvel #motoresquentando #arrefecimento #dicasdecarro #mecânica #Shorts

**Descrição:**

Ponteiro ou luz de temperatura do motor em alerta: pare em local seguro, sinalize o carro e não siga viagem. Se houver vapor ou vazamento, desligue o motor e não abra o capô. Nunca abra a tampa do reservatório com o motor quente: o sistema está sob pressão e o líquido pode queimar. Confira o nível só com o motor frio e use o líquido de arrefecimento indicado no manual.

Fontes: manuais de fabricantes de carro (Volkswagen, Hyundai, Renault, Mazda, Honda, Kia), imprensa técnica e Código de Trânsito Brasileiro.

Conteúdo informativo: não substitui o diagnóstico de um mecânico de confiança. Na dúvida, siga o manual do seu carro.

PS Automóvel: seu carro sempre em boas mãos.

**O que foi anotado:**

- Sem selo. `Fonte:` por fala: manuais VW/Hyundai/Renault/Mazda (padrão), CTB art. 40 e 46 (L03), manuais VW/Renault/Hyundai/Honda (L05), manuais VW e Hyundai (L10), Olhar Digital 26/07/2025 (L11), A Gazeta 2020 e manual Mazda (L12), Hyundai HB20 e Renault Duster (L13), Hyundai/VW/Renault (L14).
- Etiquetas acrescentadas a partir da própria fala: NÃO ABRA NADA (L01), NÃO SIGA VIAGEM (L02), FABRICANTES DIVERGEM (L05), ÁGUA NÃO BASTA (L10: a fala diz “não é só água”, que tem 4 palavras).
- **Faltou desenho**: painel com ponteiro de temperatura e vapor no capô (L01, L04: zona painel/motor), ícone “não dirigir” e acostamento (L02), triângulo (L03: zona faróis), dois manuais com setas opostas (L05), relógio sem número (L06), manômetro e cadeado na tampa (L07), jato de líquido (L08), reservatório em corte com marcas MIN-MAX (L09: zona arrefecimento + lupa), manual aberto (L10), mangueira pingando (L11), junta escurecendo (L12: lupa), mão se afastando da ventoinha (L13), guincho (L14).
- Fato: nada a corrigir. O ROTEIRO respeita a divergência VW × Renault × Hyundai/Honda sobre desligar sem vapor e não dá minutos nem graus.
- Entra no lugar do “turbo” do calendário (D8), que não tem roteiro.
- Assunto de segurança (queimadura): vale ouvir as L04, L07 e L08 antes de postar.

### D10 · Bateria fraca: os sinais antes de o carro não pegar

- Estilo **swiss-motion**. Arquivos: `molde/saida/09-bateria-swiss-motion/09-bateria-swiss-motion.mp4` e `molde/saida/09-bateria-swiss-motion/09-bateria-swiss-motion-celular.mp4` (o original em hologram-hud continua em `molde/saida/09-bateria/`) · 63,7 s
- Hashtags: #PSAutomóvel #bateria #carronãopega #dicasdecarro #mecânica #Shorts

**Descrição:**

Sua bateria dá sinais antes de deixar o carro na mão: partida lenta, só cliques ao girar a chave, faróis e painel fracos e caixa estufada. A luz da bateria acesa com o carro andando costuma apontar o sistema de carga (alternador ou correia), não só a bateria.

Fontes: fabricantes de bateria (Moura, Heliar), imprensa técnica (AutoPapo) e manual de fabricante de carro.

Conteúdo informativo: não substitui o diagnóstico de um mecânico de confiança. Na dúvida, siga o manual do seu carro.

PS Automóvel: seu carro sempre em boas mãos.

**O que foi anotado:**

- Sem selo. `Fonte:` Moura, Heliar, AutoPapo e manual Kia (padrão); L08 só Moura; L09 Heliar, AutoPapo e manual Kia; L12 manual Kia, Heliar e Moura.
- **Fato a decidir (não alterei)**: L02 “de dois a cinco anos” é a união das faixas do FACTS (Moura cita 2–3, 2–4 e 3–5 em páginas diferentes; a Heliar não dá número). O cartão diz “2-5 ANOS · Segundo os fabricantes”.
- Fonte única no FACTS: calor encurtando a vida (L03, Moura 4a) e caixa estufada = trocar na hora (L08, Moura 8a).
- **Faltou desenho**: bateria em corte e em detalhe com indicador de carga, caixa estufando e polos (L01, L08), linha do tempo de 5 anos (L02: virou cartão), ícones sol/trajeto/carro parado (L03: três etiquetas), motor de partida e ondas de áudio (L04-L06), comparação de faróis (L07: zona faróis), painel com ícone da bateria (L09), mapa (L11), gás ciano e ícones de chama, óculos e luvas (L12: três etiquetas), cabos de chupeta e manual (L13), analisador digital (L14).
- Chupeta: nenhuma ordem de cabos aparece (a nota de produção pede isso).

### D11 (Falando de [Carro 1] · parte 2) · Falando de Gol #2: Falha de ignição

- Arquivos: `molde/saida/gol-parte-02/gol-parte-02.mp4` e `molde/saida/gol-parte-02/gol-parte-02-celular.mp4` · 55,6 s
- Hashtags: #FalandoDeGol #Gol #VolkswagenGol #FalhaDeIgnicao #MecanicaAutomotiva #PSAutomovel #Shorts

**Descrição:**

Falha de ignição no Gol com motor EA111: o que mecânicos relatam, como o motor se comporta, por que usar scanner antes de trocar peça e o que o manual manda fazer. Fontes na ficha de fatos. Procure uma oficina de confiança.

Fontes e data de acesso (2026-11-09): ver `FACTS.md`.

**O que foi anotado:**

- Selo RELATO DE DONOS e título “FALANDO DE GOL #2”. `Fonte:` por fala: Oficina Brasil 02/10/2012 (L02, L08), O Mecânico 2015 (L03) e 2020 (L04, L06, L07), manual VW (L04), AutoPapo 21/02/2019 (L05, L06), manual do Novo Gol my-2017 (L09), O Mecânico/NGK 2015 (L10).
- **Fato a decidir (não alterei)**: a seção “Cuidados” do ROTEIRO manda não falar em bomba de combustível como defeito do Gol, mas a L06 lista “a bomba de combustível” entre os suspeitos de mecânicos (o FACTS L06 sustenta com duas listas independentes). Decidir se a L06 fica assim.
- **Pronúncia**: “é á cento e onze” → legenda “EA111”. Ninguém ouviu.
- **Faltou desenho**: ponteiro de rotação oscilando (L01), corte do motor com dois cilindros em vermelho e bobina dupla (L02-L03: lupa na L03), gráfico de potência (L04), ícone de injeção (L05: zona painel), cinco peças em lista (L06: cartão “5 SUSPEITOS”), scanner (L07), bobina em corte com módulo interno (L08: cartão “4 BOBINAS”), cabo de vela com X (L10).
- L08 conta “um caso publicado” (Oficina Brasil, 2012); a fala não generaliza.

### D12 · Fumaça no escapamento: o que cada cor indica

- Estilo **midcentury-toon**. Arquivos: `molde/saida/05-fumaca-escapamento-midcentury-toon/05-fumaca-escapamento-midcentury-toon.mp4` e `molde/saida/05-fumaca-escapamento-midcentury-toon/05-fumaca-escapamento-midcentury-toon-celular.mp4` (o original em hologram-hud continua em `molde/saida/05-fumaca-escapamento/`) · 67,2 s
- Hashtags: #PSAutomóvel #escapamento #fumaça #dicasdecarro #mecânica #Shorts

**Descrição:**

Fumaça branca fina em dia frio é vapor de água e é normal. Branca grossa e persistente, azulada e preta apontam defeitos diferentes: líquido de arrefecimento entrando na câmara (junta do cabeçote), óleo queimando e mistura rica, respectivamente. A cor é só uma pista: o diagnóstico é na oficina.

Para carros a gasolina, etanol ou flex. Fontes: imprensa técnica (O Mecânico, AutoPapo, iCarros, Garagem 360) e manual de fabricante.

Conteúdo informativo: não substitui o diagnóstico de um mecânico de confiança. Na dúvida, siga o manual do seu carro.

PS Automóvel: seu carro sempre em boas mãos.

**O que foi anotado:**

- Sem selo. `Fonte:` O Mecânico, AutoPapo e Garagem 360 (padrão); iCarros na L07.
- **O que mais faltou**: a fumaça colorida. O gancho e as L02, L04, L07 e L10 pedem nuvens branca, azul-acinzentada e preta; no vídeo a cor só existe nas etiquetas (BRANCA FINA: NORMAL, AZULADA: ÓLEO, PRETA: MISTURA RICA) e na zona escapamento acesa. Quem vê sem ouvir entende pelas etiquetas, mas o vídeo fica menos forte do que o roteiro quer.
- Também faltou: termômetro (L02, L04, L14, L15), gotas condensando (L03: lupa), junta do cabeçote em corte (L05: zona arrefecimento), reservatório com nível descendo (L06), pistão/anel/vedador (L08), vareta (L09), balança ar-combustível (L10), três peças acendendo (L11), catalisador rachando (L12: lupa), scanner (L13), ponteiro de temperatura (L15: zona painel).
- L11: o ROTEIRO tem uma etiqueta “FILTRO · BICOS · SONDA”; usei três placas (FILTRO DE AR, BICOS INJETORES, SONDA LAMBDA) que entram quando cada peça é falada.
- Fato: nada a corrigir; o ROTEIRO já ressalva que cor e cheiro não fecham diagnóstico. Diesel fora do escopo.
- É o mais longo dos novos (67,3 s).

### reserva (fora do calendário de 30 dias) · O número do pneu NÃO é a pressão certa

- Arquivos: `molde/saida/01-calibragem-pneu/01-calibragem-pneu.mp4` e `molde/saida/01-calibragem-pneu/01-calibragem-pneu-celular.mp4` · 63,2 s
- Hashtags: #PSAutomóvel #calibragem #pneu #dicasdecarro #mecânica #Shorts

**Descrição:**

O número gravado na lateral do pneu não é a pressão certa do seu carro: é o máximo que o pneu aguenta. Veja onde achar a pressão correta, como calibrar com o pneu frio e por que pressão errada gasta combustível e pneu.

A pressão do seu carro está na etiqueta (porta, coluna ou tampa do tanque) e no manual. Fontes: manuais de fabricantes de carro e de pneus (Michelin, Pirelli, Hankook, Goodyear).

Conteúdo informativo: não substitui o diagnóstico de um mecânico de confiança. Na dúvida, siga o manual do seu carro.

PS Automóvel: seu carro sempre em boas mãos.

**O que foi anotado:**

- Já pronto (teste do molde, revisado antes desta rodada); **não foi refeito**. O `cena.json` foi revisado por Claude, não pelo Vinicius.
- Sem selo; fonte “Michelin, Pirelli, Hankook e manuais”.
- Não está no calendário de 30 dias (o de pneu que existe é o do DOT, D18): fica de reserva.

### reserva (fora do calendário de 30 dias; parte 6 da série) · Falando de Gol #6: Lanterna traseira (recall)

- Arquivos: `molde/saida/gol-parte-06/gol-parte-06.mp4` e `molde/saida/gol-parte-06/gol-parte-06-celular.mp4` · 58,1 s
- Hashtags: #FalandoDeGol #Gol #VolkswagenGol #Recall #Seguranca #PSAutomovel #Shorts

**Descrição:**

Recall de 2015 da lanterna traseira do Gol 2014 e 2015: cerca de 170 mil carros, o que a Volkswagen e o alerta oficial dizem, como conferir pelo chassi e o que acontece se o recall não for feito. Fontes na ficha.

Fontes e data de acesso (2026-11-09): ver `FACTS.md`.

**O que foi anotado:**

- Já pronto (teste do molde, revisado antes desta rodada); **não foi refeito**. O `cena.json` foi revisado por Claude, não pelo Vinicius.
- Selo FATO DOCUMENTADO; fonte “alerta de recall, gov.br/mj, 30/11/2015”.
- Parte 6 da série: não está no calendário de 30 dias (o calendário usa as partes 1 a 3 do Carro 1). Reserva.

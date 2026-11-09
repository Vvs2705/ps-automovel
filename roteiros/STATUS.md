# roteiros · STATUS (2026-11-09)

Série principal do PS Automóvel: 30 temas na `PAUTA.md`, os 10 primeiros com roteiro completo. Cada pasta `NN-slug/` tem `ROTEIRO.md`, `FACTS.md` (fonte de cada afirmação) e `lines.json` (no formato de `ep01-oleo/voices/lines.json`).

## Prontos (10 de 10)

| # | Pasta | Título | Palavras | Duração estimada |
|---|---|---|---|---|
| 01 | `01-calibragem-pneu` | O número do pneu NÃO é a pressão certa | 180 | 82 s |
| 02 | `02-luzes-cores` | Luz vermelha ou amarela no painel: a cor manda | 154 | 70 s |
| 03 | `03-luz-da-injecao` | Luz da injeção acesa: fixa ou piscando? | 182 | 83 s |
| 04 | `04-motor-esquentando` | Motor esquentando: o que fazer e o que nunca fazer | 164 | 75 s |
| 05 | `05-fumaca-escapamento` | Fumaça no escapamento: o que cada cor indica | 175 | 80 s |
| 06 | `06-barulho-ao-frear` | Barulho ao frear: chiado, raspagem ou vibração? | 163 | 74 s |
| 07 | `07-fluido-de-freio` | Fluido de freio tem validade, mesmo rodando pouco | 152 | 69 s |
| 08 | `08-pneu-sulco-data` | Pneu careca ou velho? Sulco e data de fabricação | 190 | 86 s |
| 09 | `09-bateria` | Bateria fraca: os sinais antes de o carro não pegar | 162 | 74 s |
| 10 | `10-ponto-morto-descida` | Descer a serra no neutro: não economiza e é perigoso | 172 | 78 s |

Duração = palavras ÷ 2,2. Nenhum passa de 90 s de fala.

## Como mexer
- `ROTEIRO.md` é a fonte da verdade. Depois de editar as falas, rode `python _ferramentas/gerar.py <pasta>` (ou várias): ele regrava `lines.json`, atualiza a linha "Duração estimada" e avisa se o título passa de 60 caracteres, se uma etiqueta tem mais de 3 palavras, se há dígito ou sigla em maiúsculas na fala, se passa de 90 s ou se a última fala não é o fecho do canal.
- Siglas e números estão escritos como se falam: "pê ésse ai" (psi), "Á Bê Ésse", "dê ó tê", "tê dáblio i". Ninguém ouviu ainda como a voz edge-tts pronuncia; ouvir antes de renderizar.

## Não verificado / conferir antes de gravar
- As aspas dos `FACTS.md` vieram do extrator do WebFetch (um modelo pequeno lê a página). Duas amostras conferidas por mim direto na página bateram (Michelin e Moura), mais o art. 231, IX do CTB (Planalto). As demais não foram reconferidas: abrir o link antes de pôr texto entre aspas na tela.
- 02: a tabela de cores do UN R121 veio de um espelho do Jornal Oficial da UE; óleo e temperatura vermelhos foram confirmados parcialmente por uma proposta da OICA. Conferir o PDF da UNECE antes de mostrar a tabela.
- 08: o PDF oficial da Resolução Contran 913/2022 não abriu (o texto vem de cópias); conferir a vigência em novembro de 2026 no gov.br.
- 10: o valor da multa não entra na fala (as fontes divergem: R$ 130,16 no texto compilado do CTB lido hoje, R$ 85,13 em matéria antiga).
- 05 e 06 têm pouca fonte de fabricante brasileiro (05 é quase só imprensa técnica, mais manual Kia e CTB; 06 usa manuais internacionais). As falas usam "costuma", "pode".
- Manuais brasileiros lidos: poucos (VW, Hyundai HB20, Renault, Nissan, Fiat, Chevrolet, Mazda e Kia, conforme o tema). Toyota, Honda, Jeep e Chevrolet deram erro 403. Nenhuma marca aparece na fala; diz-se "manuais de montadoras".
- Nenhum preço em nenhum roteiro.
- A cota de WebSearch da sessão acabou no meio da pesquisa; a pesquisa dos três últimos pontos de cada tema foi feita só por WebFetch.

## CONTINUAR DAQUI
1. Vinicius lê a `PAUTA.md`, escolhe a ordem de gravação e pede ajustes de tom nas falas.
2. Escolher qual roteiro vira o EP02 e montar o vídeo com `ep01-oleo/engine`, `models.js`, `mix.py` e `music/score.py` como molde (esta sessão não renderizou nada).
3. Roteiros dos temas 11 a 20 da pauta: precisam de nova rodada de pesquisa (pedir ao pesquisador manuais de montadoras e fabricantes de peça; Bosch, NGK e Mahle não foram lidos em nenhum tema). Começar por 11 (luz do óleo), 12 (luz da bateria) e 13 (manchas embaixo do carro), que reaproveitam FACTS dos roteiros 02, 09 e 04.
4. Temas 03, 04 e 11 se sobrepõem em "o que fazer com luz vermelha"; manter a mesma orientação: parar em local seguro, nunca abrir a tampa quente, conferir o manual.

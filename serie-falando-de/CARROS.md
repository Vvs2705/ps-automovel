# CARROS · os 50 carros mais populares do Brasil

Série "Falando de [carro]" · PS Automóvel (@psautomovel). Levantado em 2026-11-09. Os dados completos estão em `carros.csv`.

## Critério (o que "popular" quer dizer aqui)

Popular = **muitos carros nas ruas**, porque problema comum importa mais em carro usado. A frota por modelo só é pública no topo 10, então a lista usa três evidências:

| Código | Evidência | Fonte | Papel |
|---|---|---|---|
| **U24** | Vendas de **usados** por modelo, 2024 (11 meses: a página não traz abril) | Fenabrave, via [Tabela FIPE](https://www.tabelafipebrasil.com/carros/usados-mais-vendidos/2024) | Substituto da frota: carro que troca muito de dono é carro que há muito tempo está nas ruas. |
| **U25** | Vendas de **usados**, janeiro a junho de 2025 | Fenabrave, via [Tabela FIPE](https://www.tabelafipebrasil.com/carros/usados-mais-vendidos/2025) | Idem, dado mais recente que a fonte abriu por completo. |
| **N24** | **Emplacamentos de novos**, 2024 inteiro (top 30) | Fenabrave, via [VRUM](https://www.vrum.com.br/veja-os-30-carros-mais-vendidos-do-brasil-em-2024.html) (08/01/2025) | Carros que entram na frota agora. |
| **N26** | Emplacamentos de novos, janeiro a julho de 2026 (top 51) | Fenabrave, via [Tabela FIPE](https://www.tabelafipebrasil.com/carros/novos-mais-vendidos/2026) | Idem, recente. |
| **F** | **Frota circulante** por modelo (top 10: Gol, Uno, Palio, Strada, Onix, Fiesta, Celta, Fox, HB20, Ka) | Relatório do Sincopeças, via [AutoPapo](https://autopapo.com.br/noticia/10-carros-mais-comuns-brasil/) (25/01/2025) | Conferência. Não entra na conta porque só existe o top 10. |

**Conta:** média mensal de usados `(U24÷11 + U25÷6)÷2` e de novos `(N24÷12 + N26÷7)÷2`, cada uma dividida pelo maior valor da lista (maior = 1,0). **Escore = 0,75 × usados + 0,25 × novos.** Ordem decrescente do escore. Peso 3 para 1 porque o objetivo é carro em circulação.

**Agrupamento:** o sedã ou a variante que divide plataforma, motor e peças com o hatch entra na mesma linha, com o nome entre parênteses (ex.: Gol inclui Voyage). Os números das variantes foram somados.

**Fora da lista:** utilitários, vans e caminhões (Master, Ducato, Daily, Sprinter, Kangoo, F-1000 etc.); Fusca e Kombi (refrigerados a ar, carros de colecionador); modelos fora de linha abaixo do corte (Vectra, Astra, Clio, Cobalt, Punto, Amarok).

## Resultado e conferência com a frota

Os 10 modelos da frota circulante do Sincopeças estão todos entre os 50. O **Gol** é o nº 1: maior frota do país (cerca de 3,49 milhões de unidades, segundo o relatório citado pelo AutoPapo) e maior vendedor de usados nos dois períodos (U24: 694.548 só o Gol; U25: 366.101).

**Atenção, empate técnico no topo.** Gol (0,750) e Onix (0,736) ficam separados por 0,014. A ordem entre eles muda com o peso: com mais de cerca de 74% de peso nos usados o Gol fica na frente; com menos, o Onix passa (50%: Onix 0,798 × Gol 0,500; 70%: Onix 0,748 × Gol 0,700). Mantive o Gol em 1º porque a frota (a evidência que o critério pede) é de 3,49 milhões contra 1,37 milhão do Onix. Se a preferência for por carro novo, a Strada lidera os emplacamentos de novos (2024: 144.684, a Polo vem em 2º com 140.177; VRUM/Fenabrave).

## Limites desta lista (leia antes de usar)

- Os números vêm de **fontes secundárias** (Tabela FIPE, VRUM, AutoPapo) que repassam dados da Fenabrave e do Sincopeças. Não foram conferidos no painel original da Fenabrave.
- A Tabela FIPE de usados 2025 só trazia janeiro a junho quando foi lida; a de 2024 não lista abril. Por isso a conta usa média mensal.
- Para os novos, só havia top 30 em 2024; modelos entre o 31º e o 60º lugar ficam com zero em N24, o que desfavorece um pouco Duster, C3 e Fiorino.
- Nivus aparece com 5.218 usados em 2024 e 30.775 em jan–jun de 2025 na mesma fonte: provável mudança de classificação. Fica em 32º; a posição é incerta.
- A fonte N24 tem Hilux (50.010) listado acima do Compass (50.055); a ordem não afeta a lista.
- Modelos novos (Tera, Dolphin Mini, Fastback, Pulse, Song) entram só pelos emplacamentos, sem histórico de usados.
- Total de emplacamentos de 2025 por marca existe (Fiat 533.710, VW 436.297, Chevrolet 275.965; VRUM, 13/01/2026), mas não foi achado o ranking de modelos de 2025 inteiro em página que abrisse; por isso não entra na conta.

## Os 50

"Gerações / anos" e "Motores" foram levantados em páginas abertas (Wikipédia pt. e uma segunda fonte quando houve); o que não foi achado está como "não verificado". O CSV traz também as vendas por modelo e as URLs.

| # | Marca | Modelo | Escore | Usados 2024 | Usados jan–jun/25 | Novos 2024 | Novos jan–jul/26 | Dados do modelo |
|---|---|---|---|---|---|---|---|---|
| 1 | Volkswagen | Gol (inclui Voyage) | 0.750 | 847.419 | 447.532 | 0 | 11 | duas fontes |
| 2 | Chevrolet | Onix (inclui Prisma e Onix Plus) | 0.736 | 545.446 | 315.329 | 157.463 | 78.348 | duas fontes |
| 3 | Fiat | Strada | 0.549 | 322.048 | 190.272 | 144.684 | 97.950 | duas fontes |
| 4 | Fiat | Palio (inclui Palio Weekend e Siena) | 0.546 | 618.038 | 324.972 | 0 | 7 | duas fontes |
| 5 | Hyundai | HB20 (inclui HB20S) | 0.527 | 355.607 | 210.693 | 134.416 | 64.188 | duas fontes |
| 6 | Volkswagen | Polo (inclui Virtus) | 0.385 | 120.087 | 98.655 | 172.543 | 83.807 | duas fontes |
| 7 | Fiat | Uno | 0.330 | 377.689 | 194.845 | 0 | 11 | duas fontes |
| 8 | Fiat | Argo (inclui Cronos) | 0.312 | 100.052 | 79.648 | 135.531 | 69.232 | uma fonte |
| 9 | Chevrolet | Corsa (inclui Classic) | 0.280 | 318.830 | 166.051 | 0 | 0 | duas fontes |
| 10 | Toyota | Corolla (sedã) | 0.279 | 255.784 | 138.768 | 37.668 | 14.687 | duas fontes |
| 11 | Volkswagen | Saveiro | 0.271 | 206.886 | 114.135 | 56.984 | 28.591 | fraca |
| 12 | Toyota | Hilux (inclui SW4) | 0.260 | 180.573 | 111.812 | 50.010 | 34.476 | fraca |
| 13 | Volkswagen | T-Cross | 0.220 | 75.803 | 54.591 | 83.990 | 55.118 | duas fontes |
| 14 | Ford | Ka (inclui Ka Sedan) | 0.216 | 269.887 | 115.052 | 0 | 8 | duas fontes |
| 15 | Fiat | Toro | 0.214 | 136.616 | 80.786 | 53.856 | 31.700 | duas fontes |
| 16 | Jeep | Compass | 0.209 | 137.610 | 78.375 | 50.055 | 31.889 | fraca |
| 17 | Chevrolet | Celta | 0.208 | 235.217 | 124.090 | 0 | 3 | duas fontes |
| 18 | Jeep | Renegade | 0.207 | 143.701 | 81.109 | 53.896 | 23.991 | uma fonte |
| 19 | Renault | Sandero (inclui Logan) | 0.205 | 230.051 | 122.873 | 0 | 1 | duas fontes |
| 20 | Hyundai | Creta | 0.199 | 86.127 | 59.195 | 69.116 | 41.809 | duas fontes |
| 21 | Volkswagen | Fox (inclui CrossFox e SpaceFox) | 0.199 | 227.220 | 116.936 | 0 | 0 | duas fontes |
| 22 | Ford | Fiesta (inclui Fiesta Sedan) | 0.197 | 238.709 | 108.946 | 0 | 1 | uma fonte |
| 23 | Fiat | Mobi | 0.197 | 86.588 | 63.604 | 67.382 | 38.686 | duas fontes |
| 24 | Chevrolet | Tracker | 0.186 | 84.868 | 55.327 | 69.481 | 34.806 | duas fontes |
| 25 | Chevrolet | S10 | 0.168 | 156.008 | 90.082 | 0 | 17.570 | duas fontes |
| 26 | Honda | HR-V | 0.168 | 99.187 | 57.573 | 50.375 | 26.367 | duas fontes |
| 27 | Honda | Civic | 0.146 | 167.014 | 85.663 | 0 | 34 | duas fontes |
| 28 | Nissan | Kicks | 0.145 | 74.574 | 45.050 | 60.455 | 19.797 | duas fontes |
| 29 | Renault | Kwid | 0.129 | 84.696 | 55.842 | 57.241 | 14 | duas fontes |
| 30 | Ford | Ranger | 0.125 | 78.375 | 45.384 | 31.860 | 20.375 | fraca |
| 31 | Ford | EcoSport | 0.119 | 136.405 | 69.940 | 0 | 0 | duas fontes |
| 32 | Volkswagen | Nivus | 0.116 | 5.218 | 30.775 | 55.924 | 32.238 | duas fontes |
| 33 | Honda | Fit | 0.102 | 115.845 | 60.193 | 0 | 3 | fraca |
| 34 | Chevrolet | Montana | 0.098 | 83.089 | 46.516 | 27.724 | 7 | duas fontes |
| 35 | Renault | Duster | 0.087 | 80.856 | 47.898 | 0 | 8.222 | duas fontes |
| 36 | Citroën | C3 | 0.083 | 78.199 | 45.110 | 0 | 7.948 | duas fontes |
| 37 | Fiat | Fastback | 0.078 | 0 | 0 | 48.246 | 29.757 | duas fontes |
| 38 | Fiat | Pulse | 0.078 | 0 | 0 | 47.019 | 30.158 | duas fontes |
| 39 | Fiat | Fiorino | 0.077 | 60.319 | 35.603 | 0 | 15.087 | duas fontes |
| 40 | BYD | Song (Plus/Pro/Plus DM-i) | 0.074 | 0 | 0 | 27.689 | 38.372 | fraca |
| 41 | Honda | City | 0.071 | 64.679 | 36.421 | 0 | 8.903 | uma fonte |
| 42 | Chevrolet | Spin | 0.070 | 58.617 | 34.234 | 0 | 11.679 | duas fontes |
| 43 | Volkswagen | Tera | 0.070 | 0 | 0 | 0 | 51.586 | duas fontes |
| 44 | Toyota | Corolla Cross | 0.068 | 0 | 0 | 47.796 | 22.301 | duas fontes |
| 45 | BYD | Dolphin Mini | 0.058 | 0 | 0 | 0 | 42.946 | duas fontes |
| 46 | Volkswagen | Golf | 0.056 | 64.011 | 32.923 | 0 | 306 | fraca |
| 47 | Chevrolet | Cruze (sedã) | 0.052 | 60.286 | 30.460 | 0 | 5 | duas fontes |
| 48 | Volkswagen | up! | 0.048 | 54.082 | 28.676 | 0 | 0 | duas fontes |
| 49 | Mitsubishi | L200 Triton | 0.047 | 50.098 | 29.678 | 0 | 0 | uma fonte |
| 50 | Caoa Chery | Tiggo 7 | 0.047 | 0 | 0 | 30.896 | 16.640 | duas fontes |

Colunas de vendas: unidades do modelo agrupado (soma das variantes entre parênteses). "Novos 2024" só tem dado para o top 30; zero significa "fora do top 30", não "nenhuma venda". "Dados do modelo" é a confiança do levantamento de gerações e motores no `carros.csv` ("duas fontes", "uma fonte" ou "fraca").

## Gerações, motores e fontes

Estão no **`carros.csv`** (colunas `geracoes_anos`, `motores`, `fontes`, `confianca_modelo`). O texto é bruto, copiado de páginas abertas (Wikipédia em português, Autoo, Quatro Rodas e similares) e traz as **divergências entre fontes** marcadas dentro do próprio campo. Antes de usar um ano ou motor num roteiro, conferir na fonte da linha. Pontos já sabidos:

- `mais_em_circulacao` ficou "não verificado" nos 50: nenhuma fonte aberta diz qual geração é a mais comum entre os usados. A leitura por geração dos problemas vem da pesquisa de cada carro.
- Cilindros e código do motor estão "não verificado" em boa parte das linhas (as páginas abertas não traziam).
- Linhas com confiança **fraca** (gerações ou motores incompletos): Saveiro (11), Hilux/SW4 (12), Compass (16), Ranger (30), Fit (33), Song (40), Golf (46).
- Linhas com **uma fonte**: Argo/Cronos (8), Renegade (18), Fiesta (22), City (41), L200 Triton (49).
- Dados que a própria fonte deixou duvidosos estão marcados no CSV (por exemplo potências do Corolla antigo e código de motor do Logan).

## Fontes de vendas (acessadas em 2026-11-09)

- U24: https://www.tabelafipebrasil.com/carros/usados-mais-vendidos/2024 (Fenabrave)
- U25: https://www.tabelafipebrasil.com/carros/usados-mais-vendidos/2025 (Fenabrave; janeiro a junho)
- N24: https://www.vrum.com.br/veja-os-30-carros-mais-vendidos-do-brasil-em-2024.html (Fenabrave, 08/01/2025)
- N26: https://www.tabelafipebrasil.com/carros/novos-mais-vendidos/2026 (Fenabrave; janeiro a julho)
- F: https://autopapo.com.br/noticia/10-carros-mais-comuns-brasil/ (Sincopeças, 25/01/2025). A matéria cita o Fox com "mais de 950 mil" e traz um número com erro de digitação; o valor exato do Fox não foi usado.
- Totais por marca em 2025: https://www.vrum.com.br/aceleradas/2026/01/7332166-as-20-marcas-de-carros-que-mais-venderam-no-brasil-em-2025.html (13/01/2026)

Piloto da série: **nº 1, Gol** (pasta `carros/gol/`).

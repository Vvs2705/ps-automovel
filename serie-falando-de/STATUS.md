# STATUS · série "Falando de [carro]" (2026-11-09)

## Feito
- `CARROS.md` e `carros.csv`: os 50 carros mais populares do Brasil, com critério, fórmula, limites e fontes de venda. Gerações, motores e URLs por modelo estão no CSV (confiança por linha).
- `METODO.md`: como levantar os 10 problemas de cada carro (fontes, regra das 2 fontes independentes, fato documentado × relato recorrente, pontuação, regras de roteiro, lista de conferência).
- `checar_partes.py`: confere título, duração, última linha, etiquetas e ids (`python checar_partes.py carros/<slug>`). Rodou nas 10 partes do Gol: 0 erros, 0 avisos.
- **Piloto nº 1, Gol** (`carros/gol/`): `PROBLEMAS.md` (10 problemas, descartados, não verificado) e `parte-01` a `parte-10`, cada uma com `ROTEIRO.md`, `FACTS.md` e `lines.json`. 6 fatos documentados (recalls) e 4 relatos recorrentes; falas de 132 a 176 palavras (60 a 80 s).

## Pontos para o Vinicius decidir ou conferir
1. **Gol × Onix no topo (decidido: Gol):** o escore deu Gol 0,750 e Onix 0,736 (empate técnico). O Gol é o nº 1 pela frota (3,49 milhões contra 1,37 milhão). O Vinicius confirmou o Gol como piloto em 2026-11-09.
2. Ninguém ouviu as falas: cada `lines.json` ainda precisa passar pela voz e pelo ouvido (siglas "é á cento e onze", "Pê Ésse").
3. Conferir à mão: página 253 do manual do Gol (litros do tanquinho, não usados na fala), consulta de chassi no site da VW, telefone de recall da VW (não citado).
4. O WebFetch salvou sozinho, no cache local, o PDF do manual do Gol (MY2021 e my-2017) durante a pesquisa; nada foi baixado de propósito nem fora do cache.
5. Pesquisa bruta dos subagentes (com divergências entre fontes e links não abertos): pasta de notas da sessão, arquivos `gol_G1.md` a `gol_G4.md`, `gen_A.json`, `gen_B.json`.

## Limites conhecidos
- Vendas: fontes secundárias (Tabela FIPE, VRUM, AutoPapo) repassando Fenabrave e Sincopeças; não conferidas no painel original da Fenabrave.
- Gerações e motores dos 50: levantados em páginas abertas, com divergências marcadas; 7 linhas "fracas" e 5 com uma fonte (lista em `CARROS.md`).
- Os 4 relatos do Gol não têm número de frequência; as falas dizem "relatam", "casos publicados", não "é comum".
- Recalls de airbag de 2023 e 2024 só estão em imprensa e blog; o portal do governo e o da VW não foram consultados por placa ou chassi.

## CONTINUAR DAQUI
1. ~~Vinicius escolhe: piloto Gol ou Onix.~~ **Decidido em 2026-11-09: o piloto é o Gol.**
2. **Carro nº 2 (Onix, incluindo Prisma e Onix Plus), num chat novo a partir deste STATUS:** repetir o fluxo do Gol — um subagente (Sonnet) por 2 ou 3 temas, cada um com 2 fontes independentes abertas por WebFetch e relatório de até 25 linhas; recalls pelo portal de recall do governo e pelo site da Chevrolet; depois montar `PROBLEMAS.md` e as 10 partes. Não repetir o erro de aceitar resumo de buscador como fonte.
3. Antes de gravar voz: ouvir 2 partes (uma de recall, uma de relato) para decidir ritmo e tom.
4. Quando a frente de roteiros liberar: alimentar o calendário com os 10 títulos do Gol (`carros/gol/parte-NN/ROTEIRO.md`, primeira linha de cada arquivo).
5. Temas reserva do Gol, se alguma parte cair: correia dentada do EA211 (confirmar intervalo no plano de revisão da VW), airbag do passageiro de 2016 (548 carros), pivô da suspensão de 2018, direção (zunido da bomba hidráulica).

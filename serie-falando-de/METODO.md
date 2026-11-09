# METODO · como levantar os 10 problemas mais comuns de cada carro

Série "Falando de [carro]" · PS Automóvel (@psautomovel). Atualizado em 2026-11-09.

**Regra de ouro:** só dado real e verificado. Sem fonte aberta por quem escreveu, a afirmação não entra. A fala diz o grau de certeza que a fonte permite, nem mais, nem menos.

## 1. Passo a passo por carro

1. **Fixar o escopo.** Pegar em `CARROS.md` o carro, as gerações e os motores. Cada problema é sempre amarrado a uma geração e a um motor (item 5).
2. **Garimpar candidatos (20 a 30 temas).** Passar pelas fontes do item 2. Anotar cada tema com o link e a data. Só nesta etapa vale resumo de buscador; dali em diante vale só página aberta.
3. **Abrir e conferir.** Cada afirmação que vai para o roteiro tem de estar numa página que a pessoa abriu e leu. Resumo de buscador, de IA ou de rede social não é fonte, só pista.
4. **Aplicar a regra das 2 fontes independentes** (item 3) e a classificação (item 4). Tema que não passa fica fora, mesmo que "todo mundo saiba".
5. **Escolher os 10** pelo critério do item 6.
6. **Escrever** `PROBLEMAS.md`, depois cada `parte-NN/` (roteiro, FACTS, lines.json) com as regras do item 9.
7. **Revisar** com a lista do item 10 antes de entregar.

## 2. Fontes aceitas

| Tipo | Exemplos | O que prova | Cuidado |
|---|---|---|---|
| Órgão oficial | Portal de recall do governo (Senacon/Ministério da Justiça), Senatran, Procon, Inmetro | Recall, norma, dado de frota | O recall prova o defeito só nos lotes e anos convocados. |
| Fabricante | Manual do proprietário, comunicado, recall no site da marca, boletim de serviço público | Procedimento, intervalo de revisão, recall | Manual diz o que fazer, não diz o que é frequente. |
| Imprensa especializada | Testes de longa duração, matérias de "defeitos crônicos", Quatro Rodas, Autoesporte, Autopapo, Mecânica Online, Oficina Brasil, Best Cars | Problema recorrente, causa técnica, custo médio | Matéria pode copiar outra: ver independência. |
| Reclame Aqui | Reclamações por marca/modelo | Volume e tema de queixas de pós-venda e garantia | Mede reclamação registrada, não frequência real; só conta como relato. |
| Fóruns e grupos de donos | Clubes e fóruns do modelo, grupos | Relato recorrente de quem tem o carro | Amostra de quem reclama; sem número. Só conta se o mesmo problema aparece em vários tópicos de autores diferentes. |
| Mecânicos | Vídeos e artigos de oficina, reparadores | Causa real, como identificar, o que fazer | Opinião de um profissional vale como relato; vários profissionais independentes valem mais. |

**Não aceitas:** IA sem fonte, comentário de vídeo isolado, "me disseram", site de venda de peças que só quer vender, texto sem autor nem data.

## 3. Independência: 2 fontes por problema

- **Independentes** são publicadores ou autores diferentes que chegaram ao dado por conta própria (ex.: uma matéria da imprensa + um tópico de fórum de donos; ou um recall oficial + uma matéria).
- **Não são independentes:** o mesmo texto replicado em dois sites; uma matéria que cita a outra como origem; várias páginas do mesmo site.
- **Recall:** vale a fonte oficial ou do fabricante mais uma confirmação (imprensa ou segunda fonte oficial).
- Problema com só 1 fonte independente **não entra**. Registrar em `PROBLEMAS.md` na seção "Descartados" com o motivo.

## 4. Classificação

| Rótulo | Quando usar | Como a fala soa |
|---|---|---|
| **Fato documentado** | Recall, comunicado do fabricante, norma ou dado de órgão oficial. | "O fabricante fez recall de…", "Segundo o comunicado oficial…" |
| **Relato recorrente de donos/mecânicos** | Aparece em 2+ fontes independentes (imprensa, fórum, mecânico, Reclame Aqui), sem número oficial. | "Donos e mecânicos relatam com frequência…", "É um problema muito citado em…" |

Nunca promover relato a fato. Nunca escrever "defeito de fábrica", "todo carro tem" ou "sempre acontece". Quando a causa é desgaste normal, dizer "desgaste".

## 5. Separar por geração e motor

Para cada problema, registrar a tabela abaixo (exemplo) e só falar da geração/motor que a fonte cita:

| Geração | Motor | Afetado? | Fonte |
|---|---|---|---|
| G5 (2008–2012) | 1.0 EA111 flex | Sim | URL |
| G7 (2017–) | 1.0 EA211 | Não citado | – |

"Não citado" não é "não afeta". Na fala: "relatado na geração X".

## 6. Como escolher os 10 mais comuns

Não existe estatística pública de defeito por modelo. "Mais comum" aqui significa **mais bem documentado**. Pontuar cada tema que já passou na regra das 2 fontes:

- +1 por fonte independente (máximo 4);
- +2 se tem recall ou comunicado do fabricante;
- +1 se aparece em 2 ou mais tipos de fonte diferentes (ex.: imprensa e fórum);
- +1 se atinge mais de uma geração;
- +1 se envolve segurança (freio, direção, cinto, airbag, risco de incêndio).

Pegar os 10 maiores. Empate: o que atinge mais carros em circulação. Se menos de 10 passam na regra, entregar só os que passaram e dizer quantos faltam. Carro lançado há pouco (menos de 3 anos) tende a ter poucos problemas documentados: aceitar menos de 10.

## 7. Dado de venda de peças por modelo

Em buscas feitas em 2026-11-09 **não apareceu nenhuma fonte pública de venda de peças por modelo** (rankings desse tipo, se existem, são de consultorias pagas ou de catálogos privados). O que existe é público e agregado: relatório de frota circulante por idade (Sindipeças), ranking de frota por modelo (relatório do Sincopeças, citado pela imprensa) e emplacamentos de novos e usados (Fenabrave). Regra: se aparecer fonte real (URL, data, metodologia), usar e citar; se não, escrever "não há dado público" no `PROBLEMAS.md` e **não citar peça mais vendida** no vídeo.

## 8. Preço

Só com fonte e data, em faixa e com o contexto (peça ou mão de obra, mercado, ano). Na fala: "a faixa publicada em [mês/ano] foi de X a Y reais; varia por região e oficina". Sem fonte, sem número: usar "custa bem menos que o conserto se o problema avançar" só se a fonte sustentar a comparação.

## 9. Regras de roteiro (cada parte)

- **Título** de até 60 caracteres: `Falando de <Carro> #N: <problema>`.
- **Gancho** nos 2 primeiros segundos (até 5 palavras faladas): a pergunta ou o sintoma.
- **Fala** em frases curtas, uma ideia por linha. Ordem: sintoma, causa, como identificar, o que fazer, gerações/motores afetados, grau de certeza (dentro da frase certa).
- **Duração** = palavras ÷ 2,2 (voz edge-tts pt-BR-AntonioNeural). Meta de 45 a 90 s de fala (99 a 198 palavras); teto de 2 minutos (cerca de 260 palavras).
- **Etiquetas na tela** de até 3 palavras (a fonte é grande).
- **Siglas e números como se fala:** "EA111" vira "é á cento e onze"; "P0301" vira "pê zero três zero um"; "1.0" vira "um ponto zero". Marcas e siglas com pronúncia difícil: escrever como soa (ex.: "Pê Ésse Automóvel").
- **Última linha, sempre:** "Pê Ésse Automóvel. Seu carro sempre em boas mãos."
- **Tom:** problema, causa, como identificar, o que fazer. Nunca falar mal de marca ou modelo, nunca comparar marcas, nunca assustar além do que a fonte diz. Segurança: sempre mandar para oficina de confiança quando o risco for freio, direção, cinto, airbag ou fogo.
- **Convite de conferência:** quando houver recall, mandar o dono conferir pelo chassi no site do fabricante ou no portal oficial.

## 10. Lista de conferência antes de entregar

- [ ] Cada linha do `lines.json` está no `FACTS.md` com URL, data de acesso e tipo de fonte, ou é instrução genérica de segurança marcada como tal.
- [ ] Cada problema tem 2 fontes independentes e o rótulo certo (fato documentado / relato recorrente).
- [ ] A fala usa a frase de certeza do rótulo.
- [ ] Geração e motor citados são os que a fonte cita.
- [ ] Nenhum preço sem fonte e data; nenhuma peça "mais vendida".
- [ ] Título até 60 caracteres, etiquetas até 3 palavras, 99 a 198 palavras faladas.
- [ ] Última linha igual à fixa; siglas e números escritos como se falam.
- [ ] Nada que fale mal da marca.

`checar_partes.py` (nesta pasta) confere a parte mecânica: título, duração, última linha e ids.

## 11. Limites do método (dizer sempre que couber)

- "Mais comum" é "mais citado e documentado", não frequência medida.
- Fóruns e Reclame Aqui superrepresentam quem teve problema; o carro sem problema não posta.
- Recall vale para os lotes convocados, não para todo o modelo.
- Matéria de imprensa pode misturar gerações: conferir ano e motor no texto.
- Carros novos têm pouca história; carros descontinuados têm mais, mas as peças e o mercado mudam.

## 12. Estrutura de pastas

```
serie-falando-de/
  CARROS.md  carros.csv  METODO.md  STATUS.md  checar_partes.py
  carros/<slug>/
    PROBLEMAS.md
    parte-01/ … parte-10/
      ROTEIRO.md   FACTS.md   lines.json
```

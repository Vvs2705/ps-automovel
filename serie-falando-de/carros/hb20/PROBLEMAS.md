# PROBLEMAS · Hyundai HB20 (inclui HB20S e HB20X) · carro nº 5

Levantado em 2026-11-09 pelo método de `../../METODO.md`. Cada parte do vídeo tem pasta própria (`parte-01` a `parte-10`) com roteiro, ficha de fatos e `lines.json`.

## Como ler

- **"Mais comum" = "mais bem documentado".** Não existe estatística pública de defeito por modelo (METODO, item 6).
- **Resultado: 5 fatos documentados (recalls, que cobrem 7 campanhas) e 5 relatos recorrentes.** Dos 5 relatos, o nº 1 (radiador e câmbio do 1.0 turbo) vem com reconhecimento da Hyundai **só noticiado pela imprensa**: a declaração e o boletim técnico não foram vistos em fonte primária e a reportagem original (Quatro Rodas) não abriu. Por isso ele entra como relato, não como fato.
- A ordem dos episódios é editorial, como no Gol: primeiro o que o dono sente no carro (relatos), depois os recalls. A pontuação do método está na tabela.
- Dois episódios juntam dois recalls do mesmo componente (nº 7, semieixo 2017 e 2019; nº 9, cilindro mestre do freio 2020 e 2021), como o Gol fez com o alternador.
- Dado de venda de peças por modelo: **não há** (METODO, item 7). Nenhuma parte cita peça "mais vendida".
- Preços: **nenhuma parte tem preço**. Os que apareceram (boia do marcador R$ 150, diagnóstico de R$ 395 na concessionária, retífica de R$ 8.500 num fórum) não têm faixa com fonte e data.

| # | Problema | Classificação | Fontes independentes | Pontos |
|---|---|---|---|---|
| 1 | Radiador e câmbio do 1.0 turbo (mistura de fluidos) | Relato recorrente + reconhecimento da Hyundai noticiado pela imprensa; não é recall | 2 (Canaltech, Garagem360); Piranot, Diário da Mídia e Click saíram no dia da Quatro Rodas | 2 |
| 2 | Falha de ignição: bobina e velas, 1.0 de 3 cilindros | Relato recorrente | 3 (Oficina Brasil, Autoo, Verificar Auto) + 1 caso de bancada (O Mecânico) | 4 |
| 3 | Suspensão batendo seco (curso curto) | Relato recorrente (com divergência entre fontes) | 3 (Verificar Auto, Autoo, Oficina Brasil) | 4 |
| 4 | Central multimídia que trava ou desconecta | Relato recorrente | 2 prudentes (Autoo e Vrum podem ter a mesma origem; Verificar Auto) | 3 |
| 5 | Marcador de combustível impreciso | Relato recorrente | 3 (Autoo, Verificar Auto, Vrum) | 3 |
| 6 | Líquido no console, indicador de marchas do 1.6 automático (recall de 2016/2017) | Fato documentado | comunicado + 4 de imprensa | 8 |
| 7 | Semieixo dianteiro (recalls de 2017 e 2019) | Fato documentado | comunicados + ofício da Senacon + 5 de imprensa | 8 |
| 8 | Válvula de vácuo do servo-freio, 1.0 turbo (recall de 2018) | Fato documentado | comunicado + 4 de imprensa | 8 |
| 9 | Cilindro mestre do freio (recalls de 2020 e 2021) | Fato documentado | 2 comunicados + relatório da Hyundai ao órgão oficial + 5 de imprensa | 8 |
| 10 | Módulo da bomba de óleo do câmbio automático (recall de 2023) | Fato documentado (confirmação de imprensa fraca) | comunicado + 2 de imprensa | 7 |

Pontos = fontes independentes (máx. 4) + 2 recall ou comunicado do fabricante + 1 se há 2 tipos de fonte + 1 se atinge mais de uma geração + 1 se envolve segurança. Nenhum atinge mais de uma geração com fonte que diga isso, então esse ponto não foi dado.

## Por geração e motor (como as fontes chamam)

| Recorte | Problemas |
|---|---|
| 1.0 aspirado, 3 cilindros (G1, 2012–2019) | 2, 3 (todas as versões G1) |
| 1.0 turbo (G1: 2016–2018; depois T-GDI) com câmbio manual de 6 marchas | 8 |
| 1.0 turbo T-GDI com câmbio automático (anos não citados) | 1 |
| 1.6 automático de 4 marchas, modelos 2013–2015 | 6 |
| 1.0 manual de 5 marchas, modelos 2017 e 2019 | 7 |
| HB20, HB20S e HB20X, anos 2021 e 2022; HB20 2020 | 9 |
| HB20 e HB20S automáticos, anos 2023 e 2024 | 10 |
| Primeira geração (2013–2019) em guias de compra | 3, 4, 5 (o nº 4 também cita um HB20 2022) |

"Não citado" não é "não afeta". Os comunicados não dizem G1, G2 ou G3: a relação com as gerações do `carros.csv` é só pelos anos.

---

## 1. Radiador e câmbio do 1.0 turbo · relato recorrente (com reconhecimento da Hyundai noticiado)
- **Sintomas:** nível do reservatório caindo de repente, luz da injeção acesa, perda de potência, superaquecimento e trancos no câmbio; em casos mais graves, códigos de falha.
- **Causa (segundo as reportagens):** falha de estanqueidade nas galerias internas do radiador deixa o líquido de arrefecimento se misturar ao fluido do câmbio automático.
- **Como identificar:** só por diagnóstico na concessionária.
- **O que fazer:** levar o histórico de manutenção e pedir avaliação; se superaquecer, parar em local seguro e procurar assistência. A Hyundai faz o reparo em garantia, sem custo, para clientes elegíveis. Não é recall.
- **Gerações/motores:** HB20 (e Creta) com motor Kappa 1.0 T-GDI e câmbio automático. Sem lista de anos nem de chassis.
- **Declaração da Hyundai (via imprensa):** problema técnico existe desde 2023 em algumas unidades; chamados diminuem desde 2024.
- **Fontes:** Canaltech 27/10/2026; Garagem360 04/11/2026; Piranot 26/10/2026 (credita a Quatro Rodas, que não abriu); Diário da Mídia 26/10/2026 (não cita origem). Detalhes em `parte-01/FACTS.md`.

## 2. Falha de ignição: bobina e velas · relato recorrente
- **Sintomas:** motor falhando, luz da injeção acesa, falha na partida, tiros no escapamento.
- **Causa:** bobina de ignição e velas, segundo as fontes. Num carro de teste (HB20 1.0 2018, 72 mil km) a bobina do 3º cilindro teve problema na medição e as velas estavam com a folga acima do nominal.
- **Como identificar:** scanner e teste elétrico de bobinas e velas.
- **O que fazer:** trocar a bobina com problema e o jogo completo de velas (O Mecânico); tiros no escapamento podem danificar o catalisador.
- **Gerações/motores:** HB20 1.0 de 3 cilindros, primeira geração. Dois reparadores (SP e MG) citam falha por volta de 38 a 40 mil km (Oficina Brasil 2020).
- **Fontes:** Oficina Brasil 04/06/2020; Autoo 12/09/2026; Verificar Auto 13/10/2026; O Mecânico 13/10/2020 (caso de bancada, não afirma que é comum). Detalhes em `parte-02/FACTS.md`.

## 3. Suspensão batendo seco · relato recorrente
- **Sintomas:** pancada seca em buracos, suspensão atinge os batentes; barulhos na dianteira.
- **Causa:** as fontes divergem. Curso curto (Verificar Auto, Autoo, queixas de donos na Oficina Brasil 2019); desgaste normal de buchas, pivôs, bieletas e batentes e molas traseiras fracas (reparadores, Oficina Brasil 2020); nos testes de 2019 a Oficina Brasil não achou fim de curso; um caso de bieleta mal apertada (O Mecânico 2016).
- **Como identificar:** passar devagar por lombada e valeta e ouvir a dianteira.
- **O que fazer:** diagnosticar a peça com folga.
- **Gerações/motores:** HB20 de primeira geração (2013–2019), 1.0 e 1.6.
- **Fontes:** Verificar Auto 13/10/2026; Autoo 12/09/2026; Oficina Brasil 04/02/2019 e 04/06/2020; O Mecânico 18/07/2016. "Toc-toc" não aparece em nenhuma fonte. Detalhes em `parte-03/FACTS.md`.

## 4. Central multimídia que trava · relato recorrente
- **Sintomas:** central trava, desconecta do celular em viagem longa, falha ao atualizar o sistema.
- **Causa:** não confirmada nas fontes abertas. A explicação "software, resolve com atualização" é de um só mecânico, em cópias de uma matéria do Autoesporte que não abriu: fica fora.
- **O que fazer:** levar à concessionária autorizada (foi o que a Hyundai pediu nos casos publicados).
- **Gerações/motores:** primeira geração (2013–2019, um caso de 2016 1.6 automático) e um HB20 2022.
- **Fontes:** Autoo 04/01/2025; Vrum 08/01/2025; Verificar Auto 13/10/2026. Detalhes em `parte-04/FACTS.md`.

## 5. Marcador de combustível impreciso · relato recorrente
- **Sintomas:** o marcador não aponta o nível com exatidão.
- **Causa:** boia ou bomba (Autoo); boia ou sensor da bomba (Verificar Auto).
- **O que fazer:** diagnosticar e trocar a peça; testar o marcador na compra de um usado.
- **Gerações/motores:** primeira geração (2013–2019). O Vrum não cita ano nem geração.
- **Fontes:** Autoo 12/09/2026; Verificar Auto 13/10/2026; Vrum 08/01/2025. Detalhes em `parte-05/FACTS.md`.

## 6. Líquido no console do 1.6 automático · fato documentado
- **Defeito:** bebida derramada no porta-copos do console pode infiltrar e atingir a fiação do indicador de marchas; com faróis ligados, curto-circuito que pode evoluir para incêndio na área do console. O comunicado diz que não há risco de combustão espontânea.
- **Quem:** HB20, HB20S e HB20X 1.6 com câmbio automático de 4 marchas, modelos 2013 a 2015, produzidos de 16/08/2012 a 31/10/2015; 139.159 veículos (só imprensa); atendimento desde 28/12/2016.
- **O que fazer:** correção gratuita (vedação de silicone, troca do indicador se houver infiltração, cerca de 1 hora); conferir pelo chassi.
- **Fontes:** comunicado da Hyundai; Motor Show, Mecânica Online e Carzin 02/01/2017; Jornal da Paraíba 17/01/2017. Detalhes em `parte-06/FACTS.md`.

## 7. Semieixo dianteiro (recalls de 2017 e 2019) · fato documentado
- **2017:** lote de peças do rolamento interno da junta homocinética com dureza abaixo do especificado; HB20 e HB20S 1.0 manual de 5 marchas, modelo 2017, produção de 20/04 a 26/05/2017; 3.109 veículos (só imprensa); atendimento desde 11/10/2017.
- **2019:** lote de semieixos dianteiros do lado direito com baixa resistência ao torque; HB20 e HB20S 1.0 manual de 5 marchas, modelo 2019, produção de 01/04 a 20/05/2019; 6.025 veículos (só imprensa); atendimento desde 01/07/2019.
- **Sinais e risco:** ruído nas manobras ou vibração; se quebrar, perda de tração. Segundo a Hyundai, freio e direção continuam funcionando; ela recomenda interromper o uso e procurar a concessionária.
- **O que fazer:** inspeção e troca gratuitas, cerca de 2 horas; conferir pelo chassi.
- **Fontes:** comunicados de 2017 e de 2019; Ofício-Circular nº 97/2019 da Senacon (18/07/2019); Carzin, Automais TV, Motor Show, Garagem360 e AutoPapo (2017 e 2019). Detalhes em `parte-07/FACTS.md`.

## 8. Válvula de vácuo do servo-freio, 1.0 turbo · fato documentado
- **Defeito:** ressecamento da válvula de controle de vácuo do servo freio, por ficar perto do catalisador; sinais: assovio na região do motor e marcha lenta oscilando; se continuar, pedal de freio endurece.
- **Quem:** HB20 e HB20S 1.0 turbo manual de 6 marchas, modelos 2016 a 2018, produzidos de 28/01/2016 a 05/02/2018; atendimento desde 29/03/2018. Total (6.737) só em uma página, fora da fala.
- **O que fazer:** a Hyundai diz que o freio continua funcionando, mas exige mais força; recomenda parar de usar o carro e procurar a concessionária. Correção gratuita (isolador térmico ou troca da válvula), cerca de 30 minutos.
- **Fontes:** comunicado da Hyundai; Motor Show, AutoPapo e Automais TV 29/03/2018; Garagem360 02/04/2018. Detalhes em `parte-08/FACTS.md`.

## 9. Cilindro mestre do freio (recalls de 2020 e 2021) · fato documentado
- **2020:** fluido de freio contaminado na linha de produção de um lote; queda de desempenho com o pedal acionado de forma lenta e suave; em frenagem de emergência funciona. HB20 2020 (e Creta), produção de 02/03 a 08/03/2020; atendimento desde 25/11/2020. Total (2.025 mais 115 no exterior) soma HB20 e Creta: fora da fala.
- **2021:** variação na usinagem do cilindro mestre pode danificar os selos; o dano atinge só uma das duas linhas, na maioria dos casos há menos eficiência, sem perda completa de frenagem. HB20, HB20S e HB20X anos 2021 e 2022, produção de 05/11/2020 a 15/11/2021; atendimento desde 02/12/2021. Sem total em nenhuma fonte.
- **O que fazer:** a Hyundai recomenda parar de usar o carro e procurar a concessionária; inspeção e troca gratuitas, cerca de 2 horas; conferir pelo chassi.
- **Fontes:** comunicados de 2020 e de 2021; relatório da Hyundai ao DPDC/Senacon 12/04/2021 (Procon-GO); AutoPapo, Mecânica Online e Revista Carro 25/11/2020; Garagem360 e Motor Show 02/12/2021. Detalhes em `parte-09/FACTS.md`.

## 10. Módulo da bomba de óleo do câmbio automático · fato documentado (imprensa fraca)
- **Defeito:** não conformidade no módulo de controle da bomba elétrica de óleo do câmbio automático em alguns veículos; pode causar curto-circuito e, em situações extremas, incêndio. O comunicado não descreve sintoma que o dono perceba.
- **Quem:** HB20 e HB20S automáticos, anos 2023 e 2024, produzidos de 20/12/2022 a 27/09/2023 (convoca também o Creta); atendimento desde 02/10/2023. Sem total.
- **O que fazer:** inspeção e, se preciso, troca do módulo; gratuita, cerca de 2 horas; conferir pelo chassi.
- **Fontes:** comunicado da Hyundai; Click Petróleo e Gás 09/10/2023 e Autos Segredos 17/12/2023 (reproduzem o comunicado; nenhuma grande matéria abriu). Detalhes em `parte-10/FACTS.md`.

---

## Descartados e temas reserva (não entraram)

| Tema | Motivo |
|---|---|
| Junta de cabeçote queimada / superaquecimento no 1.0 de 3 cilindros | **Reserva.** Três casos de três autores (Oficina Brasil 21/05/2018; dois tópicos do HB20 Clube), cada um com contexto diferente (radiador avariado e falta de manutenção; retífica; suspeita de trinca não confirmada). Nenhuma fonte trata como recorrente. Vrum e Autoo não citam. |
| Ar-condicionado deixa de gelar | **Reserva.** Só a Oficina Brasil (2020, uma oficina especialista) afirma que é comum; o Agora Motor tem erros verificáveis; O Mecânico traz um caso único (HB20 1.6 2013, o'ring da válvula de expansão). Cheiro/mofo: nenhuma fonte. |
| Trepidação da embreagem no 1.0 manual | **Reserva.** Verificar Auto lista; Revista Carro é uma carta de leitor (2021); NaPista é guia de plataforma de usados (fora das fontes aceitas); os tópicos de fórum falam de patinação ou de 1.6. |
| Perda de potência e consumo no 1.0 turbo de injeção direta | Autoo (04/01/2025) e Vrum (08/01/2025) partem de queixas de consumidores, independência não demonstrável. A Hyundai atribuiu a combustível e negou garantia nos dois casos do Autoo. "Apagão" só existe em réplicas da Autoesporte (original não abriu). Frase "casos pontuais, garantia sem limite de km" não confirmada. |
| Câmbio automático do 1.6 com trancos | Só o Verificar Auto descreve com detalhe; Agora Motor é genérico; Reclame Aqui não abriu; nenhum comunicado. |
| Faróis embaçando | Só o Agora Motor. |
| Marcha à ré que demora a engatar (manual) | Só o Agora Motor traz modelo e causa (sem fonte); o Autoo traz um leitor sem modelo. |
| Vibração do 3 cilindros em marcha lenta | É característica do motor de 3 cilindros (Autopapo, Vrum, O Mecânico), não problema do HB20; só O Mecânico liga ao HB20. |
| Coxim do motor fatigado pela explosão a cada 240° | Só O Mecânico 2024. |
| Ruído atribuído ao ABS | Só o Agora Motor, sem origem e com erro de ano. |
| Pintura e acabamento | O Vrum cita "pintura" sem detalhar; Verificar Auto cita plásticos que riscam e retoques. Vago demais para um roteiro. |
| Ruído forte nas frenagens | Só o Vrum (a partir de queixas). |
| Redução de 120 para 115 cv (modelo 2027) | Calibração por regra de IPI (Autopapo 15/06/2026), não defeito; uma fonte. |
| Falha de cilindro por bico injetor, ventoinha parada, defletor de calor, estalo da pinça | Um reparador cada, na Oficina Brasil (04/06/2020). |

## Não verificado (limites desta pesquisa)

- **Portal de recall do Ministério da Justiça e página de recalls da Hyundai não abriram** (erro de certificado e 404). Nenhum recall foi consultado por chassi. Os recalls estão sustentados pelos PDFs de comunicado da Hyundai, pelo Ofício-Circular nº 97/2019 da Senacon (cópia do MPMG), por documento da Hyundai enviado ao órgão oficial e pela imprensa. **Não se prova que não existam outros recalls do HB20** (nenhum achado em 2022 e 2024 a 2026).
- Os PDFs da Hyundai não são lidos pelo WebFetch: o texto foi decodificado localmente dos arquivos que a própria ferramenta guardou. Nenhum PDF traz data de emissão, só início de atendimento.
- Quatro Rodas e Autoesporte (reportagens originais do caso do radiador, 26/10/2026, e de julho de 2024) foram recusadas pela ferramenta. Reclame Aqui deu erro 403 em todas as tentativas: nenhum caso foi aberto.
- Fóruns de donos (HB20 Clube): só alguns tópicos abriram. Vale o Vinicius abrir no navegador para os temas reserva.
- O WebFetch devolve resumo de modelo pequeno: as citações foram conferidas por amostra. Eu mesmo reabri Vrum, Verificar Auto, Autoo (2), Oficina Brasil (2020), O Mecânico (ignição), Canaltech, Garagem360 (radiador), Autos Segredos e Click Petróleo e Gás; o resto foi lido pelos subagentes (relatórios em `side-session-notes/…/hb20_*.md`).
- Totais de veículos (139.159; 3.109; 6.025) vêm só de imprensa, sem citar origem; 6.737 (servo-freio) só de uma página.
- Divergência de datas: o comunicado do servo-freio dá produção a partir de 28/01/2016 e o `carros.csv` diz turbo desde abril de 2016; a fala usa os anos-modelo 2016 a 2018.
- Correção ao `carros.csv`: o 1.6 automático tinha 4 marchas até 2015 e 6 marchas só a partir da linha 2016 (Motor Show 22/09/2015, Verificar Auto e Agora Motor).
- Ninguém ouviu as falas: "agá bê vinte", "ésse" e "xis" ainda precisam passar pela voz.

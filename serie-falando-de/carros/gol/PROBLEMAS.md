# PROBLEMAS · Volkswagen Gol (inclui o sedã Voyage) · carro nº 1

Levantado em 2026-11-09 pelo método de `../../METODO.md`. Cada parte do vídeo tem pasta própria (`parte-01` a `parte-10`) com roteiro, ficha de fatos e `lines.json`.

## Como ler

- **"Mais comum" = "mais bem documentado".** Não existe estatística pública de defeito por modelo (METODO, item 6).
- **Resultado: 6 fatos documentados (recalls) e 4 relatos recorrentes.** Os recalls pesam porque são o único tipo de problema do Gol com fonte oficial e número; os relatos de donos e mecânicos aparecem com a frase de certeza correta na fala.
- A ordem dos episódios é editorial (primeiro o que o dono sente no carro, depois os recalls); a pontuação do método está na tabela abaixo.
- Dado de venda de peças por modelo: **não há** (METODO, item 7). Nenhuma parte cita peça "mais vendida".
- Preços: só o do câmbio I-Motion tem faixa com fonte e data (Vrum, 18/04/2025). Os de blogs sem cotação datada ficaram de fora.

| # | Problema | Classificação | Fontes independentes | Pontos |
|---|---|---|---|---|
| 1 | Consumo de óleo, 1.0 EA111 | Relato recorrente (+ admissão da VW em 2009 noticiada pela imprensa) | 4 | 8 |
| 2 | Falha de ignição, EA111 | Relato recorrente | 3 | 5 |
| 3 | Partida difícil no frio (recall de 2009) | Fato documentado | 2 (+ manual) | 6 |
| 4 | Vazamento na válvula termostática | Relato recorrente | 2 (+ manual) | 4 |
| 5 | Câmbio I-Motion com tranco (1.6) | Relato recorrente | 4 | 6 |
| 6 | Lanterna traseira (recall de 2015) | Fato documentado | 2 | 6 |
| 7 | Alternador e polia (recalls de 2017 e 2021) | Fato documentado | 4 | 9 |
| 8 | Cinto traseiro (recall de 2018) | Fato documentado | 3 | 6 |
| 9 | Rolamento da roda traseira (recall de 2010) | Fato documentado | 2 | 6 |
| 10 | Airbag (recall de 2020 e etapas de 2023/2024) | Fato documentado (2020); etapas só em imprensa/blog | 4 | 9 |

Pontos = fontes independentes (máx. 4) + 2 recall ou comunicado do fabricante + 1 se há 2 tipos de fonte + 1 se atinge mais de uma geração + 1 se envolve segurança.

## Por geração e motor (como as fontes chamam)

| Recorte | Problemas |
|---|---|
| Motor 1.0 EA111 (G4, G5, G6; 2008 a 2013 segundo o Vrum) | 1, 2, 4 (G3 e G4) |
| Novo Gol e Voyage 1.0, anos 2009 e 2010 | 3, 9 |
| Gol e Voyage 1.6 com I-Motion (fim de 2009 a 2018) | 5 |
| Gol anos 2014 e 2015 | 6 |
| Gol e Voyage 2016 e 2017; ano-modelo 2022 | 7 |
| Gol e Voyage 2018 e 2019 (lote de maio e junho de 2018) | 8 |
| Gol 2009 em diante (várias etapas) | 10 |

As fontes dos recalls quase nunca dizem G6, G7 ou G8 nem o motor. "Não citado" não é "não afeta".

---

## 1. Consumo de óleo no 1.0 EA111 · relato recorrente
- **Sintomas:** completar óleo com frequência (OnlyCars: mais de 1 litro a cada 3.000 km), fumaça azulada ao acelerar forte e na partida do dia, óleo escurecendo rápido. Em 2009: ruído interno forte e aumento do consumo.
- **Causa:** não há causa única comprovada. A VW atribuiu o caso de 2009 ao óleo, que perdia propriedades com o álcool, depois de trocar a especificação (março/abril de 2008). Hoje: o Vrum cita anéis de pistão; o OnlyCars cita retentores de válvula como mais comum e anéis em casos avançados.
- **Como identificar:** nível na vareta, carro frio e nivelado; fumaça azulada; vela oleosa.
- **O que fazer:** conferir o nível toda semana (Vrum, Mecânica Popular), usar a especificação do manual, trocar no prazo; comprar usado com histórico de manutenção. Rodar com pouco óleo causa dano grave.
- **Gerações/motores:** 1.0 EA111, G4/G5/G6 fabricados de 2008 a 2013 (Vrum). 1.0 VHT a partir de março/abril de 2008 (admissão de 2009). 1.6: só blogs, fraco: fica fora da fala.
- **Fatos firmes:** em 27/10/2009 a VW admitiu possível deficiência de lubrificação no 1.0 VHT, não fez recall e estendeu a garantia do motor de 3 para 4 anos (Mecânica Online, Encontracarros).
- **Fontes:** Mecânica Online 01/11/2009; Encontracarros 27/10/2009; Vrum 09/04/2026; OnlyCars 09/2025; Bate-Papo Automotivo 2023/2025; Polo9N 24/11/2025; Mecânica Popular 22/07/2026. Detalhes em `parte-01/FACTS.md`.

## 2. Falha de ignição no EA111 · relato recorrente
- **Sintomas:** o motor pega normal e depois falha e vibra; perda de potência; luz da injeção acesa.
- **Causa:** bobina (o EA111 usa bobina dupla com módulo integrado), velas, cabos, bicos, entrada falsa de ar, vazão ou pressão da bomba; um caso publicado teve o módulo da bobina como causa final.
- **Como identificar:** scanner; teste da bobina por par de cilindros (resistência do secundário, no Voyage 1.6 citada de 4,8 a 6,5 kΩ); não puxar o cabo de vela para testar.
- **O que fazer:** reduzir a velocidade e ir à oficina (manual: o catalisador pode superaquecer); diagnosticar antes de trocar peça.
- **Gerações/motores:** Gol com EA111 (1.0 8V; casos de G5 1.0). Bobina como ponto fraco do G7/G8 não se sustenta.
- **Fontes:** Oficina Brasil 02/10/2012; O Mecânico 24/03/2020, 29/06/2015 e 30/11/2015; Autopapo 21/02/2019 (atualizada 10/03/2025); manual VW Novo Gol. Detalhes em `parte-02/FACTS.md`.

## 3. Partida difícil no frio · fato documentado
- **Sintomas:** em baixa temperatura, o motor exigia várias tentativas de partida.
- **Causa (segundo a VW):** podia comprometer a queima, romper o coletor de admissão e, em alguns casos, causar incêndio.
- **Como identificar:** consulta de recall pelo chassi na montadora (o portal do governo só cobre a partir de 2011).
- **O que fazer:** atualização gratuita de software do sistema de partida a frio. No dia a dia, o manual manda manter o reservatório de gasolina (tanquinho) abastecido nas versões que o têm e esperar a luz de controle apagar nas versões com partida aquecida.
- **Gerações/motores:** Novo Gol 1.0 e Voyage 1.0 (e Fox 1.0), anos 2009 e 2010; cerca de 268 mil unidades, somando os três modelos.
- **Fontes:** Vrum 17/08/2009; Olhar Direto/Folha 17/08/2009; manual VW Novo Gol; Autopapo 25/06/2024. Detalhes em `parte-03/FACTS.md`.

## 4. Vazamento na válvula termostática · relato recorrente
- **Sintomas:** nível do líquido caindo, manchas brancas perto da válvula, ponteiro de temperatura subindo; no pior caso, junta do cabeçote queimada.
- **Causa:** duas fontes, duas causas diferentes. Vrum: carcaça plástica que resseca e trinca. O Mecânico (Gol G4 1.0 8V 2006): excesso de silicone na montagem.
- **Como identificar:** bolhas no vaso de expansão, teste de pressão do sistema com manômetro, manchas brancas na cúpula.
- **O que fazer:** trocar a cúpula com anéis novos, sem silicone, e sangrar. Se a luz piscar em vermelho: parar, desligar, esperar esfriar, conferir o nível; nunca abrir a tampa quente (manual MY2021).
- **Gerações/motores:** Gol G3 e G4 (Vrum); Gol G4 1.0 8V 2006, família EA111 (O Mecânico).
- **Fontes:** Vrum 09/04/2026; O Mecânico 08/08/2022; manual VW Gol MY2021. Detalhes em `parte-04/FACTS.md`.

## 5. Câmbio I-Motion com tranco · relato recorrente
- **Sintomas:** trancos nas trocas e em manobras lentas, vazamento de fluido no atuador da embreagem e no robô, embreagem patinando, dificuldade de engatar.
- **Causa:** de projeto (embreagem única que desacopla a cada troca, lógica da central) e de desgaste ou vazamento (atuador, robô, calibração).
- **Como identificar:** scanner, calibração, checagem de vazamentos; avisos do painel descritos no manual.
- **O que fazer:** não segurar o carro na subida com o acelerador (manual); na compra de usado, testar trancos e patinação e procurar vazamentos. Reparo: faixa de R$ 4 mil a R$ 7 mil (Vrum, 18/04/2025; estimativa de imprensa).
- **Gerações/motores:** só Gol e Voyage 1.6, do fim de 2009 a 2018 (G5, G6 e G7); câmbio de 5 marchas, código SQ200.
- **Fontes:** Autossegredos 25/03/2013; Autoo 22/05/2025; Vrum 18/04/2025; Oficina Brasil 11/02/2021; Motor Show 01/12/2009; Autopapo 19/07/2018. Detalhes em `parte-05/FACTS.md`.

## 6. Lanterna traseira (recall de 2015) · fato documentado
- **Defeito:** possível dano no circuito elétrico da lanterna traseira, com falha da iluminação; o alerta oficial cita risco de danos graves ou fatais aos ocupantes.
- **Quem:** Gol anos 2014 e 2015, produzidos de 02/12/2013 a 03/08/2015; 170.443 carros (iCarros escreve 170.433).
- **O que fazer:** avaliação e, se preciso, componente adicional; havendo dano interno, troca da lanterna. Conferir pelo chassi.
- **Fontes:** gov.br/mj (alerta de 30/11/2015); iCarros 26/11/2015. Detalhes em `parte-06/FACTS.md`.

## 7. Alternador e polia (recalls de 2017 e 2021) · fato documentado
- **2017:** o alternador podia parar de carregar a bateria, com panes elétricas e desligamento do motor. Up!, Gol, Voyage, Saveiro, Fox e outros, anos 2016 e 2017, produção de 01/03/2016 a 12/01/2017; 54.170 veículos (todos os modelos). Inspeção e troca gratuitas, até 3 horas.
- **2021:** a polia do motor podia se soltar, com perda da assistência da direção e falha do alternador. Gol, Voyage, Saveiro e Fox, ano-modelo 2022, produção de 07/04/2021 a 19/05/2021. Inspeção e reparo gratuitos.
- **Como identificar:** só pelo chassi; as fontes não descrevem sintoma no painel.
- **Fontes:** Procon-MS 08/06/2017; Mecânica Online 09/05/2017; Automais TV; Procon-SP 04/06/2021; Vrum 04/06/2021; Mecânica Online 04/06/2021; Motor Show 07/06/2021. Detalhes em `parte-07/FACTS.md`.

## 8. Cinto traseiro (recall de 2018) · fato documentado
- **Defeito:** desvio dimensional na rosca da porca de fixação do fecho duplo do cinto traseiro; numa colisão a fixação do banco traseiro esquerdo e central podia soltar.
- **Quem:** Gol e Voyage anos 2018 e 2019, produzidos de 16/05 a 14/06/2018. Total não divulgado.
- **O que fazer:** instalar porca de fixação no fecho, cerca de 50 minutos, atendimento a partir de 17/12/2018.
- **Fontes:** Autopapo, Motor Show e Automais TV (12/2018); Garagem360 descartada por divergir. Detalhes em `parte-08/FACTS.md`.

## 9. Rolamento da roda traseira (recall de 2010) · fato documentado
- **Defeito:** em algumas unidades, o rolamento da roda traseira tinha pouca graxa; ruído, depois travamento da roda e, em casos extremos, a roda pode se soltar.
- **Quem:** Novo Gol e Voyage anos 2009 e 2010; 193.620 carros (uma fonte aberta para o total).
- **O que fazer:** inspeção e, se preciso, troca do rolamento, sem custo; vale também para carro comprado de particular. O portal do governo não cobre 2010: perguntar à Volkswagen pelo chassi.
- **Fontes:** Procon-RS 12/02/2010; Mecânica Online 02/2010. Detalhes em `parte-09/FACTS.md`.

## 10. Airbag (recalls de 2020 a 2024) · fato documentado (2020); etapas só em imprensa/blog
- **Defeito (2020):** o propelente do gerador de gás podia se degradar com calor, variação térmica e umidade; ao disparar, o gerador pode se romper e lançar fragmentos metálicos. Gol e Voyage 2009; Autossegredos e Boris Feldman citam o fornecedor Takata.
- **Etapas de 2023 e 2024:** Gol, Voyage e Saveiro de outros anos, só em imprensa e blog; as faixas de chassi se sobrepõem. Sem total de unidades publicado.
- **O que fazer:** consultar o chassi (site da VW ou serviço de recall do governo, com conta gov.br) e agendar a troca.
- **Fontes:** Procon-SP 20/03/2020; Autopapo 23/03/2020; Autossegredos 23/03/2020; Boris Feldman 31/03/2020; O Tempo 13/09/2023 e 14/05/2024; Vrum 04/2024. Detalhes em `parte-10/FACTS.md`.

---

## Descartados (não entraram porque não passaram na regra das 2 fontes independentes)

| Tema | Motivo |
|---|---|
| Bomba de combustível, filtro, pressão | Nenhuma fonte atribui defeito ao Gol; o recall de bomba de 2015 é do Golf. |
| Direção (zunido da bomba hidráulica) | Autoo 21/09/2024 e dois casos do Reclame Aqui (Gol 2023); a independência entre eles não é demonstrável; sem recall de bomba. Tema reserva. |
| Suspensão (pivô, bieleta, coxim) | Nenhuma fonte atribui ao Gol; só roteiros genéricos de diagnóstico e casos de amortecedor traseiro de origem Reclame Aqui. |
| Embreagem e câmbio manual | Só casos isolados. |
| Vidros e travas elétricas, ar-condicionado, luzes de painel/ABS/airbag do G6 | Só uma fonte genérica (Vrum) ou nenhuma. |
| Motor 1.0 de 3 cilindros (apagar, vibração, consumo, bobina G7/G8) | Um caso (Autoo 2024) e um site sem fonte (Verificar Auto). |
| Correia dentada do EA211 | Intervalo em conflito (120 mil km ou 4,5 anos em O Mecânico e Oficina Brasil × 60 mil km no Verificar Auto); o manual MY2021 não traz km; "motor de interferência" não verificado. Tema reserva: só entra depois de confirmar no plano de revisão da VW. |
| Marcha lenta e sensores (TPS, MAP, lambda, fase) | Uma só fonte para a linha EA111. |
| Farol de neblina (2008), pedal de freio (2008), airbag do motorista (2018) | Uma fonte aberta cada. |
| Airbag do passageiro (2016, 548 carros) e pivô da suspensão (2018) | Têm duas fontes, mas lote muito pequeno; temas reserva. |
| Recompra de 194 carros sem registro de liberação (2019, expandida em 2019) | Documento oficial existe, mas não é defeito de uso do dia a dia. |
| Decisão liminar do RS sobre o motor 1.0 (2013) | Desfecho não verificado. |

## Não verificado (limites desta pesquisa)

- Resultado das consultas de chassi no site da VW e página de recalls do Procon-SP (exigem digitar chassi ou só abriram a moldura).
- Portal de recall do governo e página do fabricante não foram consultados por placa; os recalls estão sustentados por Procon, órgãos oficiais abertos e imprensa.
- Reclame Aqui: várias páginas deram erro 403; só alguns casos entram como contexto.
- Fórum G5 Clube e G6 Clube (provável melhor fórum de donos de G5/G6) não abriram a partir daqui: vale o Vinicius abrir no navegador.
- Tabela de capacidades do manual (p. 253) foi lida de texto extraído do PDF: conferir a página antes de citar litros.
- Matérias diferentes trazem telefones de recall da VW diferentes (0800 019 8866 até 2024 e 0800 109 8866 numa de 2026): nenhuma parte cita telefone.

# Molde de Shorts · PS Automóvel

Uma pasta de roteiro vira um Short pronto com um comando: voz, linha do tempo, trilha, mix a −14 LUFS, legenda karaokê, render 1080×1920 a 24 fps, `.srt`, poster, cópia leve para celular e folha de contato.

```bash
sh molde/build.sh roteiros/01-calibragem-pneu
```

```bash
sh molde/build.sh serie-falando-de/carros/gol/parte-06
```

Rode da pasta `Parafuso Solto`. A saída vai para `molde/saida/<nome>/` (`roteiros/01-x` → `01-x`; `carros/gol/parte-06` → `gol-parte-06`). Um segundo argumento troca o nome.

## Tempo por vídeo

| Etapa | Tempo |
|---|---|
| Montar o `cena.json` | rascunho automático na hora; revisar à mão leva 10 a 15 min por roteiro (os dois do teste foram revisados a partir do rascunho) |
| Máquina (vídeo de ~65 s) | ~2 min 15 s: voz ~30 s (online), checagem ~8 s, render ~40 s, mux ~20 s, celular ~20 s, folha e poster ~5 s |
| Refazer depois de mexer só no `cena.json` | ~1 min 45 s (a voz é reaproveitada) |

## Fluxo

1. `sh molde/build.sh <pasta>`. Sem `saida/<nome>/cena.json`, o build escreve um **rascunho** a partir da tabela do `ROTEIRO.md` (palavras-chave → zona, estado, etiqueta, cartão) e segue até o fim, para você ver o resultado.
2. Revise `saida/<nome>/cena.json` (cada fala tem uma `nota` com o que o roteiro pede) e rode de novo.
3. Confira `saida/<nome>/folha.jpg` e `saida/<nome>/out/checagem.txt`. O build avisa no fim se a checagem achou texto encostado, legenda fora do lugar ou erro no `cena.json`.

A pasta do roteiro só é lida (`lines.json`, `ROTEIRO.md`, `FACTS.md`). A voz só é refeita quando o `lines.json` do roteiro muda, ou com `VOZ=1`. `WORKERS=3` é o padrão e o máximo neste PC; nunca rode dois builds ao mesmo tempo.

## Estilo visual

Cinco estilos leem o mesmo `cena.json` (detalhes e por que cada um: `estilos/ESTILOS.md`):

| Estilo | Cara | Bom para |
|---|---|---|
| `hologram-hud` (padrão) | carro de arame 3D ciano, HUD | achar a peça no carro |
| `blueprint` | desenho técnico branco no azul, peças internas tracejadas | "como funciona", freio, motor |
| `chalkboard` | quadro-verde e giz, só o contorno e a peça da aula | "No quadro", comparação fixa × piscando |
| `swiss-motion` | página clara, tipografia grande, um vermelho só | números, listas de sinais, "Versus" |
| `midcentury-toon` | desenho animado anos 1950, cor chapada, tom do fundo muda por cena | o lúdico, para variar o ritmo |

- Para um vídeo novo: ponha `"estilo": "blueprint"` no topo do `cena.json` e rode o build normal.
- Para fazer outra versão de um vídeo pronto sem mexer no original: `ESTILO=blueprint sh molde/build.sh roteiros/06-barulho-ao-frear` → `saida/06-barulho-ao-frear-blueprint/` (copia o `cena.json`, já com o `estilo`, e a voz de `saida/06-barulho-ao-frear/`; a trilha sai outra, porque a semente vem do nome).
- Escolha: não repita o estilo de dois vídeos seguidos no calendário (`ESTOQUE.md` diz o estilo de cada um) e prefira o estilo que combina com o quadro (tabela acima). Legenda, selo, fonte, etiquetas, cartão e o final com a ambulância saem em todos, com os mesmos tamanhos e a mesma checagem.

## O que sai em `saida/<nome>/`

| Arquivo | O que é |
|---|---|
| `<nome>.mp4` | vídeo final, 1080×1920, 24 fps, áudio a −14 LUFS e pico ≤ −1 dB |
| `<nome>-celular.mp4` | cópia leve, 2400 kbps, duas passadas |
| `<nome>.srt` | legenda com os mesmos tempos da legenda queimada |
| `poster.jpg` | quadro sem legenda (logo depois do 1º cartão; ou `"poster": <segundos>` no `cena.json`) |
| `folha.jpg` | 18 quadros em baixa resolução para conferir texto e enquadramento |
| `cena.json`, `timeline.json`, `events.json`, `voices/`, `labios.json` (boca do apresentador), `score.wav`, `mix.wav` | dados intermediários (dá para refazer qualquer etapa) |
| `build.log`, `out/checagem.txt` | log completo e resultado da checagem |

## Formato do Short

- **Gancho na primeira fala**, que começa em 0,3 s; o carro entra por varredura em 0,6 s. A marca no começo é só o canto do HUD (`PS AUTOMÓVEL // <série>`).
- Cada fala começa quando a anterior termina + 0,3 s (`pausa` muda isso por fala).
- **Final de ~3,5 a 4 s**: se a última fala for a assinatura ("Pê Ésse Automóvel. Seu carro sempre em boas mãos."), ela é falada 20% mais rápida e toca sobre a ambulância do EP01, que vai embora com o carro na maca, com o nome pintado na lateral, o slogan e INSCREVA-SE. Sem assinatura, o final entra mudo.
- **Nunca abaixo de 70 s** (o TikTok só remunera acima de 1 min; `DURACAO_MIN=<s>` muda): se as falas somadas não chegam lá, `tools/linha_do_tempo.py` completa sozinho, nesta ordem: (a) pausas entre falas até +1,0 s cada; (b) mais até +1,0 s em cada pausa, com o carro e o cartão ainda na tela; (c) o final da ambulância (Doutor Graxa acenando, slogan, INSCREVA-SE) pelo tempo que faltar. O build não para por isso; no GitHub, o job falha se o `.mp4` sair abaixo do mínimo (rede de segurança).
- Até 2 min: passou disso, o build para com erro.
- Fala nova no `lines.json` sem entrada no `cena.json`: o build completa só essa fala com o rascunho da tabela do `ROTEIRO.md` e mantém as revisadas.
- Trilha e efeitos sintetizados; a **semente** (do nome do vídeo, ou `"semente"` no `cena.json`) escolhe tom, andamento, progressão, arpejo, timbre e bateria.

## `cena.json`

```json
{
 "carro": "hatch",
 "serie": "FALANDO DE GOL",
 "titulo": "FALANDO DE GOL #6",
 "selo": "FATO DOCUMENTADO",
 "fonte": "Fonte: alerta de recall, gov.br/mj, 30/11/2015",
 "falas": {
  "L01": { "zona": "lanternas", "estado": "atencao", "seta": true, "etiqueta": "LUZ TRASEIRA OK?" },
  "L03": { "cartao": { "rotulo": "Carros convocados", "valor": "170 MIL", "detalhe": "Número do alerta oficial: 170.443", "palavra": "carros" },
           "legenda": "Foram cerca de 170 mil carros, segundo o alerta oficial." }
 }
}
```

### Campos do topo

| Campo | Valores | Efeito |
|---|---|---|
| `estilo` | `hologram-hud` (padrão), `blueprint`, `chalkboard`, `swiss-motion`, `midcentury-toon` | desenho do vídeo (seção Estilo visual) |
| `apresentador` | `mecanico` (padrão, o Doutor Graxa), `robo`, `faisca`, `false` (sem apresentador) | personagem que fala com a voz, boca sincronizada (`apresentador/APRESENTADOR.md`) |
| `carro` | `hatch` (padrão), `sedan` | perfil do carro de arame (sem marca nem logotipo) |
| `serie` | texto | canto do HUD: `PS AUTOMÓVEL // <serie>` |
| `titulo` | texto | placa no alto durante a 1ª fala (na série "Falando de", o nome do modelo aparece só aqui e na legenda) |
| `selo` | `FATO DOCUMENTADO`, `RELATO DE DONOS` | placa com losango a partir da 2ª fala, até o final |
| `fonte` | `"Fonte: …"` até ~50 caracteres | linha de fonte sob o selo (30 px); uma fala pode trocar com `"fonte"` dela |
| `semente`, `poster`, `inicio` | números | trilha, quadro do poster, segundo em que a 1ª fala começa |

### Campos de cada fala (`falas.Lnn`)

| Campo | Valores | Efeito |
|---|---|---|
| `zona` | `carro` (nada aceso), `carroceria`, `pneus`, `freios`, `susp_dianteira`, `susp_traseira`, `motor`, `cambio`, `arrefecimento`, `eletrica` (bateria + chicote), `escapamento`, `painel`, `farois`, `lanternas`, `tanque`, `estepe` | a câmera vai até a zona, que acende; as outras partes apagam. **Herdada** pela fala seguinte |
| `estado` | `ok` (padrão: branco), `atencao` (laranja), `alerta` (vermelho na zona e no HUD + bipe) | vale só na fala. Vermelho sempre com texto: ponha uma etiqueta |
| `etiqueta` | texto ou lista de até 3 textos, **até 3 palavras cada** | placas de 34 px acima da legenda; entram quando a palavra é falada (1ª palavra com 3+ letras), ou espaçadas |
| `cartao` | `{rotulo, valor, unidade, detalhe, palavra}` | cartão no alto: valor a 130 px (até ~10 caracteres), trava na `palavra` falada |
| `pontos` | lista: `porta`, `coluna`, `tanque`, `estepe`, `painel`, `volante`, `capo`, `chassi`, `rodaD`, `rodaT`, `farol`, `lanterna`, `escape` ou uma zona; objeto `{ "p": "tanque", "rotulo": "TAMPA DO TANQUE" }` | marca o ponto no carro e põe o nome numa coluna lateral |
| `lupa` | `true` | círculo no alto com a zona de perto (não junto com `cartao`) |
| `seta` | `true` | seta animada apontando a zona |
| `legenda` | texto | o que aparece escrito quando a fala é dita de outro jeito ("PSI" × "pê ésse ai"); o karaokê fica proporcional |
| `pausa` | segundos | silêncio depois da fala (padrão 0,3; antes da assinatura, 0,5) |
| `nota` | texto | ignorado pelo filme (o rascunho põe aqui o que o roteiro pede) |

Avisos do `cena.json` (zona que não existe, etiqueta com mais de 3 palavras, valor de cartão que não cabe a 130 px, palavra que não está na fala, campo desconhecido) aparecem na checagem.

## Tela e acessibilidade (ACESSIBILIDADE.md)

| Faixa (y) | O que fica |
|---|---|
| 40–110 | canto do HUD (24 px, decorativo) |
| 128–236 | título, depois selo (34 px) e fonte (30 px) |
| 242–610 | cartão (valor 130 px, rótulo 40 px, detalhe 34 px) ou lupa |
| 626–850 | nomes dos pontos marcados (34 px), nas laterais |
| ~600–1250 | carro de arame (alvo da câmera em y 930) |
| 1150–1288 | etiquetas (34 px, 1 ou 2 fileiras) |
| 1354–1500 | legenda karaokê, 62 px, peso 600, até 2 linhas, x entre 130 e 910 |
| 620–1140 | apresentador grande na 1ª fala (x 30–530; o carro vai 250 px para a direita) |
| 890–1140 | apresentador pequeno na explicação (x 20–260) |
| 158–636 | apresentador grande no final, sobre a ambulância (x 310–770) |

A checagem (`tools/checar.mjs`) percorre o vídeo a cada 0,1 s e acusa caixas de texto a menos de 6 px uma da outra, legenda fora de y 1350–1500 ou x 130–910 e painel abaixo de y 1316. A janela do apresentador (e a mão quando ele aponta) entra na checagem como uma caixa.

## Arquivos do molde

- `build.sh`: o comando. `film.js`: o filme genérico. `carro.js`: carro de arame e zonas. `models.js`: ambulância e pista (do EP01). `main.js`, `index.html`: a página que o render abre (`?d=saida/<nome>`).
- `engine/` (holo.js, hud.js, mkmodel.mjs: Lemo-Opuscar, MIT) e `fonts/` (OFL), copiados do EP01 sem mudança.
- `estilos/`: `base.js` (o que é igual em todos os estilos), uma pele por estilo (`blueprint.js`, `chalkboard.js`, `swiss-motion.js`, `midcentury-toon.js`), `fonts/` (OFL) e `ESTILOS.md`. O `main.js` escolhe o estilo por `?estilo=` ou pelo `cena.json`; sem nenhum, usa o `film.js` de sempre.
- `apresentador/`: o apresentador (`apresentador.js`), a sincronia labial (`labios.py`: o build grava `saida/<nome>/labios.json` logo depois da voz), `conceitos.jpg` e a demo; tudo em `APRESENTADOR.md`. Entra no `film.js` e no `estilos/base.js` por 3 linhas marcadas "apresentador".
- `mix.py` e `music/score.py`: vindos do EP01, agora lendo a pasta do vídeo; a trilha varia com a semente.
- `tools/`: `tts_words.py` (edge-tts), `rascunho_cena.py`, `linha_do_tempo.py`, `make_srt.py`, `checar.mjs`, `folha.py`.

## Limites conhecidos

- Um só carro genérico (hatch/sedã) visto de fora; nada de corte interno de peça (pastilha, disco em detalhe, circuito), calendário, calibrador ou documento desenhados. O que o roteiro pede além disso vira etiqueta, cartão ou lupa.
- Sem sons reais de defeito (para "Que barulho é esse?" falta gravação).
- Ninguém ouviu os vídeos: o mix foi medido (loudness, pico), não escutado. A pronúncia das siglas na voz não foi conferida.

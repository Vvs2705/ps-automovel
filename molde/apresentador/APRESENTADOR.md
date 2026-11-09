# Apresentador · PS Automóvel (2026-11-09)

Personagem ilustrado que fala com a mesma voz dos vídeos (edge-tts `pt-BR-AntonioNeural`), com a boca sincronizada quadro a quadro. Desenhado em código (canvas 2D), sem imagem, sem download, sem serviço pago. **Integrado no molde em 2026-11-09** (o Vinicius aprovou o clipe da demo): todo build novo sai com ele, nos 5 estilos; `"apresentador": false` no `cena.json` desliga.

## Escolhido: (a) Doutor Graxa, o mecânico de jaleco

Ele veste a ideia do próprio dono (o mecânico-médico que leva o carro na maca) e fecha com a ambulância "Resgate automotivo" do final; um rosto humano, com boné PS e graxa na bochecha, passa a confiança do "mecânico de confiança" que a descrição do canal promete, e lê bem até pequeno no canto.

## Os 3 conceitos (`conceitos.jpg`)

| | Conceito | Desenho |
|---|---|---|
| (a) | **Doutor Graxa** (padrão) | mecânico de jaleco branco, boné vermelho com PS prata (cores da logo), distintivo PS, bigode, mancha de graxa no rosto e no jaleco, estetoscópio, chave e caneta no bolso |
| (b) | **Robô Ré** | robô de peças: faróis como olhos (a tampa do farol é a pálpebra), grade do radiador como boca (as barras se afastam quando ele fala), retrovisores como orelhas, para-brisa na testa, bateria com PS no corpo, vela de ignição de antena |
| (c) | **Faísca** | a vela de ignição como mascote de desenho antigo: corpo de cerâmica, porca sextavada com PS, faísca no topo, braços de mangueira e luvas brancas |

Os três usam a mesma pose (olhar, piscada, sobrancelha, boca, gesto), então trocar é uma palavra: depois da integração, `"apresentador": "robo"` ou `"faisca"` no `cena.json` (na demo: `?p=robo`). Sem logotipo de montadora, nada realista. Só o (a) foi conferido em movimento.

## Como a boca sincroniza (`labios.py` → `labios.json`)

`python labios.py <pasta voices> <saida labios.json>` lê o `.wav` e o `words.json` de cada fala (de `molde/tools/tts_words.py`) e grava, a 24 fps, uma forma por quadro (`A E I O U`, `M` fechada, `R` repouso) e a abertura 0–100. Leva menos de 1 s por vídeo. `python labios.py --teste` roda a checagem embutida.

1. **Energia abre e fecha.** RMS por quadro, relativa ao pico da própria fala: 16 dB abaixo = fechada, 2 dB abaixo = toda aberta (a voz do edge-tts é comprimida, por isso a faixa curta). Silêncio vira repouso.
2. **Vogais dão a forma.** Cada palavra do `words.json` (o texto falado, então "pê ésse ai" funciona) vira uma sequência de visemas espalhada pela duração da palavra: vogal pesa 1, consoante 0,5. Regras do português falado: O e E átonos no fim viram U e I ("carro" → carru, "de" → di), u mudo em "que"/"gui", m nasal de "bem"/"campo" não fecha a boca; M, B e P fecham e são carimbados por cima para não sumir entre duas vogais; as outras consoantes pegam a vogal seguinte. A boca pode abrir 1 quadro antes do som (como na animação de verdade).
3. **Sem tremer.** A abertura abre rápido e fecha mais devagar, com filtro de 3 quadros; nenhuma forma dura 1 quadro só (M/B/P ficam pelo menos 2). No desenho, largura/abertura/arredondamento ainda misturam 3 quadros (¼ ½ ¼). Boca a 24 fps; corpo, piscada e gestos "em dois" (12 fps), como no estilo scifi-toon da biblioteca.

## Onde ele aparece (`makeApresentador`, tela 1080×1920)

Ele vive numa janela de "transmissão" no estilo do HUD (fundo azul-petróleo, engrenagem da logo girando devagar, borda ciano); a janela recorta o busto, só a mão que aponta sai dela (nunca para baixo).

| Momento | Janela (x, y) | O que ele faz |
|---|---|---|
| Gancho (1ª fala) | grande, x 30–530, y 620–1140 | surpreso, aponta para o carro, que vai 250 px para a direita (câmera em x 790) |
| Explicação | pequena no canto esquerdo, x 20–260, y 890–1140; vai para lá em 0,7 s quando o gancho termina | expressão segue o `estado` da fala (alerta = preocupado, atenção = sério); aponta para o carro quando a zona muda ou a fala tem `seta`/`pontos` |
| Final (ambulância) | grande no alto, x 310–770, y 158–636; sobe a partir de 0,55 s antes do final | feliz, acena sobre a ambulância PS AUTOMÓVEL, o slogan e o INSCREVA-SE |

Sempre: respira, pisca a cada 2,3–4,9 s, olha para quem assiste (dá uma olhada no carro quando aponta e volta), acena com a cabeça na força da fala.

**ACESSIBILIDADE.md:** nada passa da legenda (a janela termina em y 1140; a legenda começa em 1354), das etiquetas (1150–1288), do cartão (até 610) nem da coluna de botões do Shorts (x ≥ ~920: a mão no gancho vai até x ≈ 700). Os nomes dos pontos marcados descem até y 840 com 3 pontos; o canto começa em 890. O apresentador não traz informação: o texto continua na legenda e nas placas. A caixa dele (janela + mão) entra na checagem de texto do molde (`tools/checar.mjs`), que acusa se encostar em qualquer texto. Com ele em cima, `01-calibragem-pneu` (63 s) e `gol-parte-06` (58 s) inteiros deram 0 problema.

## Arquivos

- `apresentador.js`: o módulo. `desenhaMecanico` / `desenhaRobo` / `desenhaFaisca (g, pose, parte)` desenham um quadro a partir da pose (posição e escala vêm da janela; expressão, olhar, piscada, respiração, gesto, boca); `makeApresentador({ TL, labios, cena, personagem })` devolve `draw(ctx, t)` (desenha e devolve a caixa ocupada), `dx(t)` (deslocamento do carro no gancho) e `pose(t)`. Janelas em `SLOTS`, expressões em `EXPR`.
- `labios.py`: a sincronia labial.
- `conceitos.jpg`: os 3 conceitos e as 7 bocas do padrão.
- `demo/`: a página de teste. `render.sh` faz tudo (montar → teste do labios → checagem de texto → `conceitos.jpg` → render → mux −14 LUFS → cópia para celular → folha); recusa começar se houver outro `video.mjs` rodando. `montar.py` copia (só lê) o filme do molde e os dados de `saida/01-calibragem-pneu`, aplica no `film.js` copiado as mesmas trocas da integração e corta o `mix.wav` (gancho + 2 falas, corte, última fala + final). `film.js`, `carro.js`, `models.js`, `engine/`, `fonts/`, `apresentador/` e `dados/` dentro de `demo/` são cópias refeitas a cada `montar.py`: não edite lá.
- `demo/out/apresentador-demo.mp4` (18,2 s, 1080×1920, 24 fps), `apresentador-demo-celular.mp4` (2400 kbps, duas passadas), `folha.jpg`, `render.log`.

## Integração no molde (feita em 2026-11-09)

O que foi mudado, para conferir ou desfazer (cópias de antes ficaram fora do projeto, no scratchpad da sessão). Além dos passos abaixo, os estilos de `estilos/` recebem o apresentador pelo `estilos/base.js`, com as mesmas três trocas (`styled(S, TL, cena, dur, words, lines, AP = null)`, `cx: 540 + (AP ? AP.dx(t) : 0)` no `camAt` e `if (AP) TX.push(AP.draw(ctx, t));` antes do `S.chrome`), e o `estilos/midcentury-toon.js`, que tem `makeFilm` próprio, passa o `AP` adiante. As linhas novas levam o comentário "apresentador".

Nada se copia: o módulo já está em `molde/apresentador/`, e a página do molde é servida a partir de `molde/`.

1. **`build.sh`**: logo depois do bloco `step "voz"` (antes de `step "cena"`), uma linha:
   ```sh
   step "lábios do apresentador"; say "$PY" apresentador/labios.py "$DW/voices" "$DW/labios.json"
   ```
2. **`main.js`**: três mudanças.
   - Na 2ª linha: `import { makeApresentador } from './apresentador/apresentador.js';`
   - Logo depois da linha do `Promise.all` (a que carrega `timeline.json`, `cena.json` e `voices/`):
     ```js
     const labios = await fetch(`${D}/labios.json`).then(r => (r.ok ? r.json() : null), () => null);
     const AP = labios && cena.apresentador !== false ? makeApresentador({ TL, labios, cena, personagem: typeof cena.apresentador === 'string' ? cena.apresentador : 'mecanico' }) : null;
     ```
   - `makeFilm(TL, cena, dur, words, lines)` → `makeFilm(TL, cena, dur, words, lines, AP)`.
3. **`film.js`**: três trocas, cada texto aparece uma vez só (as mesmas de `demo/montar.py`, `TROCAS`; se o `montar.py` parar com erro, o `film.js` mudou e a troca precisa ser refeita à mão):

   | Trocar | Por |
   |---|---|
   | `export function makeFilm(TL, cena, dur, words, lines) {` | `export function makeFilm(TL, cena, dur, words, lines, AP = null) {` |
   | `fov: 0.8, cx: 540, cy: CY };` (no `camAt`) | `fov: 0.8, cx: 540 + (AP ? AP.dx(t) : 0), cy: CY };` |
   | `    if (!opt.nosub) drawSub(ctx, red ? TRd : T, t);` | `    if (AP) TX.push(AP.draw(ctx, t));` e, na linha seguinte, a linha original |

   O apresentador entra depois da vinheta e antes da legenda, e a caixa dele vai para a checagem de texto sem mudar o `checar.mjs`. Ele aparece também no `poster.jpg` (bom para a capa).
4. **`README.md`**: na tabela "Campos do topo", `apresentador` = `false` (desliga) ou `mecanico` (padrão), `robo`, `faisca`; na tabela de faixas de tela, as três janelas acima. Em `ACESSIBILIDADE.md`, uma linha: "Apresentador: janela sem texto informativo; gancho x 30–530 / y 620–1140, canto x 20–260 / y 890–1140, final x 310–770 / y 158–636".
5. **Teste**: `sh molde/build.sh roteiros/01-calibragem-pneu` (a voz é reaproveitada; o build passa a ter ~1 s a mais de lábios). A checagem tem de dar 0 problema; ver `saida/01-calibragem-pneu/folha.jpg` e assistir com som.
6. **Desligar** num vídeo: `"apresentador": false` no `cena.json`. Sem `labios.json` na pasta do vídeo, o filme sai como hoje (a página avisa uma linha de arquivo faltando).

## Limites e não verificado

- Ninguém assistiu com som: a sincronia foi conferida por números (formas por fala) e por tira de quadros seguidos, não a olho com o áudio. Se a boca parecer adiantada ou atrasada, o ajuste é deslocar o índice do quadro em `mouthAt` (`apresentador.js`).
- A forma vem do texto, não de reconhecimento de fonema: em palavras que o edge-tts junta ou corta diferente do texto, a vogal pode sair um pouco fora de lugar (a abertura, que vem do áudio, continua certa).
- O gesto aponta para o centro da câmera (a zona em foco), não para o ponto exato marcado.
- Um gancho com `pontos` do lado esquerdo, ou uma fala com 4 pontos, encostaria na janela: a checagem acusa; mude a fala ou tire o apresentador dela com `"apresentador": false`.
- No gancho, a traseira do carro deslocado pode passar por trás da coluna de botões do Shorts (só arame decorativo; a zona em foco fica em x ≈ 790).
- Robô e Faísca foram desenhados com a mesma pose, mas só vistos parados.
- Nos estilos 2D de carro grande (`midcentury-toon`, `swiss-motion`), o deslocamento de 250 px do gancho corta a frente ou a traseira do carro na borda direita durante a 1ª fala; a zona em foco continua na tela. Se incomodar, diminua `DX_GANCHO` em `apresentador.js`.
- A janela é azul-petróleo com borda ciano em todos os estilos (no `swiss-motion`, claro, ela fica bem destacada).

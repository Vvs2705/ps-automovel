# Estilos visuais do molde

Todos leem o mesmo `cena.json`, a mesma voz e a mesma linha do tempo; só muda o desenho e alguns sons. Em todos ficam: legenda karaokê de 62 px (peso 600) na mesma faixa (y 1350–1500, x 130–910), selo FATO DOCUMENTADO / RELATO DE DONOS, linha "Fonte: …", etiquetas de 34 px, cartão com valor de 130 px e o final com a ambulância (desenhada no estilo), PS AUTOMÓVEL na lateral, o slogan e INSCREVA-SE. Nenhum desenha logotipo de montadora nem pessoa.

| Estilo | Por que serve ao PS Automóvel (1 linha) | Fundo | Cor da peça (zona) |
|---|---|---|---|
| `hologram-hud` (padrão) | o visual do EP01: carro de arame 3D girando, bom para "achar" a peça no carro. | escuro | ciano; laranja / vermelho |
| `blueprint` | desenho técnico em vista lateral, peças internas em linha oculta: explica "como funciona" com a cara de manual de oficina. | azul | branco grosso + nuvem de revisão; ALERTA em vermelho de carimbo |
| `chalkboard` | aula no quadro-verde, só o contorno e a peça da aula: casa com o quadro "No quadro" da estratégia e com tom de professor. | verde | giz laranja; amarelo / rosa |
| `swiss-motion` | página clara, tipografia grande e uma cor só: o mais legível para números, "Versus" e "Código de falha", e quebra a sequência de fundos escuros. | claro | vermelho; etiquetas preta (ATENÇÃO) e vermelha (ALERTA) |
| `midcentury-toon` | desenho animado anos 1950, cor chapada e estrelinhas: o lúdico, para variar o ritmo sem perder a explicação. | creme e tons pastel por cena | mostarda; laranja / vermelho |

Ficaram de fora: `iso-infographic` (pede blocos sólidos que o carro de arame não tem), `teardown` e `white-model` (pedem CAD real / maquete de lugar real), `telestrator`, `lidar-survey` e `visual-investigation` (pedem filmagem ou dados reais), `dark-keynote` (perto demais do hologram-hud), `whiteboard` (repete o chalkboard em fundo branco), `rubber-hose` (tela 4:3 e cinza, briga com o vertical) e `scifi-toon` (pede dupla de personagens e portal).

## Como usar

- No `cena.json` do vídeo: `"estilo": "blueprint"` (ou `chalkboard`, `swiss-motion`, `midcentury-toon`). Sem o campo, `hologram-hud`.
- Ou na linha de comando, sem mexer no original: `ESTILO=blueprint sh molde/build.sh roteiros/04-motor-esquentando` gera `saida/04-motor-esquentando-blueprint/`, copiando o `cena.json` e a voz de `saida/04-motor-esquentando/` se já existirem.
- A semente da trilha vem do nome da pasta de saída, então a versão em outro estilo também ganha outra trilha.

## Arquivos

- `base.js`: o que é igual em todos (falas, tempos, eventos de som, câmera por zona, posições, legenda). A leitura das falas e os eventos são cópia do `film.js`: mudou um, mude o outro.
- `<estilo>.js`: a "pele" (fundo, traço do carro, placas, cores, fontes, sons trocados). Nos quatro novos a vista é ortográfica (sem perspectiva) e o giro do carro é achatado.
- `fonts/`: Tektur, Instrument Sans (OFL, cópia de `Agentes/skills/canvas-design/canvas-fonts`), Fredoka e Lilita One (OFL, cópia de `lemo-opuscar/core/fonts`); licenças ao lado.
- Diferenças dos `STYLE.md` da biblioteca, por causa de ACESSIBILIDADE.md e do formato do Short: a legenda fica sempre embaixo (o blueprint pede no "céu" do desenho; o swiss-motion, numa coluna da grade); fontes trocadas pelas que já estavam no PC (blueprint sem letra à mão; midcentury com Lilita One e Fredoka no lugar de Alfa Slab One e Jost); sem filme de grão nem 30 fps (o molde é 24 fps).

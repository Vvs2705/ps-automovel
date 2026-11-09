// Estilo chalkboard (biblioteca: styles/chalkboard): aula no quadro-verde. Giz branco para o contorno do carro e o texto,
// giz laranja só para a peça da aula (a zona), amarelo para ATENÇÃO e rosa-vermelho para ALERTA (sempre com texto).
// Tudo entra sendo escrito da esquerda para a direita; no fim do corpo, uma passada do apagador. A legenda fica numa placa escura lisa.
import { styled, fontes, path, grao, clamp, lerp, seg, DENTRO, TAU, W, H } from './base.js';

const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
await fontes([['Fredoka', 'Fredoka-latin.woff2', '500 700', LAT], ['Fredoka', 'Fredoka-latin-ext.woff2', '500 700', EXT]]);

const LOUSA = '#1D3A2D', GIZ = '#F3F1E7', LAR = '#FFA552', AMA = '#FFE066', VER = '#FF7482';
const giz = a => `rgba(243,241,231,${a})`;
const corEst = e => e === 'alerta' ? VER : e === 'atencao' ? AMA : null;
const PO = grao(192, 0.42, h => `rgba(29,58,45,${0.35 + 0.5 * h})`);   // falhas do giz (cor da lousa por cima do traço)
let pat = null;
const traco = (ctx, p, col, w) => {   // giz: pó largo e fraco + traço firme
  ctx.strokeStyle = col; const a0 = ctx.globalAlpha;
  ctx.lineWidth = w * 2.1; ctx.globalAlpha = a0 * 0.22; ctx.stroke(p);
  ctx.lineWidth = w; ctx.globalAlpha = a0 * 0.92; ctx.stroke(p); ctx.globalAlpha = a0;
};
const caixa = (ctx, x, y, w, h, col, lw = 3) => {   // retângulo à mão, cantos passando um pouco
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(x - 6, y + 1); ctx.lineTo(x + w + 5, y - 1); ctx.moveTo(x + w + 1, y - 5); ctx.lineTo(x + w - 1, y + h + 6);
  ctx.moveTo(x + w + 6, y + h); ctx.lineTo(x - 4, y + h + 1); ctx.moveTo(x, y + h + 5); ctx.lineTo(x + 1, y - 4); ctx.stroke();
};

const S = {
  nome: 'chalkboard', ortho: true, camK: [0.35, 0.5], balanco: 0.02, escrita: 'write',
  sfx: { hum: null, scan: ['grit', { d: 0.7 }], scan_down: ['grit', { d: 0.5 }], glitch: ['knock', {}], chip: ['knock', { v: 0.5 }], roll: ['grit', {}],
    dock: ['knock', { v: 0.5 }], servo: ['grit', {}], loupe: ['whoosh', { d: 0.45 }], blip: ['knock', { v: 0.4 }], lock: ['knock', { v: 0.8 }] },
  font: {
    tag: ['600 34px Fredoka', '1px'], titulo: ['600 38px Fredoka', '1px'], selo: ['600 34px Fredoka', '1px'], fonte: ['500 30px Fredoka', '0px'],
    sub: ['600 62px Fredoka', '0px'], idx: ['500 26px Fredoka'], label: ['600 40px Fredoka', '1px'], value: px => [`600 ${px}px Fredoka`, '0px'],
    unit: px => [`600 ${px}px Fredoka`], detail: ['500 34px Fredoka'], marca: px => [`700 ${px}px Fredoka`, '2px'], marcaSub: ['600 52px Fredoka', '4px'],
    slogan: ['600 44px Fredoka', '1px'],
  },
  cor: { painel: '#21432F', painelBorda: GIZ, cruz: VER, marca1: LAR, marca2: GIZ, marcaSub: AMA },
  ink(kind, st) {
    if (kind === 'subDim') return 'rgba(246,243,232,0.62)';
    if (kind === 'sub') return '#FBF8EE';
    if (kind === 'tag') return corEst(st.estado) || giz(st.lit ? 1 : 0.7);
    if (kind === 'seta') return corEst(st.estado) || LAR;
    if (kind === 'inscreva') return LAR;
    if (kind === 'valueRoll' || kind === 'unit' || kind === 'bar0') return giz(kind === 'bar0' ? 0.2 : 0.8);
    if (kind === 'idx') return giz(0.7);
    return GIZ;
  },
  bg(ctx, t, st) {
    ctx.fillStyle = LOUSA; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) {   // marcas de apagador antigas
      const x = 540 + 420 * Math.sin(i * 1.9), y = 160 + 1600 * ((i * 0.41 + 0.1) % 1), m = ctx.createRadialGradient(x, y, 0, x, y, 380);
      m.addColorStop(0, 'rgba(230,240,232,0.05)'); m.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = m; ctx.fillRect(0, 0, W, H);
    }
    const v = ctx.createRadialGradient(540, 900, 300, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  },
  car(ctx, G, st) {
    const lit = st.lit, z = st.z, wipe = st.sai > 0 ? lerp(-150, 1250, st.sai) : null, cut = wipe == null ? lerp(-120, 1220, st.entra) : null;
    const keepW = wipe == null ? null : (x0, y0, x1) => Math.min(x0, x1) > wipe, mid = G.dist;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const id in G.parts) {
      const P = G.parts[id], foco = lit && id === z;
      if (DENTRO.has(id) && !foco) continue;            // no quadro só vai o contorno e a peça da aula
      if (foco) {
        const bb = P.bbox, c = bb ? lerp(bb[0] - 10, bb[2] + 10, st.zk) : 2000;
        traco(ctx, path(P, { keep: keepW, cut: cut == null ? c : Math.min(c, cut) }), corEst(st.estado) || LAR, 4.2);
        continue;
      }
      const a = lit ? 0.75 : 1;
      ctx.globalAlpha = 0.3 * a; traco(ctx, path(P, { keep: (x0, y0, x1, y1, d) => d >= mid + 0.05 && (!keepW || keepW(x0, y0, x1)), cut }), GIZ, 1.6);
      ctx.globalAlpha = a; traco(ctx, path(P, { keep: (x0, y0, x1, y1, d) => d < mid + 0.05 && (!keepW || keepW(x0, y0, x1)), cut }), GIZ, 2.6);
      ctx.globalAlpha = 1;
    }
    if (wipe != null) {   // rastro do apagador
      const g = ctx.createLinearGradient(wipe - 260, 0, wipe, 0); g.addColorStop(0, 'rgba(225,235,228,0)'); g.addColorStop(1, 'rgba(225,235,228,0.10)');
      ctx.fillStyle = g; ctx.fillRect(wipe - 260, 560, 260, 760);
    }
    ctx.restore();
  },
  alvo(ctx, bb, a, st) {   // a peça da aula ganha um círculo de giz
    if (a <= 0) return;
    const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, rx = (bb[2] - bb[0]) / 2 + 34, ry = (bb[3] - bb[1]) / 2 + 30;
    const p = new Path2D(); p.ellipse(cx, cy, rx, ry, -0.06, -1.9, -1.9 + TAU * 1.06 * clamp(a * 1.2));
    ctx.save(); ctx.lineCap = 'round'; traco(ctx, p, corEst(st.estado) || LAR, 3.4); ctx.restore();
  },
  van(ctx, G, st) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const id in G.parts) for (const pc of G.parts[id].pieces) {
      const luz = pc.id === 'lights';
      traco(ctx, path(pc, { cut: lerp(-200, 1300, st.entra), keep: (x0, y0, x1, y1, d) => d < G.dist + 0.1 || luz }), luz ? (st.blink ? VER : GIZ) : pc.id === 'car' ? LAR : GIZ, luz ? 4 : 2.6);
    }
    ctx.restore();
  },
  estrada(ctx, G) { ctx.save(); ctx.globalAlpha = 0.5; traco(ctx, path(G.parts.estrada, { keep: (x0, y0, x1, y1, d) => d < G.dist + 0.5 }), GIZ, 2); ctx.restore(); },
  plate(ctx, kind, x, y, w, h, st) {
    if (kind === 'slogan') return;
    ctx.save();
    ctx.fillStyle = 'rgba(27,54,42,0.94)'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    const col = kind === 'tag' ? (corEst(st.estado) || giz(st.lit ? 0.95 : 0.55)) : kind === 'inscreva' ? LAR : kind === 'fonte' ? giz(0.5) : giz(0.9);
    if (kind !== 'fonte') caixa(ctx, x, y, w, h, col, kind === 'card' ? 3.4 : 2.8); else { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 14, y + h - 4); ctx.lineTo(x + w - 10, y + h - 6); ctx.stroke(); }
    ctx.restore();
  },
  icon(ctx, cx, cy) {
    ctx.save(); ctx.strokeStyle = LAR; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 12, cy - 1); ctx.lineTo(cx - 3, cy + 10); ctx.lineTo(cx + 15, cy - 13); ctx.stroke(); ctx.restore();
  },
  lupaFundo(ctx, x, y, r) { ctx.fillStyle = '#1F3E30'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); },
  anel(ctx, x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, TAU); ctx.lineCap = 'round'; traco(ctx, p, GIZ, 3.2); },
  sub(ctx, b) {   // placa escura lisa, cantos redondos, fora do giz
    ctx.fillStyle = 'rgba(8,18,13,0.86)'; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 22); ctx.fill();
    ctx.fillStyle = LAR; ctx.beginPath(); ctx.arc(b.x + 36, b.y + b.h / 2, b.talking ? 9 + 3 * Math.abs(Math.sin(b.t * 8)) : 8, 0, TAU); ctx.fill();
  },
  post(ctx) { pat = pat || ctx.createPattern(PO, 'repeat'); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); },
  chrome(ctx, t, c) {
    ctx.save();
    ctx.fillStyle = '#5E4128'; ctx.fillRect(0, 0, W, 18); ctx.fillRect(0, H - 18, W, 18); ctx.fillRect(0, 0, 18, H); ctx.fillRect(W - 18, 0, 18, H);   // moldura de madeira
    ctx.fillStyle = '#7A5634'; ctx.fillRect(18, H - 30, W - 36, 12);
    ctx.font = '500 24px Fredoka'; ctx.letterSpacing = '1px'; ctx.textBaseline = 'middle'; ctx.fillStyle = giz(0.8);
    ctx.fillText('PS AUTOMÓVEL // ' + c.serie, 56, 75); ctx.textAlign = 'right'; ctx.fillStyle = c.red ? VER : giz(0.8); ctx.fillText(c.status, W - 56, 75);
    ctx.restore();
  },
};
export const makeFilm = (...a) => styled(S, ...a);

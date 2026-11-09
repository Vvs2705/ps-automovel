// Estilo midcentury-toon (biblioteca: styles/midcentury-toon): desenho animado dos anos 1950, cor chapada impressa fora do registro
// (a cor escapa alguns px da linha e treme de 2 em 2 quadros), linha de tinta quente que "respira", papel creme, estrelinhas atômicas.
// O carro tem sempre a mesma cor (turquesa); a peça do assunto vai em mostarda, ATENÇÃO em laranja, ALERTA em vermelho (sempre com texto).
// O fundo troca de tom a cada troca de zona (parede clara, chão mais escuro).
import { styled, fontes, path, hull, hash, clamp, lerp, eo, DENTRO, TAU, W, H } from './base.js';

const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
await fontes([['Fredoka', 'Fredoka-latin.woff2', '500 700', LAT], ['Fredoka', 'Fredoka-latin-ext.woff2', '500 700', EXT],
  ['Lilita', 'LilitaOne-latin.woff2', 400, LAT], ['Lilita', 'LilitaOne-latin-ext.woff2', 400, EXT]]);

const TIN = '#2B2321', CREME = '#FBF3E2', TURQ = '#3FA7A0', MOST = '#E9A820', LAR = '#EE7B2A', VERM = '#D7263D';
const CENAS = [['#F3E7CF', '#E2CFA8'], ['#CFE0DC', '#A9C7C0'], ['#F5D9A6', '#E4BC78'], ['#F2C9B8', '#DCA68F'], ['#DCE3C3', '#BCC898']];   // parede, chão
const corEst = e => e === 'alerta' ? VERM : e === 'atencao' ? LAR : MOST;
const off = f => { const k = Math.floor(f / 2); return [6 + 2 * hash(k), 5 + 2 * hash(k + 0.5)]; };   // fora do registro, treme de 2 em 2
const tinta = (ctx, P, opt, w) => {   // linha que respira: três espessuras e algumas falhas
  for (let g = 0; g < 3; g++) {
    ctx.lineWidth = w * [0.75, 1, 1.3][g];
    ctx.stroke(path(P, { ...opt, keep: (x0, y0, x1, y1, d) => { const h = hash(Math.round(x0 * 0.7) * 13.1 + Math.round(y0 * 0.7) * 7.7); return h > 0.12 && Math.floor(h * 3.7) % 3 === g && (!opt.keep || opt.keep(x0, y0, x1, y1, d)); } }));
  }
};
const estrela = (ctx, x, y, r, rot, col, n = 4) => {   // estrelinha atômica (4 pontas) ou explosão (8+)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rr = i % 2 ? r * (n > 4 ? 0.62 : 0.28) : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.restore();
};
const laje = (ctx, x, y, w, h, col, cel, f, r = 18) => {   // placa de papel com borda de tinta e a cor deslocada por trás
  const [ox, oy] = off(f);
  ctx.fillStyle = cel; ctx.beginPath(); ctx.roundRect(x + ox, y + oy, w, h, r); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  ctx.strokeStyle = TIN; ctx.lineWidth = 3; ctx.stroke();
};

const S = {
  nome: 'midcentury-toon', ortho: true, camK: [0.3, 0.45], balanco: 0.02, escrita: 'pop', caixa: true, barra: false, cartaoAbre: false,
  sfx: { hum: null, scan: ['whoosh', { d: 0.6 }], scan_down: ['whoosh', { d: 0.4 }], glitch: ['knock', {}], chip: ['pop', {}], roll: ['ratchet', { v: 0.4 }],
    dock: ['pop', {}], servo: ['whoosh', { d: 0.35 }], blip: ['pop', {}], lock: ['knock', {}] },
  font: {
    tag: ['400 36px Lilita', '1px'], titulo: ['400 40px Lilita', '1px'], selo: ['400 36px Lilita', '1px'], fonte: ['500 30px Fredoka', '0px'],
    sub: ['600 62px Fredoka', '0px'], idx: ['600 26px Fredoka'], label: ['400 40px Lilita', '1px'], value: px => [`400 ${px}px Lilita`, '1px'],
    unit: px => [`400 ${px}px Lilita`], detail: ['500 34px Fredoka'], marca: px => [`400 ${px}px Lilita`, '2px'], marcaSub: ['600 50px Fredoka', '4px'],
    slogan: ['400 46px Lilita', '1px'],
  },
  cor: { painel: CREME, painelBorda: TIN, cruz: VERM, marca1: VERM, marca2: TIN, marcaSub: TIN },
  valorContorno: null,
  ink(kind, st) {
    if (kind === 'subDim') return 'rgba(43,35,33,0.6)';
    if (kind === 'tag') return st.lit ? TIN : 'rgba(43,35,33,0.7)';
    if (kind === 'seta') return st.estado === 'ok' ? TIN : corEst(st.estado);
    if (kind === 'valueRoll' || kind === 'unit') return 'rgba(43,35,33,0.75)';
    if (kind === 'value') return TIN;
    if (kind === 'inscreva') return CREME;
    return TIN;
  },
  bg(ctx, t, st) {
    const k = st.fim ? 0 : CENA(st);
    const [pa] = CENAS[k];
    ctx.fillStyle = pa; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(43,35,33,0.05)';   // formas de bumerangue na parede
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(200 + 380 * i, 300 + 260 * (i % 2), 190, 80, 0.5 - i * 0.4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(43,35,33,0.06)';
    for (let y = 170; y < 600; y += 70) for (let x = (y / 70 % 2) * 35 + 60; x < W; x += 70) { ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); }
  },
  car(ctx, G, st) {
    const f = st.frame, [ox, oy] = off(f), lit = st.lit, z = st.z, mid = G.dist, sc = st.sai > 0 ? 1 - eo(st.sai) : eo(st.entra * 1.3);
    if (sc <= 0.01) return;
    const near = (x0, y0, x1, y1, d) => d < mid + 0.05;
    ctx.save();
    if (!st.lupa) {   // chão da cena
      const o = [0, 0, 0]; G.project(0, 0, 0.5, o); ctx.fillStyle = CENAS[CENA(st)][1]; ctx.fillRect(0, o[1], W, H - o[1]);
      ctx.strokeStyle = TIN; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, o[1]); ctx.lineTo(W, o[1]); ctx.stroke();
    }
    // entra/sai crescendo do chão (animação limitada: o carro "pula" para a cena)
    const g = [0, 0, 0]; G.project(0, 0, 0.5, g);
    ctx.translate(g[0], g[1]); ctx.scale(1, sc); ctx.translate(-g[0], -g[1]);
    const body = G.parts.carroceria.pieces[0];
    ctx.fillStyle = TURQ; ctx.save(); ctx.translate(ox, oy); ctx.fill(hull(body)); ctx.restore();
    for (const pc of G.parts.pneus.pieces) { ctx.fillStyle = TIN; ctx.save(); ctx.translate(ox * 0.5, oy * 0.5); ctx.fill(hull(pc)); ctx.restore(); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const id in G.parts) {
      const P = G.parts[id], foco = lit && id === z;
      if (DENTRO.has(id) && !foco) continue;
      if (foco) continue;
      ctx.strokeStyle = id === 'pneus' ? '#8E8273' : TIN; tinta(ctx, P, { keep: near }, id === 'pneus' ? 2.2 : 3.4);
    }
    if (lit && G.parts[z]) {   // peça do assunto: explosão de fundo + traço colorido grosso
      const P = G.parts[z], a = P.anchor, k = st.zk, col = corEst(st.estado);
      if (!st.lupa) estrela(ctx, a[0] + ox, a[1] + oy, 120 * eo(k), st.t * 0.3, 'rgba(251,243,226,0.85)', 12);
      ctx.strokeStyle = col; tinta(ctx, P, {}, lerp(2, 5.5, k));
      if (!st.lupa) for (let i = 0; i < 3; i++) estrela(ctx, a[0] + Math.cos(i * 2.1 + 0.6) * 150, a[1] - 40 + Math.sin(i * 2.1 + 0.6) * 110, 16 * eo(k * 2 - i * 0.3), st.t * 2 + i, i % 2 ? TIN : col);
    }
    ctx.restore();
  },
  van(ctx, G, st) {
    const [ox, oy] = off(st.frame), body = G.parts.furgao?.pieces.find(p => p.id === 'body');
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.rect(-1e4, -1e4, lerp(-200, 1300, st.entra) + 1e4, 3e4); ctx.clip();   // a van entra da esquerda para a direita
    if (body) { ctx.fillStyle = CREME; ctx.save(); ctx.translate(ox, oy); ctx.fill(hull(body)); ctx.restore(); }
    for (const pc of G.parts.rodas?.pieces || []) { ctx.fillStyle = TIN; ctx.fill(hull(pc)); }
    for (const id in G.parts) for (const pc of G.parts[id].pieces) {
      const luz = pc.id === 'lights';
      ctx.strokeStyle = luz ? (st.blink ? VERM : MOST) : pc.id === 'car' ? TURQ : pc.id.startsWith('wheel') ? '#8E8273' : TIN;
      tinta(ctx, { pieces: [pc] }, { keep: (x0, y0, x1, y1, d) => d < G.dist + 0.1 || luz }, luz ? 5 : 3.2);
    }
    ctx.restore();
    for (let i = 0; i < 4; i++) estrela(ctx, 140 + i * 260, 520 + 60 * Math.sin(i * 1.7), 18 * eo(st.entra * 2 - i * 0.2), st.t * 2 + i, i % 2 ? MOST : VERM);
  },
  estrada(ctx, G) { const o = [0, 0, 0]; G.project(0, 0, 1, o); ctx.fillStyle = '#E2CFA8'; ctx.fillRect(0, o[1] - 120, W, H); ctx.strokeStyle = TIN; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, o[1] - 120); ctx.lineTo(W, o[1] - 120); ctx.stroke(); },
  plate(ctx, kind, x, y, w, h, st) {
    if (kind === 'slogan') return;
    const cel = kind === 'tag' ? corEst(st.estado) : kind === 'inscreva' ? TIN : kind === 'card' ? TURQ : kind === 'selo' ? MOST : kind === 'ponto' ? MOST : 'rgba(43,35,33,0.25)';
    laje(ctx, x, y, w, h, kind === 'inscreva' ? VERM : kind === 'tag' && !st.lit ? 'rgba(251,243,226,0.9)' : CREME, cel, st.frame ?? 0, kind === 'card' ? 26 : 18);
  },
  icon(ctx, cx, cy, st) { estrela(ctx, cx, cy, 17, 0.3, VERM, 4); },
  lupaFundo(ctx, x, y, r) { ctx.fillStyle = CREME; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); },
  anel(ctx, x, y, r, st) {
    const [ox, oy] = off(st.frame); ctx.strokeStyle = MOST; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = TIN; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  },
  sub(ctx, b) {
    laje(ctx, b.x, b.y, b.w, b.h, CREME, TURQ, Math.floor(b.t * 24), 24);
    estrela(ctx, b.x + 36, b.y + b.h / 2, 16, b.t * 2, MOST, 4);
  },
  chrome(ctx, t, c) {
    ctx.save(); ctx.font = '600 24px Fredoka'; ctx.letterSpacing = '1px'; ctx.textBaseline = 'middle'; ctx.fillStyle = TIN;
    ctx.fillText('PS AUTOMÓVEL // ' + c.serie, 60, 75); ctx.textAlign = 'right'; ctx.fillStyle = c.red ? VERM : TIN; ctx.fillText(c.status, W - 60, 75);
    ctx.restore();
  },
};
// tom da cena: muda a cada troca de zona (st.trocas = quantas trocas de zona houve até a fala atual)
const CENA = st => (st.trocas ?? 0) % CENAS.length;
export const makeFilm = (TL, cena0, dur, words, lines, AP = null) => {
  // índice de cena por fala: soma 1 a cada mudança de zona (o mesmo cálculo de herança do base.js)
  const ids = TL.ids.filter(id => id !== TL.assina); let z = 'carro', n = 0; const troca = {};
  ids.forEach((id, i) => { const c = (cena0.falas || {})[id] || {}; const nz = c.zona || z; if (i && nz !== z) n++; z = nz; troca[i] = n; });
  const tr = st => ({ ...st, trocas: st.L ? troca[st.L.i] : 0 });
  return styled({ ...S, bg: (ctx, t, st) => S.bg(ctx, t, tr(st)), car: (ctx, G, st) => S.car(ctx, G, tr(st)) }, TL, cena0, dur, words, lines, AP);
};

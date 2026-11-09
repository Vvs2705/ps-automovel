// Estilo swiss-motion (biblioteca: styles/swiss-motion): página clara, grade modular, uma família tipográfica (Instrument Sans)
// e uma só cor de sinal, o vermelho, que marca a peça do assunto. Carro em vista lateral chapada, linha preta; texto alinhado à esquerda
// sobe de dentro de um recorte. ALERTA: etiqueta vermelha com texto; ATENÇÃO: etiqueta preta com barra vermelha (nunca só cor).
import { styled, fontes, path, hull, lerp, seg, DENTRO, TAU, W, H } from './base.js';

await fontes([['InstrumentSans', 'InstrumentSans-Bold.ttf', 700], ['InstrumentSans', 'InstrumentSans-Regular.ttf', 400]]);

const PAG = '#ECEAE4', PAPEL = '#FFFFFF', TIN = '#141414', CIN = '#8B8A85', SIN = '#E30613';
const tin = a => `rgba(20,20,20,${a})`;
const S = {
  nome: 'swiss-motion', ortho: true, camK: [0.25, 0.3], balanco: 0, escrita: 'mask', barra: true,
  sfx: { hum: null, scan: ['whoosh', { d: 0.6 }], scan_down: ['whoosh', { d: 0.4 }], glitch: ['knock', {}], chip: ['tink', { v: 0.45 }], roll: ['ratchet', { v: 0.5 }],
    dock: ['knock', { v: 0.5 }], servo: ['whoosh', { d: 0.35 }], blip: ['tink', { v: 0.4 }] },
  font: {
    tag: ['700 34px InstrumentSans', '0px'], titulo: ['700 38px InstrumentSans', '-0.5px'], selo: ['700 34px InstrumentSans', '0.5px'], fonte: ['400 30px InstrumentSans', '0px'],
    sub: ['700 62px InstrumentSans', '-1px'], idx: ['700 26px InstrumentSans'], label: ['700 40px InstrumentSans', '-0.5px'], value: px => [`700 ${px}px InstrumentSans`, `${-px * 0.03}px`],
    unit: px => [`700 ${px}px InstrumentSans`], detail: ['400 34px InstrumentSans'], marca: px => [`700 ${px}px InstrumentSans`, '-2px'], marcaSub: ['400 50px InstrumentSans', '2px'],
    slogan: ['700 44px InstrumentSans', '-0.5px'],
  },
  cor: { painel: PAPEL, painelBorda: TIN, cruz: SIN, marca1: SIN, marca2: TIN, marcaSub: tin(0.7) },
  caixa: true,
  ink(kind, st) {
    if (kind === 'subDim') return tin(0.6);
    if (kind === 'tag') return st.lit || st.estado !== 'ok' ? PAPEL : tin(0.75);
    if (kind === 'ponto' || kind === 'inscreva' || kind === 'selo') return PAPEL;
    if (kind === 'seta') return SIN;
    if (kind === 'fonte' || kind === 'idx' || kind === 'unit') return tin(0.62);
    if (kind === 'valueRoll' || kind === 'bar0') return tin(kind === 'bar0' ? 0.12 : 0.5);
    if (kind === 'bar') return SIN;
    if (kind === 'linha') return TIN;
    return TIN;
  },
  bg(ctx) {
    ctx.fillStyle = PAG; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = tin(0.07); ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 110; x <= 970; x += 107.5) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
    for (let y = 128; y < H; y += 96) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();
  },
  car(ctx, G, st) {
    const lit = st.lit, z = st.z, mid = G.dist, cut = st.sai > 0 ? lerp(1200, -120, st.sai) : lerp(-120, 1200, st.entra);
    const keep = st.sai > 0 ? (x0, y0, x1, y1, d) => Math.max(x0, x1) < cut : null;
    ctx.save(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    if (!st.lupa) { const o = [0, 0, 0], q = [0, 0, 0]; G.project(-1.7, 0, 0.5, o); G.project(1.7, 0, 0.5, q); ctx.fillStyle = TIN; ctx.fillRect(Math.min(o[0], q[0]), o[1] - 1, Math.abs(q[0] - o[0]) * Math.min(1, st.entra * 1.4), 4); }
    for (const id in G.parts) {
      const P = G.parts[id], foco = lit && id === z;
      if (DENTRO.has(id) && !foco) continue;
      if (foco) {
        ctx.strokeStyle = SIN; ctx.lineWidth = lerp(2, 5, st.zk); ctx.stroke(path(P, { keep, cut: st.sai > 0 ? null : cut }));
        continue;
      }
      if (id === 'pneus' && !st.lupa) for (const pc of P.pieces) { ctx.fillStyle = lit ? tin(0.06) : tin(0.1); ctx.fill(hull(pc)); }
      ctx.strokeStyle = tin(lit ? 0.18 : 0.25); ctx.lineWidth = 1; ctx.stroke(path(P, { keep: (x0, y0, x1, y1, d) => d >= mid + 0.05 && (!keep || keep(x0, y0, x1)), cut: st.sai > 0 ? null : cut }));
      ctx.strokeStyle = tin(lit ? 0.55 : 0.92); ctx.lineWidth = 2.2; ctx.stroke(path(P, { keep: (x0, y0, x1, y1, d) => d < mid + 0.05 && (!keep || keep(x0, y0, x1)), cut: st.sai > 0 ? null : cut }));
    }
    ctx.restore();
  },
  alvo(ctx, bb, a) {   // cantos de registro em volta da peça
    if (a <= 0) return;
    const p = 20, L = 30 * a, x0 = bb[0] - p, y0 = bb[1] - p, x1 = bb[2] + p, y1 = bb[3] + p;
    ctx.save(); ctx.strokeStyle = TIN; ctx.lineWidth = 3; ctx.beginPath();
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x1, y1, -1, -1], [x0, y1, 1, -1]]) { ctx.moveTo(x + sx * L, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * L); }
    ctx.stroke(); ctx.restore();
  },
  van(ctx, G, st) {
    ctx.save(); ctx.lineJoin = 'round';
    const body = G.parts.furgao?.pieces.find(p => p.id === 'body');
    const cut = lerp(-200, 1300, st.entra);   // a lataria entra junto com o traço
    if (body) { ctx.save(); ctx.beginPath(); ctx.rect(-1e4, -1e4, cut + 1e4, 3e4); ctx.clip(); ctx.fillStyle = PAPEL; ctx.fill(hull(body)); ctx.restore(); }
    for (const id in G.parts) for (const pc of G.parts[id].pieces) {
      const luz = pc.id === 'lights';
      ctx.strokeStyle = luz ? (st.blink ? SIN : TIN) : pc.id === 'car' ? SIN : TIN; ctx.lineWidth = luz ? 3.4 : 2.2;
      ctx.stroke(path(pc, { keep: (x0, y0, x1, y1, d) => d < G.dist + 0.1 || luz, cut }));
    }
    ctx.restore();
  },
  estrada(ctx, G) { ctx.save(); ctx.strokeStyle = TIN; ctx.lineWidth = 2; ctx.stroke(path(G.parts.estrada, { keep: (x0, y0, x1, y1, d) => d < G.dist + 0.5 })); ctx.restore(); },
  plate(ctx, kind, x, y, w, h, st) {
    if (kind === 'slogan' || kind === 'fonte' || kind === 'titulo') { if (kind !== 'slogan') { ctx.fillStyle = PAG; ctx.fillRect(x, y, w, h); ctx.fillStyle = TIN; ctx.fillRect(x, y, kind === 'titulo' ? w : 60, kind === 'titulo' ? 5 : 2); } return; }
    if (kind === 'tag') {
      const on = st.lit || st.estado !== 'ok';
      ctx.fillStyle = st.estado === 'alerta' ? SIN : on ? TIN : PAG; ctx.fillRect(x, y, w, h);
      if (!on) { ctx.strokeStyle = TIN; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); }
      if (st.estado === 'atencao') { ctx.fillStyle = SIN; ctx.fillRect(x, y, 10, h); }
      return;
    }
    if (kind === 'ponto' || kind === 'selo') { ctx.fillStyle = TIN; ctx.fillRect(x, y, w, h); return; }
    if (kind === 'inscreva') { ctx.fillStyle = SIN; ctx.fillRect(x, y, w, h); return; }
    ctx.fillStyle = PAPEL; ctx.fillRect(x, y, w, h); ctx.fillStyle = TIN; ctx.fillRect(x, y, w, 6);   // cartão: papel branco, régua grossa
  },
  icon(ctx, cx, cy) { ctx.fillStyle = SIN; ctx.fillRect(cx - 12, cy - 12, 24, 24); },
  lupaFundo(ctx, x, y, r) { ctx.fillStyle = PAPEL; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); },
  anel(ctx, x, y, r) {
    ctx.strokeStyle = TIN; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = SIN; ctx.lineWidth = 3; ctx.beginPath(); for (const a of [0, 1, 2, 3]) { const c = Math.cos(a * TAU / 4), s = Math.sin(a * TAU / 4); ctx.moveTo(x + c * (r - 14), y + s * (r - 14)); ctx.lineTo(x + c * (r + 14), y + s * (r + 14)); } ctx.stroke();
  },
  sub(ctx, b) { ctx.fillStyle = PAPEL; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle = TIN; ctx.fillRect(b.x, b.y, b.w, 6); ctx.fillStyle = SIN; ctx.fillRect(b.x + 26, b.y + 34, 18, 18); },
  chrome(ctx, t, c) {
    ctx.save(); ctx.font = '700 24px InstrumentSans'; ctx.textBaseline = 'middle'; ctx.fillStyle = TIN;
    ctx.fillText('PS Automóvel', 110, 75); const w = ctx.measureText('PS Automóvel  ').width; ctx.font = '400 24px InstrumentSans'; ctx.fillStyle = tin(0.6); ctx.fillText(c.serie, 110 + w, 75);
    ctx.textAlign = 'right'; ctx.font = '700 24px InstrumentSans'; ctx.fillStyle = c.red ? SIN : TIN; ctx.fillText(c.status, 970, 75);
    ctx.fillStyle = TIN; ctx.fillRect(110, 100, 860, 2);
    ctx.restore();
  },
};
export const makeFilm = (...a) => styled(S, ...a);

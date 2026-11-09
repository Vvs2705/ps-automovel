// Estilo blueprint (biblioteca: styles/blueprint): desenho técnico em linha branca sobre papel azul-da-prússia, vista ortográfica,
// peças por dentro da lataria em linha oculta (tracejada), linhas de centro nas rodas, chão hachurado, notas de desenho com régua dupla.
// Uma tinta fora do azul, o vermelho de carimbo: só para ALERTA, a cruz da ambulância e o INSCREVA-SE.
import { styled, fontes, path, grao, clamp, lerp, seg, DENTRO, TAU, W, H } from './base.js';
import { CAR } from '../carro.js';

await fontes([['Tektur', 'Tektur-Medium.ttf', 500], ['Tektur', 'Tektur-Regular.ttf', 400]]);

const BR = '#E7F0F9', TINTA = '#FF5A4E';
const br = a => `rgba(231,240,249,${a})`;
const GR = grao(256, 0.5, h => `rgba(255,255,255,${0.025 + 0.05 * h})`);
let pat = null;
const nuvem = (ctx, x0, y0, x1, y1, r) => {   // nuvem de revisão (contorno de arcos) em volta da zona
  const per = [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]];
  ctx.beginPath();
  for (const [ax, ay, bx, by] of per) {
    const L = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.round(L / (2 * r))), ux = (bx - ax) / L, uy = (by - ay) / L;
    for (let i = 0; i < n; i++) { const cx = ax + ux * (i + 0.5) * L / n, cy = ay + uy * (i + 0.5) * L / n, a = Math.atan2(uy, ux); ctx.arc(cx, cy, L / n / 2, a + Math.PI, a, false); }
  }
  ctx.stroke();
};
const regua = (ctx, x, y, w, h, col, dash) => {   // régua dupla das notas de desenho
  ctx.strokeStyle = col; ctx.setLineDash(dash ? [10, 6] : []); ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.setLineDash([]); ctx.lineWidth = 1; ctx.strokeRect(x + 6.5, y + 6.5, w - 13, h - 13);
};

const S = {
  nome: 'blueprint', ortho: true, camK: [0.4, 0.5], balanco: 0.03, escrita: 'write',
  sfx: { hum: null, scan: ['grit', { d: 0.6 }], scan_down: ['grit', { d: 0.4 }], glitch: ['knock', {}], chip: ['grit', { d: 0.22 }], roll: ['grit', {}],
    dock: ['knock', { v: 0.6 }], servo: ['grit', {}], loupe: ['whoosh', { d: 0.45 }], blip: ['tink', { v: 0.6 }] },
  font: {
    tag: ['500 34px Tektur', '1px'], titulo: ['500 36px Tektur', '2px'], selo: ['500 34px Tektur', '2px'], fonte: ['400 30px Tektur', '0px'],
    sub: ['600 62px Rajdhani', '0px'], idx: ['400 26px Tektur'], label: ['500 40px Tektur', '1px'], value: px => [`500 ${px}px Tektur`, '0px'],
    unit: px => [`500 ${px}px Tektur`], detail: ['400 34px Tektur'], marca: px => [`500 ${px}px Tektur`, '4px'], marcaSub: ['400 52px Tektur', '6px'],
    slogan: ['500 42px Tektur', '2px'],
  },
  cor: { painel: '#123370', painelBorda: BR, cruz: TINTA, marca1: BR, marca2: BR, marcaSub: br(0.85) },
  ink(kind, st) {
    if (kind === 'subDim') return br(0.62);
    if (kind === 'tag' && !st.lit) return br(0.7);
    if (kind === 'inscreva') return '#fff';
    if (kind === 'valueRoll' || kind === 'unit' || kind === 'bar0') return br(kind === 'bar0' ? 0.25 : 0.8);
    if (kind === 'seta' || kind === 'ponto') return st.red ? TINTA : BR;
    return BR;
  },
  bg(ctx, t, st) {
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, '#1B3A78'); g.addColorStop(0.55, '#21489A'); g.addColorStop(1, '#173470');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {   // manchas da emulsão (fixas no papel)
      const x = 180 + 760 * Math.sin(i * 2.1 + 0.5) ** 2, y = 200 + 1500 * ((i * 0.37) % 1), r = 420 + 160 * (i % 3);
      const m = ctx.createRadialGradient(x, y, 0, x, y, r); m.addColorStop(0, i % 2 ? 'rgba(10,25,70,0.22)' : 'rgba(60,110,190,0.16)'); m.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = m; ctx.fillRect(0, 0, W, H);
    }
    ctx.strokeStyle = br(0.07); ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 60; x < W; x += 60) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 30; y < H; y += 60) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();
    ctx.strokeStyle = br(0.55); ctx.lineWidth = 2; ctx.strokeRect(24, 24, W - 48, H - 48); ctx.lineWidth = 1; ctx.strokeRect(34, 34, W - 68, H - 68);
  },
  car(ctx, G, st) {
    const cut = st.sai > 0 ? lerp(1200, -120, st.sai) : lerp(-120, 1200, st.entra), lit = st.lit, z = st.z, k = st.zk;
    const keep = st.sai > 0 ? (x0, y0, x1) => Math.max(x0, x1) < cut : null;
    const opt = { keep, cut: st.sai > 0 ? null : cut }, mid = G.dist;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (!st.lupa) {   // chão hachurado e linhas de centro das rodas
      const o = [0, 0, 0], q = [0, 0, 0]; G.project(-1.6, 0, CAR.HZ, o); G.project(1.6, 0, CAR.HZ, q);
      ctx.strokeStyle = br(0.7); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = br(0.3); ctx.beginPath();
      for (let x = o[0]; x < q[0]; x += 16) { const y = lerp(o[1], q[1], (x - o[0]) / (q[0] - o[0])); ctx.moveTo(x, y + 3); ctx.lineTo(x - 14, y + 17); }
      ctx.stroke();
      ctx.setLineDash([26, 6, 4, 6]); ctx.strokeStyle = br(0.45); ctx.lineWidth = 1.2; ctx.beginPath();
      for (const wx of CAR.WX) { G.project(wx, CAR.R, CAR.HZ, o); ctx.moveTo(o[0], o[1] - 120); ctx.lineTo(o[0], o[1] + 60); ctx.moveTo(o[0] - 110, o[1]); ctx.lineTo(o[0] + 110, o[1]); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    for (const id in G.parts) {
      const P = G.parts[id], foco = lit && id === z, dentro = DENTRO.has(id) && !foco;
      const a = lit && !foco ? lerp(1, 0.45, k) : 1;
      if (dentro) { ctx.setLineDash([9, 7]); ctx.strokeStyle = br(0.5 * a); ctx.lineWidth = 1.3; ctx.stroke(path(P, opt)); ctx.setLineDash([]); continue; }
      const near = path(P, { ...opt, keep: (x0, y0, x1, y1, d) => d < mid + 0.05 && (!keep || keep(x0, y0, x1)) }), far = path(P, { ...opt, keep: (x0, y0, x1, y1, d) => d >= mid + 0.05 && (!keep || keep(x0, y0, x1)) });
      const col = foco && st.estado === 'alerta' ? TINTA : BR;
      ctx.strokeStyle = foco ? col : br(0.32 * a); ctx.lineWidth = foco ? 2.4 : 1.1; ctx.stroke(far);
      ctx.strokeStyle = foco ? col : br(0.9 * a); ctx.lineWidth = foco ? lerp(2.2, 3.6, k) : 2.1; ctx.stroke(near);
    }
    // ponta da pena no desenho entrando
    if (!st.lupa && st.entra < 1 && st.entra > 0) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cut, 930 + 120 * Math.sin(st.t * 9), 5, 0, TAU); ctx.fill(); }
    ctx.restore();
  },
  alvo(ctx, bb, a, st) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 2.4; ctx.strokeStyle = st.estado === 'alerta' ? TINTA : BR; ctx.setLineDash([]);
    nuvem(ctx, bb[0] - 22, bb[1] - 22, bb[2] + 22, bb[3] + 22, 16); ctx.restore();
  },
  van(ctx, G, st) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const id in G.parts) for (const pc of G.parts[id].pieces) {
      const luz = pc.id === 'lights', carro = pc.id === 'car';
      ctx.strokeStyle = luz ? (st.blink ? TINTA : '#fff') : carro ? br(0.75) : BR; ctx.lineWidth = luz ? 3 : carro ? 1.6 : 2.1;
      ctx.stroke(path(pc, { cut: lerp(-200, 1300, st.entra) }));
    }
    ctx.restore();
  },
  estrada(ctx, G) { ctx.save(); ctx.strokeStyle = br(0.45); ctx.lineWidth = 1.6; ctx.setLineDash([24, 10]); ctx.stroke(path(G.parts.estrada)); ctx.restore(); },
  plate(ctx, kind, x, y, w, h, st) {
    if (kind === 'slogan') return;
    ctx.save(); ctx.fillStyle = kind === 'inscreva' ? 'rgba(150,30,30,0.35)' : 'rgba(14,34,82,0.86)'; ctx.fillRect(x, y, w, h);
    const col = kind === 'inscreva' || (kind === 'tag' && st.estado === 'alerta') ? TINTA : br(kind === 'tag' && !st.lit ? 0.55 : 0.95);
    regua(ctx, x, y, w, h, col, kind === 'tag' && st.estado === 'atencao');
    ctx.restore();
  },
  icon(ctx, cx, cy) {   // balão de peça com visto
    ctx.save(); ctx.strokeStyle = BR; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.lineTo(cx - 2, cy + 6); ctx.lineTo(cx + 8, cy - 6); ctx.stroke(); ctx.restore();
  },
  lupaFundo(ctx, x, y, r) { ctx.fillStyle = '#183A7C'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); },
  anel(ctx, x, y, r) {
    ctx.strokeStyle = BR; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1; ctx.setLineDash([26, 6, 4, 6]); ctx.beginPath(); ctx.arc(x, y, r + 12, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  },
  sub(ctx, b, st) {
    ctx.fillStyle = 'rgba(12,30,74,0.9)'; ctx.fillRect(b.x, b.y, b.w, b.h);
    regua(ctx, b.x, b.y, b.w, b.h, br(0.9));
    ctx.strokeStyle = br(0.9); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x + 34, b.y + b.h / 2, 18, 0, TAU); ctx.stroke();   // balão com o número da nota
    ctx.font = '500 22px Tektur'; ctx.fillStyle = BR; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(b.i + 1), b.x + 34, b.y + b.h / 2 + 1); ctx.textAlign = 'left';
  },
  post(ctx) { pat = pat || ctx.createPattern(GR, 'repeat'); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); },
  chrome(ctx, t, c) {
    ctx.save(); ctx.font = '500 24px Tektur'; ctx.letterSpacing = '2px'; ctx.fillStyle = br(0.85); ctx.textBaseline = 'middle';
    ctx.fillText('PS AUTOMÓVEL // ' + c.serie, 60, 75); ctx.textAlign = 'right'; ctx.fillStyle = c.red ? TINTA : br(0.85); ctx.fillText(c.status, W - 60, 75);
    ctx.strokeStyle = br(0.55); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(34, 106); ctx.lineTo(W - 34, 106); ctx.stroke();
    ctx.restore();
  },
};
export const makeFilm = (...a) => styled(S, ...a);

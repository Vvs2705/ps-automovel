// PS Automóvel · molde de Shorts: timeline.json + cena.json + voz → filme. O desenho fica no engine (EP01), o carro em carro.js.
// Cada fala acende uma zona do carro de arame e pode trazer etiquetas, um cartão de valor, pontos marcados, lupa e seta.
// Final: a ambulância do EP01 vai embora com o carro na maca + INSCREVA-SE. Tamanhos de texto: ACESSIBILIDADE.md.
import { Holo, drawScanPlane, drawPad, makeCamera } from './engine/holo.js';
import * as U from './engine/hud.js';
import { buildAmbulance, buildRoad, VAN } from './models.js';
import { buildCar, ZONAS, PONTOS } from './carro.js';

export const W = 1080, H = 1920, FPS = 24;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const nwords = s => s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;   // "·" e ":" não contam como palavra
function K(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i], [b, vb] = keys[i + 1];
    if (t <= b) { const k = eio((t - a) / (b - a)); return va.map((x, j) => lerp(x, vb[j], k)); }
  }
  return keys[keys.length - 1][1];
}
const HUE = 196, ACC = 24, RED = 355, ORG = 30;
const COR = { atencao: '#ffa24a', alerta: '#ff4a5a' };
const ZTXT = { carro: 'CARRO', carroceria: 'CARROCERIA', pneus: 'PNEUS', freios: 'FREIOS', susp_dianteira: 'SUSPENSÃO DIANT.', susp_traseira: 'SUSPENSÃO TRAS.',
  motor: 'MOTOR', cambio: 'CÂMBIO', arrefecimento: 'ARREFECIMENTO', eletrica: 'ELÉTRICA', escapamento: 'ESCAPAMENTO', painel: 'PAINEL',
  farois: 'FARÓIS', lanternas: 'LANTERNAS', tanque: 'TANQUE', estepe: 'ESTEPE' };
const ETXT = { ok: 'ZONA', atencao: 'ATENÇÃO', alerta: 'ALERTA' };
// câmera de cada zona: alvo, yaw (negativo = frente 3/4, positivo = traseira 3/4), pitch, distância
const CAM = {
  carro: [0, 0.45, 0, -0.62, 0.2, 6.4], carroceria: [0, 0.5, 0, -0.62, 0.2, 6.2],
  pneus: [-0.8, 0.25, 0.4, -0.5, 0.14, 4.3], freios: [-0.8, 0.25, 0.35, -0.42, 0.12, 3.9],
  susp_dianteira: [-0.8, 0.38, 0.3, -0.45, 0.16, 4.3], susp_traseira: [0.75, 0.36, 0.3, 0.55, 0.16, 4.4],
  motor: [-0.85, 0.45, 0, -0.78, 0.4, 4.4], cambio: [-0.7, 0.36, 0.15, -0.5, 0.36, 4.3], arrefecimento: [-1.05, 0.4, 0, -0.95, 0.3, 4.4],
  eletrica: [-0.15, 0.45, 0, -0.62, 0.32, 5.6], escapamento: [0.2, 0.18, 0, 0.6, 0.04, 5.6], painel: [-0.38, 0.66, 0.05, -0.32, 0.3, 3.6],
  farois: [-1.2, 0.5, 0.05, -1.0, 0.16, 4.2], lanternas: [1.2, 0.6, 0.05, 1.0, 0.16, 4.2], tanque: [0.6, 0.42, 0.25, 0.45, 0.26, 4.6], estepe: [0.95, 0.4, 0, 0.8, 0.55, 4.2],
};
const CY = 930;   // altura do alvo na tela: o carro fica entre os cartões (em cima) e as etiquetas (embaixo)

export function makeFilm(TL, cena, dur, words, lines, AP = null) {
  const WARN = [];
  const warn = s => { if (!WARN.includes(s)) WARN.push(s); };
  const CARM = buildCar(cena.carro || 'hatch'), VANM = buildAmbulance(), ROAD = buildRoad();
  const HO = new Holo(W, H);
  const T = U.theme(HUE, ACC), TRd = U.theme(RED, ACC), TOr = U.theme(ORG, ACC);
  const vo = TL.vo, DUR = TL.dur, O = TL.outro, SIGN = TL.assina, IDS = TL.ids;
  const BODY = IDS.filter(id => id !== SIGN);
  const end = id => vo[id] + (dur[id] || 2);
  const TEXT = Object.fromEntries(lines.map(l => [l.id, l.text]));
  // tempo absoluto da 1ª palavra da fala que começa com w (sem acento); null se não achar
  const wt = (id, w, edge = 't0') => {
    const k = norm(String(w).split(/\s+/)[0] || ''); if (k.length < 2) return null;
    for (const x of words[id] || []) { const n = norm(x.w); if (n && (n === k || (k.length >= 4 && n.startsWith(k.slice(0, 6))))) return vo[id] + (edge === 'end' ? x.t1 : x.t0); }
    return null;
  };
  // ---------- falas: zona herdada da anterior, o resto vale só na própria fala ----------
  const F = {}; let zPrev = 'carro', fonte = cena.fonte || '';
  BODY.forEach((id, i) => {
    const c = (cena.falas || {})[id] || {};
    for (const k of Object.keys(c)) if (!['zona', 'estado', 'etiqueta', 'cartao', 'pontos', 'lupa', 'seta', 'pausa', 'legenda', 'fonte', 'nota'].includes(k)) warn(`${id}: campo desconhecido "${k}"`);
    const zona = c.zona || zPrev; zPrev = zona;
    if (zona !== 'carro' && !ZONAS.includes(zona)) warn(`${id}: zona "${zona}" não existe (use: carro, ${ZONAS.join(', ')})`);
    const estado = c.estado || 'ok'; if (!ETXT[estado]) warn(`${id}: estado "${estado}" (use ok, atencao, alerta)`);
    if (c.fonte !== undefined) fonte = c.fonte;
    const tags = [].concat(c.etiqueta || []).map(String);
    for (const s of tags) if (nwords(s) > 3) warn(`${id}: etiqueta "${s}" tem mais de 3 palavras`);
    if (c.cartao && c.lupa) warn(`${id}: cartão e lupa na mesma fala disputam o topo da tela; a lupa foi desligada`);
    const a = vo[id] - 0.15, b = i + 1 < BODY.length ? vo[BODY[i + 1]] - 0.15 : O - 0.45, d = dur[id] || 2;
    const pts = [].concat(c.pontos || []).map(p => typeof p === 'string' ? { p } : p);
    for (const p of pts) if (!PONTOS[p.p] && !CARM.byId[p.p]) warn(`${id}: ponto "${p.p}" não existe (use: ${Object.keys(PONTOS).join(', ')} ou uma zona)`);
    const tagT = tags.map((s, j) => wt(id, s.replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).find(x => x.length >= 3) || '') ?? vo[id] + 0.25 + j * d * 0.7 / Math.max(1, tags.length));
    const ptT = pts.map((p, j) => wt(id, p.rotulo || p.p) ?? vo[id] + (j + 0.4) * d / Math.max(1, pts.length));
    const cardT = c.cartao ? Math.min((c.cartao.palavra && wt(id, c.cartao.palavra, 'end')) || vo[id] + 0.45 * d, vo[id] + 0.6 * d) : 0;   // o valor fica ao menos 40% da fala na tela
    if (c.cartao?.palavra && !wt(id, c.cartao.palavra)) warn(`${id}: palavra "${c.cartao.palavra}" do cartão não está na fala`);
    F[id] = { id, i, zona, estado, tags, tagT, pts, ptT, card: c.cartao, cardT, lupa: !!c.lupa && !c.cartao, seta: !!c.seta, a, b, d, fonte, leg: c.legenda };
  });
  const lineAt = t => { let L = F[BODY[0]]; for (const id of BODY) if (t >= F[id].a) L = F[id]; return L; };
  const keepOf = (zona, cor) => { const P = CARM.byId[zona]; return P ? Object.fromEntries(P.pieces.map(p => [p.id, cor])) : {}; };
  const isRed = t => t < O - 0.45 && lineAt(t).estado === 'alerta';

  // ---------- eventos de som (mix.py) ----------
  const EV = [];
  const ev = (t, type, o = {}) => EV.push({ t: Math.round(Math.max(0, t) * 1000) / 1000, type, ...o });
  ev(0, 'scan', { d: 0.6 }); ev(0.05, 'hum', { to: O - 0.4 });
  BODY.forEach((id, i) => {
    const L = F[id], prev = i ? F[BODY[i - 1]] : null;
    if (prev && prev.zona !== L.zona) ev(L.a - 0.1, 'whoosh', { d: 0.6 });
    if (L.zona !== 'carro' && (!prev || prev.zona !== L.zona)) ev(L.a + 0.45, 'lock');
    if (L.estado === 'alerta' && (!prev || prev.estado !== 'alerta')) { ev(L.a, 'glitch'); ev(L.a + 0.1, 'alarme', { n: 3 }); }
    if (L.estado === 'atencao') ev(L.a + 0.1, 'blip', { n: 2 });
    L.tagT.forEach((t, j) => ev(t, 'chip', { i: (i + j) % 5 }));
    L.ptT.forEach((t, j) => ev(t, 'blip', { n: j }));
    if (L.card) { ev(L.a + 0.1, 'dock'); ev(L.cardT - 0.5, 'roll', { d: 0.5 }); ev(L.cardT, 'confirm'); }
    if (L.lupa) ev(L.a + 0.3, 'loupe');
    if (L.seta) ev(L.a + 0.2, 'servo', { d: 0.35 });
  });
  const CLACK = O + 1.0, GO = O + 1.2;
  const slogan = SIGN ? (wt(SIGN, 'seu') ?? vo[SIGN] + 1.2) : O + 0.6, sloganEnd = SIGN ? (wt(SIGN, 'maos', 'end') ?? end(SIGN)) : O + 1.6;
  ev(O - 0.45, 'scan_down', { d: 0.4 }); ev(O, 'scan', { d: 0.4 });
  ev(O, 'rumble', { d: GO - O + 0.2, f0: 30, f1: 30, v: 0.4 }); ev(GO, 'rumble', { d: DUR - GO, f0: 32, f1: 58, v: 0.8 });
  ev(O + 0.2, 'roll', { d: CLACK - O - 0.2 }); ev(CLACK, 'clack_lock');
  ev(slogan, 'roll', { d: Math.max(0.2, sloganEnd - slogan), v: 0.5 }); ev(sloganEnd, 'confirm'); ev(GO, 'chip', { i: 2 });
  const sir = Math.max(GO + 0.3, SIGN ? end(SIGN) + 0.05 : GO);
  if (DUR - sir > 0.4) ev(sir, 'siren', { d: DUR - sir, env: [[0, 0], [0.15, 0.8], [1, 0.5]], dop: [[0, 0.98], [1, 0.95]], pan: -0.35 });
  EV.sort((a, b) => a.t - b.t);

  // ---------- câmera ----------
  const camAt = t => {
    const L = lineAt(t), P = L.i ? F[BODY[L.i - 1]] : null;
    const c1 = CAM[L.zona] || CAM.carro, c0 = P ? (CAM[P.zona] || CAM.carro) : c1;
    const k = eio(seg(t, L.a - 0.05, L.a + 0.85)), v = c0.map((x, j) => lerp(x, c1[j], k));
    return { target: [v[0], v[1], v[2]], yaw: v[3] + 0.07 * Math.sin(t * 0.45), pitch: v[4], dist: v[5] * (1 - 0.015 * Math.sin(t * 0.3)), fov: 0.8, cx: 540 + (AP ? AP.dx(t) : 0), cy: CY };
  };
  const vanState = t => { const u = seg(t, GO, DUR), dx = -3.2 * u * u; return { dx, wheel: -dx / VAN.R, pitch: -0.016 * seg(t, GO, GO + 0.2) * (1 - seg(t, GO + 0.4, GO + 1.4)), door: VAN.DOORS }; };
  const camVan = (t, dx) => {
    const [yaw, pitch, dist] = K(t, [[O, [0.7, 0.2, 7.2]], [GO, [0.62, 0.17, 7.0]], [DUR, [0.52, 0.14, 7.4]]]);
    return { target: [0.3 + 0.55 * dx, 0.55, 0], yaw, pitch, dist, fov: 0.8, cx: 540, cy: 860 };
  };
  const ptWorld = p => PONTOS[p] || CARM.byId[p]?.anchor || [0, 0.5, 0];

  // ---------- tipografia (cada texto vai para TX: caixa na tela, usada pela checagem de sobreposição) ----------
  let TX = [];
  const txt = (id, text, x0, y0, x1, y1, pass) => TX.push({ id, text, x0, y0, x1, y1, ...(pass ? { pass: true } : {}) });
  const tagW = (ctx, label) => { ctx.save(); ctx.font = `600 34px ${U.FONT.ui}`; ctx.letterSpacing = '2px'; const w = ctx.measureText(label).width + 46; ctx.restore(); return w; };
  const tag = (ctx, Th, x, y, label, a, o = {}) => {
    if (a <= 0) return;
    const w = tagW(ctx, label), h = 62;
    U.plate(ctx, Th, x, y, w, h, a);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (o.lit) { ctx.strokeStyle = Th.hi(0.9 * a); ctx.lineWidth = 1.6; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
    ctx.font = `600 34px ${U.FONT.ui}`; ctx.letterSpacing = '2px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = o.lit ? Th.hi(a) : Th.line(0.62 * a);
    ctx.fillText(U.rollText(label, o.roll ?? 1, o.frame || 0, 5), x + 23, y + h / 2 + 1);
    ctx.restore();
    txt('tag:' + label, label, x, y, x + w, y + h);
  };
  const rows = (ctx, Th, items, yLast, frame) => {          // etiquetas centralizadas; quebram em 2 fileiras se não couberem em 860 px
    const ws = items.map(it => tagW(ctx, it.label)), gap = 18, R = [[]]; let acc = 0;
    items.forEach((it, i) => { if (R[R.length - 1].length && acc + gap + ws[i] > 860) { R.push([]); acc = 0; } R[R.length - 1].push(i); acc += (acc ? gap : 0) + ws[i]; });
    R.forEach((r, ri) => {
      const y = yLast - (R.length - 1 - ri) * 76, tot = r.reduce((s, i) => s + ws[i], 0) + gap * (r.length - 1);
      let x = 520 - tot / 2;
      for (const i of r) { tag(ctx, Th, x, y, items[i].label, items[i].a, { ...items[i], frame }); x += ws[i] + gap; }
    });
  };
  const plateText = (ctx, Th, id, s, x, y, h, font, a, o = {}) => {   // texto numa placa, alinhado à esquerda (o.center centraliza em x)
    if (a <= 0 || !s) return;
    ctx.save(); ctx.font = font; ctx.letterSpacing = o.ls || '2px'; const w = ctx.measureText(s).width + (o.icon ? 70 : 40); ctx.restore();
    const x0 = o.center ? x - w / 2 : x;
    U.plate(ctx, Th, x0, y, w, h, a);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = font; ctx.letterSpacing = o.ls || '2px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    if (o.icon) {                                                  // selo: losango com visto
      const cx = x0 + 30, cy = y + h / 2; ctx.strokeStyle = Th.acc(a); ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx + 14, cy); ctx.lineTo(cx, cy + 14); ctx.lineTo(cx - 14, cy); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx - 1, cy + 5); ctx.lineTo(cx + 7, cy - 5); ctx.stroke();
    }
    ctx.fillStyle = o.col ? o.col(a) : Th.hi(a);
    ctx.fillText(U.rollText(s, o.roll ?? 1, o.frame || 0, 9), x0 + (o.icon ? 54 : 20), y + h / 2 + 1);
    ctx.restore();
    txt(id, s, x0, y, x0 + w, y + h);
  };
  const marker = (ctx, Th, p, a, pulse) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = Th.hi(0.95 * a); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(p[0], p[1], 18, 0, TAU); ctx.stroke();
    ctx.fillStyle = Th.hi(a); ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, TAU); ctx.fill();
    if (pulse > 0 && pulse < 1) { ctx.strokeStyle = Th.line(0.8 * a * (1 - pulse)); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], 18 + 46 * pulse, 0, TAU); ctx.stroke(); }
    ctx.restore();
  };
  const arrow = (ctx, Th, to, a, t) => {                      // seta animada apontando para a zona
    const sg = to[0] > 540 ? 1 : -1, fr = [to[0] + sg * 150, to[1] - 200], L = Math.hypot(to[0] - fr[0], to[1] - fr[1]);
    const ux = (to[0] - fr[0]) / L, uy = (to[1] - fr[1]) / L, e = [to[0] - ux * 30, to[1] - uy * 30], k = eo(a);
    const tip = [fr[0] + (e[0] - fr[0]) * k, fr[1] + (e[1] - fr[1]) * k];
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = Th.hi(0.95 * a); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(fr[0], fr[1]); ctx.lineTo(tip[0], tip[1]);
    const px = -uy, py = ux; ctx.moveTo(tip[0] - ux * 26 + px * 16, tip[1] - uy * 26 + py * 16); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(tip[0] - ux * 26 - px * 16, tip[1] - uy * 26 - py * 16);
    ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = Th.line(0.7 * a);
    for (let j = 0; j < 3; j++) { const u = ((t * 0.9 + j / 3) % 1) * k * 0.8, c = [fr[0] + (e[0] - fr[0]) * u, fr[1] + (e[1] - fr[1]) * u]; ctx.beginPath(); ctx.moveTo(c[0] - ux * 10 + px * 9, c[1] - uy * 10 + py * 9); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0] - ux * 10 - px * 9, c[1] - uy * 10 - py * 9); ctx.stroke(); }
    ctx.restore();
  };
  // ambulância (do EP01): ponto do furgão com o mergulho do freio; brilho do giroflex; nome pintado na lateral; slogan
  const vp = (x, y, z, vs) => { const c = Math.cos(vs.pitch), s = Math.sin(vs.pitch), X = x - VAN.WX[0]; return [VAN.WX[0] + X * c - y * s + vs.dx, X * s + y * c, z]; };
  const sirenGlow = (ctx, cam, vs, blink, a) => {
    if (a <= 0) return;
    const P = makeCamera(cam, W, H).project, o = [0, 0, 0];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, z, c] of VAN.lights) {
      if ((c === 'r') !== !!blink) continue;
      const q = vp(x, y, z, vs); P(q[0], q[1], q[2], o); const r = 95 * 5.6 / Math.max(o[2], 1);
      const g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], r);
      g.addColorStop(0, c === 'r' ? `rgba(255,60,75,${0.9 * a})` : `rgba(225,245,255,${0.75 * a})`); g.addColorStop(0.35, c === 'r' ? `rgba(255,40,60,${0.25 * a})` : `rgba(160,220,255,${0.2 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(o[0] - r, o[1] - r, 2 * r, 2 * r);
    }
    ctx.restore();
  };
  const vanName = (ctx, Th, cam, vs, k, frame, a) => {
    if (a <= 0 || k <= 0) return;
    const P = makeCamera(cam, W, H).project, sd = VAN.side, z = VAN.HZ * 1.01;
    const pt = (x, y) => { const q = vp(x, y, z, vs), o = [0, 0, 0]; P(q[0], q[1], q[2], o); return o; };
    const O0 = pt(sd.x0, sd.y1), X = pt(sd.x1, sd.y1), Y = pt(sd.x0, sd.y0);
    const LW = 1000, LH = 1000 * (sd.y1 - sd.y0) / (sd.x1 - sd.x0), locked = k >= 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    ctx.setTransform((X[0] - O0[0]) / LW, (X[1] - O0[1]) / LW, (Y[0] - O0[0]) / LH, (Y[1] - O0[1]) / LH, O0[0], O0[1]);
    const s = LH - 40, c0 = 20 + s / 2, c1 = LH / 2, b = s * 0.17, kc = eo(seg(k, 0, 0.4));
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(2,10,16,${0.6 * kc})`; ctx.fillRect(0, 0, LW, LH);
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = Th.line(0.45 * kc); ctx.lineWidth = 3; ctx.strokeRect(0, 0, LW, LH);
    ctx.fillStyle = Th.acc(0.95 * kc); ctx.beginPath(); ctx.rect(c0 - b, c1 - s / 2, 2 * b, s); ctx.rect(c0 - s / 2, c1 - b, s, 2 * b); ctx.fill();
    ctx.strokeStyle = Th.line(0.8 * kc); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(c0, c1, s * 0.62, 0, TAU); ctx.stroke();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.letterSpacing = '6px';
    let fs = 130; for (; fs > 60; fs -= 4) { ctx.font = `600 ${fs}px ${U.FONT.ui}`; if (ctx.measureText('PS AUTOMÓVEL').width <= LW - s - 70) break; }
    const x0 = s + 60, yb = LH * 0.6;
    ctx.font = `600 ${fs}px ${U.FONT.ui}`; ctx.fillStyle = locked ? Th.acc(1) : Th.line(0.85);
    ctx.fillText(U.rollText('PS', k, frame, 1), x0, yb); const w = ctx.measureText('PS ').width;
    ctx.font = `500 ${fs}px ${U.FONT.ui}`; ctx.fillStyle = locked ? Th.hi(1) : Th.line(0.85);
    ctx.fillText(U.rollText('AUTOMÓVEL', clamp(k * 1.15 - 0.15), frame, 2), x0 + w, yb);
    ctx.font = `52px ${U.FONT.mono}`; ctx.letterSpacing = '8px'; ctx.fillStyle = Th.line(0.9);
    ctx.fillText(U.rollText('RESGATE AUTOMOTIVO', clamp(k * 1.3 - 0.3), frame, 3), x0 + 4, LH * 0.9);
    ctx.restore();
    txt('title', 'PS AUTOMÓVEL', Math.min(O0[0], Y[0]), O0[1], X[0], Y[1]);
  };
  const tagline = (ctx, Th, k, frame, a, y) => {
    if (a <= 0 || k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.textAlign = 'center';
    ctx.font = `42px ${U.FONT.mono}`; ctx.letterSpacing = '4px'; ctx.fillStyle = k >= 1 ? Th.line(0.95) : Th.dim(0.8);
    ctx.fillText(U.rollText('SEU CARRO SEMPRE EM BOAS MÃOS.', k, frame, 4), 540 + 3, y);
    ctx.strokeStyle = Th.line(0.6); ctx.lineWidth = 1.2; const w = 230 * eo(k);
    ctx.beginPath(); ctx.moveTo(540 - 330, y + 36); ctx.lineTo(540 - 330 + w, y + 36); ctx.moveTo(540 + 330, y + 36); ctx.lineTo(540 + 330 - w, y + 36); ctx.stroke();
    ctx.restore();
    txt('tagline', 'SEU CARRO SEMPRE EM BOAS MÃOS.', 80, y - 44, 1000, y + 12);
  };

  // ---------- legenda karaokê (62 px, 2 linhas por página, termina em y = 1500) ----------
  const SUBIDS = BODY;
  const subOf = t => {
    for (let i = 0; i < SUBIDS.length; i++) {
      const id = SUBIDS[i], s0 = vo[id] - 0.1, nxt = i + 1 < SUBIDS.length ? vo[SUBIDS[i + 1]] - 0.12 : O - 0.2;
      const s1 = Math.min(nxt, end(id) + 0.6);
      if (t >= s0 && t < s1) return { id, s0, s1 };
    }
    return null;
  };
  const SUBTEXT = id => F[id].leg || TEXT[id];
  const SUB_PX = 62, SUB_W = 780, SUB_Y = 1500;
  const drawSub = (ctx, Th, t) => {
    const s = subOf(t); if (!s) return;
    const list = words[s.id] || [], text = SUBTEXT(s.id);
    const a = clamp((t - s.s0) / 0.1) * clamp((s.s1 - t) / 0.12);
    ctx.save(); ctx.font = `600 ${SUB_PX}px ${U.FONT.ui}`; ctx.textBaseline = 'alphabetic';
    const toks = text.split(' '), lns = []; let cur = [], wcur = 0; const sp = ctx.measureText(' ').width;
    for (const tk of toks) { const w = ctx.measureText(tk).width; if (cur.length && wcur + sp + w > SUB_W) { lns.push(cur); cur = []; wcur = 0; } cur.push(tk); wcur += (cur.length > 1 ? sp : 0) + w; }
    if (cur.length) lns.push(cur);
    // palavra i da legenda ↔ palavra da voz (proporcional quando a legenda escrita difere da fala, ex.: "PSI" × "pê ésse ai")
    const N = toks.length, M = Math.max(1, list.length), wOf = i => list[Math.min(M - 1, Math.floor(i * M / N))];
    const saidAt = i => { const W0 = wOf(i); return W0 ? vo[s.id] + W0.t0 - 0.02 : vo[s.id]; };
    let said = 0; for (let i = 0; i < N; i++) if (t >= saidAt(i)) said = i + 1;
    const lineOf = []; lns.forEach((l, li) => l.forEach(() => lineOf.push(li)));
    const p0 = Math.floor(lineOf[Math.min(Math.max(0, said - 1), lineOf.length - 1)] / 2) * 2, page = lns.slice(p0, p0 + 2);
    let wi = lns.slice(0, p0).reduce((n, l) => n + l.length, 0);
    const lh = Math.round(SUB_PX * 1.18), hh = page.length * lh, y0 = SUB_Y - hh;
    const tws = page.map(l => ctx.measureText(l.join(' ')).width), tw = Math.max(...tws), x0 = 520 - tw / 2;
    ctx.fillStyle = `rgba(1,8,12,${0.8 * a})`; ctx.fillRect(x0 - 70, y0 - 24, tw + 104, hh + 40);
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = Th.line(0.6 * a); ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(x0 - 70, y0 - 8); ctx.lineTo(x0 - 70, y0 - 24); ctx.lineTo(x0 - 54, y0 - 24);
    ctx.moveTo(x0 + tw + 18, y0 + hh + 16); ctx.lineTo(x0 + tw + 34, y0 + hh + 16); ctx.lineTo(x0 + tw + 34, y0 + hh); ctx.stroke();
    ctx.fillStyle = Th.line(0.9 * a);
    const talking = t < end(s.id);
    for (let i = 0; i < 4; i++) { const h = talking ? 8 + 20 * Math.abs(Math.sin(t * 9 + i * 1.7)) : 5; ctx.fillRect(x0 - 54 + i * 8, y0 + hh / 2 - h / 2 - 6, 4, h); }
    page.forEach((ln, li) => {
      let x = 520 - tws[li] / 2; const y = y0 + (li + 1) * lh - 14;
      for (const tk of ln) { ctx.fillStyle = t >= saidAt(wi) ? Th.hi(0.97 * a) : Th.line(0.62 * a); ctx.fillText(tk, x, y); x += ctx.measureText(tk).width + sp; wi++; }
    });
    ctx.restore();
    txt('sub:' + s.id, page.map(l => l.join(' ')).join(' '), x0 - 70, y0, x0 + tw + 34, SUB_Y);   // caixa do texto (a placa vai de y0−24 a y0+hh+16)
  };

  // ---------- quadro ----------
  const render = (ctx, t, opt = {}) => {
    TX = [];
    const frame = Math.floor(t * FPS + 1e-6), red = isRed(t), Th = red ? TRd : T;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    U.background(ctx, W, H, Th, { cx: 540, cy: CY, px: t * 6, py: t * 3 });
    let status = '';
    if (t < O) {
      // ===== carro de arame =====
      const L = lineAt(t), cam = camAt(t), z = L.zona;
      const lit = z !== 'carro' && z !== 'carroceria';
      const scan = t < 0.6 ? { y: lerp(-0.1, 1.3, seg(t, 0, 0.6)), band: 0.08 } : null;
      const scanDown = t > O - 0.45 ? { y: lerp(1.2, -0.1, seg(t, O - 0.45, O - 0.05)) } : null;
      const prevZ = L.i ? F[BODY[L.i - 1]].zona : null, wk = prevZ !== z ? seg(t, L.a + 0.1, L.a + 0.8) : 1;
      const wave = wk > 0 && wk < 1 ? { y: lerp(-0.05, 1.05, wk), w: 0.05 } : null;
      const keep = lit && L.estado !== 'ok' ? keepOf(z, COR[L.estado]) : {};
      const flash = lit && L.estado === 'ok' ? { [z]: 1 } : null;
      drawPad(ctx, cam, W, H, { hue: Th.hue, rot: t * 0.12, alpha: 0.7 * (scanDown ? 0.4 : 1), y: 0 });
      if (scan) drawScanPlane(ctx, cam, W, H, scan.y, { hue: Th.hue, r: 1.5, rot: t * 0.5 });
      const info = HO.draw(ctx, CARM, cam, { hue: Th.hue, scan, scanDown, wave, focus: lit ? z : null, dim: 0.42, keep, flash, lineWidth: 1.4, glow: 1 });
      const anc = info.anchor[z] || info.anchor.carroceria;
      // alvo na zona
      const bb = info.bbox[z];
      if (lit && !scanDown && bb && bb[2] - bb[0] < 760) U.targetBox(ctx, Th, info.bbox[z], seg(t, L.a + 0.15, L.a + 0.45) * (1 - seg(t, L.b - 0.25, L.b)), { flash: Math.abs(t - L.a - 0.45) < 0.06, pad: 18 });
      // seta
      if (L.seta && anc) arrow(ctx, Th, anc, seg(t, L.a + 0.2, L.a + 0.6) * (1 - seg(t, L.b - 0.25, L.b)), t);
      // lupa: o mesmo carro, mais perto da zona, num círculo no alto
      if (L.lupa) {
        const la = seg(t, L.a + 0.3, L.a + 0.6) * (1 - seg(t, L.b - 0.3, L.b)), lx = 540, ly = 432, lr = 165 * eo(seg(t, L.a + 0.3, L.a + 0.75));
        if (la > 0 && lr > 4) {
          if (anc) U.leader(ctx, Th, [anc[0], anc[1]], [anc[0], ly + lr + 60], [lx + (anc[0] > lx ? 0.5 : -0.5) * lr, ly + lr * 0.87], seg(t, L.a + 0.4, L.a + 0.8), { alpha: la });
          const zw = CARM.byId[z]?.anchor || [0, 0.5, 0];
          ctx.save(); ctx.globalAlpha = la; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.fillStyle = 'rgba(1,8,12,0.92)'; ctx.fill(); ctx.clip();
          HO.draw(ctx, CARM, { target: zw, yaw: cam.yaw, pitch: cam.pitch, dist: 1.7, fov: 0.8, cx: lx, cy: ly }, { hue: Th.hue, focus: lit ? z : null, dim: 0.3, keep, flash, lineWidth: 1.8, alpha: la });
          ctx.restore();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = la;
          ctx.strokeStyle = Th.line(0.9); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.stroke();
          ctx.strokeStyle = Th.line(0.5); ctx.lineWidth = 1; ctx.beginPath();
          for (let i = 0; i < 72; i++) { const th = i / 72 * TAU, r2 = lr + (i % 6 ? 6 : 13); ctx.moveTo(lx + Math.cos(th) * (lr + 2), ly + Math.sin(th) * (lr + 2)); ctx.lineTo(lx + Math.cos(th) * r2, ly + Math.sin(th) * r2); }
          ctx.stroke(); ctx.restore();
        }
      }
      // pontos marcados, com o nome numa coluna lateral (não encostam uns nos outros)
      const P3 = info.project, o3 = new Float32Array(3);
      L.pts.forEach((p, j) => {
        const pa = seg(t, L.ptT[j] - 0.1, L.ptT[j] + 0.15) * (1 - seg(t, L.b - 0.25, L.b)); if (pa <= 0 || scanDown) return;
        const w3 = ptWorld(p.p); P3(w3[0], w3[1], w3[2], o3); const sp = [o3[0], o3[1]];
        marker(ctx, Th, sp, pa, seg(t, L.ptT[j], L.ptT[j] + 0.6));
        if (p.rotulo === false) return;
        const lab = (p.rotulo || p.p).toUpperCase(), w = tagW(ctx, lab), right = sp[0] > 540, y = 626 + j * 76;   // nome do lado do ponto
        const x = right ? 1080 - 90 - w : 90;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = Th.line(0.8 * pa); ctx.lineWidth = 1.4; ctx.beginPath();
        const ed = sp[0] > x + w ? x + w : x, s = sp[0] > ed ? 1 : -1;   // liga na borda da placa mais perto do ponto
        ctx.moveTo(sp[0] - s * 18, sp[1]); ctx.lineTo(ed + s * 14, y + 31); ctx.lineTo(ed, y + 31); ctx.stroke(); ctx.restore();
        tag(ctx, Th, x, y, lab, pa, { lit: true, roll: seg(t, L.ptT[j] - 0.05, L.ptT[j] + 0.3), frame });
      });
      // cartão de valor (topo)
      if (L.card) {
        const r = seg(t, L.a + 0.1, L.a + 0.45) * (1 - seg(t, L.b - 0.3, L.b));
        if (r > 0) {
          const c = { label: L.card.rotulo || '', value: String(L.card.valor ?? ''), unit: L.card.unidade || '', detail: L.card.detalhe || '' };
          ctx.save(); ctx.letterSpacing = '0px'; const bs = U.fitFont(ctx, c.value, 300, 130, U.FONT.ui, 840 - 110, 60); ctx.restore();
          if (bs < 130) warn(`${L.id}: valor "${c.value}" do cartão não cabe a 130 px (ficou ${bs} px): encurte`);
          U.specCard(ctx, Th, 110, 262, c, { reveal: r, roll: seg(t, L.cardT - 0.5, L.cardT), detail: seg(t, L.cardT, L.cardT + 0.5), frame, flash: Math.abs(t - L.cardT) < 0.05 }, { w: 840, big: 130, index: String(L.i + 1).padStart(2, '0') });
          ctx.save(); ctx.font = `500 34px ${U.FONT.ui}`; const dl = c.detail ? U.wrap(ctx, c.detail, 840).length : 0; ctx.restore();
          txt('card:' + L.id, [c.label, c.value, c.unit, c.detail].join(' '), 88, 242, 972, 262 + 60 + 117 + 12 + (dl ? 48 + dl * 42 : 0) + 20);
        }
      }
      // etiquetas (embaixo, acima da legenda)
      if (L.tags.length) {
        const out = 1 - seg(t, L.b - 0.25, L.b);
        rows(ctx, red ? TRd : L.estado === 'atencao' ? TOr : T, L.tags.map((s, j) => ({ label: s, lit: t >= L.tagT[j], a: seg(t, L.tagT[j] - 0.15, L.tagT[j] + 0.1) * out, roll: seg(t, L.tagT[j] - 0.1, L.tagT[j] + 0.25) })), 1226, frame);
      }
      // título da série no gancho; depois selo + fonte até o final
      const top = 1 - seg(t, O - 0.6, O - 0.3);
      if (cena.titulo) plateText(ctx, T, 'titulo', cena.titulo, 110, 128, 56, `600 36px ${U.FONT.ui}`, (BODY.length > 1 ? 1 - seg(t, F[BODY[1]].a - 0.2, F[BODY[1]].a) : 1) * top, { roll: seg(t, 0.1, 0.6), frame, ls: '3px' });
      const s0 = cena.titulo && BODY.length > 1 ? F[BODY[1]].a : 0.3, sa = seg(t, s0, s0 + 0.3) * top;   // o selo entra quando o título sai
      if (cena.selo) plateText(ctx, T, 'selo', String(cena.selo).toUpperCase(), 110, 128, 56, `600 34px ${U.FONT.ui}`, sa, { icon: true, roll: seg(t, s0, s0 + 0.6), frame, ls: '3px' });
      if (L.fonte) {
        ctx.save(); ctx.font = `500 30px ${U.FONT.ui}`; ctx.letterSpacing = '1px'; if (ctx.measureText(L.fonte).width > 820) warn(`fonte "${L.fonte}" passa de 820 px: encurte`); ctx.restore();
        plateText(ctx, T, 'fonte', L.fonte, 110, cena.selo ? 192 : 128, 44, `500 30px ${U.FONT.ui}`, sa, { col: T.line, ls: '1px' });
      }
      status = `${ETXT[L.estado] || 'ZONA'} · ${ZTXT[z] || z.toUpperCase()}`;
    } else {
      // ===== final: ambulância do PS Automóvel leva o carro na maca =====
      const vs = vanState(t), cam = camVan(t, vs.dx), scan = t < O + 0.4 ? { y: lerp(-0.2, 1.5, seg(t, O, O + 0.4)), band: 0.07 } : null;
      if (scan) drawScanPlane(ctx, cam, W, H, scan.y, { hue: T.hue, r: 1.8, rot: t * 0.5 });
      HO.draw(ctx, ROAD, cam, { hue: T.hue, scan, lineWidth: 1.3, gain: 0.7 });
      const door = 'portas' + vs.door, blink = Math.floor(t * 7) % 2, angle = { wheelF: vs.wheel, wheelR: vs.wheel };
      for (const id of ['body', 'inside', 'lights', 'maca', 'car', door]) angle[id] = vs.pitch;
      HO.draw(ctx, VANM, cam, { hue: T.hue, scan, only: ['furgao', 'luzes', 'rodas', door, 'carga'],
        explode: { furgao: vs.dx, luzes: vs.dx, rodas: vs.dx, carga: vs.dx, [door]: vs.dx }, angle, lineWidth: 1.5, glow: 1.1,
        keep: { lights: blink ? '#ff3b4a' : '#eaf6ff', car: '#ffa25a' } });
      sirenGlow(ctx, cam, vs, blink, seg(t, O + 0.1, O + 0.4));
      vanName(ctx, T, cam, vs, seg(t, O + 0.2, CLACK), frame, 1);
      tagline(ctx, T, seg(t, slogan, sloganEnd), frame, 1, 1330);
      const ia = seg(t, GO, GO + 0.3);
      if (ia > 0) rows(ctx, T, [{ label: 'INSCREVA-SE', lit: true, a: ia, roll: seg(t, GO, GO + 0.35) }], 1385, frame);
      status = t < GO ? 'RESGATE · CARREGADO' : 'RESGATE · EM ROTA';
    }
    U.vignette(ctx, W, H, 0.55);
    if (AP) TX.push(AP.draw(ctx, t));   // apresentador (apresentador/APRESENTADOR.md)
    if (!opt.nosub) drawSub(ctx, red ? TRd : T, t);
    const tc = `T+${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`;
    U.chrome(ctx, W, H, red ? TRd : T, { tl: 'PS AUTOMÓVEL // ' + (cena.serie || 'DICA'), tr: status, bl: tc, br: '1080×1920', alpha: 0.9, px: t * 8 });
    txt('chrome', 'PS AUTOMÓVEL ' + status, 0, 40, W, 110, true);
    return TX;
  };

  const subs = () => SUBIDS.map(id => { const s = subOf(vo[id] + 0.01); return { t0: s.s0, t1: s.s1, text: SUBTEXT(id) }; });
  return { DUR, render, EV, subs, WARN };
}

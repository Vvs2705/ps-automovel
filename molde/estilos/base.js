// Estilos do molde: o MESMO cena.json, timeline.json e voz do film.js (hologram-hud), desenhados por uma "pele" (estilos/<nome>.js).
// Aqui fica tudo o que não muda de um estilo para outro: leitura das falas, tempos, eventos de som, câmera por zona, posições na tela
// (as mesmas faixas do film.js e da ACESSIBILIDADE.md, para a checagem valer igual) e a legenda karaokê.
// ponytail: a lógica das falas e dos eventos é cópia do film.js (que não podia ser mexido enquanto o estoque era gerado); se um mudar, mude o outro.
import { makeCamera } from '../engine/holo.js';
import { wrap } from '../engine/hud.js';
import { buildAmbulance, buildRoad, VAN } from '../models.js';
import { buildCar, ZONAS, PONTOS } from '../carro.js';

export const W = 1080, H = 1920, FPS = 24, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const nwords = s => s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
function K(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i], [b, vb] = keys[i + 1];
    if (t <= b) { const k = eio((t - a) / (b - a)); return va.map((x, j) => lerp(x, vb[j], k)); }
  }
  return keys[keys.length - 1][1];
}
export const ZTXT = { carro: 'CARRO', carroceria: 'CARROCERIA', pneus: 'PNEUS', freios: 'FREIOS', susp_dianteira: 'SUSPENSÃO DIANT.', susp_traseira: 'SUSPENSÃO TRAS.',
  motor: 'MOTOR', cambio: 'CÂMBIO', arrefecimento: 'ARREFECIMENTO', eletrica: 'ELÉTRICA', escapamento: 'ESCAPAMENTO', painel: 'PAINEL',
  farois: 'FARÓIS', lanternas: 'LANTERNAS', tanque: 'TANQUE', estepe: 'ESTEPE' };
export const ETXT = { ok: 'ZONA', atencao: 'ATENÇÃO', alerta: 'ALERTA' };
// partes que ficam por dentro ou atrás da lataria (desenho técnico: linha oculta)
export const DENTRO = new Set(['motor', 'cambio', 'arrefecimento', 'eletrica', 'escapamento', 'painel', 'tanque', 'estepe', 'susp_dianteira', 'susp_traseira', 'freios']);
const CAM = {   // igual ao film.js: alvo, yaw, pitch, distância
  carro: [0, 0.45, 0, -0.62, 0.2, 6.4], carroceria: [0, 0.5, 0, -0.62, 0.2, 6.2],
  pneus: [-0.8, 0.25, 0.4, -0.5, 0.14, 4.3], freios: [-0.8, 0.25, 0.35, -0.42, 0.12, 3.9],
  susp_dianteira: [-0.8, 0.38, 0.3, -0.45, 0.16, 4.3], susp_traseira: [0.75, 0.36, 0.3, 0.55, 0.16, 4.4],
  motor: [-0.85, 0.45, 0, -0.78, 0.4, 4.4], cambio: [-0.7, 0.36, 0.15, -0.5, 0.36, 4.3], arrefecimento: [-1.05, 0.4, 0, -0.95, 0.3, 4.4],
  eletrica: [-0.15, 0.45, 0, -0.62, 0.32, 5.6], escapamento: [0.2, 0.18, 0, 0.6, 0.04, 5.6], painel: [-0.38, 0.66, 0.05, -0.32, 0.3, 3.6],
  farois: [-1.2, 0.5, 0.05, -1.0, 0.16, 4.2], lanternas: [1.2, 0.6, 0.05, 1.0, 0.16, 4.2], tanque: [0.6, 0.42, 0.25, 0.45, 0.26, 4.6], estepe: [0.95, 0.4, 0, 0.8, 0.55, 4.2],
};
const CY = 930;

// fontes do estilo, carregadas antes do primeiro quadro: [família, arquivo em estilos/fonts/, peso]
export async function fontes(lista) {
  await Promise.all(lista.map(async ([fam, arq, peso, range]) => {
    const f = new FontFace(fam, `url(${new URL('fonts/' + arq, import.meta.url)})`, { weight: String(peso), ...(range ? { unicodeRange: range } : {}) });
    document.fonts.add(f); await f.load();
  }));
}

// câmera: perspectiva (engine) ou ortográfica (vista técnica / chapada, sem perspectiva) com a mesma convenção do makeCamera
export function camera(cam) {
  if (!cam.ortho) return makeCamera(cam, W, H);
  const { target: T, yaw, pitch, dist } = cam, cp = Math.cos(pitch), sp = Math.sin(pitch);
  const f = [-Math.sin(yaw) * cp, -sp, -Math.cos(yaw) * cp], rl = Math.hypot(f[2], f[0]), r = [-f[2] / rl, 0, f[0] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const k = (H / 2) / Math.tan((cam.fov || 0.6) / 2) / dist, cx = cam.cx ?? W / 2, cy = cam.cy ?? H / 2;
  const project = (x, y, z, o) => {
    const dx = x - T[0], dy = y - T[1], dz = z - T[2];
    o[0] = cx + (dx * r[0] + dy * r[1] + dz * r[2]) * k; o[1] = cy - (dx * u[0] + dy * u[1] + dz * u[2]) * k; o[2] = dist + dx * f[0] + dy * f[1] + dz * f[2];
    return o;
  };
  return { project, k };
}

// geometria projetada: por parte, os segmentos [x0,y0,x1,y1,profundidade] de cada peça, caixa e âncora na tela
export function geo(model, cam, o = {}) {
  const P = camera(cam).project, t3 = [0, 0, 0], parts = {};
  for (const Pt of model.parts) {
    if (o.only && !o.only.includes(Pt.id)) continue;
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; const pieces = [];
    for (const Pc of Pt.pieces) {
      const k = o.explode ? (o.explode[Pc.id] ?? o.explode[Pt.id] ?? 0) : 0;
      if (Pc.internal && k <= 0) continue;
      const ang = o.angle ? (o.angle[Pc.id] || 0) : 0, ax = ang && Pc.axis, ca = Math.cos(ang), sa = Math.sin(ang);
      const n = Pc.n, V = Pc.v, S = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        let x = V[i * 3], y = V[i * 3 + 1], z = V[i * 3 + 2];
        if (ax) { const dx = x - ax.c[0], dy = y - ax.c[1]; x = ax.c[0] + dx * ca - dy * sa; y = ax.c[1] + dx * sa + dy * ca; }
        P(x + Pc.explode[0] * k, y + Pc.explode[1] * k, z + Pc.explode[2] * k, t3);
        S[i * 3] = t3[0]; S[i * 3 + 1] = t3[1]; S[i * 3 + 2] = t3[2];
        if (Pc.box !== false) { if (t3[0] < bx0) bx0 = t3[0]; if (t3[0] > bx1) bx1 = t3[0]; if (t3[1] < by0) by0 = t3[1]; if (t3[1] > by1) by1 = t3[1]; }
      }
      const E = Pc.e, sg = new Float32Array(E.length / 2 * 5);
      for (let j = 0, m = 0; j < E.length; j += 2, m += 5) {
        const a = E[j] * 3, b = E[j + 1] * 3;
        sg[m] = S[a]; sg[m + 1] = S[a + 1]; sg[m + 2] = S[b]; sg[m + 3] = S[b + 1]; sg[m + 4] = (S[a + 2] + S[b + 2]) / 2;
      }
      pieces.push({ id: Pc.id, sg, S });
    }
    const an = Pt.anchor; P(an[0], an[1], an[2], t3);
    parts[Pt.id] = { id: Pt.id, pieces, bbox: bx1 > bx0 ? [bx0, by0, bx1, by1] : null, anchor: [t3[0], t3[1], t3[2]] };
  }
  return { parts, project: P, dist: cam.dist };
}
// Path2D dos segmentos de uma parte (ou peça); keep(x0,y0,x1,y1,z) filtra; cut = só a fração mais à esquerda (desenho entrando)
export function path(src, o = {}) {
  const p = new Path2D(), list = src.pieces ? src.pieces : [src];
  for (const pc of list) {
    if (o.piece && !o.piece(pc.id)) continue;
    const s = pc.sg;
    for (let m = 0; m < s.length; m += 5) {
      if (o.keep && !o.keep(s[m], s[m + 1], s[m + 2], s[m + 3], s[m + 4])) continue;
      if (o.cut != null && Math.min(s[m], s[m + 2]) > o.cut) continue;
      p.moveTo(s[m], s[m + 1]); p.lineTo(s[m + 2], s[m + 3]);
    }
  }
  return p;
}
// envoltória convexa dos vértices de uma peça (preenchimento chapado de lataria, pneu)
export function hull(pc) {
  const S = pc.S, P = []; for (let i = 0; i < S.length; i += 3) P.push([S[i], S[i + 1]]);
  P.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  const h = lo.slice(0, -1).concat(up.slice(0, -1)), q = new Path2D();
  h.forEach((p, i) => (i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1]))); q.closePath();
  return q;
}
// ruído de grão fixo (giz, papel, impressão): canvas pequeno para usar como padrão
export function grao(n, dens, fill) {
  const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
  for (let i = 0; i < n * n * dens; i++) { const x = hash(i * 1.37) * n, y = hash(i * 2.91 + 7) * n, r = 0.4 + hash(i * 5.3) * 1.4; g.fillStyle = fill(hash(i * 9.1)); g.fillRect(x, y, r, r); }
  return c;
}

// ======================================================================================================
// S (a pele): nome, ortho, camK [yaw, pitch], sfx, font{}, cor{}, bg, car, van, plate, ring, chrome, post, sub, escrita
export function styled(S, TL, cena, dur, words, lines, AP = null) {
  const WARN = [];
  const warn = s => { if (!WARN.includes(s)) WARN.push(s); };
  const CARM = buildCar(cena.carro || 'hatch'), VANM = buildAmbulance(), ROAD = buildRoad();
  const vo = TL.vo, DUR = TL.dur, O = TL.outro, SIGN = TL.assina, IDS = TL.ids;
  const BODY = IDS.filter(id => id !== SIGN);
  const end = id => vo[id] + (dur[id] || 2);
  const TEXT = Object.fromEntries(lines.map(l => [l.id, l.text]));
  const wt = (id, w, edge = 't0') => {
    const k = norm(String(w).split(/\s+/)[0] || ''); if (k.length < 2) return null;
    for (const x of words[id] || []) { const n = norm(x.w); if (n && (n === k || (k.length >= 4 && n.startsWith(k.slice(0, 6))))) return vo[id] + (edge === 'end' ? x.t1 : x.t0); }
    return null;
  };
  // ---------- falas (igual ao film.js) ----------
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
    const cardT = c.cartao ? Math.min((c.cartao.palavra && wt(id, c.cartao.palavra, 'end')) || vo[id] + 0.45 * d, vo[id] + 0.6 * d) : 0;
    if (c.cartao?.palavra && !wt(id, c.cartao.palavra)) warn(`${id}: palavra "${c.cartao.palavra}" do cartão não está na fala`);
    F[id] = { id, i, zona, estado, tags, tagT, pts, ptT, card: c.cartao, cardT, lupa: !!c.lupa && !c.cartao, seta: !!c.seta, a, b, d, fonte, leg: c.legenda };
  });
  const lineAt = t => { let L = F[BODY[0]]; for (const id of BODY) if (t >= F[id].a) L = F[id]; return L; };
  const isRed = t => t < O - 0.45 && lineAt(t).estado === 'alerta';

  // ---------- eventos de som (os do film.js; o estilo troca os de ficção científica pelos seus) ----------
  const EV = [];
  const ev = (t, type, o = {}) => {
    const m = S.sfx ? S.sfx[type] : undefined; if (m === null) return;
    if (m) { type = m[0]; o = { ...o, ...m[1] }; }
    EV.push({ t: Math.round(Math.max(0, t) * 1000) / 1000, type, ...o });
  };
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

  // ---------- câmera (as zonas do film.js; nos estilos 2D o giro e a inclinação são achatados e a projeção é ortográfica) ----------
  const [KY, KP] = S.camK || [1, 1], ortho = !!S.ortho;
  const camOf = c => ({ target: [c[0], c[1], c[2]], yaw: c[3] * KY, pitch: c[4] * KP, dist: c[5] });
  const camAt = t => {
    const L = lineAt(t), P = L.i ? F[BODY[L.i - 1]] : null;
    const c1 = CAM[L.zona] || CAM.carro, c0 = P ? (CAM[P.zona] || CAM.carro) : c1;
    const k = eio(seg(t, L.a - 0.05, L.a + 0.85)), v = c0.map((x, j) => lerp(x, c1[j], k));
    return { ...camOf(v), yaw: v[3] * KY + (S.balanco ?? 0.07) * Math.sin(t * 0.45), fov: 0.8, cx: 540 + (AP ? AP.dx(t) : 0), cy: CY, ortho };
  };
  const vanState = t => { const u = seg(t, GO, DUR), dx = -3.2 * u * u; return { dx, wheel: -dx / VAN.R, pitch: -0.016 * seg(t, GO, GO + 0.2) * (1 - seg(t, GO + 0.4, GO + 1.4)), door: VAN.DOORS }; };
  const camVan = (t, dx) => {
    const [yaw, pitch, dist] = K(t, [[O, [0.7, 0.2, 7.2]], [GO, [0.62, 0.17, 7.0]], [DUR, [0.52, 0.14, 7.4]]]);
    return { target: [0.3 + 0.55 * dx, 0.55, 0], yaw: yaw * KY, pitch: pitch * KP, dist, fov: 0.8, cx: 540, cy: 860, ortho };
  };
  const ptWorld = p => PONTOS[p] || CARM.byId[p]?.anchor || [0, 0.5, 0];

  // ---------- texto: toda caixa vai para TX (a checagem de sobreposição lê) ----------
  let TX = [];
  const txt = (id, text, x0, y0, x1, y1, pass) => TX.push({ id, text, x0, y0, x1, y1, ...(pass ? { pass: true } : {}) });
  const fnt = (ctx, f) => { ctx.font = f[0]; ctx.letterSpacing = f[1] || '0px'; };
  const meas = (ctx, f, s) => { ctx.save(); fnt(ctx, f); const w = ctx.measureText(s).width; ctx.restore(); return w; };
  // escreve s em (x, y) com a entrada do estilo: k de 0 a 1 (write = da esquerda para a direita, pop = cresce, fade = aparece)
  const put = (ctx, s, x, y, f, col, k = 1, o = {}) => {
    if (k <= 0 || !s) return;
    ctx.save(); fnt(ctx, f); ctx.textBaseline = o.base || 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = col;
    const mode = o.mode || S.escrita || 'write', w = ctx.measureText(s).width;
    if (k < 1 && mode === 'write') { ctx.beginPath(); ctx.rect(x - 4, y - 400, (w + 8) * eo(k), 800); ctx.clip(); }
    if (k < 1 && mode === 'pop') { const s2 = 0.8 + 0.2 * eo(k * 1.4) + 0.06 * Math.sin(clamp(k) * Math.PI); ctx.translate(x + w / 2, y); ctx.scale(s2, s2); ctx.translate(-x - w / 2, -y); ctx.globalAlpha *= clamp(k * 3); }
    if (k < 1 && mode === 'fade') { ctx.globalAlpha *= clamp(k * 2); ctx.translate(0, 18 * (1 - eo(k))); }
    if (k < 1 && mode === 'mask') {   // sobe de dentro de um recorte (tipografia suíça)
      const m = ctx.measureText(s), y0 = y - m.actualBoundingBoxAscent - 6, h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + 12;
      ctx.beginPath(); ctx.rect(x - 6, y0, w + 12, h); ctx.clip(); ctx.translate(0, h * (1 - eo(k)));
    }
    if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke[1]; ctx.strokeStyle = o.stroke[0]; ctx.strokeText(s, x, y); }
    ctx.fillText(s, x, y);
    ctx.restore();
  };
  const st0 = t => ({ t, frame: Math.floor(t * FPS + 1e-6) });
  const tagW = (ctx, label) => meas(ctx, S.font.tag, label) + 46;
  const tag = (ctx, x, y, label, a, o = {}) => {
    if (a <= 0) return;
    const w = tagW(ctx, label), h = 62, st = { ...o, a };
    ctx.save(); ctx.globalAlpha = a; S.plate(ctx, o.kind || 'tag', x, y, w, h, st);
    put(ctx, label, x + 23, y + h / 2 + 1, S.font.tag, S.ink(o.kind || 'tag', st), o.k ?? 1); ctx.restore();
    txt('tag:' + label, label, x, y, x + w, y + h);
  };
  const rows = (ctx, items, yLast) => {
    const ws = items.map(it => tagW(ctx, it.label)), gap = 18, R = [[]]; let acc = 0;
    items.forEach((it, i) => { if (R[R.length - 1].length && acc + gap + ws[i] > 860) { R.push([]); acc = 0; } R[R.length - 1].push(i); acc += (acc ? gap : 0) + ws[i]; });
    R.forEach((r, ri) => {
      const y = yLast - (R.length - 1 - ri) * 76, tot = r.reduce((s, i) => s + ws[i], 0) + gap * (r.length - 1);
      let x = 520 - tot / 2;
      for (const i of r) { tag(ctx, x, y, items[i].label, items[i].a, items[i]); x += ws[i] + gap; }
    });
  };
  const plateText = (ctx, kind, s, x, y, h, f, a, o = {}) => {
    if (a <= 0 || !s) return;
    const w = meas(ctx, f, s) + (o.icon ? 70 : 40);
    ctx.save(); ctx.globalAlpha = a; S.plate(ctx, kind, x, y, w, h, { a });
    if (o.icon) S.icon(ctx, x + 30, y + h / 2, { a });
    put(ctx, s, x + (o.icon ? 54 : 20), y + h / 2 + 1, f, S.ink(kind, {}), o.k ?? 1); ctx.restore();
    txt(kind, s, x, y, x + w, y + h);
  };
  const arrow = (ctx, to, a, t, col) => {
    const sg = to[0] > 540 ? 1 : -1, fr = [to[0] + sg * 150, to[1] - 200], L = Math.hypot(to[0] - fr[0], to[1] - fr[1]);
    const ux = (to[0] - fr[0]) / L, uy = (to[1] - fr[1]) / L, e = [to[0] - ux * 30, to[1] - uy * 30], k = eo(a);
    const tip = [fr[0] + (e[0] - fr[0]) * k, fr[1] + (e[1] - fr[1]) * k], px = -uy, py = ux;
    ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.strokeStyle = col; ctx.lineWidth = S.setaW || 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(fr[0], fr[1]); ctx.lineTo(tip[0], tip[1]);
    ctx.moveTo(tip[0] - ux * 30 + px * 19, tip[1] - uy * 30 + py * 19); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(tip[0] - ux * 30 - px * 19, tip[1] - uy * 30 - py * 19); ctx.stroke();
    ctx.restore();
  };
  const marker = (ctx, p, a, pulse, col) => {
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p[0], p[1], 18, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, TAU); ctx.fill();
    if (pulse > 0 && pulse < 1) { ctx.globalAlpha = a * (1 - pulse); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], 18 + 46 * pulse, 0, TAU); ctx.stroke(); }
    ctx.restore();
  };
  // cartão de valor: mesma geometria do specCard do film.js (rótulo 40 px, valor 130 px, detalhe 34 px)
  const card = (ctx, x, y, w, c, st) => {
    const r = eo(st.reveal); if (st.reveal <= 0) return;
    ctx.save(); fnt(ctx, S.font.detail); const dl = c.detail ? wrap(ctx, c.detail, w) : []; ctx.restore();
    const hh = 60 + 130 * 0.9 + 12 + (dl.length ? 48 + dl.length * 42 : 0) + 20;
    ctx.save(); ctx.globalAlpha = clamp(st.reveal * 2); S.plate(ctx, 'card', x - 22, y - 20, (w + 44) * (S.cartaoAbre === false ? 1 : r), hh + 20, st); ctx.restore();
    put(ctx, st.index, x, y + 44, S.font.idx, S.ink('idx', st), clamp(r * 2), { base: 'alphabetic', mode: 'fade' });
    const lab = S.caixa === false ? c.label : c.label.toUpperCase();
    let fs = 40; ctx.save(); for (; fs > 26; fs--) { fnt(ctx, [S.font.label[0].replace(/\d+px/, fs + 'px'), S.font.label[1]]); if (ctx.measureText(lab).width <= w - 70) break; } ctx.restore();
    put(ctx, lab, x + 62, y + 46, [S.font.label[0].replace(/\d+px/, fs + 'px'), S.font.label[1]], S.ink('label', st), clamp(st.reveal * 1.6 - 0.2), { base: 'alphabetic' });
    if (st.roll > 0) {
      let bs = 130; ctx.save(); for (; bs > 60; bs--) { fnt(ctx, S.font.value(bs)); if (ctx.measureText(c.value).width <= w - 110) break; } ctx.restore();
      if (bs < 130) warn(`${st.id}: valor "${c.value}" do cartão não cabe a 130 px (ficou ${bs} px): encurte`);
      const yb = y + 60 + bs * 0.78, locked = st.roll >= 1, vw = meas(ctx, S.font.value(bs), c.value);
      put(ctx, c.value, x - 4, yb, S.font.value(bs), S.ink(locked ? 'value' : 'valueRoll', st), st.roll, { base: 'alphabetic', mode: S.escritaValor || S.escrita, stroke: S.valorContorno });
      if (c.unit) put(ctx, c.unit, x + vw + 10, yb, S.font.unit(Math.round(bs * 0.3)), S.ink('unit', st), clamp(st.roll * 2 - 1), { base: 'alphabetic', mode: 'fade' });
      if (S.barra !== false) { ctx.save(); ctx.fillStyle = S.ink('bar0', st); ctx.fillRect(x, y + 60 + bs * 0.9 + 8, w, 3); ctx.fillStyle = S.ink('bar', st); ctx.fillRect(x, y + 60 + bs * 0.9 + 8, w * clamp(st.roll), 3); ctx.restore(); }
    }
    const hv = 60 + 130 * 0.9 + 12;
    dl.forEach((ln, i) => put(ctx, ln, x, y + hv + 48 + i * 42, S.font.detail, S.ink('detail', st), clamp(st.detail * 1.5 - i * 0.2), { base: 'alphabetic' }));
  };
  // painel lateral da ambulância com o nome (mapeado no plano z = +HZ, como no film.js)
  const vp = (x, y, z, vs) => { const c = Math.cos(vs.pitch), s = Math.sin(vs.pitch), X = x - VAN.WX[0]; return [VAN.WX[0] + X * c - y * s + vs.dx, X * s + y * c, z]; };
  const vanName = (ctx, cam, vs, k) => {
    if (k <= 0) return;
    const P = camera(cam).project, sd = VAN.side, z = VAN.HZ * 1.01;
    const pt = (x, y) => { const q = vp(x, y, z, vs), o = [0, 0, 0]; P(q[0], q[1], q[2], o); return o; };
    const O0 = pt(sd.x0, sd.y1), X = pt(sd.x1, sd.y1), Y = pt(sd.x0, sd.y0);
    const LW = 1000, LH = 1000 * (sd.y1 - sd.y0) / (sd.x1 - sd.x0), kc = eo(seg(k, 0, 0.4));
    ctx.save(); ctx.setTransform((X[0] - O0[0]) / LW, (X[1] - O0[1]) / LW, (Y[0] - O0[0]) / LH, (Y[1] - O0[1]) / LH, O0[0], O0[1]);
    const s = LH - 40, c0 = 20 + s / 2, c1 = LH / 2, b = s * 0.17;
    ctx.globalAlpha = kc; ctx.fillStyle = S.cor.painel; ctx.fillRect(0, 0, LW, LH);
    ctx.strokeStyle = S.cor.painelBorda; ctx.lineWidth = 6; ctx.strokeRect(3, 3, LW - 6, LH - 6);
    ctx.fillStyle = S.cor.cruz; ctx.beginPath(); ctx.rect(c0 - b, c1 - s / 2, 2 * b, s); ctx.rect(c0 - s / 2, c1 - b, s, 2 * b); ctx.fill();
    ctx.globalAlpha = 1;
    let fs = 130; for (; fs > 60; fs -= 4) { fnt(ctx, S.font.marca(fs)); if (ctx.measureText('PS AUTOMÓVEL').width <= LW - s - 70) break; }
    const x0 = s + 60, yb = LH * 0.6;
    put(ctx, 'PS', x0, yb, S.font.marca(fs), S.cor.marca1, clamp(k * 1.4), { base: 'alphabetic' });
    const w = meas(ctx, S.font.marca(fs), 'PS ');
    put(ctx, 'AUTOMÓVEL', x0 + w, yb, S.font.marca(fs), S.cor.marca2, clamp(k * 1.15 - 0.15), { base: 'alphabetic' });
    put(ctx, 'RESGATE AUTOMOTIVO', x0 + 4, LH * 0.9, S.font.marcaSub, S.cor.marcaSub, clamp(k * 1.3 - 0.3), { base: 'alphabetic' });
    ctx.restore();
    txt('title', 'PS AUTOMÓVEL', Math.min(O0[0], Y[0]), O0[1], X[0], Y[1]);
  };
  const tagline = (ctx, k, y) => {
    if (k <= 0) return;
    const s = 'SEU CARRO SEMPRE EM BOAS MÃOS.', w = meas(ctx, S.font.slogan, s);
    ctx.save(); S.plate(ctx, 'slogan', 540 - w / 2 - 24, y - 46, w + 48, 64, { a: 1, k });
    put(ctx, s, 540 - w / 2, y, S.font.slogan, S.ink('slogan', {}), k, { base: 'alphabetic' }); ctx.restore();
    txt('tagline', s, 80, y - 44, 1000, y + 12);
  };

  // ---------- legenda karaokê (62 px, 2 linhas por página, termina em y = 1500; mesma caixa do film.js) ----------
  const subOf = t => {
    for (let i = 0; i < BODY.length; i++) {
      const id = BODY[i], s0 = vo[id] - 0.1, nxt = i + 1 < BODY.length ? vo[BODY[i + 1]] - 0.12 : O - 0.2;
      const s1 = Math.min(nxt, end(id) + 0.6);
      if (t >= s0 && t < s1) return { id, s0, s1 };
    }
    return null;
  };
  const SUBTEXT = id => F[id].leg || TEXT[id];
  const SUB_W = 780, SUB_Y = 1500;
  const drawSub = (ctx, t, st) => {
    const s = subOf(t); if (!s) return;
    const list = words[s.id] || [], text = SUBTEXT(s.id);
    const a = clamp((t - s.s0) / 0.1) * clamp((s.s1 - t) / 0.12);
    ctx.save(); fnt(ctx, S.font.sub); ctx.textBaseline = 'alphabetic';
    const toks = text.split(' '), lns = []; let cur = [], wcur = 0; const sp = ctx.measureText(' ').width;
    for (const tk of toks) { const w = ctx.measureText(tk).width; if (cur.length && wcur + sp + w > SUB_W) { lns.push(cur); cur = []; wcur = 0; } cur.push(tk); wcur += (cur.length > 1 ? sp : 0) + w; }
    if (cur.length) lns.push(cur);
    const N = toks.length, M = Math.max(1, list.length), wOf = i => list[Math.min(M - 1, Math.floor(i * M / N))];
    const saidAt = i => { const W0 = wOf(i); return W0 ? vo[s.id] + W0.t0 - 0.02 : vo[s.id]; };
    let said = 0; for (let i = 0; i < N; i++) if (t >= saidAt(i)) said = i + 1;
    const lineOf = []; lns.forEach((l, li) => l.forEach(() => lineOf.push(li)));
    const p0 = Math.floor(lineOf[Math.min(Math.max(0, said - 1), lineOf.length - 1)] / 2) * 2, page = lns.slice(p0, p0 + 2);
    let wi = lns.slice(0, p0).reduce((n, l) => n + l.length, 0);
    const lh = Math.round(62 * 1.18), hh = page.length * lh, y0 = SUB_Y - hh;
    const tws = page.map(l => ctx.measureText(l.join(' ')).width), tw = Math.max(...tws), x0 = 520 - tw / 2;
    ctx.globalAlpha = a; S.sub(ctx, { x: x0 - 70, y: y0 - 24, w: tw + 104, h: hh + 40, tx: x0, ty: y0, tw, hh, talking: t < end(s.id), t, i: F[s.id].i, ...st });
    fnt(ctx, S.font.sub);
    page.forEach((ln, li) => {
      let x = 520 - tws[li] / 2; const y = y0 + (li + 1) * lh - 14;
      for (const tk of ln) { ctx.fillStyle = S.ink(t >= saidAt(wi) ? 'sub' : 'subDim', st); ctx.fillText(tk, x, y); x += ctx.measureText(tk).width + sp; wi++; }
    });
    ctx.restore();
    txt('sub:' + s.id, page.map(l => l.join(' ')).join(' '), x0 - 70, y0, x0 + tw + 34, SUB_Y);
  };

  // ---------- quadro ----------
  const render = (ctx, t, opt = {}) => {
    TX = [];
    const red = isRed(t), base = { ...st0(t), red };
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.letterSpacing = '0px'; ctx.setLineDash([]);
    let status = '';
    if (t < O) {
      const L = lineAt(t), cam = camAt(t), z = L.zona, lit = z !== 'carro' && z !== 'carroceria';
      const P = L.i ? F[BODY[L.i - 1]] : null, zk = P && P.zona === z ? 1 : seg(t, L.a + 0.1, L.a + 0.7);
      const st = { ...base, L, z, lit, estado: L.estado, zk, entra: seg(t, 0, 0.8), sai: seg(t, O - 0.45, O - 0.05), cam };
      S.bg(ctx, t, st);
      const G = geo(CARM, cam); st.G = G;
      S.car(ctx, G, st);
      const anc = G.parts[z]?.anchor || G.parts.carroceria.anchor, bb = G.parts[z]?.bbox;
      if (lit && bb && bb[2] - bb[0] < 760 && S.alvo) S.alvo(ctx, bb, seg(t, L.a + 0.15, L.a + 0.45) * (1 - seg(t, L.b - 0.25, L.b)), st);
      if (L.seta && anc) arrow(ctx, anc, seg(t, L.a + 0.2, L.a + 0.6) * (1 - seg(t, L.b - 0.25, L.b)), t, S.ink('seta', st));
      if (L.lupa) {
        const la = seg(t, L.a + 0.3, L.a + 0.6) * (1 - seg(t, L.b - 0.3, L.b)), lx = 540, ly = 432, lr = 165 * eo(seg(t, L.a + 0.3, L.a + 0.75));
        if (la > 0 && lr > 4) {
          ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = S.ink('linha', st); ctx.lineWidth = 2.5; ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(anc[0], anc[1]); ctx.lineTo(anc[0], ly + lr + 60); ctx.lineTo(lx + (anc[0] > lx ? 0.5 : -0.5) * lr, ly + lr * 0.87); ctx.stroke(); ctx.restore();
          const zw = CARM.byId[z]?.anchor || [0, 0.5, 0];
          ctx.save(); ctx.globalAlpha = la; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.clip();
          S.lupaFundo(ctx, lx, ly, lr, st);
          S.car(ctx, geo(CARM, { target: zw, yaw: cam.yaw, pitch: cam.pitch, dist: 1.7, fov: 0.8, cx: lx, cy: ly, ortho }), { ...st, lupa: true, zk: 1, entra: 1, sai: 0 });
          ctx.restore();
          ctx.save(); ctx.globalAlpha = la; S.anel(ctx, lx, ly, lr, st); ctx.restore();
        }
      }
      const o3 = [0, 0, 0];
      L.pts.forEach((p, j) => {
        const pa = seg(t, L.ptT[j] - 0.1, L.ptT[j] + 0.15) * (1 - seg(t, L.b - 0.25, L.b)); if (pa <= 0 || st.sai > 0) return;
        const w3 = ptWorld(p.p); G.project(w3[0], w3[1], w3[2], o3); const sp = [o3[0], o3[1]];
        marker(ctx, sp, pa, seg(t, L.ptT[j], L.ptT[j] + 0.6), S.ink('ponto', st));
        if (p.rotulo === false) return;
        const lab = (p.rotulo || p.p).toUpperCase(), w = tagW(ctx, lab), y = 626 + j * 76, x = sp[0] > 540 ? 1080 - 90 - w : 90;
        const ed = sp[0] > x + w ? x + w : x, s = sp[0] > ed ? 1 : -1;
        ctx.save(); ctx.globalAlpha = pa; ctx.strokeStyle = S.ink('linha', st); ctx.lineWidth = 2.4; ctx.beginPath();
        ctx.moveTo(sp[0] - s * 18, sp[1]); ctx.lineTo(ed + s * 14, y + 31); ctx.lineTo(ed, y + 31); ctx.stroke(); ctx.restore();
        tag(ctx, x, y, lab, pa, { kind: 'ponto', lit: true, k: seg(t, L.ptT[j] - 0.05, L.ptT[j] + 0.3) });
      });
      if (L.card) {
        const r = seg(t, L.a + 0.1, L.a + 0.45) * (1 - seg(t, L.b - 0.3, L.b));
        if (r > 0) {
          const c = { label: L.card.rotulo || '', value: String(L.card.valor ?? ''), unit: L.card.unidade || '', detail: L.card.detalhe || '' };
          card(ctx, 110, 262, 840, c, { ...st, id: L.id, reveal: r, roll: seg(t, L.cardT - 0.5, L.cardT), detail: seg(t, L.cardT, L.cardT + 0.5), flash: Math.abs(t - L.cardT) < 0.05, index: String(L.i + 1).padStart(2, '0') });
          ctx.save(); fnt(ctx, S.font.detail); const dl = c.detail ? wrap(ctx, c.detail, 840).length : 0; ctx.restore();
          txt('card:' + L.id, [c.label, c.value, c.unit, c.detail].join(' '), 88, 242, 972, 262 + 60 + 117 + 12 + (dl ? 48 + dl * 42 : 0) + 20);
        }
      }
      if (L.tags.length) {
        const out = 1 - seg(t, L.b - 0.25, L.b), est = red ? 'alerta' : L.estado;
        rows(ctx, L.tags.map((s, j) => ({ label: s, lit: t >= L.tagT[j], estado: est, a: seg(t, L.tagT[j] - 0.15, L.tagT[j] + 0.1) * out, k: seg(t, L.tagT[j] - 0.1, L.tagT[j] + 0.25) })), 1226);
      }
      const top = 1 - seg(t, O - 0.6, O - 0.3);
      if (cena.titulo) plateText(ctx, 'titulo', cena.titulo, 110, 128, 56, S.font.titulo, (BODY.length > 1 ? 1 - seg(t, F[BODY[1]].a - 0.2, F[BODY[1]].a) : 1) * top, { k: seg(t, 0.1, 0.6) });
      const s0 = cena.titulo && BODY.length > 1 ? F[BODY[1]].a : 0.3, sa = seg(t, s0, s0 + 0.3) * top;
      if (cena.selo) plateText(ctx, 'selo', String(cena.selo).toUpperCase(), 110, 128, 56, S.font.selo, sa, { icon: true, k: seg(t, s0, s0 + 0.6) });
      if (L.fonte) {
        if (meas(ctx, S.font.fonte, L.fonte) > 820) warn(`fonte "${L.fonte}" passa de 820 px: encurte`);
        plateText(ctx, 'fonte', L.fonte, 110, cena.selo ? 192 : 128, 44, S.font.fonte, sa, { k: seg(t, s0 + 0.1, s0 + 0.7) });
      }
      status = `${ETXT[L.estado] || 'ZONA'} · ${ZTXT[z] || z.toUpperCase()}`;
      S.post?.(ctx, t, st);
      if (!opt.nosub) drawSub(ctx, t, st);
    } else {
      // ===== final: a ambulância do PS Automóvel, desenhada no estilo, leva o carro na maca =====
      const vs = vanState(t), cam = camVan(t, vs.dx), st = { ...base, red: false, fim: true, entra: seg(t, O, O + 0.5), blink: Math.floor(t * 7) % 2 };
      S.bg(ctx, t, st);
      const door = 'portas' + vs.door, angle = { wheelF: vs.wheel, wheelR: vs.wheel };
      for (const id of ['body', 'inside', 'lights', 'maca', 'car', door]) angle[id] = vs.pitch;
      S.estrada?.(ctx, geo(ROAD, cam), st);
      S.van(ctx, geo(VANM, cam, { only: ['furgao', 'luzes', 'rodas', door, 'carga'], explode: { furgao: vs.dx, luzes: vs.dx, rodas: vs.dx, carga: vs.dx, [door]: vs.dx }, angle }), st);
      vanName(ctx, cam, vs, seg(t, O + 0.2, CLACK));
      tagline(ctx, seg(t, slogan, sloganEnd), 1330);
      const ia = seg(t, GO, GO + 0.3);
      if (ia > 0) rows(ctx, [{ label: 'INSCREVA-SE', lit: true, kind: 'inscreva', a: ia, k: seg(t, GO, GO + 0.35) }], 1385);
      status = t < GO ? 'RESGATE · CARREGADO' : 'RESGATE · EM ROTA';
      S.post?.(ctx, t, st);
    }
    if (AP) TX.push(AP.draw(ctx, t));   // apresentador (apresentador/APRESENTADOR.md)
    S.chrome(ctx, t, { ...base, status, serie: cena.serie || 'DICA', put, fnt });
    txt('chrome', 'PS AUTOMÓVEL ' + status, 0, 40, W, 110, true);
    return TX;
  };
  const subs = () => BODY.map(id => { const s = subOf(vo[id] + 0.01); return { t0: s.s0, t1: s.s1, text: SUBTEXT(id) }; });
  return { DUR, render, EV, subs, WARN };
}

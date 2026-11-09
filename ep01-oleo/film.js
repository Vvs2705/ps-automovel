// PS Automóvel · EP01 "Por que trocar o óleo?" — linha do tempo, câmeras e estados (o desenho fica no engine).
import { Holo, drawScanPlane, drawPad, makeCamera } from './engine/holo.js';
import * as U from './engine/hud.js';
import { buildEngine, buildAmbulance, buildRoad, VAN, R, L, PIN, GALLERY } from './models.js';

export const W = 1080, H = 1920, FPS = 24;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const ei = t => Math.pow(clamp(t), 3);
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const q8 = x => Math.round(x * 8) / 8;                     // grade de 1/16 a 120 BPM
function K(t, keys) {                                     // trilha de keyframes, eio entre chaves
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i], [b, vb] = keys[i + 1];
    if (t <= b) { const k = eio((t - a) / (b - a)); return Array.isArray(va) ? va.map((x, j) => lerp(x, vb[j], k)) : lerp(va, vb, k); }
  }
  return keys[keys.length - 1][1];
}
const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a, b, k) => '#' + hex2(a).map((x, i) => Math.round(lerp(x, hex2(b)[i], clamp(k))).toString(16).padStart(2, '0')).join('');
const OIL_NEW = '#ffc94a', OIL_OLD = '#7a4e16';
const HUE = 196, ACC = 24, RED = 355;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export function makeFilm(TL, dur, words) {
  const ENG = buildEngine(), VANM = buildAmbulance(), ROAD = buildRoad();
  const HO = new Holo(W, H);
  const T = U.theme(HUE, ACC), TRd = U.theme(RED, ACC);
  const vo = TL.vo, S = TL.sec, DUR = TL.dur;
  // tempo absoluto de uma palavra falada: wt('L03', 'minuto', 'end', n-ésima ocorrência)
  const wt = (id, w, edge = 't0', nth = 0) => {
    const list = words[id] || []; let c = 0;
    for (const x of list) if (norm(x.w) === norm(w) && c++ === nth) return vo[id] + (edge === 'end' ? x.t1 : x.t0);
    throw new Error(`palavra ${w} não achada em ${id}`);
  };
  const end = id => vo[id] + (dur[id] || 2);
  const C = {
    metal: wt('L02', 'metal'), rpm: q8(wt('L03', 'minuto', 'end')), cinq: wt('L03', 'cinquenta'), cinqLock: q8(wt('L03', 'segundo', 'end')),
    pel: wt('L04', 'pelicula'),
    fn: ['lubrifica', 'resfriar', 'limpa', 'veda', 'protege'].map(w => q8(wt('L05', w))),
    calor: wt('L07', 'calor'), fuligem: wt('L07', 'fuligem'), desg: wt('L07', 'desgaste'),
    borra: wt('L08', 'borra'), entupir: wt('L08', 'entupir'),
    semPel: wt('L09', 'pelicula'), metal2: q8(wt('L09', 'metal')), dispara: wt('L09', 'dispara'), trava: q8(wt('L09', 'trava')),
    filtro: q8(wt('L10', 'filtro')), manual: q8(wt('L10', 'manual', 'end')),
    pouco: q8(wt('L11', 'pouco')), transito: q8(wt('L11', 'transito')), poeira: q8(wt('L11', 'poeira')),
    severo: q8(wt('L11', 'severo')), menor: q8(wt('L11', 'menor', 'end')),
    troca: wt('L12', 'troca'), motor12: wt('L12', 'motor'),
    nome: q8(wt('L13', 'automovel', 'end')), slogan: wt('L13', 'seu'), sloganEnd: q8(wt('L13', 'maos', 'end')),
  };
  const SEIZE0 = 4.0, CLACK = Math.max(75.5, C.nome);

  // ---------- virabrequim: velocidade (voltas/s) integrada numa tabela ----------
  const omega = t => {
    if (t < 3.85) return 1.25;
    if (t < SEIZE0) return lerp(1.25, 0, seg(t, 3.85, SEIZE0));
    if (t < S.motor) return 0;
    if (t < 34) return 0.8;
    if (t < 47) return 0.7;
    if (t < S.virada) return lerp(0.7, 0.45, seg(t, 47, S.virada));
    if (t < C.trava) return 0.45 * (1 + 0.35 * Math.sin(t * 19) * seg(t, C.dispara - 0.4, C.dispara));
    if (t < S.fix) return 0;
    return lerp(0, 0.7, seg(t, S.fix, S.fix + 1.5));
  };
  const flowSp = t => {
    if (t < S.motor) return 0;
    if (t < C.borra) return 1;
    if (t < S.virada) return lerp(1, 0.08, seg(t, C.borra, C.entupir + 0.6));
    if (t < S.fix + 0.8) return 0;
    return 1;
  };
  const DT = 1 / 240, NT = Math.ceil((DUR + 1) / DT), TH = new Float64Array(NT), FL = new Float64Array(NT);
  for (let i = 1; i < NT; i++) { const t = (i - 0.5) * DT; TH[i] = TH[i - 1] + omega(t) * DT; FL[i] = FL[i - 1] + flowSp(t) * DT; }
  const tab = (A, t) => { const x = clamp(t / DT, 0, NT - 1.001), i = Math.floor(x); return lerp(A[i], A[i + 1], x - i); };
  const theta = t => tab(TH, t) + 0.12;
  const flowPos = t => tab(FL, t);

  // ---------- estados do óleo ----------
  const age = t => t < S.fix ? clamp(0.75 * eio(seg(t, C.calor - 0.2, end('L07'))) + 0.25 * eio(seg(t, vo.L08, end('L08')))) : 0;
  const sludge = t => t < S.fix ? eio(seg(t, C.borra - 0.3, C.entupir + 0.6)) : 0;
  const film = t => t < S.fix ? 1 - eio(seg(t, C.semPel, C.metal2)) : eio(seg(t, S.fix + 0.4, S.fix + 1.6));
  const isRed = t => t < S.intro || (t >= C.metal2 && t < S.fix - 0.1);

  // ---------- eventos de som (lidos pelo mix.py via events.json) ----------
  const EV = [];
  const ev = (t, type, o = {}) => EV.push({ t: Math.round(t * 1000) / 1000, type, ...o });
  // batidas do mancal: uma por volta, no gancho e depois que o desgaste dispara
  for (let i = 1; i < NT; i++) {
    const t = i * DT, a = Math.floor(TH[i - 1] + 0.12), b = Math.floor(TH[i] + 0.12);
    if (b > a && ((t < SEIZE0) || (t > C.dispara - 0.3 && t < C.trava))) ev(t, 'knock', { v: t < SEIZE0 ? 0.8 : 1 });
  }
  ev(0, 'hum', { to: S.intro - 0.2 }); ev(0, 'engine', { to: SEIZE0, v: 0.8, red: 1 });
  ev(SEIZE0, 'seize', { v: 0.7 }); ev(4.12, 'scan_down', { d: 0.3 });
  ev(4.5, 'scan', { d: 0.35 });
  ev(4.3, 'siren', { d: 3.6, env: [[0, 0.35], [0.6, 1], [0.72, 1], [1, 0]], dop: [[0, 1.05], [0.62, 1], [1, 0.99]], pan: 0.35 });   // J-cut: a sirene chega antes
  ev(4.7, 'rumble', { d: 2.2, f0: 44, f1: 30, v: 0.9 }); ev(5.5, 'whoosh', { d: 0.7 }); ev(5.95, 'brake', { d: 0.55 }); ev(6.55, 'hiss');
  ev(7.0, 'roll', { d: 1.0 }); ev(8.0, 'lock_big'); ev(8.15, 'roll', { d: 0.6, v: 0.5 }); ev(8.75, 'confirm', { v: 0.6 });
  ev(9.45, 'scan_down', { d: 0.5 });
  ev(S.motor, 'scan', { d: 1.6 }); ev(S.motor + 0.3, 'hum', { to: S.virada - 0.02 }); ev(S.motor + 1.2, 'engine', { to: S.virada, v: 0.5 });
  ev(q8(C.metal), 'lock'); ev(C.rpm - 0.6, 'roll', { d: 0.6 }); ev(C.rpm, 'confirm'); ev(C.rpm + 0.2, 'rev_up', { d: 1.2 });
  ev(C.cinqLock - 0.6, 'roll', { d: 0.6 }); ev(C.cinqLock, 'confirm'); ev(21.0, 'dock'); ev(21.25, 'dock');
  ev(22.3, 'loupe'); ev(q8(C.pel), 'blip', { n: 2 });
  C.fn.forEach((t, i) => ev(t, 'chip', { i }));
  ev(34.5, 'blip', { n: 0 }); ev(C.calor, 'oil_bed', { to: S.silencio }); ev(C.fuligem, 'grit', { d: 3 }); ev(q8(C.borra), 'clog');
  ev(S.silencio, 'silence', { to: S.virada });
  ev(S.virada, 'loupe_big'); ev(C.metal2, 'scrape', { to: C.trava }); ev(C.metal2, 'glitch');
  ev(C.trava, 'seize_big'); ev(S.travou, 'powerdown');
  ev(S.fix, 'scan', { d: 1.8, v: 1.2 }); ev(S.fix + 0.4, 'hum', { to: 73.6 }); ev(S.fix + 0.6, 'engine', { to: 73.6, v: 0.45 }); ev(S.fix + 0.5, 'oil_fresh', { d: 2 });
  ev(C.filtro, 'lock'); ev(C.manual - 0.5, 'roll', { d: 0.5 }); ev(C.manual, 'confirm');
  for (const t of [C.pouco, C.transito, C.poeira]) ev(t, 'chip', { i: 1 });
  ev(C.severo, 'servo', { d: 0.4 }); ev(C.menor - 0.4, 'roll', { d: 0.4 }); ev(C.menor, 'confirm');
  ev(q8(C.troca), 'servo', { d: 0.6 }); ev(q8(C.motor12), 'servo', { d: 0.9 });
  ev(73.6, 'scan_down', { d: 0.4 }); ev(74.0, 'scan', { d: 0.4 });
  ev(74.0, 'rumble', { d: 1.7, f0: 30, f1: 30, v: 0.4 }); ev(75.6, 'rumble', { d: 4.4, f0: 32, f1: 58, v: 0.8 });   // marcha lenta, arrancada
  ev(78.35, 'siren', { d: 1.65, env: [[0, 0], [0.15, 0.8], [1, 0.5]], dop: [[0, 0.98], [1, 0.95]], pan: -0.35 });   // depois da última fala, indo embora
  ev(74.4, 'roll', { d: CLACK - 74.4 }); ev(CLACK, 'clack_lock');
  ev(C.slogan, 'roll', { d: C.sloganEnd - C.slogan, v: 0.5 }); ev(C.sloganEnd, 'confirm'); ev(78.0, 'chip', { i: 2 });
  ev(0, 'crank', { hz: 50, w: Array.from({ length: Math.ceil(DUR * 50) }, (_, i) => +omega(i / 50).toFixed(3)) });   // rotação para o ronco do mix
  EV.sort((a, b) => a.t - b.t);

  // ---------- helpers de projeção ----------
  const projector = (cam, spin = 0) => {
    const Cm = makeCamera(cam, W, H), cs = Math.cos(spin), sn = Math.sin(spin), o = new Float32Array(3);
    return (x, y, z) => { Cm.project(x * cs + z * sn, y, -x * sn + z * cs, o); return [o[0], o[1], o[2]]; };
  };
  const bboxOf = (P, pts) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { const s = P(...p); x0 = Math.min(x0, s[0]); y0 = Math.min(y0, s[1]); x1 = Math.max(x1, s[0]); y1 = Math.max(y1, s[1]); } return [x0, y0, x1, y1]; };
  const boxPts = (cx, cy, cz, hx, hy, hz) => { const o = []; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) o.push([cx + a * hx, cy + b * hy, cz + c * hz]); return o; };
  const pose = t => {
    const ang = theta(t) * TAU, al = Math.asin(clamp(-R * Math.sin(ang) / L, -1, 1));
    const dy = R * Math.cos(ang) + L * Math.cos(al) - PIN;
    return { ang, al, dy, pin: [-R * Math.sin(ang), R * Math.cos(ang)] };
  };

  // ---------- câmeras ----------
  const camEngine = t => {
    let k;
    if (t < S.intro) k = [[0, [0.55, 0.17, 6.4, 900]], [S.intro, [0.44, 0.15, 5.7, 900]]];
    else if (t < S.funcoes) k = [[S.motor, [0.95, 0.48, 7.2, 900]], [S.motor + 1.7, [0.55, 0.16, 6.3, 900]], [vo.L03, [0.5, 0.12, 6.1, 900]], [S.funcoes, [0.42, 0.11, 5.9, 900]]];
    else if (t < S.virada) k = [[S.funcoes, [0.42, 0.11, 5.9, 900]], [S.funcoes + 1.1, [0.36, 0.1, 8.3, 930]], [S.desgaste, [0.24, 0.1, 8.3, 930]], [S.silencio, [0.06, 0.09, 7.9, 930]]];
    else if (t < S.fix) k = [[S.virada, [0.06, 0.09, 7.9, 930]], [S.fix, [0.0, 0.09, 8.0, 930]]];
    else k = [[S.fix, [0.35, 0.16, 6.9, 870]], [S.outro, [0.35, 0.14, 6.6, 870]]];
    const [yaw, pitch, dist, cy] = K(t, k);
    let cx = 540, roll = 0;
    const shake = (t0, a) => { const u = seg(t, t0, t0 + 0.25); if (u > 0 && u < 1) { cx += (hash(Math.floor(t * 24)) - 0.5) * a * (1 - u); roll += (hash(Math.floor(t * 24) + 9) - 0.5) * a * 0.002 * (1 - u); } };
    shake(SEIZE0, 18); shake(C.trava, 26);
    return { target: [0, 0.38, 0], yaw, pitch, dist, fov: 0.8, cx, cy, roll };
  };
  // ambulância: chega da direita freando (vinheta) e vai embora para a esquerda com o carro na maca (final)
  const vanState = t => {
    if (t < S.motor) {
      const u = seg(t, 4.7, 6.5), dx = 3.4 * (1 - u) * (1 - u), tb = t - 6.5;     // desaceleração constante até parar
      const pitch = t < 6.5 ? 0.028 * seg(t, 4.75, 4.95) : 0.028 * Math.exp(-tb * 5) * Math.cos(tb * 15);
      return { dx, wheel: (3.4 - dx) / VAN.R, pitch, door: 0, cargo: false };
    }
    const u = seg(t, 75.6, DUR), dx = -2.9 * u * u;                                   // arranca acelerando
    return { dx, wheel: -dx / VAN.R, pitch: -0.016 * seg(t, 75.6, 75.8) * (1 - seg(t, 76.0, 77.0)), door: VAN.DOORS, cargo: true };
  };
  const camVan = (t, dx) => {
    const k = t < S.motor ? [[S.intro, [0.66, 0.12, 7.4]], [6.5, [0.6, 0.15, 7.0]], [S.motor, [0.54, 0.17, 6.8]]]
      : [[S.outro, [0.7, 0.2, 7.2]], [75.6, [0.62, 0.17, 7.0]], [DUR, [0.52, 0.14, 7.4]]];
    const [yaw, pitch, dist] = K(t, k);
    let cy = 860; const u = seg(t, 6.5, 6.75); if (u > 0 && u < 1) cy += (hash(Math.floor(t * 24)) - 0.5) * 12 * (1 - u);
    return { target: [0.3 + (t < S.motor ? 0 : 0.55 * dx), 0.55, 0], yaw, pitch, dist, fov: 0.8, cx: 540, cy };
  };

  // ---------- desenho do motor ----------
  const drawEngine = (ctx, t, cam, o = {}) => {
    const p = pose(t), oil = mixHex(OIL_NEW, OIL_OLD, age(t));
    const keep = { 'oil-sump': oil, gallery: oil, ...(o.keep || {}) };
    return HO.draw(ctx, ENG, cam, {
      hue: o.hue, spin: o.spin || 0, scan: o.scan, scanDown: o.scanDown, gain: o.gain ?? 1, glow: o.glow ?? 1, lineWidth: 1.5,
      explode: { piston: p.dy, 'piston-rings': p.dy, 'wrist-pin': p.dy, rod: p.dy },
      angle: { 'crank-main': p.ang, 'crank-webs': p.ang, 'crank-pin': p.ang, rod: p.al },
      keep, focus: o.focus, dim: o.dim, flash: o.flash, only: o.only,
    });
  };
  // pontinhos do óleo andando pela galeria
  const drawFlow = (ctx, P, t, a) => {
    if (a <= 0) return;
    const col = mixHex(OIL_NEW, OIL_OLD, age(t)), f = flowPos(t) * 0.55;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col;
    for (const path of GALLERY) {
      const segs = []; let Ltot = 0;
      for (let i = 0; i < path.length - 1; i++) { const d = Math.hypot(...path[i + 1].map((x, j) => x - path[i][j])); segs.push(d); Ltot += d; }
      for (let s = (f % 0.07); s < Ltot; s += 0.07) {
        let r = s, i = 0; while (i < segs.length - 1 && r > segs[i]) { r -= segs[i]; i++; }
        const u = r / segs[i], pt = path[i].map((x, j) => lerp(x, path[i + 1][j], u)), sp = P(...pt);
        ctx.globalAlpha = a * (0.55 + 0.45 * hash(Math.floor(s * 100))); ctx.fillRect(sp[0] - 2, sp[1] - 2, 4, 4);
      }
    }
    ctx.restore();
  };

  // ---------- lupa 2D: parede do cilindro | película | anel do pistão ----------
  const drawLoupe = (ctx, Th, lx, ly, lr, t, a, frame) => {
    if (a <= 0 || lr < 4) return;
    const ag = age(t), sl = sludge(t), fm = film(t), oil = mixHex(OIL_NEW, OIL_OLD, ag);
    const contact = t >= C.metal2 && t < S.fix ? 1 : 0, frozen = t >= C.trava && t < S.fix;
    const ph = theta(t) * TAU, py = Math.cos(ph) * 0.3 * lr;
    const xw = lx - 0.32 * lr, gap = lerp(2, 0.2 * lr, fm), xr = xw + gap;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.fillStyle = 'rgba(1,8,12,0.9)'; ctx.fill();
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    // parede (hachura)
    ctx.strokeStyle = Th.dim(0.32 * a); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let k = -30; k < 30; k++) { const x0 = lx - lr + k * 18; ctx.moveTo(x0, ly + lr); ctx.lineTo(x0 + 2 * lr, ly - lr); }
    ctx.save(); ctx.beginPath(); ctx.rect(lx - lr, ly - lr, xw - (lx - lr), 2 * lr); ctx.clip();
    ctx.strokeStyle = Th.dim(0.3 * a); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let k = -30; k < 30; k++) { const x0 = lx - 2 * lr + k * 18; ctx.moveTo(x0, ly + lr); ctx.lineTo(x0 + 2 * lr, ly - lr); }
    ctx.stroke(); ctx.restore();
    ctx.strokeStyle = contact ? (frozen ? Th.hi(0.9 * a) : `rgba(255,${120 + 100 * hash(frame)},90,${a})`) : Th.line(0.95 * a); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(xw, ly - lr); ctx.lineTo(xw, ly + lr); ctx.stroke();
    // película de óleo: faixa + traços que cisalham (parede parada, anel em movimento)
    ctx.fillStyle = oil + '40'; ctx.fillRect(xw, ly - lr, gap, 2 * lr);
    const nS = 46, flowOff = flowPos(t) * 30 * (1 - sl * 0.9);
    ctx.strokeStyle = oil; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i < nS; i++) {
      const fx = hash(i * 3.1), base = (hash(i * 7.7) * 2 - 1) * lr * 1.2;
      const y = ly + (((base + fx * py + flowOff * (0.3 + fx)) % (2.4 * lr)) + 2.4 * lr) % (2.4 * lr) - 1.2 * lr;
      const x = xw + 2 + fx * Math.max(0, gap - 4), len = 6 + 10 * (1 - sl);
      ctx.moveTo(x, y); ctx.lineTo(x, y + len);
    }
    ctx.globalAlpha = a * (0.9 - 0.5 * ag); ctx.stroke(); ctx.globalAlpha = a;
    // borra: grumos
    if (sl > 0) for (let i = 0; i < 18; i++) {
      const y = ly + (hash(i * 5.3) * 2 - 1) * lr, rr = (5 + 9 * hash(i * 2.2)) * sl * Math.max(0.3, fm);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(60,38,12,${0.85 * a * sl})`;
      ctx.beginPath(); ctx.arc(xw + gap * (0.2 + 0.6 * hash(i * 9.1)), y, rr, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
    }
    // fuligem (pontos escuros) e limalha (traços claros)
    const nSoot = Math.floor(ag * 38), nMet = Math.floor(ag * 12);
    for (let i = 0; i < nSoot; i++) {
      const fx = hash(i * 1.7 + 40), y = ly + (((hash(i * 4.3 + 40) * 2 - 1) * lr * 1.2 + fx * py + flowOff * 0.5) % (2.4 * lr) + 2.4 * lr) % (2.4 * lr) - 1.2 * lr;
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(8,6,4,${0.95 * a})`;
      ctx.beginPath(); ctx.arc(xw + 3 + fx * Math.max(0, gap - 6), y, 3.2, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = Th.hi(0.85 * a); ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < nMet; i++) {
      const fx = hash(i * 2.9 + 80), y = ly + (((hash(i * 6.1 + 80) * 2 - 1) * lr * 1.2 + fx * py) % (2.4 * lr) + 2.4 * lr) % (2.4 * lr) - 1.2 * lr;
      const x = xw + 3 + fx * Math.max(0, gap - 6); ctx.moveTo(x - 3, y - 2); ctx.lineTo(x + 3, y + 2);
    }
    ctx.stroke();
    // pistão + anéis (sobem e descem com o virabrequim)
    const land = xr + 0.08 * lr, rh = 0.14 * lr, rw = 0.26 * lr;
    ctx.fillStyle = Th.line(0.07 * a); ctx.fillRect(land, ly - 1.2 * lr, lx + lr - land, 2.4 * lr);   // corpo do pistão
    ctx.strokeStyle = Th.line(0.95 * a); ctx.lineWidth = 2.2; ctx.beginPath();
    for (const k of [-1, 0, 1]) {
      const ry = ly + py + k * 0.46 * lr;
      ctx.rect(xr, ry - rh / 2, rw, rh);                                          // anel
      ctx.moveTo(land, ry - rh / 2 - 7); ctx.lineTo(xr + rw + 10, ry - rh / 2 - 7); ctx.lineTo(xr + rw + 10, ry + rh / 2 + 7); ctx.lineTo(land, ry + rh / 2 + 7);   // canaleta
    }
    ctx.moveTo(land, ly - 1.2 * lr); ctx.lineTo(land, ly + 1.2 * lr);
    ctx.stroke();
    ctx.fillStyle = Th.line(0.2 * a);
    for (const k of [-1, 0, 1]) { const ry = ly + py + k * 0.46 * lr; ctx.fillRect(xr, ry - rh / 2, rw, rh); }
    ctx.strokeStyle = Th.dim(0.22 * a); ctx.lineWidth = 1; ctx.beginPath();
    for (let x = xr + rw + 34; x < lx + lr; x += 24) { ctx.moveTo(x, ly - lr); ctx.lineTo(x, ly + lr); }
    ctx.stroke();
    if (lr > 150) {                                                                 // nomes das três coisas da lupa
      ctx.font = `600 ${Math.round(Math.max(26, lr * 0.09))}px ${U.FONT.ui}`; ctx.letterSpacing = '2px'; ctx.textBaseline = 'middle';
      ctx.fillStyle = Th.line(0.75 * a); ctx.textAlign = 'right'; ctx.fillText('PAREDE', xw - 12, ly - 0.62 * lr);
      ctx.textAlign = 'left'; ctx.fillText('PISTÃO', xr + rw + 26, ly - 0.62 * lr);
      ctx.fillText('ANEL', xr + rw + 26, ly + py + 0.08 * lr); ctx.letterSpacing = '0px';
    }
    // faíscas no contato metal-metal
    if (contact && !frozen) {
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 26; i++) {
        const h1 = hash(frame * 3.3 + i), h2 = hash(frame * 7.1 + i * 2), y0 = ly + py + (h2 * 2 - 1) * 0.6 * lr;
        const an = Math.PI * (0.75 + 0.5 * h1), ln = 14 + 50 * hash(i + frame);
        ctx.strokeStyle = i % 3 ? `rgba(255,${150 + 90 * h1},120,${a})` : Th.hi(a);
        ctx.beginPath(); ctx.moveTo(xw, y0); ctx.lineTo(xw + Math.cos(an) * ln, y0 - Math.sin(an) * ln * 0.6); ctx.stroke();
      }
    }
    ctx.restore();
    // moldura
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    ctx.strokeStyle = Th.line(0.9); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.stroke();
    ctx.strokeStyle = Th.line(0.5); ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < 72; i++) { const th = i / 72 * TAU, r2 = lr + (i % 6 ? 6 : 13); ctx.moveTo(lx + Math.cos(th) * (lr + 2), ly + Math.sin(th) * (lr + 2)); ctx.lineTo(lx + Math.cos(th) * r2, ly + Math.sin(th) * r2); }
    ctx.stroke();
    ctx.restore();
    return { xw, gap, ly, py };
  };

  // ---------- tipografia ----------
  let TX = [];
  const txt = (id, text, x0, y0, x1, y1, pass) => TX.push({ id, text, x0, y0, x1, y1, ...(pass ? { pass: true } : {}) });
  const tag = (ctx, Th, x, y, label, a, o = {}) => {        // etiqueta: placa + índice + rótulo; lit = falada/travada
    if (a <= 0) return 0;
    ctx.save(); ctx.font = `600 34px ${U.FONT.ui}`; ctx.letterSpacing = '2px';
    const w = ctx.measureText(label).width + (o.idx ? 90 : 46), h = 62;
    U.plate(ctx, Th, x, y, w, h, a);
    ctx.globalCompositeOperation = 'lighter';
    if (o.lit) { ctx.strokeStyle = Th.hi(0.9 * a); ctx.lineWidth = 1.6; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    if (o.idx) { ctx.font = `24px ${U.FONT.mono}`; ctx.letterSpacing = '0px'; ctx.fillStyle = o.lit ? Th.acc(a) : Th.dim(0.8 * a); ctx.fillText(o.idx, x + 16, y + h / 2 + 1); }
    ctx.font = `600 34px ${U.FONT.ui}`; ctx.letterSpacing = '2px';
    ctx.fillStyle = o.lit ? Th.hi(a) : Th.line(0.62 * a);
    const tx = x + (o.idx ? 64 : 23); ctx.fillText(U.rollText(label, o.roll ?? 1, o.frame || 0, 5), tx, y + h / 2 + 1);
    ctx.restore();
    txt('tag:' + label, label, x, y, x + w, y + h);
    return w;
  };
  const row = (ctx, Th, items, y, a, frame) => {             // fileira centralizada de etiquetas
    ctx.save(); ctx.font = `600 34px ${U.FONT.ui}`; ctx.letterSpacing = '2px';
    const ws = items.map(it => ctx.measureText(it.label).width + (it.idx ? 90 : 46)); ctx.restore();
    const gap = 18, tot = ws.reduce((s, w) => s + w, 0) + gap * (items.length - 1);
    let x = 520 - tot / 2;
    items.forEach((it, i) => { tag(ctx, Th, x, y, it.label, a * (it.a ?? 1), { ...it, frame }); x += ws[i] + gap; });
    return [520 - tot / 2, 520 + tot / 2];
  };
  // ambulância: posição de um ponto do furgão já com o mergulho do freio (gira em torno do contato da roda dianteira)
  const vp = (x, y, z, vs) => { const c = Math.cos(vs.pitch), s = Math.sin(vs.pitch), X = x - VAN.WX[0]; return [VAN.WX[0] + X * c - y * s + vs.dx, X * s + y * c, z]; };
  const sirenGlow = (ctx, cam, vs, blink, a) => {            // brilho do giroflex: vermelho e branco alternando
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
  const vanName = (ctx, Th, cam, vs, k, frame, a) => {      // nome pintado na lateral do baú, rolando até travar
    if (a <= 0 || k <= 0) return;
    const P = makeCamera(cam, W, H).project, sd = VAN.side, z = VAN.HZ * 1.01;
    const pt = (x, y) => { const q = vp(x, y, z, vs), o = [0, 0, 0]; P(q[0], q[1], q[2], o); return o; };
    const O = pt(sd.x0, sd.y1), X = pt(sd.x1, sd.y1), Y = pt(sd.x0, sd.y0);
    const LW = 1000, LH = 1000 * (sd.y1 - sd.y0) / (sd.x1 - sd.x0), locked = k >= 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    ctx.setTransform((X[0] - O[0]) / LW, (X[1] - O[1]) / LW, (Y[0] - O[0]) / LH, (Y[1] - O[1]) / LH, O[0], O[1]);
    const s = LH - 40, c0 = 20 + s / 2, c1 = LH / 2, b = s * 0.17, kc = eo(seg(k, 0, 0.4));   // cruz de socorro
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(2,10,16,${0.6 * kc})`; ctx.fillRect(0, 0, LW, LH);   // painel pintado: o carro lá dentro não embaralha o nome
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = Th.line(0.45 * kc); ctx.lineWidth = 3; ctx.strokeRect(0, 0, LW, LH);
    ctx.fillStyle = Th.acc(0.95 * kc); ctx.beginPath(); ctx.rect(c0 - b, c1 - s / 2, 2 * b, s); ctx.rect(c0 - s / 2, c1 - b, s, 2 * b); ctx.fill();   // um só preenchimento: o centro não estoura
    ctx.strokeStyle = Th.line(0.8 * kc); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(c0, c1, s * 0.62, 0, TAU); ctx.stroke();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.letterSpacing = '6px';
    let fs = 130; for (; fs > 60; fs -= 4) { ctx.font = `600 ${fs}px ${U.FONT.ui}`; if (ctx.measureText('PS AUTOMÓVEL').width <= LW - s - 70) break; }
    const x0 = s + 60, yb = LH * 0.6;
    ctx.font = `600 ${fs}px ${U.FONT.ui}`; ctx.fillStyle = locked ? Th.acc(1) : Th.line(0.85);
    const ps = U.rollText('PS', k, frame, 1); ctx.fillText(ps, x0, yb); const w = ctx.measureText('PS ').width;
    ctx.font = `500 ${fs}px ${U.FONT.ui}`; ctx.fillStyle = locked ? Th.hi(1) : Th.line(0.85);
    ctx.fillText(U.rollText('AUTOMÓVEL', clamp(k * 1.15 - 0.15), frame, 2), x0 + w, yb);
    ctx.font = `52px ${U.FONT.mono}`; ctx.letterSpacing = '8px'; ctx.fillStyle = Th.line(0.9);
    ctx.fillText(U.rollText('RESGATE AUTOMOTIVO', clamp(k * 1.3 - 0.3), frame, 3), x0 + 4, LH * 0.9);
    ctx.restore();
    txt('title', 'PS AUTOMÓVEL', Math.min(O[0], Y[0]), O[1], X[0], Y[1]);
  };
  const tagline = (ctx, Th, k, frame, a, y) => {
    if (a <= 0 || k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.textAlign = 'center';
    ctx.font = `42px ${U.FONT.mono}`; ctx.letterSpacing = '4px'; ctx.fillStyle = k >= 1 ? Th.line(0.95) : Th.dim(0.8);
    ctx.fillText(U.rollText('SEU CARRO SEMPRE EM BOAS MÃOS.', k, frame, 4), 540 + 3, y);
    ctx.strokeStyle = Th.line(0.6); ctx.lineWidth = 1.2; const w = 230 * eo(k);
    ctx.beginPath(); ctx.moveTo(540 - 330 - w * 0, y + 36); ctx.lineTo(540 - 330 + w, y + 36); ctx.moveTo(540 + 330, y + 36); ctx.lineTo(540 + 330 - w, y + 36); ctx.stroke();
    ctx.restore();
    txt('tagline', 'SEU CARRO SEMPRE EM BOAS MÃOS.', 80, y - 44, 1000, y + 12);
  };

  // ---------- legenda karaokê ----------
  const LINES = Object.keys(vo).sort((a, b) => vo[a] - vo[b]);
  const subOf = t => {
    for (let i = 0; i < LINES.length; i++) {
      const id = LINES[i], s0 = vo[id] - 0.1, nxt = i + 1 < LINES.length ? vo[LINES[i + 1]] - 0.12 : DUR;
      const s1 = Math.min(nxt, end(id) + 0.6);
      if (t >= s0 && t < s1) return { id, s0, s1 };
    }
    return null;
  };
  const SUBTEXT = {};
  // legenda grande (acessibilidade): 62 px, no máximo 2 linhas por vez; quando a fala passa da 2ª linha, vira a página
  const SUB_PX = 62, SUB_W = 780, SUB_Y = 1500;
  const drawSub = (ctx, Th, t) => {
    const s = subOf(t); if (!s || s.id === 'L13') return;
    const list = words[s.id], text = SUBTEXT[s.id];
    const a = clamp((t - s.s0) / 0.1) * clamp((s.s1 - t) / 0.12);
    ctx.save(); ctx.font = `600 ${SUB_PX}px ${U.FONT.ui}`; ctx.textBaseline = 'alphabetic';
    const toks = text.split(' '), lines = []; let cur = [], wcur = 0; const sp = ctx.measureText(' ').width;
    for (const tk of toks) { const w = ctx.measureText(tk).width; if (cur.length && wcur + sp + w > SUB_W) { lines.push(cur); cur = []; wcur = 0; } cur.push(tk); wcur += (cur.length > 1 ? sp : 0) + w; }
    if (cur.length) lines.push(cur);
    const lineOf = []; lines.forEach((l, li) => l.forEach(() => lineOf.push(li)));
    let said = 0; for (const W0 of list) if (t >= vo[s.id] + W0.t0 - 0.02) said++;
    const p0 = Math.floor(lineOf[Math.min(Math.max(0, said - 1), lineOf.length - 1)] / 2) * 2, page = lines.slice(p0, p0 + 2);
    let wi = lines.slice(0, p0).reduce((n, l) => n + l.length, 0);
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
      for (const tk of ln) {
        const W0 = list[Math.min(wi, list.length - 1)], sd = t >= vo[s.id] + W0.t0 - 0.02;
        ctx.fillStyle = sd ? Th.hi(0.97 * a) : Th.line(0.62 * a); ctx.fillText(tk, x, y);
        x += ctx.measureText(tk).width + sp; wi++;
      }
    });
    ctx.restore();
    txt('sub:' + s.id, page.map(l => l.join(' ')).join(' '), x0 - 70, y0 - 24, x0 + tw + 34, y0 + hh + 16);
  };

  // ---------- quadro ----------
  const render = (ctx, t, opt = {}) => {
    TX = [];
    const frame = Math.floor(t * FPS + 1e-6), red = isRed(t), Th = red ? TRd : T;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    U.background(ctx, W, H, Th, { cx: 540, cy: 900, px: t * 6, py: t * 3 });
    let status = '';
    const inBolt = t >= S.intro && t < S.motor || t >= S.outro;
    if (!inBolt) {
      // ===== motor =====
      const cam = camEngine(t), spin = t >= S.fix ? (t - S.fix) * 0.42 : 0, P = projector(cam, spin), p = pose(t);
      let gain = 1, scan = null, scanDown = null, focus = null, dim = 0.3, keep = {}, flash = null;
      if (t < S.intro) { scanDown = t > 4.12 ? { y: lerp(1.6, -0.7, seg(t, 4.12, 4.45)) } : null; status = t < SEIZE0 ? 'ALERTA · ÓLEO VENCIDO' : 'MOTOR TRAVADO'; }
      else if (t < S.funcoes) { const k = seg(t, S.motor, S.motor + 1.6); if (k < 1) scan = { y: lerp(-0.62, 1.5, k), band: 0.08 }; status = k < 1 ? `SCAN DO MOTOR · ${String(Math.round(k * 100)).padStart(3, '0')}%` : 'MOTOR · EM RODAGEM'; }
      else if (t < S.desgaste) status = 'ÓLEO · PELÍCULA ATIVA';
      else if (t < S.silencio) status = t < C.borra ? 'ÓLEO · DEGRADANDO' : 'ÓLEO · BORRA DETECTADA';
      else if (t < S.fix) { status = t < C.trava ? 'ALERTA · ATRITO METAL-METAL' : 'MOTOR TRAVADO'; }
      else if (t < S.outro) { const k = seg(t, S.fix, S.fix + 1.8); if (k < 1) scan = { y: lerp(-0.62, 1.5, k), band: 0.08 }; if (t > 73.6) scanDown = { y: lerp(1.6, -0.7, seg(t, 73.6, 74.0)) }; status = 'ÓLEO NOVO · OK'; }
      // ganho: o motor recua atrás da lupa grande na virada, apaga no travamento
      if (t >= S.virada && t < S.fix) gain = lerp(0.85, 0.32, seg(t, S.virada, S.virada + 0.6)) * (t > S.travou ? lerp(1, 0.25, seg(t, S.travou, S.fix - 0.1)) : 1);
      if (t >= C.metal && t < C.metal + 0.12) flash = { pistao: 1, cilindro: 1 };
      if (t >= S.funcoes && t < S.virada) keep['piston-rings'] = '#e9fbff';
      if (t >= S.fix + 1 && t < vo.L11 && t > C.filtro - 0.3) { focus = 'filtro'; dim = 0.45; }
      if (t > 60 && t < S.outro) gain = Math.min(gain, 1);
      drawPad(ctx, cam, W, H, { hue: Th.hue, rot: t * 0.12, alpha: (t < S.intro ? 0.6 : 0.9) * gain * (scanDown ? 0.4 : 1), y: -0.62 });
      if (scan) drawScanPlane(ctx, cam, W, H, scan.y, { hue: Th.hue, r: 0.75, rot: t * 0.5 });
      const info = drawEngine(ctx, t, cam, { hue: Th.hue, spin, scan, scanDown, gain, focus, dim, keep, flash });
      // "50 vezes por segundo": fantasmas do pistão e da biela
      const blur = seg(t, C.rpm, C.rpm + 0.6) * (1 - seg(t, end('L03') + 0.4, end('L03') + 1.2));
      if (blur > 0.01) for (let k = 1; k <= 4; k++) {
        const tt = t + k * 0.06 * blur;
        drawEngine(ctx, tt, cam, { hue: Th.hue, spin, gain: 0.32 * blur, glow: 0.4, only: ['pistao', 'biela', 'virabrequim'] });
      }
      if (t >= S.motor && t < S.virada) drawFlow(ctx, P, t, (scan ? 0 : 1) * gain);
      if (t >= S.fix + 1 && t < 73.6) drawFlow(ctx, P, t, 1);
      // caixas de alvo
      const pistBox = () => bboxOf(P, boxPts(0, PIN + 0.045 + p.dy, 0, 0.29, 0.2, 0.29));
      const brgBox = () => bboxOf(P, boxPts(p.pin[0], p.pin[1], 0, 0.15, 0.15, 0.1));
      if (t < S.intro) { const k = seg(t, 0.3, 0.55) * (1 - seg(t, SEIZE0 + 0.05, SEIZE0 + 0.15)); U.targetBox(ctx, Th, brgBox(), k, { tag: 'TGT 01 · MANCAL', flash: Math.abs(t - 0.55) < 0.08 }); }
      if (t >= S.motor && t < S.funcoes) { const k = seg(t, C.metal - 0.22, C.metal) * (1 - seg(t, vo.L03 + 0.2, vo.L03 + 0.5)); U.targetBox(ctx, Th, pistBox(), k, { tag: 'TGT 01 · PISTÃO', flash: Math.abs(t - C.metal) < 0.06 }); }
      if (t >= S.fix && t < vo.L11) { const k = seg(t, C.filtro - 0.22, C.filtro) * (1 - seg(t, vo.L11 - 0.3, vo.L11)); if (k > 0) U.targetBox(ctx, Th, info.bbox.filtro, k, { tag: 'TGT 02 · FILTRO', flash: Math.abs(t - C.filtro) < 0.06 }); }
      // lupa
      let LA = 0, lx = 540, ly = 395, lr = 215;
      if (t >= S.funcoes && t < S.fix) {
        LA = seg(t, 22.3, 22.6);
        const big = eo(seg(t, S.virada, S.virada + 0.55));
        lx = 540; ly = lerp(395, 760, big); lr = lerp(215, 400, big) * eo(seg(t, 22.3, 22.75));
        if (t > S.travou) LA *= lerp(1, 0.55, seg(t, S.travou, S.fix));
      }
      if (LA > 0) {
        const anc = P(0.27, PIN + 0.22 - 0.07 + p.dy, 0.0);
        const prog = seg(t, 22.5, 23.0) * (1 - seg(t, S.virada, S.virada + 0.3));
        if (prog > 0) U.leader(ctx, Th, [anc[0], anc[1]], [anc[0] + 120, ly + lr + 40], [lx + lr * 0.5, ly + lr * 0.87], prog, { alpha: LA });
        const L0 = drawLoupe(ctx, Th, lx, ly, lr, t, LA, frame);
        // rótulos da lupa
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `26px ${U.FONT.mono}`; ctx.textAlign = 'center';
        ctx.fillStyle = Th.line(0.8 * LA); ctx.fillText('LUPA · FORA DE ESCALA', lx, ly - lr - 26);
        ctx.restore();
        txt('lupa', 'LUPA · FORA DE ESCALA', lx - 180, ly - lr - 50, lx + 180, ly - lr - 18, true);
        let lab = '', la = 0;
        if (t < S.desgaste) { lab = 'PELÍCULA DE ÓLEO'; la = seg(t, C.pel - 0.1, C.pel + 0.4); }
        else if (t < C.borra) { lab = 'ÓLEO GASTO · FULIGEM'; la = seg(t, C.fuligem - 0.2, C.fuligem + 0.3); }
        else if (t < S.virada) { lab = 'BORRA'; la = 1; }
        else if (t < C.trava) { lab = 'SEM PELÍCULA'; la = seg(t, C.semPel, C.semPel + 0.3); }
        else { lab = 'MOTOR TRAVADO'; la = 1; }
        if (la > 0 && lr > 100) {
          const lyy = ly + lr - 52;
          ctx.save(); ctx.font = `600 32px ${U.FONT.ui}`; ctx.letterSpacing = '3px'; const w = ctx.measureText(lab).width + 40; ctx.restore();
          U.plate(ctx, Th, L0.xw - 6, lyy - 24, w, 52, LA * la);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `600 32px ${U.FONT.ui}`; ctx.letterSpacing = '3px'; ctx.textBaseline = 'middle';
          ctx.fillStyle = Th.hi(LA * la); ctx.fillText(U.rollText(lab, clamp(la * 1.4), frame, 7), L0.xw + 11, lyy + 2); ctx.restore();
          txt('lupa:' + lab, lab, L0.xw - 6, lyy - 24, L0.xw - 6 + w, lyy + 28);
        }
      }
      // ===== painéis de cada seção =====
      if (t >= S.motor && t < S.funcoes) {
        // cartões 3.000 RPM e 50 /s, depois viram etiquetas
        const c1 = { label: 'Rotação do motor', value: '3.000', unit: 'RPM' }, c2 = { label: 'Ciclos de cada pistão', value: '50', unit: 'POR S', detail: '3.000 ÷ 60 = 50 voltas por segundo' };
        const r1 = seg(t, vo.L03 - 0.1, vo.L03 + 0.35) * (1 - seg(t, C.cinq - 0.35, C.cinq - 0.1));
        const r2 = seg(t, C.cinq - 0.25, C.cinq + 0.2) * (1 - seg(t, 21.0, 21.35));
        if (r1 > 0) U.specCard(ctx, Th, 110, 196, c1, { reveal: r1, roll: seg(t, C.rpm - 0.6, C.rpm), frame, flash: Math.abs(t - C.rpm) < 0.05 }, { w: 840, big: 150, index: '01' });
        if (r2 > 0) U.specCard(ctx, Th, 110, 196, c2, { reveal: r2, roll: seg(t, C.cinqLock - 0.6, C.cinqLock), detail: seg(t, C.cinqLock, C.cinqLock + 0.6), frame, flash: Math.abs(t - C.cinqLock) < 0.05 }, { w: 840, big: 150, index: '02' });
        if (r1 > 0) txt('c1', '3.000 RPM ROTAÇÃO DO MOTOR', 88, 176, 972, 420);
        if (r2 > 0) txt('c2', '50 POR S CICLOS DE CADA PISTÃO 3.000 ÷ 60 = 50 voltas por segundo', 88, 176, 972, 470);
        const d1 = seg(t, 21.0, 21.3), d2 = seg(t, 21.25, 21.55);
        if (d1 > 0) row(ctx, Th, [{ label: 'MOTOR · 3.000 RPM', idx: '01', lit: true, a: d1 }, { label: 'PISTÃO · 50/S', idx: '02', lit: true, a: d2 }], 1226 + 20 * (1 - eo(d1)), 1, frame);
      }
      if (t >= S.funcoes && t < S.desgaste + 0.6) {
        const out = 1 - seg(t, S.desgaste, S.desgaste + 0.5);
        const F = ['LUBRIFICA', 'RESFRIA', 'LIMPA', 'VEDA', 'PROTEGE'];
        const items = F.map((l, i) => ({ label: l, idx: '0' + (i + 1), lit: t >= C.fn[i], a: Math.max(seg(t, C.fn[i] - 0.15, C.fn[i] + 0.1), t > vo.L05 - 0.3 ? 0.3 : 0), roll: seg(t, C.fn[i] - 0.1, C.fn[i] + 0.25) }));
        row(ctx, Th, items.slice(0, 3), 1150, out, frame); row(ctx, Th, items.slice(3), 1226, out, frame);
      }
      if (t >= S.desgaste && t < S.silencio + 0.3) {
        // medidores: estado do óleo, aditivos, fuligem (sem números inventados)
        const a = seg(t, S.desgaste + 0.4, S.desgaste + 0.9) * (1 - seg(t, S.silencio, S.silencio + 0.3)), ag = age(t);
        if (a > 0) {
          U.plate(ctx, Th, 100, 1150, 880, 166, a);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
          ctx.font = `26px ${U.FONT.mono}`; ctx.fillStyle = Th.line(0.85); ctx.textAlign = 'left'; ctx.fillText('ESTADO DO ÓLEO', 124, 1186);
          const bx = 124, bw = 832, by = 1202;
          const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, OIL_NEW + 'cc'); g.addColorStop(1, OIL_OLD + 'cc');
          ctx.fillStyle = g; ctx.fillRect(bx, by, bw, 8);
          ctx.fillStyle = Th.hi(1); const nx = bx + bw * ag; ctx.fillRect(nx - 1.5, by - 10, 3, 28);
          ctx.beginPath(); ctx.moveTo(nx - 8, by - 12); ctx.lineTo(nx + 8, by - 12); ctx.lineTo(nx, by - 2); ctx.fill();
          ctx.font = `600 28px ${U.FONT.ui}`; ctx.letterSpacing = '2px';
          [['NOVO', 0, 'left'], ['GASTO', 0.5, 'center'], ['VENCIDO', 1, 'right']].forEach(([s, u, al]) => { ctx.textAlign = al; ctx.fillStyle = Math.abs(ag - u) < 0.25 ? Th.hi(1) : Th.line(0.5); ctx.fillText(s, bx + bw * u, by + 46); });
          ctx.letterSpacing = '0px'; ctx.textAlign = 'left'; ctx.font = `24px ${U.FONT.mono}`;
          const meter = (x, label, v) => { ctx.fillStyle = Th.line(0.85); ctx.fillText(label, x, 1294); for (let i = 0; i < 10; i++) { ctx.fillStyle = i < Math.round(v * 10) ? Th.line(0.9) : Th.dim(0.25); ctx.fillRect(x + 150 + i * 24, 1278, 16, 18); } };
          meter(124, 'ADITIVOS', 1 - ag * 0.85); meter(560, 'FULIGEM', ag);
          ctx.restore();
          txt('gauge', 'ESTADO DO ÓLEO NOVO GASTO VENCIDO ADITIVOS FULIGEM', 100, 1150, 980, 1316);
        }
      }
      if (t >= S.virada && t < S.fix) {
        const a = seg(t, C.metal2, C.metal2 + 0.2) * (1 - seg(t, S.fix - 0.4, S.fix));
        if (a > 0) {
          const lab = t < C.trava ? 'ATRITO METAL-METAL' : 'MOTOR TRAVADO';
          ctx.save(); ctx.font = `600 46px ${U.FONT.ui}`; ctx.letterSpacing = '4px'; const w = ctx.measureText(lab).width + 64; ctx.restore();
          U.plate(ctx, Th, 540 - w / 2, 214, w, 80, a);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `600 46px ${U.FONT.ui}`; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = (t < C.trava && frame % 6 < 3) ? Th.line(a) : Th.hi(a); ctx.fillText(lab, 542, 256); ctx.restore();
          txt('alerta:' + lab, lab, 540 - w / 2, 214, 540 + w / 2, 294);
        }
      }
      if (t >= S.fix && t < S.outro) {
        const c1 = { label: 'Óleo + filtro', value: 'NO PRAZO', unit: '', detail: 'Do manual do seu carro' };
        const c2 = { label: 'Uso severo', value: 'MENOR', unit: '', detail: 'Intervalo de troca: veja a tabela do manual' };
        const r1 = seg(t, vo.L10 + 0.4, vo.L10 + 0.8) * (1 - seg(t, C.severo - 0.2, C.severo + 0.1));
        const r2 = seg(t, C.severo, C.severo + 0.4) * (1 - seg(t, vo.L12 - 0.3, vo.L12));
        if (r1 > 0) { U.specCard(ctx, T, 110, 196, c1, { reveal: r1, roll: seg(t, C.manual - 0.5, C.manual), detail: seg(t, C.manual, C.manual + 0.5), frame, flash: Math.abs(t - C.manual) < 0.05 }, { w: 840, big: 130, index: '01' }); txt('f1', 'ÓLEO + FILTRO NO PRAZO Do manual do seu carro', 88, 176, 972, 470); }
        if (r2 > 0) { U.specCard(ctx, T, 110, 196, c2, { reveal: r2, roll: seg(t, C.menor - 0.4, C.menor), detail: seg(t, C.menor, C.menor + 0.5), frame, flash: Math.abs(t - C.menor) < 0.05 }, { w: 840, big: 130, index: '02' }); txt('f2', 'USO SEVERO MENOR Intervalo de troca: veja a tabela do manual', 88, 176, 972, 470); }
        // etiquetas do uso severo + colchete
        const ta = 1 - seg(t, vo.L12 - 0.3, vo.L12);
        if (t > C.pouco - 0.2 && ta > 0) {
          const items = [['TRAJETOS CURTOS', C.pouco], ['TRÂNSITO', C.transito], ['POEIRA', C.poeira]].map(([l, tt]) => ({ label: l, lit: t >= tt, a: seg(t, tt - 0.15, tt + 0.1), roll: seg(t, tt - 0.1, tt + 0.25) }));
          const [x0, x1] = row(ctx, T, items, 1226, ta, frame);
          const b = eo(seg(t, C.severo, C.severo + 0.4)) * ta;
          if (b > 0) {
            U.plate(ctx, T, 400, 1136, 240, 44, b);
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.hi(0.9 * b); ctx.lineWidth = 1.6; ctx.beginPath();
            ctx.moveTo(x0, 1210); ctx.lineTo(x0, 1196); ctx.lineTo(x1, 1196); ctx.lineTo(x1, 1210); ctx.moveTo(520, 1196); ctx.lineTo(520, 1180); ctx.stroke();
            ctx.font = `600 30px ${U.FONT.ui}`; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = T.hi(b); ctx.fillText('USO SEVERO', 522, 1159); ctx.restore();
            txt('severo', 'USO SEVERO', 400, 1136, 640, 1180);
          }
        }
        // custo: troca × motor (barras ilustrativas)
        const ca = seg(t, vo.L12 - 0.1, vo.L12 + 0.3) * (1 - seg(t, 73.4, 73.7));
        if (ca > 0) {
          U.plate(ctx, T, 100, 190, 880, 250, ca);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = ca;
          ctx.font = `26px ${U.FONT.mono}`; ctx.fillStyle = T.line(0.85); ctx.fillText('CUSTO · ESCALA ILUSTRATIVA', 128, 232);
          const bar = (y, label, w, k) => {
            ctx.font = `600 40px ${U.FONT.ui}`; ctx.letterSpacing = '3px'; ctx.fillStyle = T.hi(1); ctx.fillText(label, 128, y);
            ctx.letterSpacing = '0px'; ctx.fillStyle = T.line(0.25); ctx.fillRect(350, y - 28, 590, 28);
            ctx.fillStyle = label.includes('MOTOR') ? T.line(0.9) : T.acc(1); ctx.fillRect(350, y - 28, 590 * w * eo(k), 28);
          };
          bar(300, 'TROCA', 0.05, seg(t, C.troca - 0.1, C.troca + 0.5)); bar(380, 'MOTOR', 1, seg(t, C.motor12 - 0.1, C.motor12 + 0.9));
          ctx.restore();
          txt('custo', 'CUSTO ESCALA ILUSTRATIVA TROCA MOTOR', 100, 190, 980, 440);
        }
      }
      if (t >= C.metal2 && t < C.metal2 + 0.125) U.glitch(ctx, W, H, 0.8, frame);
      if (t < S.intro && t > SEIZE0 - 0.02 && t < SEIZE0 + 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = TRd.line(0.18); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    } else {
      // ===== ambulância do PS Automóvel: vinheta (chega vazia) e final (vai embora com o carro na maca) =====
      const vs = vanState(t), cam = camVan(t, vs.dx);
      let scan = null, scanDown = null;
      if (t < S.motor) {
        if (t < 4.85) scan = { y: lerp(-0.2, 1.5, seg(t, S.intro, 4.85)), band: 0.07 };
        if (t > 9.45) scanDown = { y: lerp(1.6, -0.2, seg(t, 9.45, 9.95)) };
      } else if (t < 74.4) scan = { y: lerp(-0.2, 1.5, seg(t, 74.0, 74.4)), band: 0.07 };
      if (scan) drawScanPlane(ctx, cam, W, H, scan.y, { hue: T.hue, r: 1.8, rot: t * 0.5 });
      HO.draw(ctx, ROAD, cam, { hue: T.hue, scan, scanDown, lineWidth: 1.3, gain: 0.7 });
      const door = 'portas' + vs.door, blink = Math.floor(t * 7) % 2;
      const angle = { wheelF: vs.wheel, wheelR: vs.wheel };
      for (const id of ['body', 'inside', 'lights', 'maca', 'car', door]) angle[id] = vs.pitch;
      HO.draw(ctx, VANM, cam, { hue: T.hue, scan, scanDown, only: ['furgao', 'luzes', 'rodas', door].concat(vs.cargo ? ['carga'] : []),
        explode: { furgao: vs.dx, luzes: vs.dx, rodas: vs.dx, carga: vs.dx, [door]: vs.dx }, angle, lineWidth: 1.5, glow: 1.1,
        keep: { lights: blink ? '#ff3b4a' : '#eaf6ff', car: '#ffa25a' } });
      const tA = t < S.motor ? 1 - seg(t, 9.45, 9.85) : 1, vis = t < S.motor ? seg(t, 4.6, 4.8) : seg(t, 74.1, 74.4);
      sirenGlow(ctx, cam, vs, blink, tA * vis);
      vanName(ctx, T, cam, vs, t < S.motor ? seg(t, 7.0, 8.0) : seg(t, 74.4, CLACK), frame, tA);
      if (t < S.motor) {
        tagline(ctx, T, seg(t, 8.15, 8.75), frame, tA, 1330);
        if (t > 8.0 && t < 8.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = T.line(0.1 * (1 - seg(t, 8.0, 8.2))); ctx.fillRect(0, 0, W, H); ctx.restore(); }
      } else {
        tagline(ctx, T, seg(t, C.slogan, C.sloganEnd), frame, 1, 1330);
        const sa = seg(t, 78.0, 78.3);
        if (sa > 0) row(ctx, T, [{ label: 'INSCREVA-SE', lit: true, roll: seg(t, 78.0, 78.35) }], 1385, sa, frame);
      }
      status = t < S.motor ? (t < 6.5 ? 'RESGATE · A CAMINHO' : 'RESGATE · NO LOCAL') : (t < 75.6 ? 'RESGATE · CARREGADO' : 'RESGATE · EM ROTA');
    }
    U.vignette(ctx, W, H, 0.55);
    if (!opt.nosub) drawSub(ctx, red ? TRd : T, t);
    const tc = `T+${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`;
    U.chrome(ctx, W, H, red ? TRd : T, { tl: 'PS AUTOMÓVEL // EP01', tr: status, bl: tc, br: 'ÓLEO · 1080×1920', alpha: 0.9, px: t * 8 });
    txt('chrome', 'PS AUTOMÓVEL // EP01 ' + status, 0, 40, W, 110, true);
    // silêncio digital: tela segura parada (o som cuida do resto)
    return TX;
  };

  // legendas (.srt) e textos de cada linha
  const subs = () => LINES.filter(id => id !== 'L13').map(id => { const s = subOf(vo[id] + 0.01); return { t0: s.s0, t1: s.s1, text: SUBTEXT[id] }; });
  return { DUR, render, EV, subs, setText: (lines) => lines.forEach(l => SUBTEXT[l.id] = l.text), C };
}

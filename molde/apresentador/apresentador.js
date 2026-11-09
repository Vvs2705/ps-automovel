// PS Automóvel · apresentador ilustrado, desenhado em canvas 2D (sem imagem, sem download). Detalhes e integração: APRESENTADOR.md.
// · desenhaMecanico / desenhaRobo / desenhaFaisca (g, p, parte): um quadro do personagem a partir da pose p (POSE abaixo);
//   origem = meio da base do busto, 1 unidade = 1 px numa janela de 560 de largura. parte 'corpo' (vai recortado pela janela) ou 'braco' (gesto).
// · makeApresentador({ TL, labios, cena }): o diretor. A cada t decide a janela (grande no gancho, no canto na explicação, grande no
//   final com a marca), a expressão, o olhar, a piscada, a respiração, o gesto e a boca (labios.json, de labios.py).
// Estilo (scifi-toon / rubber-hose da Lemo-Opuscar): contorno escuro grosso, cor chapada, uma sombra dura por forma, olhos grandes,
// corpo "em dois" (12 fps) e boca a 24 fps.
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const back = t => { t = clamp(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };   // passa ~10 % e volta
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

export const C = {
  ink: '#1a1213', skin: '#c68a5c', skinD: '#a26a43', hair: '#2b1d16', cap: '#d22a33', capD: '#9a1822', silver: '#dfe4e8', silverD: '#9aa5ae',
  coat: '#f3f5f7', coatD: '#c6d0d9', shirt: '#2a2d33', mouth: '#5a1820', tongue: '#d8616b', teeth: '#fbfaf3', eye: '#ffffff', pupil: '#151012',
  grease: 'rgba(38,33,31,0.72)', frame: '#08161f', disc: '#0f2635', gear: '#163a4f', line: 'rgba(130,225,255,0.9)',
};
const LW = 7;
const FONTE = 'Rajdhani, "Arial Narrow", Arial, sans-serif';

// pose neutra: tudo que a função de desenho recebe
export const POSE = {
  gaze: [0, 0],                    // olhar: -1..1 (x para a direita da tela, y para baixo); [0, 0] = olhando para quem assiste
  fecha: 0, baixo: 0, wide: 1,     // pálpebra de cima (piscada) e de baixo (sorriso) 0..1; abertura do olho
  brow: { raise: 0, tilt: 0 },     // sobrancelha: sobe -1..1; inclina (1 = preocupado, -1 = bravo)
  sorriso: 0.35,                   // -1 (triste) .. 1 (sorriso aberto)
  boca: { w: 1, h: 0, r: 0, press: 0 },   // largura, abertura 0..1, arredondamento 0..1 (O, U), lábios apertados (M, B, P)
  resp: 0,                         // respiração -1..1
  cabeca: { dy: 0, rot: 0 },       // aceno de cabeça
  gesto: { tipo: null, k: 0, ang: -0.3, onda: 0 },   // 'aponta' (ang = direção na tela) ou 'acena'; k 0..1
};

// ---------- peças comuns ----------
function sh(g, path, fill, o = {}) {           // forma chapada: recheio, sombra dura recortada dentro, contorno
  g.beginPath(); path(g); g.fillStyle = fill; g.fill();
  if (o.shade) { g.save(); g.clip(); g.beginPath(); o.shade(g); g.fillStyle = o.shadeFill; g.fill(); g.restore(); }
  if (o.lw === 0) return;
  g.beginPath(); path(g); g.lineWidth = o.lw || LW; g.strokeStyle = C.ink; g.stroke();
}
function olho(g, x, y, rx, ry, gaze, fecha, baixo, lid, pupR = 10) {
  const el = c => c.ellipse(x, y, rx, ry, 0, 0, TAU);
  g.beginPath(); el(g); g.fillStyle = C.eye; g.fill();
  g.save(); g.clip();
  const px = x + gaze[0] * rx * 0.42, py = y + gaze[1] * ry * 0.35;
  g.beginPath(); g.arc(px, py, pupR, 0, TAU); g.fillStyle = C.pupil; g.fill();
  g.beginPath(); g.arc(px - pupR * 0.35, py - pupR * 0.42, pupR * 0.33, 0, TAU); g.fillStyle = '#fff'; g.fill();
  const yt = y - ry + 2 * ry * clamp(fecha), yb = y + ry - ry * clamp(baixo);
  g.fillStyle = lid;
  if (fecha > 0.02) g.fillRect(x - rx - 2, y - ry - 2, 2 * rx + 4, yt - y + ry + 2);
  if (baixo > 0.02) g.fillRect(x - rx - 2, yb, 2 * rx + 4, y + ry - yb + 2);
  g.restore();
  g.strokeStyle = C.ink; g.lineWidth = LW * 0.8;
  if (fecha > 0.02) {
    const yy = Math.min(yt, y + ry * 0.92), hw = rx * Math.sqrt(Math.max(0, 1 - ((yy - y) / ry) ** 2));
    g.beginPath(); g.moveTo(x - hw, yy); g.quadraticCurveTo(x, yy + (fecha > 0.9 ? ry * 0.25 : 3), x + hw, yy); g.stroke();
  }
  g.beginPath(); el(g); g.stroke();
}
function sobrancelha(g, x, y, side, raise, tilt, cor, len = 56, lw = 13) {
  const yi = y - raise * 14 - tilt * 12, yo = y - raise * 14 + tilt * 5;
  g.beginPath(); g.moveTo(x - side * len * 0.5, yi); g.quadraticCurveTo(x, Math.min(yi, yo) - 8, x + side * len * 0.5, yo);
  g.lineCap = 'round'; g.lineWidth = lw; g.strokeStyle = cor; g.stroke();
}
// boca paramétrica: m = { w, h, r, press } (POSE.boca); hw0/oh0 = meia largura e abertura máxima
function boca(g, x, y, m, sorriso, hw0 = 34, oh0 = 56) {
  const hw = hw0 * m.w * (1 - 0.12 * m.press), oh = oh0 * m.h, R = m.r, cy = -sorriso * 7 * (1 - R);
  g.save(); g.translate(x, y); g.strokeStyle = C.ink; g.lineCap = 'round';
  if (oh < 3.5) {
    g.beginPath(); g.moveTo(-hw, cy); g.quadraticCurveTo(0, sorriso * 13 + oh, hw, cy);
    g.lineWidth = LW * (0.9 + 0.45 * m.press); g.stroke();
    if (m.press > 0.5) { g.lineWidth = 4; g.beginPath(); g.moveTo(-hw - 2, cy - 6); g.lineTo(-hw - 2, cy + 6); g.moveTo(hw + 2, cy - 6); g.lineTo(hw + 2, cy + 6); g.stroke(); }
  } else {
    const k = 0.55 + 0.45 * R, bt = oh * (0.24 + 0.26 * R), bb = oh * (0.76 - 0.26 * R) + Math.max(0, sorriso) * 4;
    const path = c => { c.moveTo(-hw, cy); c.bezierCurveTo(-hw * k, cy - bt * 4 / 3, hw * k, cy - bt * 4 / 3, hw, cy); c.bezierCurveTo(hw * k, cy + bb * 4 / 3, -hw * k, cy + bb * 4 / 3, -hw, cy); c.closePath(); };
    g.beginPath(); path(g); g.fillStyle = C.mouth; g.fill();
    g.save(); g.clip();
    if (R < 0.75) { g.fillStyle = C.teeth; g.fillRect(-hw, cy - bt - 4, 2 * hw, 4 + Math.min(13, oh * 0.28)); }
    if (oh > 16) { g.beginPath(); g.ellipse(0, cy + bb * 0.98, hw * 0.62, oh * 0.32, 0, 0, TAU); g.fillStyle = C.tongue; g.fill(); }
    g.restore();
    g.beginPath(); path(g); g.lineWidth = LW * 0.85; g.stroke();
  }
  if (sorriso > 0.6 && m.press < 0.5) { g.lineWidth = 4; g.beginPath(); g.arc(-hw - 8, cy - 4, 9, -0.6, 0.9); g.moveTo(hw + 8 + 9 * Math.cos(Math.PI - 0.9), cy - 4 + 9 * Math.sin(Math.PI - 0.9)); g.arc(hw + 8, cy - 4, 9, Math.PI - 0.9, Math.PI + 0.6); g.stroke(); }
  g.restore();
}
function maoAponta(g, x, y, ang, cor, sombra) {
  g.save(); g.translate(x, y); g.rotate(ang);
  sh(g, c => c.ellipse(0, 0, 27, 24, 0, 0, TAU), cor, { shade: c => c.ellipse(4, 14, 28, 14, 0, 0, TAU), shadeFill: sombra });
  sh(g, c => c.roundRect(12, -10, 54, 19, 9.5), cor);
  sh(g, c => c.ellipse(4, -21, 16, 10, -0.45, 0, TAU), cor);
  g.lineWidth = 4; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(10, 6); g.lineTo(22, 8); g.moveTo(8, 15); g.lineTo(19, 17); g.stroke();
  g.restore();
}
function maoAberta(g, x, y, rot, cor, sombra) {
  g.save(); g.translate(x, y); g.rotate(rot);
  for (let i = 0; i < 4; i++) { g.save(); g.rotate(-0.42 + i * 0.27); sh(g, c => c.roundRect(-8.5, -64, 17, 46, 8.5), cor); g.restore(); }
  sh(g, c => c.ellipse(-24, 6, 11, 22, 0.9, 0, TAU), cor);
  sh(g, c => c.ellipse(0, 0, 27, 29, 0, 0, TAU), cor, { shade: c => c.ellipse(6, 16, 28, 14, 0, 0, TAU), shadeFill: sombra });
  g.restore();
}
function tubo(g, pts, cor, larg) {             // manga / braço: contorno grosso + recheio, pelo ombro → cotovelo → mão
  const p = c => { c.moveTo(pts[0][0], pts[0][1]); c.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); p(g); g.lineWidth = larg + 2 * LW; g.strokeStyle = C.ink; g.stroke();
  g.beginPath(); p(g); g.lineWidth = larg; g.strokeStyle = cor; g.stroke();
}
// braço do gesto a partir do ombro S: aponta (mão para ang) ou acena (mão no alto, abanando)
function braco(g, p, S, o) {
  const G = p.gesto; if (!G.tipo || G.k <= 0.02) return;
  const k = G.k;
  let E, H;
  if (G.tipo === 'aponta') {
    const a = G.ang, d = [Math.cos(a), Math.sin(a)], e = [Math.cos(a + 0.55), Math.sin(a + 0.55)];
    E = [lerp(S[0] + 18, S[0] + e[0] * 120, k), lerp(S[1] + 110, S[1] + e[1] * 120, k)];
    H = [lerp(S[0] + 22, E[0] + d[0] * 118, k), lerp(S[1] + 200, E[1] + d[1] * 118, k)];
    tubo(g, [S, E, H], o.manga, o.larg);
    maoAponta(g, H[0] + d[0] * 8, H[1] + d[1] * 8, a, o.mao, o.maoD);
  } else {
    E = [S[0] + lerp(20, 70, k), S[1] + lerp(110, -60, k)];
    H = [S[0] + lerp(25, 40, k), S[1] + lerp(200, -190, k)];
    tubo(g, [S, E, H], o.manga, o.larg);
    maoAberta(g, H[0], H[1] - 12, 0.32 * G.onda * k, o.mao, o.maoD);
  }
}

// ---------- (a) mecânico de jaleco: boné PS, mancha de graxa, estetoscópio (padrão) ----------
export function desenhaMecanico(g, p, parte = 'corpo') {
  g.lineJoin = 'round'; g.lineCap = 'round';
  const b = p.resp || 0;
  if (parte === 'braco') return braco(g, p, [186, -150 - 2 * b], { manga: C.coat, larg: 50, mao: C.skin, maoD: C.skinD });
  // pescoço, jaleco, camiseta, lapelas
  sh(g, c => c.roundRect(-50, -236, 100, 80, 20), C.skin, { shade: c => c.rect(-60, -236, 120, 40), shadeFill: C.skinD });
  g.save(); g.scale(1 + 0.004 * b, 1 + 0.012 * b);
  sh(g, c => { c.moveTo(-222, 14); c.lineTo(-214, -92); c.quadraticCurveTo(-206, -166, -118, -182); c.lineTo(118, -182); c.quadraticCurveTo(206, -166, 214, -92); c.lineTo(222, 14); c.closePath(); },
    C.coat, { shade: c => { c.moveTo(70, -200); c.quadraticCurveTo(210, -175, 236, -60); c.lineTo(236, 20); c.lineTo(150, 20); c.quadraticCurveTo(170, -90, 70, -200); }, shadeFill: C.coatD });
  sh(g, c => { c.moveTo(-60, -184); c.lineTo(60, -184); c.lineTo(0, -66); c.closePath(); }, C.shirt);
  sh(g, c => { c.moveTo(-60, -184); c.lineTo(-108, -154); c.lineTo(-14, -84); c.closePath(); }, C.coat);
  sh(g, c => { c.moveTo(60, -184); c.lineTo(108, -154); c.lineTo(14, -84); c.closePath(); }, C.coat, { shade: c => c.rect(40, -190, 80, 120), shadeFill: C.coatD });
  // bolso com chave e caneta; distintivo PS; graxa
  sh(g, c => c.roundRect(-150, -152, 13, 50, 5), C.silver);
  sh(g, c => { c.arc(-143.5, -158, 15, 0, TAU); }, C.silver);
  g.fillStyle = C.coat; g.fillRect(-149, -180, 11, 16);
  sh(g, c => c.roundRect(-124, -146, 11, 40, 4), C.cap);
  sh(g, c => c.roundRect(-172, -116, 78, 70, 8), C.coat, { shade: c => c.rect(-172, -60, 80, 20), shadeFill: C.coatD });
  sh(g, c => c.roundRect(112, -140, 76, 46, 10), C.cap, { lw: 5 });
  g.font = `600 36px ${FONTE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.silver; g.fillText('PS', 150, -115);
  g.fillStyle = C.grease; g.beginPath(); g.ellipse(-150, -20, 20, 9, 0.5, 0, TAU); g.ellipse(-128, -12, 8, 4, 0.3, 0, TAU); g.fill();
  // estetoscópio (o "resgate automotivo")
  for (const [w, cor] of [[15, C.ink], [8, '#454b53']]) {
    g.lineWidth = w; g.strokeStyle = cor; g.beginPath();
    g.moveTo(-68, -190); g.bezierCurveTo(-112, -130, -96, -40, -86, 30);
    g.moveTo(68, -190); g.bezierCurveTo(104, -132, 94, -84, 76, -62); g.stroke();
  }
  sh(g, c => c.arc(74, -50, 17, 0, TAU), C.silver); g.lineWidth = 4; g.beginPath(); g.arc(74, -50, 8, 0, TAU); g.stroke();
  g.restore();

  // cabeça
  g.save(); g.translate(0, -318 - 3 * b + p.cabeca.dy); g.rotate(p.cabeca.rot);
  const fx = p.gaze[0] * 9, fy = p.gaze[1] * 5;
  for (const sd of [-1, 1]) { sh(g, c => c.ellipse(sd * 114, 10, 24, 31, 0, 0, TAU), C.skin); g.lineWidth = 4; g.beginPath(); g.arc(sd * 116, 10, 11, sd > 0 ? -1.4 : 1.7, sd > 0 ? 1.4 : 4.5); g.stroke(); }
  sh(g, c => c.ellipse(0, 0, 116, 132, 0, 0, TAU), C.skin, { shade: c => c.ellipse(116, 34, 46, 128, 0, 0, TAU), shadeFill: C.skinD });
  for (const sd of [-1, 1]) sh(g, c => { c.moveTo(sd * 116, -80); c.lineTo(sd * 96, -80); c.lineTo(sd * 100, 4); c.lineTo(sd * 112, 18); c.closePath(); }, C.hair, { lw: 4 });
  const fecha = p.fecha, wide = p.wide || 1;
  olho(g, -44 + fx, -4 + fy, 27, 33 * wide, p.gaze, fecha, p.baixo, C.skin);
  olho(g, 44 + fx, -4 + fy, 27, 33 * wide, p.gaze, fecha, p.baixo, C.skin);
  sobrancelha(g, -46 + fx, -52 + fy, -1, p.brow.raise, p.brow.tilt, C.hair);
  sobrancelha(g, 46 + fx, -52 + fy, 1, p.brow.raise, p.brow.tilt, C.hair);
  sh(g, c => c.ellipse(fx * 1.3, 28 + fy, 23, 18, 0, 0, TAU), C.skin, { shade: c => c.ellipse(fx * 1.3 + 12, 38 + fy, 22, 12, 0, 0, TAU), shadeFill: C.skinD });
  g.fillStyle = C.grease; g.beginPath(); g.ellipse(72 + fx, 58 + fy, 17, 9, -0.4, 0, TAU); g.ellipse(88 + fx, 70 + fy, 8, 5, -0.4, 0, TAU); g.fill();
  boca(g, fx, 90 + fy, p.boca, p.sorriso);
  const my = 60 + fy - p.boca.h * 5;           // bigode sobe um pouco quando a boca abre
  sh(g, c => { c.moveTo(fx, my - 12); c.bezierCurveTo(fx - 30, my - 22, fx - 62, my - 6, fx - 58, my + 10); c.bezierCurveTo(fx - 40, my + 4, fx - 18, my + 6, fx, my);
    c.bezierCurveTo(fx + 18, my + 6, fx + 40, my + 4, fx + 58, my + 10); c.bezierCurveTo(fx + 62, my - 6, fx + 30, my - 22, fx, my - 12); c.closePath(); }, C.hair, { lw: 4 });
  // boné
  sh(g, c => { c.moveTo(-124, -98); c.bezierCurveTo(-132, -200, -62, -224, 0, -224); c.bezierCurveTo(62, -224, 132, -200, 124, -98); c.closePath(); },
    C.cap, { shade: c => c.ellipse(132, -150, 58, 96, 0, 0, TAU), shadeFill: C.capD });
  g.lineWidth = 3; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(0, -224); g.quadraticCurveTo(-34, -170, -44, -98); g.moveTo(0, -224); g.quadraticCurveTo(34, -170, 44, -98); g.stroke();
  sh(g, c => c.arc(0, -224, 9, 0, TAU), C.capD, { lw: 4 });
  g.font = `600 62px ${FONTE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = C.ink; g.strokeText('PS', 0, -146); g.fillStyle = C.silver; g.fillText('PS', 0, -146);
  sh(g, c => { c.moveTo(-134, -100); c.quadraticCurveTo(0, -48, 134, -100); c.quadraticCurveTo(0, -80, -134, -100); c.closePath(); }, C.capD);
  g.restore();
}

// ---------- (b) robô de peças de carro: faróis = olhos, grade = boca, retrovisores = orelhas, bateria = corpo ----------
const RB = { body: '#30363d', lid: '#48505a', metal: '#b9c3cc', metalD: '#8592a0', glass: '#9fe9ff' };
export function desenhaRobo(g, p, parte = 'corpo') {
  g.lineJoin = 'round'; g.lineCap = 'round';
  const b = p.resp || 0;
  if (parte === 'braco') return braco(g, p, [190, -150], { manga: RB.metal, larg: 34, mao: RB.metalD, maoD: '#6b7783' });
  g.save(); g.scale(1, 1 + 0.01 * b);
  sh(g, c => c.roundRect(-205, -196, 410, 230, 20), RB.body, { shade: c => c.rect(120, -200, 100, 240), shadeFill: '#22272d' });
  sh(g, c => c.roundRect(-212, -206, 424, 40, 12), RB.lid);
  sh(g, c => c.roundRect(-150, -238, 44, 34, 6), C.cap); sh(g, c => c.roundRect(106, -238, 44, 34, 6), '#1d2126');
  g.fillStyle = '#fff'; g.font = `600 34px ${FONTE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('+', -128, -221); g.fillText('−', 128, -221);
  sh(g, c => c.roundRect(-96, -146, 192, 96, 14), C.silver, { lw: 5 });
  g.fillStyle = C.cap; g.font = `600 76px ${FONTE}`; g.fillText('PS', 0, -97);
  g.restore();
  for (const y of [-250, -270, -290]) sh(g, c => c.ellipse(0, y - 2 * b, 46, 12, 0, 0, TAU), RB.metalD, { lw: 5 });
  g.save(); g.translate(0, -400 - 3 * b + p.cabeca.dy); g.rotate(p.cabeca.rot);
  const fx = p.gaze[0] * 8, fy = p.gaze[1] * 4;
  // antena = vela de ignição, com faísca
  sh(g, c => c.roundRect(-12, -176, 24, 54, 6), '#f1efe8'); sh(g, c => c.roundRect(-20, -128, 40, 22, 4), RB.metalD);
  g.lineWidth = 5; g.strokeStyle = '#ffd23f'; g.beginPath(); const sp = Math.floor(((p.t || 0) * 12)) % 2 ? 1 : -1;
  g.moveTo(-10, -186); g.lineTo(sp * 6, -196); g.lineTo(-sp * 4, -206); g.lineTo(sp * 10, -216); g.stroke();
  for (const sd of [-1, 1]) { sh(g, c => c.rect(sd * 150 - (sd > 0 ? 0 : 26), -42, 26, 12), RB.metalD, { lw: 4 }); sh(g, c => c.ellipse(sd * 186, -46, 26, 34, sd * 0.2, 0, TAU), RB.metal, { shade: c => c.ellipse(sd * 186, -46, 15, 22, sd * 0.2, 0, TAU), shadeFill: '#2b3a48' }); }
  sh(g, c => c.roundRect(-152, -114, 304, 236, 46), RB.metal, { shade: c => c.rect(96, -120, 70, 250), shadeFill: RB.metalD });
  sh(g, c => { c.moveTo(-104, -100); c.lineTo(104, -100); c.lineTo(122, -62); c.lineTo(-122, -62); c.closePath(); }, '#5fb9d6', { lw: 5 });
  for (const sd of [-1, 1]) {
    sh(g, c => c.arc(sd * 68 + fx, -4 + fy, 52, 0, TAU), C.silver);
    olho(g, sd * 68 + fx, -4 + fy, 42, 42 * (p.wide || 1), p.gaze, p.fecha, p.baixo, RB.metalD, 13);
    g.strokeStyle = RB.glass; g.lineWidth = 4; g.beginPath(); g.arc(sd * 68 + fx, -4 + fy, 46, -2.6, -1.2); g.stroke();
  }
  sobrancelha(g, -68 + fx, -62 + fy, -1, p.brow.raise, p.brow.tilt, RB.metalD, 60, 12);
  sobrancelha(g, 68 + fx, -62 + fy, 1, p.brow.raise, p.brow.tilt, RB.metalD, 60, 12);
  // grade = boca: a abertura segue a fala, as barras se afastam
  const m = p.boca, gw = 86 * m.w * (1 - 0.1 * m.press), gh = 14 + 62 * m.h, gy = 80 + fy, sm = p.sorriso * 10 * (1 - m.r);
  const grade = c => { c.moveTo(fx - gw, gy - gh / 2 - sm); c.quadraticCurveTo(fx, gy - gh / 2 + sm * 0.4, fx + gw, gy - gh / 2 - sm); c.lineTo(fx + gw * (1 - 0.25 * m.r), gy + gh / 2); c.quadraticCurveTo(fx, gy + gh / 2 + 10 + sm, fx - gw * (1 - 0.25 * m.r), gy + gh / 2); c.closePath(); };
  g.beginPath(); grade(g); g.fillStyle = '#14181d'; g.fill();
  g.save(); g.clip(); g.fillStyle = RB.metal; for (let i = 1; i <= 3; i++) g.fillRect(fx - gw, gy - gh / 2 + i * gh / 4 - 3, 2 * gw, 6); g.restore();
  g.beginPath(); grade(g); g.lineWidth = LW; g.strokeStyle = C.ink; g.stroke();
  sh(g, c => c.roundRect(-164, 118, 328, 34, 14), RB.metalD);
  g.restore();
}

// ---------- (c) Faísca, a vela de ignição ----------
const FV = { cer: '#f1efe8', cerD: '#cfc9bb', nut: '#aab4bd', nutD: '#7f8b96', arm: '#5c636b' };
export function desenhaFaisca(g, p, parte = 'corpo') {
  g.lineJoin = 'round'; g.lineCap = 'round';
  const b = p.resp || 0;
  if (parte === 'braco') return braco(g, p, [140, -170], { manga: FV.arm, larg: 22, mao: '#ffffff', maoD: '#d6d9dd' });
  sh(g, c => { c.moveTo(-200, 20); c.lineTo(-200, -70); c.lineTo(200, -70); c.lineTo(200, 20); c.closePath(); }, FV.nut, { shade: c => c.rect(70, -80, 140, 110), shadeFill: FV.nutD });
  g.lineWidth = 5; g.beginPath(); g.moveTo(-70, -70); g.lineTo(-70, 20); g.moveTo(70, -70); g.lineTo(70, 20); g.stroke();
  g.fillStyle = C.cap; g.font = `600 64px ${FONTE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PS', 0, -24);
  g.save(); g.translate(0, -70); g.scale(1 + 0.006 * b, 1 + 0.012 * b); g.translate(0, p.cabeca.dy * 0.5); g.rotate(p.cabeca.rot * 0.5);
  const body = c => { c.moveTo(-150, 0); c.bezierCurveTo(-160, -200, -130, -360, -96, -420); c.lineTo(96, -420); c.bezierCurveTo(130, -360, 160, -200, 150, 0); c.closePath(); };
  sh(g, body, FV.cer, { shade: c => { c.moveTo(80, 0); c.bezierCurveTo(120, -160, 112, -320, 70, -420); c.lineTo(200, -420); c.lineTo(200, 0); c.closePath(); }, shadeFill: FV.cerD });
  for (const y of [-386, -404]) { g.lineWidth = 5; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(-98, y); g.quadraticCurveTo(0, y + 8, 98, y); g.stroke(); }
  sh(g, c => c.roundRect(-34, -470, 68, 54, 10), FV.nut, { shade: c => c.rect(10, -470, 30, 60), shadeFill: FV.nutD });
  g.lineWidth = 6; g.strokeStyle = '#ffd23f'; g.beginPath(); const sp = Math.floor(((p.t || 0) * 12)) % 2 ? 1 : -1;
  g.moveTo(0, -474); g.lineTo(sp * 14, -492); g.lineTo(-sp * 8, -506); g.lineTo(sp * 18, -526); g.stroke();
  const fx = p.gaze[0] * 9, fy = p.gaze[1] * 5, ey = -250 + fy;
  g.fillStyle = 'rgba(232,110,120,0.45)'; g.beginPath(); g.ellipse(-84 + fx, ey + 64, 20, 11, 0, 0, TAU); g.ellipse(84 + fx, ey + 64, 20, 11, 0, 0, TAU); g.fill();
  olho(g, -44 + fx, ey, 28, 36 * (p.wide || 1), p.gaze, p.fecha, p.baixo, FV.cer, 11);
  olho(g, 44 + fx, ey, 28, 36 * (p.wide || 1), p.gaze, p.fecha, p.baixo, FV.cer, 11);
  sobrancelha(g, -46 + fx, ey - 50, -1, p.brow.raise, p.brow.tilt, '#3b3f45', 50, 11);
  sobrancelha(g, 46 + fx, ey - 50, 1, p.brow.raise, p.brow.tilt, '#3b3f45', 50, 11);
  boca(g, fx, ey + 92, p.boca, p.sorriso, 36, 60);
  g.restore();
}

export const PERSONAGENS = { mecanico: desenhaMecanico, robo: desenhaRobo, faisca: desenhaFaisca };

// ---------- janela (o personagem vive numa "transmissão" com o estilo do HUD) ----------
function engrenagem(g, x, y, R, r, n, rot) {
  g.beginPath();
  for (let i = 0; i < n * 4; i++) { const a = rot + i / (n * 4) * TAU, rr = (i % 4 < 2) ? R : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath();
}
export function janela(g, B, a = 1, t = 0) {
  const r = B.w * 0.06, cx = B.x0 + B.w / 2, cy = B.y0 + B.h * 0.4;
  g.save(); g.globalAlpha *= a;
  g.beginPath(); g.roundRect(B.x0, B.y0, B.w, B.h, r); g.fillStyle = C.frame; g.fill();
  g.save(); g.clip();
  g.beginPath(); g.arc(cx, cy, B.w * 0.4, 0, TAU); g.fillStyle = C.disc; g.fill();
  engrenagem(g, cx, cy, B.w * 0.47, B.w * 0.42, 12, t * 0.12); g.lineWidth = Math.max(1.5, B.w * 0.012); g.strokeStyle = C.gear; g.stroke();
  g.restore();
  g.beginPath(); g.roundRect(B.x0, B.y0, B.w, B.h, r); g.lineWidth = Math.max(2, B.w * 0.007); g.strokeStyle = C.line; g.stroke();
  const L = Math.max(10, B.w * 0.08), o = Math.max(4, B.w * 0.014); g.lineWidth = Math.max(2.5, B.w * 0.01); g.strokeStyle = 'rgba(190,245,255,0.95)'; g.beginPath();
  g.moveTo(B.x0 - o, B.y0 - o + L); g.lineTo(B.x0 - o, B.y0 - o); g.lineTo(B.x0 - o + L, B.y0 - o);
  g.moveTo(B.x1 + o - L, B.y1 + o); g.lineTo(B.x1 + o, B.y1 + o); g.lineTo(B.x1 + o, B.y1 + o - L); g.stroke();
  g.restore();
}
// desenha o personagem dentro da janela B: o corpo recortado pela janela; o braço do gesto pode sair pelos lados (nunca abaixo dela)
export function desenhaNaJanela(g, B, p, personagem = 'mecanico', a = 1) {
  const D = PERSONAGENS[personagem] || desenhaMecanico, s = B.w / 560;
  g.save(); g.globalAlpha *= a;
  g.save(); g.beginPath(); g.roundRect(B.x0, B.y0, B.w, B.h, B.w * 0.06); g.clip();
  g.translate(B.x0 + B.w / 2, B.y1); g.scale(s, s); D(g, p, 'corpo'); g.restore();
  if (p.gesto.tipo && p.gesto.k > 0.02) { g.save(); g.beginPath(); g.rect(-4000, -4000, 9000, 4000 + B.y1); g.clip(); g.translate(B.x0 + B.w / 2, B.y1); g.scale(s, s); D(g, p, 'braco'); g.restore(); }
  g.restore();
}

// ---------- diretor ----------
// janelas na tela 1080×1920: [x0, y1 (base), largura]; altura = 1,04 × largura. Faixas: ACESSIBILIDADE.md.
//   gancho: grande à esquerda, entre o cartão (termina em y 610) e as etiquetas (começam em y 1150); o carro vai 250 px para a direita.
//   canto:  pequeno no canto esquerdo, entre os nomes dos pontos marcados (até y 840 com 3 pontos) e as etiquetas.
//   final:  grande no alto (abaixo do canto do HUD, y 110), sobre a ambulância com o nome PS AUTOMÓVEL, o slogan e o INSCREVA-SE.
export const SLOTS = { gancho: [30, 1140, 500], canto: [20, 1140, 240], final: [310, 636, 460] };
export const DX_GANCHO = 250;
const VIS = { A: [1, 1, 0.12], E: [1.12, 0.62, 0], I: [1.18, 0.4, 0], O: [0.66, 0.86, 1], U: [0.46, 0.56, 1], M: [0.86, 0, 0], R: [0.95, 0, 0] };
export const EXPR = {
  neutro: { raise: 0, tilt: 0, sorriso: 0.35, lid: 0, baixo: 0, wide: 1 },
  feliz: { raise: 0.25, tilt: 0, sorriso: 1, lid: 0, baixo: 0.22, wide: 1 },
  serio: { raise: -0.35, tilt: -0.3, sorriso: 0, lid: 0.12, baixo: 0, wide: 1 },
  preocupado: { raise: 0.3, tilt: 0.9, sorriso: -0.5, lid: 0, baixo: 0, wide: 1.06 },
  surpreso: { raise: 0.9, tilt: 0.1, sorriso: 0.25, lid: 0, baixo: 0, wide: 1.12 },
};
const mixE = (A, B, k) => Object.fromEntries(Object.keys(A).map(key => [key, lerp(A[key], B[key], k)]));

export function makeApresentador({ TL, labios, cena = {}, personagem = 'mecanico', slots = SLOTS }) {
  const vo = TL.vo, ids = TL.ids, DUR = TL.dur, O = TL.outro ?? DUR, fps = labios?.fps || 24, LB = labios?.falas || {};
  const falas = cena.falas || {};
  const nq = id => LB[id] ? LB[id].v.length : 0;
  const fim = id => vo[id] + nq(id) / fps;
  const first = ids[0], gEnd = fim(first);
  let z = 'carro'; const ZONA = {}; for (const id of ids) { z = falas[id]?.zona || z; ZONA[id] = z; }
  const body = ids.filter(id => vo[id] < O);
  const exprOf = id => id === first ? 'surpreso' : vo[id] >= O ? 'feliz' : ({ alerta: 'preocupado', atencao: 'serio' })[falas[id]?.estado] || 'neutro';
  const lineAt = t => { let L = first; for (const id of ids) if (t >= vo[id] - 0.15) L = id; return L; };
  // gestos: aponta para o carro no gancho e quando o assunto muda de zona (ou a fala marca seta/pontos); acena no final
  const GEST = [];
  if (gEnd - vo[first] > 1.2) GEST.push({ tipo: 'aponta', a: vo[first] + 0.35, b: gEnd - 0.15 });
  body.slice(1).forEach((id, i) => {
    const f = falas[id] || {};
    if (ZONA[id] !== ZONA[body[i]] || f.seta || f.pontos) GEST.push({ tipo: 'aponta', a: vo[id] + 0.1, b: Math.min(vo[id] + 1.8, fim(id)) });
  });
  GEST.push({ tipo: 'acena', a: O + 0.45, b: DUR + 9 });
  const BL = []; for (let x = 1.3, i = 0; x < DUR + 5; i++) { BL.push(x); x += 2.3 + 2.6 * hash(i + 7); }
  // janela no tempo
  const t1 = gEnd + 0.15, t2 = t1 + 0.7, t3 = O - 0.55, t4 = O + 0.15;
  const mix = (A, B, k) => A.map((x, i) => lerp(x, B[i], k));
  const big = t => (t < O ? 1 - eio(seg(t, t1, t2)) : 0);
  const boxAt = t => {
    const [x0, y1, w0] = t < t2 ? mix(slots.gancho, slots.canto, eio(seg(t, t1, t2))) : mix(slots.canto, slots.final, eio(seg(t, t3, t4)));
    const k = 0.9 + 0.1 * back(seg(t, 0, 0.3)), w = w0 * k, h = w * 1.04, cx = x0 + w0 / 2;   // entrada: cresce do centro da base
    return { x0: cx - w / 2, x1: cx + w / 2, y0: y1 - h, y1, w, h };
  };
  const dx = t => DX_GANCHO * big(t);
  const mouthAt = t => {
    for (const id of ids) {
      const n = nq(id); if (!n) continue;
      const f = (t - vo[id]) * fps; if (f < -1 || f >= n + 1) continue;
      const at = k => { const i = Math.floor(f) + k; return i < 0 || i >= n ? ['R', 0] : [LB[id].v[i], LB[id].a[i] / 100]; };
      let w = 0, h = 0, r = 0, e = 0;
      [-1, 0, 1].forEach((k, j) => { const [v, a] = at(k), P = VIS[v] || VIS.R, q = [0.25, 0.5, 0.25][j]; w += q * P[0]; h += q * P[1] * (v === 'M' || v === 'R' ? 0 : 0.3 + 0.7 * a); r += q * P[2]; });
      for (let k = -5; k <= 0; k++) e += at(k)[1] / 6;
      return { boca: { w, h, r, press: at(0)[0] === 'M' ? 1 : 0 }, e };
    }
    return { boca: { w: 0.95, h: 0, r: 0, press: 0 }, e: 0 };
  };
  const pose = t => {
    const tb = Math.floor(t * 12 + 1e-6) / 12;                 // corpo "em dois": 12 desenhos por segundo; a boca segue a 24
    const id = lineAt(t), i = ids.indexOf(id), E = mixE(EXPR[exprOf(ids[Math.max(0, i - 1)])], EXPR[exprOf(id)], eio(seg(t, vo[id] - 0.15, vo[id] + 0.2)));
    const M = mouthAt(t);
    let G = null, k = 0, ante = 0;
    for (const x of GEST) if (tb >= x.a - 0.12 && tb < x.b + 0.35) { G = x; ante = seg(tb, x.a - 0.12, x.a) * (1 - seg(tb, x.a, x.a + 0.1)); k = back(seg(tb, x.a, x.a + 0.32)) * (1 - eio(seg(tb, x.b, x.b + 0.35))); break; }
    let blink = 0; for (const x of BL) { const u = (tb - x) / 0.17; if (u >= 0 && u < 1) blink = Math.sin(u * Math.PI); }
    const sc = Math.floor(tb / 1.7);
    let gaze = [0.28 * (hash(sc) - 0.5), 0.2 * (hash(sc + 50) - 0.5)];
    const B = boxAt(t), s = B.w / 560;
    let ang = -0.3;
    if (G?.tipo === 'aponta') {                                  // mão e olhar vão para o carro (centro da câmera), depois o olhar volta para quem assiste
      const Sx = B.x0 + B.w / 2 + 186 * s, Sy = B.y1 - 150 * s;
      ang = clamp(Math.atan2(930 - Sy, 540 + dx(t) - Sx), -1.1, 0.45);
      const kg = seg(tb, G.a, G.a + 0.2) * (1 - seg(tb, G.a + 0.9, G.a + 1.15));
      gaze = [lerp(gaze[0], Math.cos(ang) * 0.9, kg), lerp(gaze[1], Math.sin(ang) * 0.6, kg)];
    }
    const resp = Math.sin(TAU * tb / 3.6);
    return {
      gaze, fecha: E.lid + (1 - E.lid) * blink, baixo: E.baixo, wide: E.wide, brow: { raise: E.raise + 0.25 * M.e, tilt: E.tilt }, sorriso: E.sorriso,
      boca: M.boca, resp, t,
      cabeca: { dy: 6 * M.e + 7 * ante, rot: 0.025 * Math.sin(tb * 0.8) + 0.03 * (M.e - 0.3) + (G?.tipo === 'aponta' ? 0.04 * k : 0) },
      gesto: { tipo: G?.tipo || null, k: Math.max(0, k), ang, onda: Math.sin(TAU * 2.2 * tb) },
    };
  };
  // desenha sobre o quadro do filme (depois da vinheta, antes da legenda) e devolve a caixa ocupada, para a checagem de texto
  const draw = (g, t) => {
    const B = boxAt(t), a = seg(t, 0, 0.25), p = pose(t);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.letterSpacing = '0px';
    janela(g, B, a, t); desenhaNaJanela(g, B, p, personagem, a);
    g.restore();
    let { x0: bx0, y0: by0, x1: bx1, y1: by1 } = B;
    if (p.gesto.tipo === 'aponta' && p.gesto.k > 0.02) {         // a mão que sai da janela também ocupa espaço
      const s = B.w / 560, Sx = B.x0 + B.w / 2 + 186 * s, Sy = B.y1 - 150 * s, L = 300 * s * p.gesto.k;
      const hx = Sx + Math.cos(p.gesto.ang) * L, hy = Sy + Math.sin(p.gesto.ang) * L;
      bx0 = Math.min(bx0, hx - 40 * s); bx1 = Math.max(bx1, hx + 40 * s); by0 = Math.min(by0, hy - 40 * s);
    }
    return { id: 'apresentador', text: '(apresentador)', x0: bx0, y0: by0, x1: bx1, y1: by1 };
  };
  return { draw, dx, pose, boxAt, GEST };
}

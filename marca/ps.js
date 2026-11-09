// Banner do PS Automóvel (2560×1440) no visual do logo: fibra de carbono, vermelho e prata escovada.
// ?a=ps  (&guia=1 desenha as áreas seguras do YouTube por cima)
import { Holo } from './engine/holo.js';
import { buildEngine, R, L } from './models.js';

const Q = new URLSearchParams(location.search), W = 2560, H = 1440, TAU = Math.PI * 2;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const g = cv.getContext('2d');
const F = 'Bahnschrift';                              // fonte do Windows; só vira pixel na imagem
const logo = new Image(); logo.src = 'ps-automovel-logo-original.jpg'; await logo.decode();
const LX = 1001, LY = 567, LR = 528;                  // centro e raio do emblema no arquivo do logo (medidos)

// fundo: trama de fibra de carbono + luz vermelha no centro
const P = Object.assign(document.createElement('canvas'), { width: 28, height: 28 }), p = P.getContext('2d');
for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
  const x = i * 14, y = j * 14, v = (i + j) % 2;
  const gr = v ? p.createLinearGradient(x, y, x + 14, y) : p.createLinearGradient(x, y, x, y + 14);
  gr.addColorStop(0, '#1d1e21'); gr.addColorStop(0.5, '#121315'); gr.addColorStop(1, '#08090a');
  p.fillStyle = gr; p.fillRect(x, y, 14, 14);
}
g.fillStyle = g.createPattern(P, 'repeat'); g.fillRect(0, 0, W, H);
let rg = g.createRadialGradient(1280, 720, 0, 1280, 720, 1100);
rg.addColorStop(0, 'rgba(200,10,20,0.28)'); rg.addColorStop(0.55, 'rgba(120,0,10,0.10)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
g.fillStyle = rg; g.fillRect(0, 0, W, H);

// faixas de corrida diagonais atrás do texto
g.save(); g.globalCompositeOperation = 'lighter';
for (const [x, w, a] of [[1500, 90, 0.10], [1640, 26, 0.16], [1700, 10, 0.22], [2140, 60, 0.10], [2230, 14, 0.18]]) {
  g.fillStyle = `rgba(230,20,30,${a})`; g.beginPath();
  g.moveTo(x + 260, 0); g.lineTo(x + 260 + w, 0); g.lineTo(x - 260 + w, H); g.lineTo(x - 260, H); g.closePath(); g.fill();
}
g.restore();

// motor em corte, em vermelho, à direita (só desktop/TV)
const ang = 1.1, al = Math.asin(-R * Math.sin(ang) / L), PIN = R + L, dy = R * Math.cos(ang) + L * Math.cos(al) - PIN;
new Holo(W, H).draw(g, buildEngine(), { target: [0, 0.38, 0], yaw: -0.45, pitch: 0.12, dist: 4.2, fov: 0.8, cx: 2350, cy: 730 }, {
  hue: 358, gain: 0.5, glow: 0.8, lineWidth: 1.6, explode: { piston: dy, 'piston-rings': dy, 'wrist-pin': dy, rod: dy },
  angle: { 'crank-main': ang, 'crank-webs': ang, 'crank-pin': ang, rod: al } });

// engrenagem prata cortada na borda esquerda (só desktop/TV)
function gear(cx, cy, r, n, d) {
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, s = TAU / n;
    for (const [k, rr] of [[0, r], [0.12, r + d], [0.38, r + d], [0.5, r]]) g.lineTo(cx + Math.cos(a + k * s) * rr, cy + Math.sin(a + k * s) * rr);
    g.lineTo(cx + Math.cos(a + s) * r, cy + Math.sin(a + s) * r);
  }
  g.closePath();
}
const silver = (y0, y1) => { const s = g.createLinearGradient(0, y0, 0, y1); for (const [o, c] of [[0, '#f6f6f6'], [0.45, '#c9cacc'], [0.52, '#7d7f83'], [1, '#e4e5e7']]) s.addColorStop(o, c); return s; };
g.save(); g.globalAlpha = 0.5; g.lineJoin = 'round';
gear(90, 720, 360, 14, 70); g.strokeStyle = '#000'; g.lineWidth = 40; g.stroke(); g.strokeStyle = silver(290, 1150); g.lineWidth = 26; g.stroke();
g.beginPath(); g.arc(90, 720, 300, 0, TAU); g.strokeStyle = '#d4101c'; g.lineWidth = 16; g.stroke();
g.restore();

// emblema: o próprio logo, recortado em círculo com borda suave
const BX = 752, BY = 720, BR = 208, k = BR / LR;
{
  const s = Math.round(LR * 1.08), C = Object.assign(document.createElement('canvas'), { width: 2 * s, height: 2 * s }), c = C.getContext('2d');
  c.drawImage(logo, LX - s, LY - s, 2 * s, 2 * s, 0, 0, 2 * s, 2 * s);
  const m = c.createRadialGradient(s, s, LR * 1.0, s, s, s); m.addColorStop(0, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalCompositeOperation = 'destination-in'; c.fillStyle = m; c.fillRect(0, 0, 2 * s, 2 * s);
  rg = g.createRadialGradient(BX, BY, BR * 0.6, BX, BY, BR * 1.5); rg.addColorStop(0, 'rgba(0,0,0,0.85)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(BX - BR * 1.6, BY - BR * 1.6, BR * 3.2, BR * 3.2);
  g.drawImage(C, BX - s * k, BY - s * k, 2 * s * k, 2 * s * k);
}

// texto metálico em itálico, no estilo do "AUTOMÓVEL" do logo
function metal(txt, x, y, size, fill, edge) {
  g.save(); g.translate(x, y); g.transform(1, 0, -0.2, 1, 0, 0);
  g.font = `700 ${size}px ${F}`; g.letterSpacing = `${Math.round(size * 0.02)}px`; g.lineJoin = 'round';
  g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 18; g.shadowOffsetY = 8;
  g.strokeStyle = edge; g.lineWidth = size * 0.12; g.strokeText(txt, 0, 0); g.shadowColor = 'transparent';
  g.strokeStyle = '#050505'; g.lineWidth = size * 0.06; g.strokeText(txt, 0, 0);
  g.fillStyle = fill; g.fillText(txt, 0, 0);
  const w = g.measureText(txt).width; g.restore(); return w;
}
const red = (y0, y1) => { const s = g.createLinearGradient(0, y0, 0, y1); for (const [o, c] of [[0, '#ff3b3b'], [0.45, '#d80f1a'], [0.55, '#86000b'], [1, '#e41d26']]) s.addColorStop(o, c); return s; };
const x0 = 1010, maxW = 2030 - x0;
let fs = 150; g.font = `700 ${fs}px ${F}`;
for (; fs > 60; fs -= 2) { g.font = `700 ${fs}px ${F}`; g.letterSpacing = `${Math.round(fs * 0.02)}px`; if (g.measureText('MECÂNICA SEM MISTÉRIO').width + fs * 0.35 <= maxW) break; }
const yb = 745;
const w1 = metal('MECÂNICA ', x0 + 30, yb, fs, silver(yb - fs * 0.75, yb), '#b80f19');
metal('SEM MISTÉRIO', x0 + 30 + w1, yb, fs, red(yb - fs * 0.75, yb), '#d8d9db');

g.save(); g.textBaseline = 'alphabetic';
g.font = `600 34px ${F}`; g.letterSpacing = '10px'; g.fillStyle = '#ff2b33'; g.shadowColor = 'rgba(255,30,40,0.7)'; g.shadowBlur = 16;
g.fillRect(x0 + 40, 586, 70, 8); g.fillText('CANAL DE MECÂNICA  //  SHORTS', x0 + 130, 600);
g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 10;
const SUB = 'PROBLEMAS  ·  SONS  ·  CURIOSIDADES  ·  CONCEITOS';
for (let s = 40; s > 20; s--) { g.font = `600 ${s}px ${F}`; g.letterSpacing = `${Math.round(s * 0.14)}px`; if (g.measureText(SUB).width <= maxW - 14) break; }
g.fillStyle = '#e6e7ea'; g.fillText(SUB, x0 + 14, 826);
g.font = `italic 400 34px ${F}`; g.letterSpacing = '3px'; g.fillStyle = '#a9abb0';
g.fillText('Seu carro sempre em boas mãos.', x0 + 4, 890);
g.restore();

// vinheta: escurece as bordas da TV
rg = g.createRadialGradient(1280, 720, 700, 1280, 720, 1600); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.75)');
g.fillStyle = rg; g.fillRect(0, 0, W, H);

if (Q.has('guia')) {
  g.save(); g.lineWidth = 4; g.font = '28px sans-serif';
  for (const [w, h, c, n] of [[1546, 423, '#0f0', 'celular/todos'], [1855, 423, '#ff0', 'tablet'], [2560, 423, '#f0f', 'desktop']]) {
    g.strokeStyle = c; g.strokeRect((W - w) / 2, (H - h) / 2, w, h); g.fillStyle = c; g.fillText(n, (W - w) / 2 + 10, (H - h) / 2 - 10);
  }
  g.restore();
}
window.render = () => {}; window.DUR = 0; window.READY = true;

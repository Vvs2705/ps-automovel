// Modelos do EP01, em unidades de palco (y para cima), sem normalizar: a cinemática usa estes números.
// Motor monocilíndrico em corte (virabrequim, biela, pistão, cilindro, cárter, galeria, filtro) e o parafuso do canal.
import { Model } from './engine/mkmodel.mjs';
import { prepModel } from './engine/holo.js';

export const R = 0.22, L = 0.62;          // raio do virabrequim, comprimento da biela
export const PIN = R + L;                 // altura do pino do pistão no PMS (repouso)
const TAU = Math.PI * 2;

// extruda um contorno 2D (xy) entre z0 e z1: contornos da frente e de trás, arestas laterais, faces
function extrude(M, pts, z0, z1, every = 2) {
  const A = pts.map(([x, y]) => M.vtx([x, y, z0])), B = pts.map(([x, y]) => M.vtx([x, y, z1])), n = pts.length;
  for (let i = 0; i < n; i++) {
    M.edge(A[i], A[(i + 1) % n]); M.edge(B[i], B[(i + 1) % n]);
    if (i % every === 0) M.edge(A[i], B[i]);
    M.quad(A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]);
  }
}
const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });

export function buildEngine() {
  const M = new Model('MOTOR 1 CIL');
  const AX = { c: [0, 0, 0], d: [0, 0, 1] };
  // virabrequim
  M.part('virabrequim', { anchor: [0, R, 0.13], center: [0, 0.05, 0] });
  M.piece('crank-main', { axis: AX }); M.tube([0, 0, -0.44], [0, 0, 0.44], 0.075, { rings: 5, seg: 12, longs: 4 });
  M.piece('crank-webs', { axis: AX });
  const web = [...arc(0, 0, 0.30, -Math.PI * 0.12, -Math.PI * 0.88, 12), [-0.11, 0.0], ...arc(0, R, 0.11, Math.PI, 0, 8), [0.11, 0.0]];
  for (const z of [-0.16, 0.16]) extrude(M, web, z - 0.03, z + 0.03, 3);
  M.piece('crank-pin', { axis: AX }); M.tube([0, R, -0.13], [0, R, 0.13], 0.065, { rings: 3, seg: 12, longs: 4 });
  // biela: gira em torno do pino do pistão e sobe/desce com ele
  M.part('biela', { anchor: [0.06, R + L * 0.5, 0.05] });
  M.piece('rod', { axis: { c: [0, PIN, 0], d: [0, 0, 1] }, explode: [0, 1, 0] });
  M.tube([0, R, -0.05], [0, R, 0.05], 0.115, { rings: 2, seg: 16, longs: 8 });
  M.tube([0, PIN, -0.045], [0, PIN, 0.045], 0.07, { rings: 2, seg: 12, longs: 6 });
  extrude(M, [[-0.055, R + 0.1], [0.055, R + 0.1], [0.035, PIN - 0.06], [-0.035, PIN - 0.06]], -0.035, 0.035, 1);
  // pistão
  const pB = PIN - 0.13, pT = PIN + 0.22;
  M.part('pistao', { anchor: [0.275, pT - 0.06, 0], center: [0, PIN + 0.05, 0] });
  M.piece('piston', { explode: [0, 1, 0] });
  M.tube([0, pB, 0], [0, pT, 0], 0.265, { rings: 5, seg: 22, longs: 8 });
  M.disc([0, pT, 0], [0, 1, 0], 0.265, { rings: [0.265, 0.17, 0.07], seg: 22 });
  M.piece('piston-rings', { explode: [0, 1, 0], hot: true });
  for (const dy of [0.035, 0.07, 0.105]) M.ring([0, pT - dy, 0], [0, 1, 0], 0.272, 24, 0.016);
  M.piece('wrist-pin', { explode: [0, 1, 0] }); M.tube([0, PIN, -0.2], [0, PIN, 0.2], 0.045, { rings: 3, seg: 10, longs: 4 });
  // cilindro em corte (só a metade de trás) + cabeçote
  M.part('cilindro', { anchor: [-0.29, 0.9, 0] });
  M.piece('liner'); M.tube([0, 0.32, 0], [0, 1.14, 0], 0.29, { rings: 7, seg: 24, longs: 10, arc: [-0.27, 0.27] });
  M.piece('head'); M.box([0, 1.22, -0.05], [0.72, 0.16, 0.42]);
  M.tube([-0.12, 1.14, -0.05], [-0.12, 1.42, -0.05], 0.025, { rings: 2, seg: 8, longs: 2 });
  M.tube([0.12, 1.14, -0.05], [0.12, 1.42, -0.05], 0.025, { rings: 2, seg: 8, longs: 2 });
  M.disc([-0.12, 1.15, -0.05], [0, 1, 0], 0.08, { rings: [0.08, 0.03], seg: 14 }); M.disc([0.12, 1.15, -0.05], [0, 1, 0], 0.08, { rings: [0.08, 0.03], seg: 14 });
  // cárter com o óleo
  M.part('carter', { anchor: [0.3, -0.42, 0.28], center: [0, -0.38, 0] });
  M.piece('pan'); extrude(M, [[-0.46, -0.2], [0.46, -0.2], [0.37, -0.58], [-0.37, -0.58]], -0.3, 0.3, 1);
  M.piece('oil-sump');
  for (let i = 0; i <= 6; i++) { const z = -0.28 + 0.56 * i / 6, a = M.vtx([-0.395, -0.44, z]), b = M.vtx([0.395, -0.44, z]); M.edge(a, b); }
  for (let i = 0; i <= 8; i++) { const x = -0.395 + 0.79 * i / 8, a = M.vtx([x, -0.44, -0.28]), b = M.vtx([x, -0.44, 0.28]); M.edge(a, b); }
  // galeria de óleo: pescador → filtro → mancal e parede do cilindro
  M.part('galeria', { anchor: [0.34, 0.3, 0.0] });
  M.piece('gallery', { box: false });
  M.polyTube(GALLERY[0], 0.018, { seg: 6, longs: 2, ringsPer: 2 });
  M.polyTube(GALLERY[1], 0.018, { seg: 6, longs: 2, ringsPer: 2 });
  M.part('filtro', { anchor: [0.62, -0.1, 0.1], center: [0.52, -0.12, 0.1] });
  M.piece('filter'); M.tube([0.52, -0.27, 0.1], [0.52, 0.03, 0.1], 0.1, { rings: 6, seg: 16, longs: 8 });
  M.disc([0.52, -0.27, 0.1], [0, 1, 0], 0.1, { rings: [0.1, 0.04], seg: 16 });
  return prepModel(M.toJSON());
}
// caminhos da galeria (os pontinhos de fluxo andam por eles)
export const GALLERY = [
  [[0.22, -0.52, 0], [0.22, -0.3, 0], [0.42, -0.27, 0.1], [0.42, -0.02, 0.1], [0.22, 0.0, 0], [0.08, 0.0, 0]],
  [[0.42, -0.02, 0.1], [0.36, 0.2, 0.02], [0.33, 0.62, 0], [0.31, 0.95, 0]],
];

export function buildBolt() {
  const M = new Model('PARAFUSO');
  M.part('parafuso', { anchor: [0.33, 0.1, 0] });
  M.piece('bolt', { explode: [0, 1, 0], axis: { c: [0, 0.0, 0], d: [0, 0, 1] } });
  const hex = (y) => { const ids = M.circle([0, y, 0], [0, 1, 0], 0.34, 6); return ids; };
  const A = hex(0.03), B = hex(0.24);
  for (let i = 0; i < 6; i++) { M.edge(A[i], B[i]); M.quad(A[i], A[(i + 1) % 6], B[(i + 1) % 6], B[i]); }
  M.ring([0, 0.255, 0], [0, 1, 0], 0.27, 24, 0.02);      // chanfro
  M.ring([0, 0.015, 0], [0, 1, 0], 0.38, 28, 0.03);      // arruela
  M.tube([0, -1.0, 0], [0, 0.0, 0], 0.15, { rings: 6, seg: 16, longs: 8 });
  let prev = null; const pitch = 0.085, n = Math.round((0.86 / pitch) * 24);   // rosca: hélice
  for (let i = 0; i <= n; i++) { const a = i / 24 * TAU, y = -0.97 + i / 24 * pitch, id = M.vtx([Math.cos(a) * 0.162, y, Math.sin(a) * 0.162]); if (prev !== null) M.edge(prev, id); prev = id; }
  return prepModel(M.toJSON());
}

export function buildPlate() {
  const M = new Model('CHAPA');
  M.part('chapa', { anchor: [0.7, -0.06, 0.5] });
  M.piece('plate'); M.box([0, -0.07, 0], [1.9, 0.14, 1.2]);
  M.ring([0, 0.0, 0], [0, 1, 0], 0.19, 24, 0.0);
  return prepModel(M.toJSON());
}

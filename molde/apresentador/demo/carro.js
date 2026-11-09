// Carro genérico de arame (hatch ou sedã), sem marca nem logotipo. Frente para -x, lado do motorista em +z, chão em y = 0.
// Cada zona é uma parte do modelo: o filme acende uma zona com focus/keep/flash do Holo.
import { Model } from './engine/mkmodel.mjs';
import { prepModel } from './engine/holo.js';

const TAU = Math.PI * 2;
const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });

export const CAR = { R: 0.2, WX: [-0.8, 0.78], HZ: 0.5, Y0: 0.2 };
export const ZONAS = ['carroceria', 'pneus', 'freios', 'susp_dianteira', 'susp_traseira', 'motor', 'cambio', 'arrefecimento', 'eletrica',
  'escapamento', 'painel', 'farois', 'lanternas', 'tanque', 'estepe'];
// pontos com nome (lado do motorista) para as marcas "pontos" do cena.json; os nomes das zonas também valem (usam a âncora)
export const PONTOS = {
  porta: [-0.25, 0.42, 0.5], coluna: [0.12, 0.6, 0.47], tanque: [0.95, 0.6, 0.48], estepe: [0.95, 0.36, 0],
  painel: [-0.42, 0.68, 0.15], volante: [-0.3, 0.66, 0.22], capo: [-0.9, 0.62, 0], chassi: [-0.6, 0.62, 0.0],
  rodaD: [-0.8, 0.2, 0.5], rodaT: [0.78, 0.2, 0.5], farol: [-1.22, 0.5, 0.35], lanterna: [1.22, 0.64, 0.37], escape: [1.3, 0.14, -0.25],
};

export function buildCar(tipo = 'hatch') {
  const { R: WR, WX, HZ, Y0 } = CAR, M = new Model('CARRO');
  const well = cx => arc(cx, Y0, 0.25, 0, Math.PI, 8);
  const top = tipo === 'sedan'
    ? [[-0.28, 0.93], [0.42, 0.95], [0.8, 0.7], [1.24, 0.67], [1.27, 0.32]]
    : [[-0.28, 0.94], [0.62, 0.96], [1.05, 0.86], [1.22, 0.62], [1.24, 0.3]];
  const prof = [[-1.25, Y0 + 0.04], [-1.27, 0.42], [-1.2, 0.55], [-0.62, 0.64], ...top, [top[top.length - 1][0], Y0 + 0.02], ...well(WX[1]), ...well(WX[0])];
  const NC = 4 + top.length + 1;                                     // cantos do perfil (antes das caixas de roda)
  const zf = ([, y]) => (y > 0.66 ? HZ * 0.8 : HZ);                    // cabine mais estreita que a carroceria
  // ----- carroceria -----
  M.part('carroceria', { anchor: [0.2, 0.96, HZ] });
  M.piece('carroceria');
  const A = prof.map(p => M.vtx([p[0], p[1], -zf(p)])), B = prof.map(p => M.vtx([p[0], p[1], zf(p)])), n = prof.length;
  for (let i = 0; i < n; i++) { M.edge(A[i], A[(i + 1) % n]); M.edge(B[i], B[(i + 1) % n]); M.quad(A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]); }
  for (let i = 0; i < NC; i++) M.edge(A[i], B[i]);
  const L = (pts, closed) => { const ids = pts.map(p => M.vtx(p)); for (let i = 0; i < ids.length - (closed ? 0 : 1); i++) M.edge(ids[i], ids[(i + 1) % ids.length]); return ids; };
  for (const s of [-1, 1]) {
    const z = s * HZ * 1.004, zw = s * HZ * 0.81;
    const rear = tipo === 'sedan' ? [[0.4, 0.92], [0.68, 0.7]] : [[0.6, 0.93], [0.98, 0.7]];
    L([[-0.58, 0.67, zw], [-0.3, 0.9, zw], [0.06, 0.91, zw], [0.06, 0.67, zw]], true);               // janela da frente
    L([[0.16, 0.67, zw], [0.16, 0.91, zw], [rear[0][0], rear[0][1], zw], [rear[1][0], rear[1][1], zw]], true);   // janela de trás
    L([[-0.6, 0.64, z], [1.1, 0.64, z]]);                                                         // linha de cintura
    L([[-0.55, Y0 + 0.08, z], [-0.55, 0.64, z]]); L([[0.12, Y0 + 0.08, z], [0.12, 0.64, z]]); L([[0.66, Y0 + 0.1, z], [0.66, 0.64, z]]);   // portas
    L([[-0.55, Y0 + 0.08, z], [0.66, Y0 + 0.08, z]]);                                            // soleira
    L([[-0.12, 0.56, z], [0.0, 0.56, z]]); L([[0.42, 0.56, z], [0.54, 0.56, z]]);                // maçanetas
    M.box([-0.5, 0.74, s * (HZ * 0.84)], [0.08, 0.06, 0.08]);                                     // retrovisor
  }
  L([[-1.27, 0.36, -0.3], [-1.27, 0.36, 0.3]]); L([[1.25, 0.36, -0.42], [1.25, 0.36, 0.42]]);    // para-choques
  // ----- rodas: pneus (com raios para mostrar giro) e freios -----
  M.part('pneus', { anchor: [WX[0], WR * 2, HZ] });
  const wheels = [];
  WX.forEach((wx, j) => { for (const s of [-1, 1]) wheels.push([wx, s, (j ? 'T' : 'D') + (s > 0 ? 'E' : 'D')]); });   // D/T = dianteira/traseira; E/D = esquerda/direita
  for (const [wx, s, id] of wheels) {
    M.piece('pneu' + id, { axis: { c: [wx, WR, 0], d: [0, 0, 1] } });
    const z0 = s * (HZ - 0.09), nz = [0, 0, 1];
    const T0 = M.circle([wx, WR, z0 - 0.07], nz, WR * 0.93, 32), T1 = M.circle([wx, WR, z0], nz, WR, 32), T2 = M.circle([wx, WR, z0 + 0.07], nz, WR * 0.93, 32);
    for (let i = 0; i < 32; i++) { M.quad(T0[i], T0[(i + 1) % 32], T1[(i + 1) % 32], T1[i]); M.quad(T1[i], T1[(i + 1) % 32], T2[(i + 1) % 32], T2[i]); if (i % 4 === 0) { M.edge(T0[i], T1[i]); M.edge(T1[i], T2[i]); } }
    const zr = z0 + s * 0.07, rim = M.circle([wx, WR, zr], nz, WR * 0.62, 25), hub = M.circle([wx, WR, zr], nz, WR * 0.16, 10);
    for (let i = 0; i < 5; i++) M.edge(rim[i * 5], hub[i * 2]);
  }
  M.part('freios', { anchor: [WX[0], WR + 0.05, HZ - 0.2] });
  M.piece('freios');
  for (const [wx, s] of wheels) {
    const zd = s * (HZ - 0.13);
    M.disc([wx, WR, zd], [0, 0, 1], 0.13, { rings: [0.13, 0.09, 0.05], seg: 20 });
    M.box([wx + 0.1, WR + 0.08, zd - s * 0.025], [0.07, 0.11, 0.06]);                             // pinça
  }
  // ----- suspensão -----
  const spring = (x, z, y0, y1, r) => { let prev = null; const nn = 6 * 16; for (let i = 0; i <= nn; i++) { const a = i / 16 * TAU, y = y0 + (y1 - y0) * i / nn, id = M.vtx([x + Math.cos(a) * r, y, z + Math.sin(a) * r]); if (prev !== null) M.edge(prev, id); prev = id; } };
  M.part('susp_dianteira', { anchor: [WX[0], 0.58, HZ - 0.2] });
  M.piece('susp_dianteira');
  for (const s of [-1, 1]) {
    const z = s * (HZ - 0.24);
    spring(WX[0], z, 0.3, 0.56, 0.06); M.tube([WX[0], 0.24, z], [WX[0], 0.62, z], 0.022, { rings: 2, seg: 8, longs: 2 });
    L([[WX[0], WR, s * (HZ - 0.15)], [WX[0] + 0.05, 0.14, s * 0.18], [WX[0] - 0.25, 0.14, s * 0.18], [WX[0], WR, s * (HZ - 0.15)]], false);   // bandeja
  }
  M.part('susp_traseira', { anchor: [WX[1], 0.56, HZ - 0.2] });
  M.piece('susp_traseira');
  M.tube([WX[1] - 0.05, 0.2, -(HZ - 0.15)], [WX[1] - 0.05, 0.2, HZ - 0.15], 0.03, { rings: 4, seg: 8, longs: 3 });   // eixo de torção
  for (const s of [-1, 1]) { const z = s * (HZ - 0.24); spring(WX[1] - 0.05, z, 0.24, 0.48, 0.055); M.tube([WX[1] + 0.07, 0.22, z], [WX[1] + 0.07, 0.5, z], 0.018, { rings: 2, seg: 8, longs: 2 }); }
  // ----- motor, câmbio, arrefecimento -----
  M.part('motor', { anchor: [-0.85, 0.62, 0.15] });
  M.piece('motor');
  M.box([-0.86, 0.4, 0], [0.34, 0.24, 0.48]); M.box([-0.86, 0.56, 0], [0.3, 0.08, 0.44]);
  for (let i = 0; i < 4; i++) M.circle([-0.86, 0.605, -0.165 + i * 0.11], [0, 1, 0], 0.03, 10);
  for (let i = 0; i < 4; i++) M.polyTube([[-0.72, 0.55, -0.165 + i * 0.11], [-0.66, 0.6, -0.165 + i * 0.11], [-0.66, 0.6, 0]], 0.012, { seg: 6, longs: 2, ringsPer: 2 });
  M.part('cambio', { anchor: [-0.62, 0.42, 0.34] });
  M.piece('cambio');
  M.tube([-0.82, 0.36, 0.24], [-0.82, 0.36, 0.42], 0.13, { rings: 3, seg: 14, longs: 6 });
  M.box([-0.66, 0.34, 0.33], [0.2, 0.18, 0.18]);
  M.tube([-0.8, WR, 0.24], [-0.8, WR, HZ - 0.16], 0.02, { rings: 3, seg: 6, longs: 2 }); M.tube([-0.8, WR, -0.12], [-0.8, WR, -(HZ - 0.16)], 0.02, { rings: 3, seg: 6, longs: 2 });   // semieixos
  L([[-0.6, 0.4, 0.33], [-0.3, 0.5, 0.05]]);                                                     // trambulador até a alavanca
  M.part('arrefecimento', { anchor: [-1.14, 0.52, 0.3] });
  M.piece('arrefecimento');
  M.box([-1.14, 0.38, 0], [0.04, 0.24, 0.72]);
  for (let i = 1; i < 12; i++) L([[-1.12, 0.27, -0.36 + i * 0.06], [-1.12, 0.49, -0.36 + i * 0.06]]);
  M.circle([-1.08, 0.38, 0], [1, 0, 0], 0.1, 16);
  M.polyTube([[-1.12, 0.47, 0.25], [-1.04, 0.5, 0.2], [-1.03, 0.5, 0.05]], 0.016, { seg: 6, longs: 2, ringsPer: 2 });
  M.polyTube([[-1.12, 0.29, -0.25], [-1.04, 0.3, -0.2], [-1.03, 0.33, -0.1]], 0.016, { seg: 6, longs: 2, ringsPer: 2 });
  M.tube([-0.98, 0.52, -0.33], [-0.98, 0.62, -0.33], 0.04, { rings: 2, seg: 10, longs: 3 });    // reservatório
  // ----- elétrica: bateria + chicote até faróis e lanternas -----
  M.part('eletrica', { anchor: [-0.98, 0.6, 0.3] });
  M.piece('eletrica');
  M.box([-0.98, 0.5, 0.3], [0.16, 0.14, 0.12]);
  M.tube([-1.01, 0.57, 0.27], [-1.01, 0.6, 0.27], 0.012, { rings: 2, seg: 6, longs: 2 }); M.tube([-0.95, 0.57, 0.33], [-0.95, 0.6, 0.33], 0.012, { rings: 2, seg: 6, longs: 2 });
  L([[-0.95, 0.58, 0.33], [-0.6, 0.3, 0.38], [0.66, 0.3, 0.38], [1.18, 0.6, 0.37]]);           // chicote até a lanterna esquerda
  L([[0.66, 0.3, 0.38], [0.9, 0.3, -0.38], [1.18, 0.6, -0.37]]);
  L([[-1.01, 0.58, 0.27], [-1.18, 0.5, 0.35]]); L([[-1.01, 0.58, 0.27], [-1.1, 0.52, -0.35]]);
  // ----- escapamento -----
  M.part('escapamento', { anchor: [1.25, 0.14, -0.25] });
  M.piece('escapamento');
  M.polyTube([[-0.95, 0.32, -0.05], [-0.9, 0.12, -0.05], [-0.4, 0.1, -0.08], [0.7, 0.1, -0.15]], 0.025, { seg: 8, longs: 3, ringsPer: 3 });
  M.tube([0.7, 0.12, -0.18], [1.1, 0.12, -0.18], 0.07, { rings: 4, seg: 14, longs: 6 });
  M.tube([1.1, 0.12, -0.2], [1.32, 0.14, -0.25], 0.022, { rings: 2, seg: 8, longs: 3 });
  // ----- painel -----
  M.part('painel', { anchor: [-0.42, 0.7, 0.2] });
  M.piece('painel');
  L(Array.from({ length: 11 }, (_, i) => [-0.44 + 0.03 * Math.sin(i / 10 * Math.PI), 0.66, -0.4 + 0.08 * i]));
  L(Array.from({ length: 11 }, (_, i) => [-0.38 + 0.03 * Math.sin(i / 10 * Math.PI), 0.6, -0.4 + 0.08 * i]));
  M.circle([-0.3, 0.64, 0.22], [1, 0.35, 0], 0.1, 20); M.circle([-0.3, 0.64, 0.22], [1, 0.35, 0], 0.025, 8);
  M.circle([-0.42, 0.7, 0.16], [1, 0.3, 0], 0.035, 12); M.circle([-0.42, 0.7, 0.28], [1, 0.3, 0], 0.035, 12);
  // ----- faróis, lanternas -----
  M.part('farois', { anchor: [-1.22, 0.52, 0.36] });
  M.piece('farois');
  for (const s of [-1, 1]) { const q = [[-1.23, 0.46, s * 0.24], [-1.23, 0.46, s * 0.44], [-1.19, 0.55, s * 0.44], [-1.19, 0.55, s * 0.24]].map(p => M.vtx(p)); M.quad(...q); for (let i = 0; i < 4; i++) M.edge(q[i], q[(i + 1) % 4]); M.circle([-1.22, 0.505, s * 0.34], [1, 0.2, 0], 0.035, 10); }
  M.part('lanternas', { anchor: [1.22, 0.66, 0.38] });
  M.piece('lanternas');
  const ly = tipo === 'sedan' ? [0.5, 0.63] : [0.52, 0.66], lx = tipo === 'sedan' ? 1.26 : 1.23;
  for (const s of [-1, 1]) { const q = [[lx, ly[0], s * 0.28], [lx, ly[0], s * 0.46], [lx - 0.02, ly[1], s * 0.46], [lx - 0.02, ly[1], s * 0.28]].map(p => M.vtx(p)); M.quad(...q); for (let i = 0; i < 4; i++) M.edge(q[i], q[(i + 1) % 4]); L([[lx, (ly[0] + ly[1]) / 2, s * 0.3], [lx, (ly[0] + ly[1]) / 2, s * 0.44]]); }
  // ----- tanque, estepe -----
  M.part('tanque', { anchor: [0.95, 0.6, HZ] });
  M.piece('tanque');
  M.box([0.42, 0.2, 0], [0.42, 0.1, 0.62]);
  M.polyTube([[0.6, 0.24, 0.25], [0.85, 0.45, 0.4], [0.95, 0.6, 0.47]], 0.018, { seg: 6, longs: 2, ringsPer: 2 });
  M.circle([0.95, 0.6, HZ * 1.006], [0, 0, 1], 0.05, 14);
  M.part('estepe', { anchor: [0.95, 0.4, 0] });
  M.piece('estepe');
  M.ring([0.95, 0.3, 0], [0, 1, 0], 0.18, 28, 0.08); M.circle([0.95, 0.34, 0], [0, 1, 0], 0.08, 14);
  return prepModel(M.toJSON());
}

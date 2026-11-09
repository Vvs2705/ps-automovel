// Modelos reaproveitados do EP01 (ep01-oleo/models.js): ambulância do PS Automóvel e pista. O carro genérico está em carro.js.
import { Model } from './engine/mkmodel.mjs';
import { prepModel } from './engine/holo.js';

const TAU = Math.PI * 2;

// extruda um contorno 2D (xy) entre z0 e z1: contornos da frente e de trás, arestas laterais, faces
function extrude(M, pts, z0, z1, every = 2, open = -1) {   // open: índice do segmento sem face (vão da porta)
  const A = pts.map(([x, y]) => M.vtx([x, y, z0])), B = pts.map(([x, y]) => M.vtx([x, y, z1])), n = pts.length;
  for (let i = 0; i < n; i++) {
    M.edge(A[i], A[(i + 1) % n]); M.edge(B[i], B[(i + 1) % n]);
    if (i % every === 0) M.edge(A[i], B[i]);
    if (i !== open) M.quad(A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]);
  }
}
const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });

// ---------- ambulância do PS Automóvel (vinheta e final) ----------
// Furgão com a frente para -x e as portas traseiras em x = X1. Tudo anda junto por explode [1,0,0] (valor = deslocamento em x).
// O Holo só gira em z: as rodas giram no próprio eixo, o corpo "mergulha" no freio em torno do contato da roda dianteira,
// e as portas (que abrem em torno de y) viram uma parte por ângulo: portas0 (fechadas) … portas6 (abertas), escolhidas com `only`.
export const VAN = {
  R: 0.2, WX: [-0.88, 0.85], HZ: 0.52, X1: 1.3, DOORS: 6,
  side: { x0: -0.32, x1: 1.2, y0: 0.56, y1: 1.0 },                 // painel lateral (z = +HZ) onde vai o nome
  lights: [[-0.39, 1.2, 0.26, 'r'], [-0.15, 1.2, 0.26, 'w'], [-0.39, 1.2, -0.26, 'r'], [-0.15, 1.2, -0.26, 'w'], [1.26, 1.08, 0.44, 'r'], [1.26, 1.08, -0.44, 'r']],
};
export function buildAmbulance() {
  const { R: WR, WX, HZ, X1, DOORS } = VAN, PIV = { c: [WX[0], 0, 0], d: [0, 0, 1] }, Y0 = 0.22;
  const M = new Model('AMBULANCIA');
  const well = cx => arc(cx, Y0, 0.25, 0, Math.PI, 8);                // caixa de roda, da direita para a esquerda
  const prof = [[-1.28, Y0], [-1.28, 0.5], [-1.0, 0.6], [-0.7, 1.0], [-0.46, 1.02], [-0.42, 1.12], [X1, 1.12], [X1, Y0], ...well(WX[1]), ...well(WX[0])];
  M.part('furgao', { anchor: [0.4, 1.12, HZ] });
  M.piece('body', { explode: [1, 0, 0], axis: PIV });
  extrude(M, prof, -HZ, HZ, 99, 6);                                    // segmento 6 = traseira aberta (vão das portas)
  for (let i = 1; i < 8; i++) M.edge(i, i + prof.length);              // arestas só nos cantos do perfil (A[i] = i, B[i] = n + i)
  const side = (pts, z) => pts.map(([x, y]) => M.vtx([x, y, z]));
  const lines = (pts, z, closed) => { const ids = side(pts, z); for (let i = 0; i < ids.length - (closed ? 0 : 1); i++) M.edge(ids[i], ids[(i + 1) % ids.length]); };
  for (const z of [-HZ, HZ]) {
    const zz = z * 1.006;
    lines([[-0.97, 0.64], [-0.72, 0.96], [-0.5, 0.97], [-0.5, 0.64]], zz, true);                 // janela da cabine
    lines([[-0.47, 0.26], [-0.47, 1.0]], zz);                                                     // fresta da porta
    lines([[-0.42, 0.5], [X1, 0.5]], zz); lines([[-0.42, 0.535], [X1, 0.535]], zz);              // faixa da ambulância
    M.quad(...side([[-0.42, 0.47], [X1, 0.47], [X1, 1.12], [-0.42, 1.12]], z));                  // faces laterais (brilho do holograma)
    M.quad(...side([[-1.28, 0.47], [-0.5, 0.47], [-0.5, 1.02], [-0.7, 1.0]], z));
    M.quad(...side([[-1.28, 0.47], [-0.7, 1.0], [-1.0, 0.6], [-1.28, 0.5]], z));
  }
  M.box([-1.27, 0.3, 0], [0.08, 0.1, HZ * 2 + 0.04]); M.box([X1 + 0.03, 0.27, 0], [0.06, 0.08, HZ * 2 + 0.04]);   // para-choques
  for (const s of [-1, 1]) { M.box([-0.96, 0.86, s * (HZ + 0.07)], [0.05, 0.13, 0.06]); M.edge(M.vtx([-0.9, 0.86, s * HZ]), M.vtx([-0.95, 0.86, s * (HZ + 0.05)])); }   // retrovisores
  M.piece('inside', { explode: [1, 0, 0], axis: PIV, box: false });   // parede da cabine: dá fundo quando a porta abre
  { const Q = [[-0.42, Y0 + 0.02, -HZ], [-0.42, Y0 + 0.02, HZ], [-0.42, 1.1, HZ], [-0.42, 1.1, -HZ]].map(p => M.vtx(p)); M.quad(...Q); for (let i = 0; i < 4; i++) M.edge(Q[i], Q[(i + 1) % 4]); }
  M.part('luzes', { anchor: [-0.27, 1.2, 0] });
  M.piece('lights', { explode: [1, 0, 0], axis: PIV });
  M.box([-0.27, 1.155, 0], [0.32, 0.07, 0.62]); for (const z of [-0.44, 0.44]) M.box([X1 - 0.04, 1.08, z], [0.06, 0.06, 0.1]);
  M.part('rodas', { anchor: [WX[0], 0, HZ] });
  WX.forEach((wx, j) => {
    M.piece(j ? 'wheelR' : 'wheelF', { explode: [1, 0, 0], axis: { c: [wx, WR, 0], d: [0, 0, 1] } });
    for (const s of [-1, 1]) {
      const z0 = s * (HZ - 0.07), n = [0, 0, 1];
      const T0 = M.circle([wx, WR, z0 - 0.06], n, WR * 0.94, 32), T1 = M.circle([wx, WR, z0], n, WR, 32), T2 = M.circle([wx, WR, z0 + 0.06], n, WR * 0.94, 32);
      for (let i = 0; i < 32; i++) { M.quad(T0[i], T0[(i + 1) % 32], T1[(i + 1) % 32], T1[i]); M.quad(T1[i], T1[(i + 1) % 32], T2[(i + 1) % 32], T2[i]); if (i % 4 === 0) { M.edge(T0[i], T1[i]); M.edge(T1[i], T2[i]); } }
      const zf = z0 + s * 0.06, rim = M.circle([wx, WR, zf], n, WR * 0.6, 25), hub = M.circle([wx, WR, zf], n, WR * 0.18, 10);
      for (let i = 0; i < 5; i++) M.edge(rim[i * 5], hub[i * 2]);       // raios: mostram o giro
    }
  });
  for (let k = 0; k <= DOORS; k++) {                                     // portas traseiras: uma parte por ângulo
    M.part('portas' + k, { anchor: [X1, 1.0, HZ] });
    M.piece('portas' + k, { explode: [1, 0, 0], axis: PIV });
    const th = k / DOORS * 1.75;
    for (const s of [-1, 1]) {
      const d = [Math.sin(th), 0, -s * Math.cos(th)], P = (u, y) => M.vtx([X1 + d[0] * u, y, s * HZ + d[2] * u]), w = HZ * 0.99;
      const q = [P(0, 0.25), P(w, 0.25), P(w, 1.09), P(0, 1.09)]; M.quad(...q); for (let i = 0; i < 4; i++) M.edge(q[i], q[(i + 1) % 4]);
      const j = [P(w * 0.15, 0.72), P(w * 0.85, 0.72), P(w * 0.85, 1.0), P(w * 0.15, 1.0)]; for (let i = 0; i < 4; i++) M.edge(j[i], j[(i + 1) % 4]);
    }
  }
  // a carga: o carro deitado numa maca (só no final)
  M.part('carga', { anchor: [0.4, 0.85, 0] });
  M.piece('maca', { explode: [1, 0, 0], axis: PIV });
  M.box([0.42, 0.37, 0], [1.5, 0.035, 0.62]);
  for (const x of [-0.25, 1.09]) for (const z of [-0.25, 0.25]) { M.tube([x, 0.355, z], [x, Y0 + 0.03, z], 0.012, { rings: 2, seg: 6, longs: 2 }); M.circle([x, Y0 + 0.03, z], [0, 0, 1], 0.025, 8); }
  M.piece('car', { explode: [1, 0, 0], axis: PIV });
  const cx = 0.42, cy = 0.39, cr = 0.085, cw = x => arc(x, cy + 0.06, 0.11, 0, Math.PI, 6);
  const car = [[cx - 0.62, cy + 0.06], [cx - 0.62, cy + 0.2], [cx - 0.42, cy + 0.26], [cx - 0.18, cy + 0.43], [cx + 0.3, cy + 0.44], [cx + 0.58, cy + 0.26], [cx + 0.62, cy + 0.2], [cx + 0.62, cy + 0.06], ...cw(cx + 0.38), ...cw(cx - 0.38)];
  extrude(M, car, -0.3, 0.3, 3);
  for (const z of [-0.302, 0.302]) {
    for (const W of [[[cx - 0.38, cy + 0.27], [cx - 0.17, cy + 0.41], [cx + 0.08, cy + 0.41], [cx + 0.08, cy + 0.27]], [[cx + 0.13, cy + 0.27], [cx + 0.13, cy + 0.41], [cx + 0.29, cy + 0.41], [cx + 0.5, cy + 0.27]]]) lines(W, z, true);
    for (const x of [cx - 0.38, cx + 0.38]) { M.circle([x, cy + cr, z * 0.97], [0, 0, 1], cr, 16); M.circle([x, cy + cr, z * 0.97], [0, 0, 1], cr * 0.5, 10); }
  }
  return prepModel(M.toJSON());
}
export function buildRoad() {                                          // pista parada: dá a sensação de movimento
  const M = new Model('ESTRADA'); M.part('estrada', { anchor: [0, 0, 1] }); M.piece('road', { box: false });
  const ln = (x0, x1, z) => M.edge(M.vtx([x0, 0, z]), M.vtx([x1, 0, z]));
  ln(-9, 9, 0.95); ln(-9, 9, 1.2); ln(-9, 9, -2.85);                   // meio-fio e bordas
  for (let x = -9; x < 9; x += 1.1) ln(x, x + 0.55, -0.95);            // faixa tracejada
  return prepModel(M.toJSON());
}

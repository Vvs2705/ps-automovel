// Folha dos 3 conceitos (conceitos.jpg): os três personagens na janela, com a mesma pose-base, e as bocas do padrão.
import { POSE, EXPR, janela, desenhaNaJanela, desenhaMecanico as DES } from './apresentador/apresentador.js';
const F = 'Rajdhani, Arial, sans-serif';
const pose = (expr, o = {}) => { const E = EXPR[expr]; return { ...POSE, fecha: E.lid, baixo: E.baixo, wide: E.wide, brow: { raise: E.raise, tilt: E.tilt }, sorriso: E.sorriso, ...o }; };
const CONC = [
  { p: 'mecanico', nome: '(a) Doutor Graxa · PADRÃO', l1: 'Mecânico de jaleco, boné PS, graxa no rosto', l2: 'e estetoscópio: o médico do Resgate automotivo.',
    pose: pose('feliz', { boca: { w: 1.12, h: 0.55, r: 0, press: 0 }, gaze: [0.5, -0.1], gesto: { tipo: 'aponta', k: 1, ang: -0.35, onda: 0 } }) },
  { p: 'robo', nome: '(b) Robô Ré', l1: 'Robô de peças: faróis nos olhos, grade na boca,', l2: 'retrovisores, bateria no corpo, vela de antena.',
    pose: pose('neutro', { boca: { w: 1, h: 0.75, r: 0.1, press: 0 }, gesto: { tipo: 'acena', k: 1, ang: 0, onda: 0.6 }, t: 0.05 }) },
  { p: 'faisca', nome: '(c) Faísca', l1: 'A vela de ignição que explica o carro:', l2: 'mascote de desenho antigo, luvas e faísca.',
    pose: pose('surpreso', { boca: { w: 0.66, h: 0.8, r: 1, press: 0 }, gaze: [-0.3, 0], gesto: { tipo: 'aponta', k: 1, ang: -0.6, onda: 0 } }) },
];
const VIS = [['A', [1, 1, 0.12]], ['E', [1.12, 0.62, 0]], ['I', [1.18, 0.4, 0]], ['O', [0.66, 0.86, 1]], ['U', [0.46, 0.56, 1]], ['M B P', [0.86, 0, 0], 1], ['repouso', [0.95, 0, 0]]];
const txt = (g, s, x, y, px, w = 500, col = '#e8f7ff', al = 'center') => { g.font = `${w} ${px}px ${F}`; g.fillStyle = col; g.textAlign = al; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); };

export function folhaConceitos(g, W, H) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#03101a'; g.fillRect(0, 0, W, H);
  txt(g, 'PS AUTOMÓVEL · APRESENTADOR · 3 CONCEITOS', W / 2, 78, 52, 600);
  CONC.forEach((c, i) => {
    const cx = 420 + i * 780, w = 520, h = w * 1.04, B = { x0: cx - w / 2, x1: cx + w / 2, y1: 700, y0: 700 - h, w, h };
    janela(g, B, 1, 0.4); desenhaNaJanela(g, B, c.pose, c.p);
    if (i === 0) { g.fillStyle = '#d22a33'; g.beginPath(); g.roundRect(B.x1 - 170, B.y0 - 26, 190, 56, 10); g.fill(); txt(g, 'PADRÃO', B.x1 - 75, B.y0 + 14, 36, 600, '#fff'); }
    txt(g, c.nome, cx, 790, 46, 600); txt(g, c.l1, cx, 846, 34, 400, '#a9cfe0'); txt(g, c.l2, cx, 890, 34, 400, '#a9cfe0');
  });
  txt(g, 'Bocas do padrão (uma por quadro, a 24 fps: labios.json)', W / 2, 1000, 38, 500);
  VIS.forEach(([nome, m, press], i) => {
    const w = 250, h = 270, x0 = 175 + i * 300, y0 = 1040, B = { x0, x1: x0 + w, y0, y1: y0 + h, w, h };
    janela(g, B, 1, 0);
    g.save(); g.beginPath(); g.roundRect(x0, y0, w, h, 15); g.clip();
    const s = 0.95; g.translate(x0 + w / 2, y0 + h / 2 + 300 * s); g.scale(s, s);   // de perto: o rosto no meio da janela
    const p = pose('neutro', { boca: { w: m[0], h: m[1], r: m[2], press: press || 0 }, sorriso: nome === 'repouso' ? 0.35 : 0.1 });
    DES(g, p);
    g.restore();
    txt(g, nome, x0 + w / 2, y0 + h + 52, 40, 600);
  });
}

// Demo do apresentador: o filme do molde (cópia com as trocas da integração, feita por montar.py) + o apresentador, num clipe de ~18 s
// com dois trechos do vídeo 01-calibragem-pneu (dados/cortes.json). ?conceitos=1 desenha a folha dos 3 conceitos (--size 2400x1500).
import { makeFilm } from './film.js';
import { makeApresentador } from './apresentador/apresentador.js';
import { folhaConceitos } from './conceitos.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
const Q = new URLSearchParams(location.search);
await Promise.all(['300', '400', '500', '600'].map(w => document.fonts.load(`${w} 40px Rajdhani`)).concat([document.fonts.load('20px ShareTechMono')]));
if (Q.has('conceitos')) {
  cv.width = innerWidth; cv.height = innerHeight;
  window.DUR = 1; window.render = t => folhaConceitos(g, cv.width, cv.height, t);
} else {
  const get = async u => { const r = await fetch(`dados/${u}`); if (!r.ok) throw new Error(`faltou dados/${u} (rode montar.py)`); return r.json(); };
  let [TL, cena, dur, words, lines, labios, cortes] = await Promise.all(['timeline.json', 'cena.json', 'voices/dur.json', 'voices/words.json', 'voices/lines.json', 'labios.json', 'cortes.json'].map(get));
  // integração (igual ao passo 2 do APRESENTADOR.md): "apresentador" no cena.json = false (desliga) ou 'mecanico' | 'robo' | 'faisca'
  const AP = cena.apresentador === false ? null : makeApresentador({ TL, labios, cena, personagem: Q.get('p') || (typeof cena.apresentador === 'string' ? cena.apresentador : 'mecanico') });
  const film = makeFilm(TL, cena, dur, words, lines, AP);
  if (Q.has('inteiro')) cortes = [[0, TL.dur]];   // o vídeo inteiro, para a checagem de texto
  const map = t => { let acc = 0; for (const [a, b] of cortes) { if (t < acc + b - a) return a + t - acc; acc += b - a; } return cortes.at(-1)[1]; };
  window.DUR = cortes.reduce((s, [a, b]) => s + b - a, 0);
  window.WARN = film.WARN;
  window.TEXTS = t => film.render(g, map(t), { nosub: Q.has('nosub') });
  window.render = t => { film.render(g, map(t), { nosub: Q.has('nosub') }); };
}
window.READY = true;

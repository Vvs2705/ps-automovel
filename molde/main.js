// Entrada da página: ?d=saida/<nome> aponta a pasta do vídeo (timeline.json, cena.json, voices/) → filme
// Estilo: ?estilo=<nome> ou "estilo" no cena.json (estilos/ESTILOS.md); sem nenhum, hologram-hud (film.js).
import { makeApresentador } from './apresentador/apresentador.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
const Q = new URLSearchParams(location.search), D = (Q.get('d') || '').replace(/\/+$/, '');
if (!D) throw new Error('falta ?d=saida/<nome> (a pasta do vídeo)');
await Promise.all(['300', '400', '500', '600'].map(w => document.fonts.load(`${w} 40px Rajdhani`)).concat([document.fonts.load('20px ShareTechMono')]));
const get = async u => { const r = await fetch(`${D}/${u}`); if (!r.ok) throw new Error(`faltou ${D}/${u}`); return r.json(); };
const [TL, cena, dur, words, lines] = await Promise.all([get('timeline.json'), get('cena.json'), get('voices/dur.json'), get('voices/words.json'), get('voices/lines.json')]);
// apresentador (apresentador/APRESENTADOR.md): "apresentador" no cena.json = false (desliga) ou 'mecanico' (padrão) | 'robo' | 'faisca'
const labios = await fetch(`${D}/labios.json`).then(r => (r.ok ? r.json() : null), () => null);
const AP = labios && cena.apresentador !== false ? makeApresentador({ TL, labios, cena, personagem: typeof cena.apresentador === 'string' ? cena.apresentador : 'mecanico' }) : null;
const estilo = Q.get('estilo') || cena.estilo || 'hologram-hud';
if (!/^[a-z0-9-]+$/.test(estilo)) throw new Error(`estilo "${estilo}" inválido`);
const { makeFilm } = await import(estilo === 'hologram-hud' ? './film.js' : `./estilos/${estilo}.js`);
const film = makeFilm(TL, cena, dur, words, lines, AP);
for (const l of lines) {                       // a legenda pinta palavra a palavra: avisa se a voz devolveu outro número de palavras
  const n = l.text.split(' ').length, m = (words[l.id] || []).length;
  if (n !== m) film.WARN.push(`${l.id}: ${n} palavras no texto, ${m} no tempo da voz (karaokê fica proporcional)`);
}
window.DUR = film.DUR;
window.EV = film.EV;
window.SUBS = film.subs();
window.WARN = film.WARN;
window.TEXTS = t => film.render(g, t, { nosub: Q.has('nosub') });
window.render = t => { film.render(g, t, { nosub: Q.has('nosub') }); };
window.READY = true;

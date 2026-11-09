// Entrada da página: tempos (timeline.json) + voz (dur.json, words.json, lines.json) → filme
import { makeFilm } from './film.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
const Q = new URLSearchParams(location.search);
await Promise.all(['300', '400', '500', '600'].map(w => document.fonts.load(`${w} 40px Rajdhani`)).concat([document.fonts.load('20px ShareTechMono')]));
const get = async u => { const r = await fetch(u); if (!r.ok) throw new Error(`faltou ${u}`); return r.json(); };
const [TL, dur, words, lines] = await Promise.all([get('timeline.json'), get('voices/dur.json'), get('voices/words.json'), get('voices/lines.json')]);
for (const l of lines) {                       // a legenda pinta palavra a palavra: o número de palavras tem de bater
  const n = l.text.split(' ').length, m = (words[l.id] || []).length;
  if (n !== m) console.warn(`${l.id}: ${n} palavras no texto, ${m} no tempo da voz`);
}
const film = makeFilm(TL, dur, words);
film.setText(lines);
window.DUR = film.DUR;
window.EV = film.EV;
window.SUBS = film.subs();
window.CUES = film.C;
window.TEXTS = t => film.render(g, t, { nosub: Q.has('nosub') });
window.render = t => { film.render(g, t, { nosub: Q.has('nosub') }); };
window.READY = true;

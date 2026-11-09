// Checagem de texto na tela: node tools/checar.mjs <molde> <d=saida/nome> [passo=0.1]
// Percorre o filme e acusa: textos que se encostam (caixas a menos de 6 px), legenda fora de y 1350–1500 ou de x 130–910,
// painéis que descem abaixo de y 1316 (a legenda começa ali) e os avisos do cena.json (window.WARN). Sai com 1 se achar problema.
import path from 'path'; import { pathToFileURL } from 'url';
const LIB = process.env.LIB || path.join(process.env.USERPROFILE || process.env.HOME, 'lemo-opuscar');
const { openDemo, closeServer } = await import(pathToFileURL(path.join(LIB, 'core/render/page.mjs')).href);
const [dir, d, passo = '0.1'] = process.argv.slice(2);
const { browser, page } = await openDemo(dir, { w: 1080, h: 1920, q: d, gl: false });
const r = await page.evaluate(step => {
  const bad = new Map(), add = (k, t) => { if (!bad.has(k)) bad.set(k, t); }, seen = new Set();
  for (let t = 0; t <= window.DUR; t += step) {
    const B = (window.TEXTS(t) || []).filter(b => !b.pass);
    for (const b of B) seen.add(b.id + '|' + b.text);
    for (const b of B) {
      if (b.id.startsWith('sub:')) {
        if (b.y0 < 1350 - 1 || b.y1 > 1500 + 1) add(`legenda ${b.id} fora de y 1350–1500 (${Math.round(b.y0)}–${Math.round(b.y1)})`, t);
        if (b.x0 + 70 < 130 - 1 || b.x1 - 34 > 910 + 1) add(`legenda ${b.id} fora de x 130–910 (${Math.round(b.x0 + 70)}–${Math.round(b.x1 - 34)})`, t);
      } else if (!['title', 'tagline'].includes(b.id) && !b.id.startsWith('tag:INSCREVA') && b.y1 > 1316 + 1) add(`"${b.text}" desce até y ${Math.round(b.y1)} (limite 1316)`, t);
    }
    for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
      const a = B[i], b = B[j], m = 6;
      if (a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.y0 < b.y1 + m && b.y0 < a.y1 + m) add(`encostam: "${a.text}" × "${b.text}"`, t);
    }
  }
  return { dur: window.DUR, n: seen.size, bad: [...bad].map(([k, t]) => `${t.toFixed(1)} s  ${k}`), warn: window.WARN || [] };
}, +passo);
await browser.close(); closeServer();
for (const w of r.warn) console.log('aviso: ' + w);
for (const b of r.bad) console.log('texto: ' + b);
console.log(`checagem: ${r.dur.toFixed(1)} s, ${r.n} textos vistos, ${r.bad.length} problema(s) de texto, ${r.warn.length} aviso(s) do cena.json`);
process.exit(r.bad.length ? 1 : 0);

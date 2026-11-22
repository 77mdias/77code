// Gera os PNGs dos ícones a partir do C7: node design/logo/export-icons.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
const dir = new URL('.', import.meta.url).pathname;
const svg = readFileSync(dir + 'c7-elo-visivel.svg', 'utf8');
const jobs = [
  // [arquivo, tamanho, cor do 77, fundo (null = transparente), margem em fração do lado]
  ['ico-16.png', 16, '#5B8BD0', null, 0], ['ico-32.png', 32, '#5B8BD0', null, 0], ['ico-48.png', 48, '#5B8BD0', null, 0],
  ['apple-touch-icon.png', 180, '#ECE9E0', '#07090D', 0.14],
];
const b = await chromium.launch();
const p = await b.newPage();
for (const [name, size, fg, bg, pad] of jobs) {
  const url = 'data:image/svg+xml;base64,' + Buffer.from(svg.replaceAll('currentColor', fg)).toString('base64');
  const data = await p.evaluate(async ({ url, size, bg, pad }) => {
    const img = new Image(); img.src = url; await img.decode();
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, size, size); }
    const m = Math.round(size * pad); g.drawImage(img, m, m, size - 2 * m, size - 2 * m);
    return c.toDataURL('image/png').split(',')[1];
  }, { url, size, bg, pad });
  writeFileSync(dir + name, Buffer.from(data, 'base64'));
}
await b.close();

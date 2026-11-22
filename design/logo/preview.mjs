// Folha de prova dos logos: node design/logo/preview.mjs  (gera design/logo/preview.png)
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
const dir = new URL('.', import.meta.url).pathname;
const svgs = readdirSync(dir).filter((f) => f.endsWith('.svg')).sort();
// cada logo vira uma imagem isolada: ids de máscara repetidos não se misturam entre SVGs
const cell = (svg, s, fg) => `<img width="${s}" height="${s}" src="data:image/svg+xml;base64,${Buffer.from(svg.replaceAll('currentColor', fg)).toString('base64')}">`;
const row = (f, fg, bg) => {
  const svg = readFileSync(dir + f, 'utf8');
  return `<div style="display:flex;gap:28px;align-items:center;padding:18px 24px;background:${bg};color:${fg}">
    <div style="width:150px;font:600 14px Inter,sans-serif">${f.replace('.svg', '')}</div>
    ${[256, 64, 32, 16].map((s) => cell(svg, s, fg)).join('')}
    <div style="width:64px;height:64px;image-rendering:pixelated;background:${bg}"><img class="z" width="64" height="64" style="image-rendering:pixelated" src="data:image/svg+xml;base64,${Buffer.from(svg.replaceAll('currentColor', fg)).toString('base64')}" onload="this.style.width='64px'"></div>
  </div>`;
};
const html = `<body style="margin:0">${svgs.map((f) => row(f, '#111', '#f3f1ea') + row(f, '#ECE9E0', '#07090D')).join('')}</body>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 760, height: 100 } });
await p.setContent(html);
// lupa: o 16 px desenhado num canvas e ampliado 4x sem suavizar
await p.evaluate(async () => {
  for (const img of document.querySelectorAll('img.z')) {
    const c = document.createElement('canvas'); c.width = 16; c.height = 16;
    await img.decode(); c.getContext('2d').drawImage(img, 0, 0, 16, 16);
    const big = document.createElement('canvas'); big.width = 64; big.height = 64;
    const g = big.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, 64, 64);
    img.replaceWith(big);
  }
});
await p.screenshot({ path: dir + 'preview.png', fullPage: true });
await b.close();

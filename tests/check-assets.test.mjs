import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { audit, collectRefs } from '../scripts/check-assets.mjs';

test('expande os quadros da hero', () => {
  const r = collectRefs(['img.src = `/static/frames2/Image${i}.webp`;']);
  assert.equal(r.size, 40);
  assert.ok(r.has('/static/frames2/Image40.webp'));
});

test('lê caminhos com aspas, url() e query', () => {
  const r = collectRefs([`url('/static/hero/image-1.webp')`, `src="/static/logo.webp?v=2"`]);
  assert.deepEqual([...r].sort(), ['/static/hero/image-1.webp', '/static/logo.webp']);
});

test('o repo está limpo', () => {
  const a = audit(process.cwd());
  assert.deepEqual(a.missing, []);
  assert.deepEqual(a.unused, []);
  assert.deepEqual(a.spaced, []);
  assert.deepEqual(a.leftovers, []);
  assert.ok(a.bytes < 12_000_000, `public/static com ${a.bytes} bytes`);
});

test('metadados de compartilhamento', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /property="og:image" content="https:\/\/77code\.com\.br\/static\/og\.jpg"/);
  assert.match(html, /property="og:url" content="https:\/\/77code\.com\.br"/);
  assert.ok(existsSync('public/static/og.jpg'));
});

test('a chave do Web3Forms do autor original não está no código', () => {
  assert.ok(!readFileSync('src/main.js', 'utf8').includes('32ed7635-a0ab-4135-b458-17153735f046'));
});

test('a IA se chama Flora em todo o site', () => {
  const files = ['index.html', 'src/main.js', 'src/style.css'];
  const kiko = files.flatMap((f) => readFileSync(f, 'utf8').split('\n')
    .map((l, i) => (/kiko/i.test(l) ? `${f}:${i + 1}` : null)).filter(Boolean));
  assert.deepEqual(kiko, []);
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /<div class="chat-title">Interactive Flora AI<\/div>/);
  assert.match(html, /placeholder="Speak to Flora\.\.\."/);
});

test('a frase japonesa da cena 2 diz full cycle, como a hero', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.ok(html.includes('<div class="award-top-subtitle">フルサイクルAIエンジニア / クリエイティブコーダー</div>'));
  assert.ok(!html.includes('フルスタック'));
});

test('ícones com o logo 77 (C7) no site e na 404', () => {
  for (const page of ['index.html', 'public/404.html']) {
    const html = readFileSync(page, 'utf8');
    assert.match(html, /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">/, page);
    assert.match(html, /<link rel="icon" href="\/favicon\.ico" sizes="48x48">/, page);
    assert.match(html, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/, page);
    assert.ok(!html.includes('logo.webp'), page);
  }
  for (const f of ['public/favicon.svg', 'public/favicon.ico', 'public/apple-touch-icon.png']) assert.ok(existsSync(f), f);
  assert.ok(!existsSync('public/static/logo.webp'));
  const svg = readFileSync('public/favicon.svg', 'utf8');
  assert.match(svg, /prefers-color-scheme: ?dark/);
});

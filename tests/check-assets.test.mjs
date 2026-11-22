import { test } from 'node:test';
import assert from 'node:assert/strict';
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

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BG_MOBILE, BG_MOBILE_QUERY, BG_SIZES, BG_SRC, BG_SRCSET, frameForProgress, frameUrl, nearestLoaded } from '../src/lib/frames.ts';

test('frameForProgress leva o progresso do scroll ao quadro 1..40', () => {
  assert.equal(frameForProgress(0), 1);
  assert.equal(frameForProgress(1), 40);
  assert.equal(frameForProgress(0.5), 21);
  assert.equal(frameForProgress(-1), 1);
  assert.equal(frameForProgress(2), 40);
});

test('nearestLoaded devolve o quadro carregado mais próximo', () => {
  assert.equal(nearestLoaded(10, new Set([1, 9, 12])), 9);
  assert.equal(nearestLoaded(10, new Set([8, 12])), 8);
  assert.equal(nearestLoaded(5, new Set()), 1);
  assert.equal(nearestLoaded(7, new Set([7])), 7);
});

test('os preloads do index.html batem com as URLs de src/lib/frames.ts', () => {
  const html = readFileSync('index.html', 'utf8');
  const has = (attrs: string[]) => assert.ok(
    html.split('\n').some((l) => l.includes('rel="preload" as="image"') && attrs.every((a) => l.includes(a))), attrs.join(' '));
  has([`href="${BG_MOBILE}"`, `media="${BG_MOBILE_QUERY}"`]);
  has([`href="${BG_SRC}"`, `imagesrcset="${BG_SRCSET}"`, `imagesizes="${BG_SIZES}"`, 'media="(min-width: 768px)"']);
  has([`href="${frameUrl(1, true)}"`, `media="${BG_MOBILE_QUERY}"`]);
  has([`href="${frameUrl(1, false)}"`, 'media="(min-width: 768px)"']);
});

test('a casca estática do index.html usa o mesmo quadro 1 e a mesma consulta', () => {
  const shell = readFileSync('index.html', 'utf8').match(/<div id="shell"[\s\S]*?<\/picture>/)![0];
  assert.ok(shell.includes(`<source media="${BG_MOBILE_QUERY}" srcset="${frameUrl(1, true)}">`));
  assert.ok(shell.includes(`<img src="${frameUrl(1, false)}"`));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { CASES } from '../src/content/cases.ts';
import { PROFILE } from '../src/content/profile.ts';
import { CONTACT } from '../src/content/contact.ts';
import { JP } from '../src/content/jp.ts';

test('os 4 casos na ordem do site', () => {
  assert.deepEqual(CASES.map((c) => c.slug), ['criptenv', 'ateliesys', 'lene-studio-beauty', 'range77']);
  assert.deepEqual(CASES.map((c) => c.number), [1, 2, 3, 4]);
});

test('cada caso tem 2 a 4 pistas, stack e captura que existe', () => {
  for (const c of CASES) {
    assert.ok(c.clues.length >= 2 && c.clues.length <= 4, `${c.slug}: pistas`);
    assert.ok(c.stack.length >= 2, `${c.slug}: stack`);
    assert.ok(existsSync('public' + c.screenshot.desktop), `${c.slug}: desktop`);
    assert.ok(existsSync('public' + c.screenshot.mobile), `${c.slug}: mobile`);
  }
});

test('links dos casos são https ou null', () => {
  for (const c of CASES) assert.ok(c.url === null || c.url.startsWith('https://'), c.slug);
});

test('nenhum preço no texto', () => {
  const json = JSON.stringify([CASES, PROFILE, CONTACT]);
  assert.doesNotMatch(json, /R\$\s?\d|US\$\s?\d|\$\d/);
});

test('japonês com sentido', () => {
  for (const [key, e] of Object.entries(JP)) {
    assert.ok(e.text && e.reading && e.meaning, key);
    assert.match(e.text, /[぀-ヿ一-龯]/, key);
  }
});

test('o perfil tem as três especialidades', () => {
  assert.deepEqual(PROFILE.specialties.map((s) => s.title), [
    'Frontend & Product',
    'AI & Automation',
    'Backend & Infrastructure',
  ]);
});

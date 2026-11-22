import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toRequestMessages, floraErrorReply } from '../src/chat-history.js';

test('primeira mensagem vira uma lista só com ela', () => {
  assert.deepEqual(toRequestMessages([], 'oi'), [{ role: 'user', content: 'oi' }]);
});

test('histórico longo é cortado para no máximo 11, começando e terminando em user', () => {
  const history = Array.from({ length: 14 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
  const out = toRequestMessages(history, 'nova');
  assert.ok(out.length <= 11);
  assert.equal(out[0].role, 'user');
  assert.deepEqual(out.at(-1), { role: 'user', content: 'nova' });
  for (let i = 1; i < out.length; i++) assert.notEqual(out[i].role, out[i - 1].role);
});

test('não altera o histórico recebido', () => {
  const history = [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }];
  toRequestMessages(history, 'c');
  assert.equal(history.length, 2);
});

test('falas de erro da Flora', () => {
  assert.match(floraErrorReply(429), /minute/);
  assert.match(floraErrorReply(503), /contact section/);
  assert.match(floraErrorReply(403), /verify/);
  assert.match(floraErrorReply(500), /trouble connecting/);
});

test('a site key de produção do Turnstile está no código', async () => {
  const { readFileSync } = await import('node:fs');
  const main = readFileSync('src/main.js', 'utf8');
  assert.ok(!main.includes('TURNSTILE_SITE_KEY_PENDENTE'));
  assert.ok(main.includes("'0x4AAAAAAGMqWO7gw7Me7Zju'"));
});

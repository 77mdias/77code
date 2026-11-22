import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askFlora, EXPRESSIONS, FLORA_SYSTEM, REFUSAL_REPLY } from '../../src/worker/flora.js';

// Cliente falso com a forma do SDK: guarda os parâmetros e devolve uma resposta pronta.
const fake = (response) => {
  const calls = [];
  return { calls, beta: { messages: { create: async (p) => { calls.push(p); return response; } } } };
};
const ok = (json) => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(json) }] });

test('chama o Sonnet 5.5 com manual em cache, esforço baixo, saída estruturada e fallback', async () => {
  const c = fake(ok({ reply: 'Oi!', expression: 'happy' }));
  await askFlora(c, [{ role: 'user', content: 'oi' }]);
  const p = c.calls[0];
  assert.equal(p.model, 'claude-sonnet-5-5');
  assert.deepEqual(p.betas, ['server-side-fallback-2026-07-01']);
  assert.equal(p.fallbacks, 'default');
  assert.equal(p.output_config.effort, 'low');
  assert.equal(p.output_config.format.type, 'json_schema');
  assert.deepEqual(p.output_config.format.schema.properties.expression.enum, EXPRESSIONS);
  assert.deepEqual(p.system[0].cache_control, { type: 'ephemeral' });
  assert.equal(p.system[0].text, FLORA_SYSTEM);
  assert.deepEqual(p.messages, [{ role: 'user', content: 'oi' }]);
});

test('devolve reply e expression do JSON', async () => {
  const r = await askFlora(fake(ok({ reply: 'Oi!', expression: 'happy' })), [{ role: 'user', content: 'oi' }]);
  assert.deepEqual(r, { reply: 'Oi!', expression: 'happy' });
});

test('expression fora da lista vira warm', async () => {
  const r = await askFlora(fake(ok({ reply: 'Oi!', expression: 'angry' })), [{ role: 'user', content: 'oi' }]);
  assert.equal(r.expression, 'warm');
});

test('recusa vira a resposta fixa com expressão kind', async () => {
  const r = await askFlora(fake({ stop_reason: 'refusal', content: [] }), [{ role: 'user', content: 'oi' }]);
  assert.deepEqual(r, { reply: REFUSAL_REPLY, expression: 'kind' });
});

test('texto que não é JSON ou max_tokens lança erro', async () => {
  const msgs = [{ role: 'user', content: 'oi' }];
  await assert.rejects(askFlora(fake({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'não é json' }] }), msgs));
  await assert.rejects(askFlora(fake({ stop_reason: 'max_tokens', content: [{ type: 'text', text: '{"reply":' }] }), msgs));
});

test('o manual tem os contatos e projetos aprovados e nenhum preço', () => {
  for (const s of ['jean.77mdiasdev@gmail.com', 'wa.me/5518988125925', 'github.com/77mdias', 'linkedin.com/in/jeancmdias',
    'CriptEnv', 'AtelieSys', 'Lene Studio Beauty', 'RANGE77', 'UNOESTE', 'Presidente Prudente']) {
    assert.ok(FLORA_SYSTEM.includes(s), s);
  }
  assert.doesNotMatch(FLORA_SYSTEM, /R\$\s?\d|US\$\s?\d|\$\d/);
});

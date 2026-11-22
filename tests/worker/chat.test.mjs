import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleChat, validateBody } from '../../src/worker/chat.js';
import { verifyTurnstile } from '../../src/worker/turnstile.js';
import worker, { createClaudeClient } from '../../src/worker/index.js';

const post = (body, headers = {}) => new Request('https://x/api/chat', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
const good = { messages: [{ role: 'user', content: 'oi' }], turnstileToken: 't' };

function deps(over = {}) {
  const seen = { verify: [], ask: [], limit: [] };
  return {
    seen,
    env: { CHAT_ENABLED: 'true', ...over.env },
    verify: over.verify ?? (async (token, ip) => { seen.verify.push([token, ip]); return true; }),
    ask: over.ask ?? (async (messages) => { seen.ask.push(messages); return { reply: 'Oi', expression: 'happy' }; }),
    limiter: over.limiter ?? { limit: async (o) => { seen.limit.push(o); return { success: true }; } },
  };
}
const json = async (res) => ({ status: res.status, body: await res.json() });

test('responde reply e expression', async () => {
  const d = deps();
  assert.deepEqual(await json(await handleChat(post(good), d)), { status: 200, body: { reply: 'Oi', expression: 'happy' } });
  assert.deepEqual(d.seen.ask[0], good.messages);
});

test('chat desligado dá 503 antes de qualquer coisa', async () => {
  const d = deps({ env: { CHAT_ENABLED: 'false' } });
  assert.deepEqual(await json(await handleChat(post(good), d)), { status: 503, body: { error: 'chat_disabled' } });
  assert.equal(d.seen.verify.length + d.seen.ask.length, 0);
});

test('Turnstile inválido dá 403 e não chama o Claude', async () => {
  const d = deps({ verify: async () => false });
  assert.deepEqual(await json(await handleChat(post(good), d)), { status: 403, body: { error: 'turnstile_failed' } });
  assert.equal(d.seen.ask.length, 0);
});

test('body inválido dá 400', async () => {
  const bodies = ['não é json', {}, { messages: [] }, { messages: [{ role: 'assistant', content: 'oi' }] },
    { messages: [{ role: 'user', content: '' }] }, { messages: [{ role: 'user', content: 'x'.repeat(1201) }] },
    { messages: [{ role: 'user', content: 'a' }, { role: 'user', content: 'b' }] },
    { messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] },
    { messages: Array.from({ length: 13 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'a' })) }];
  for (const b of bodies) {
    const body = typeof b === 'string' ? b : { ...b, turnstileToken: 't' };
    const d = deps();
    assert.deepEqual(await json(await handleChat(post(body), d)), { status: 400, body: { error: 'bad_request' } }, JSON.stringify(b));
    assert.equal(d.seen.ask.length, 0);
  }
});

test('validateBody aceita 11 mensagens alternadas e recusa papel estranho', () => {
  const msgs = Array.from({ length: 11 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'a' }));
  assert.deepEqual(validateBody({ messages: msgs }), { ok: true, messages: msgs });
  assert.deepEqual(validateBody({ messages: [{ role: 'system', content: 'a' }] }), { ok: false });
});

test('limite estourado dá 429 e usa o IP como chave', async () => {
  const d = deps({ limiter: { limit: async (o) => { assert.deepEqual(o, { key: '1.2.3.4' }); return { success: false }; } } });
  assert.deepEqual(await json(await handleChat(post(good), d)), { status: 429, body: { error: 'rate_limited' } });
  assert.equal(d.seen.ask.length, 0);
});

test('falha do Claude dá 502', async () => {
  const d = deps({ ask: async () => { throw new Error('falhou'); } });
  assert.deepEqual(await json(await handleChat(post(good), d)), { status: 502, body: { error: 'upstream_error' } });
});

test('não registra o conteúdo da conversa', async () => {
  const logged = [];
  const orig = { log: console.log, error: console.error, warn: console.warn };
  for (const k of Object.keys(orig)) console[k] = (...a) => logged.push(a.map(String).join(' '));
  try {
    const secret = { messages: [{ role: 'user', content: 'segredo-do-visitante' }], turnstileToken: 't' };
    await handleChat(post(secret), deps());
    await handleChat(post(secret), deps({ ask: async () => { throw new Error('x'); } }));
  } finally { Object.assign(console, orig); }
  assert.ok(!logged.some((l) => l.includes('segredo-do-visitante')), logged.join('\n'));
});

test('verifyTurnstile manda secret, token e IP e respeita success', async () => {
  const calls = [];
  const fetchFn = async (url, init) => { calls.push([url, init]); return new Response(JSON.stringify({ success: true })); };
  assert.equal(await verifyTurnstile('tok', 'sec', '1.2.3.4', fetchFn), true);
  assert.equal(calls[0][0], 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  const form = new URLSearchParams(calls[0][1].body);
  assert.deepEqual([form.get('secret'), form.get('response'), form.get('remoteip')], ['sec', 'tok', '1.2.3.4']);
  assert.equal(await verifyTurnstile('tok', 'sec', 'ip', async () => new Response('{"success":false}')), false);
  assert.equal(await verifyTurnstile('tok', 'sec', 'ip', async () => { throw new Error('rede'); }), false);
  let fetched = false;
  assert.equal(await verifyTurnstile('', 'sec', 'ip', async () => { fetched = true; }), false);
  assert.equal(fetched, false);
});

test('index: GET em /api/chat dá 405 e /api/outra dá 404', async () => {
  const env = { CHAT_ENABLED: 'true' };
  const get = await worker.fetch(new Request('https://x/api/chat'), env);
  assert.deepEqual({ status: get.status, body: await get.json() }, { status: 405, body: { error: 'method_not_allowed' } });
  const other = await worker.fetch(new Request('https://x/api/outra', { method: 'POST' }), env);
  assert.equal(other.status, 404);
});

test('resposta longa da Flora no histórico (até 4000) é aceita; acima disso dá 400', async () => {
  const hist = (n) => ({ messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'x'.repeat(n) }, { role: 'user', content: 'b' }], turnstileToken: 't' });
  assert.equal((await handleChat(post(hist(3000)), deps())).status, 200);
  assert.equal((await handleChat(post(hist(4001)), deps())).status, 400);
});

test('cliente do Claude com prazo curto e no máximo 1 nova tentativa', () => {
  const c = createClaudeClient({ ANTHROPIC_API_KEY: 'sk-ant-teste' });
  assert.equal(c.timeout, 25_000);
  assert.equal(c.maxRetries, 1);
});

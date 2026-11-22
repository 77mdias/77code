// POST /api/chat: checagens do mais barato para o mais caro, e só no fim o Claude.
// Nunca registrar o conteúdo das conversas (nem em erro).

const MAX_MESSAGES = 12;
const MAX_CHARS = 1200;

const reply = (status, data) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const fail = (status, error) => reply(status, { error });

export function validateBody(body) {
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return { ok: false };
  for (const [i, m] of messages.entries()) {
    const role = i % 2 === 0 ? 'user' : 'assistant';
    if (m?.role !== role || typeof m.content !== 'string') return { ok: false };
    if (!m.content.trim() || m.content.length > MAX_CHARS) return { ok: false };
  }
  if (messages.at(-1).role !== 'user') return { ok: false };
  return { ok: true, messages: messages.map(({ role, content }) => ({ role, content })) };
}

export async function handleChat(request, { env, verify, ask, limiter }) {
  if (env.CHAT_ENABLED !== 'true') return fail(503, 'chat_disabled');

  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'bad_request');
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (!(await verify(body?.turnstileToken, ip))) return fail(403, 'turnstile_failed');

  const input = validateBody(body);
  if (!input.ok) return fail(400, 'bad_request');

  const { success } = await limiter.limit({ key: ip });
  if (!success) return fail(429, 'rate_limited');

  try {
    return reply(200, await ask(input.messages));
  } catch (error) {
    // só o tipo do erro, nunca a conversa
    console.error('flora: falha ao chamar o Claude:', error?.constructor?.name ?? 'Error', error?.status ?? '');
    return fail(502, 'upstream_error');
  }
}

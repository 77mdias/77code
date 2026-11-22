// Worker do 77code: só roda para /api/* (assets.run_worker_first); o resto é arquivo estático.
import Anthropic from '@anthropic-ai/sdk';
import { handleChat } from './chat.js';
import { askFlora } from './flora.js';
import { verifyTurnstile } from './turnstile.js';

const json = (status, data) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8' },
});

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname !== '/api/chat') return json(404, { error: 'not_found' });
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });

    // cliente por requisição: o `env` (e a chave) só existe dentro do fetch
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    return handleChat(request, {
      env,
      verify: (token, ip) => verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip),
      ask: (messages) => askFlora(client, messages),
      limiter: env.CHAT_LIMITER,
    });
  },
};

# Chat da Flora com a API do Claude — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Flora AI responde de verdade no chat do site, como guia do portfólio, por um Worker que chama a API do Claude, com Turnstile, limite por IP e desligamento pelo servidor.

**Architecture:** O Worker `77code` ganha código (`main`) que roda só para `/api/*` (`run_worker_first`); o resto continua servido como arquivo estático. A lógica fica em funções puras com dependências injetadas (cliente do Claude, verificação do Turnstile, limitador), testadas com `node:test` sem rede. O site manda a conversa inteira e um token do Turnstile; o Worker devolve `{ reply, expression }`.

**Tech Stack:** Cloudflare Workers (wrangler 4.166.0), `@anthropic-ai/sdk` (versão exata atual), Turnstile, Vite 8, `node:test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-flora-chat-design.md`

## Global Constraints

- Modelo `claude-sonnet-5-5`, numa constante só (`FLORA_MODEL`), para trocar numa linha.
- Expressões válidas, exatamente: `warm, explain, happy, thinking, shock, kind, return, aval_work`.
- Entrada: no máximo 12 mensagens, cada uma com 1 a 1.200 caracteres, papéis alternados `user`/`assistant`, a primeira e a última `user`.
- Limite: 10 mensagens por 60 s por IP (`CF-Connecting-IP`).
- Ordem no Worker: chat desligado (`503`) → corpo não é JSON (`400`) → Turnstile (`403`; o token vem no corpo) → mensagens inválidas (`400`) → limite (`429`) → Claude (`502` se falhar).
- Respostas de erro sempre JSON `{ "error": "<código>" }` com os códigos `chat_disabled`, `turnstile_failed`, `bad_request`, `rate_limited`, `upstream_error`, `method_not_allowed`.
- Nada do conteúdo das conversas vai para log (`console.*`) no Worker.
- Testes automáticos nunca chamam o Claude de verdade.
- Versões exatas no `package.json` (`pnpm add -E` com a versão completa).
- Docs, comentários novos e commits em português do Brasil.

## Review Focus

1. **Corpo que não é JSON** ou JSON sem `messages` → `400 bad_request`, nunca `500`. Teste na Task 2 (`body inválido dá 400`).
2. **Claude respondendo fora do formato** (JSON inválido, `expression` fora da lista, `stop_reason: "refusal"` ou `"max_tokens"`) → o visitante sempre recebe uma fala válida, sem erro. Teste na Task 1.
3. **Visitante com várias abas ou mensagens rápidas** (requisição em andamento) → o site não manda duas ao mesmo tempo nem duplica o histórico. Teste na Task 3 (`não duplica o histórico com cliques rápidos`).
4. **Script do Turnstile que não carrega** (bloqueador, rede) → a Flora diz que não conseguiu verificar e não trava o campo. Teste na Task 3.
5. **Requisição que não é `POST`** ou outro caminho em `/api/` → `405`/`404` em JSON, e o site estático continua intacto. Teste na Task 2.

---

### Task 1: O manual da Flora e a chamada ao Claude

**Files:**
- Create: `src/worker/flora.js`, `tests/worker/flora.test.mjs`
- Modify: `package.json` (`"test": "node --test tests/*.test.mjs tests/worker/*.test.mjs"`, dependência `@anthropic-ai/sdk`)

**Interfaces:**
- Produces:
  - `export const FLORA_MODEL = 'claude-sonnet-5-5'`
  - `export const EXPRESSIONS = ['warm','explain','happy','thinking','shock','kind','return','aval_work']`
  - `export const FLORA_SYSTEM` (string: persona + manual aprovado no spec)
  - `export async function askFlora(client, messages) -> Promise<{ reply: string, expression: string }>`; `client` tem a forma do SDK (`client.beta.messages.create(params)`).
  - `export const REFUSAL_REPLY` (texto fixo, em inglês, sugerindo o contato)

- [ ] **Step 1: Testes que falham** — `tests/worker/flora.test.mjs`, com um cliente falso que guarda os `params` e devolve uma resposta pronta:

```js
const fake = (response) => { const calls = []; return { calls, beta: { messages: { create: async (p) => { calls.push(p); return response; } } } }; };
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
test('devolve reply e expression do JSON', async () => { /* ok({reply:'Oi!',expression:'happy'}) → { reply:'Oi!', expression:'happy' } */ });
test('expression fora da lista vira warm', async () => { /* expression:'angry' → 'warm' */ });
test('recusa vira a resposta fixa com expressão kind', async () => { /* {stop_reason:'refusal', content:[]} → { reply: REFUSAL_REPLY, expression: 'kind' } */ });
test('texto que não é JSON ou max_tokens lança erro', async () => { /* rejects */ });
test('o manual tem os contatos e projetos aprovados e nenhum preço', () => {
  for (const s of ['jean.77mdiasdev@gmail.com', 'wa.me/5518988125925', 'github.com/77mdias', 'linkedin.com/in/jeancmdias',
                   'CriptEnv', 'AtelieSys', 'Lene Studio Beauty', 'RANGE77', 'UNOESTE', 'Presidente Prudente']) assert.ok(FLORA_SYSTEM.includes(s), s);
  assert.doesNotMatch(FLORA_SYSTEM, /R\$\s?\d|US\$\s?\d|\$\d/);
});
```

- [ ] **Step 2: Rodar e ver falhar** — `pnpm test` → FAIL (módulo não existe).

- [ ] **Step 3: Implementar** — `pnpm add -E @anthropic-ai/sdk@<versão atual exata>`. Em `askFlora`: `client.beta.messages.create({ model: FLORA_MODEL, max_tokens: 2000, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default', system: [{ type: 'text', text: FLORA_SYSTEM, cache_control: { type: 'ephemeral' } }], output_config: { effort: 'low', format: { type: 'json_schema', schema: REPLY_SCHEMA } }, messages })`. `REPLY_SCHEMA` = objeto com `reply` (string) e `expression` (string, `enum: EXPRESSIONS`), ambos `required`, `additionalProperties: false`. Antes de ler o conteúdo, checar `stop_reason` (`refusal` → resposta fixa; qualquer outro diferente de `end_turn` → erro); juntar os blocos `type === 'text'` e fazer `JSON.parse`.
  - `FLORA_SYSTEM`: em inglês, curto. Persona: Flora, guia do portfólio de DIAS77 (Jean), simpática e direta; responde em 2 a 4 frases, **no idioma de quem escreve**; só usa o manual; fora dele diz que não sabe e sugere falar com o Jean; nunca dá preço (valor combinado na conversa direta); nunca fala de vida pessoal; quando o visitante quer contratar ou entrevistar, aponta o contato; escolhe a `expression` que combina com o tom. O manual: exatamente a lista "O que a Flora sabe" do spec, com os textos dos 4 projetos copiados de `projectData` em `src/main.js` e as habilidades dos `.sys-module` de `index.html`.

- [ ] **Step 4: Rodar e ver passar** — `pnpm test` → todos PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: manual da Flora e chamada ao Claude"`

---

### Task 2: O Worker `/api/chat` com Turnstile, validação e limite

**Files:**
- Create: `src/worker/index.js`, `src/worker/chat.js`, `src/worker/turnstile.js`, `tests/worker/chat.test.mjs`
- Modify: `wrangler.jsonc`, `package.json` (`cf:dev`)

**Interfaces:**
- Consumes: `askFlora`, `EXPRESSIONS` (Task 1).
- Produces:
  - `export async function verifyTurnstile(token, secret, ip, fetchFn = fetch) -> Promise<boolean>` — `false` sem token; senão POST `https://challenges.cloudflare.com/turnstile/v0/siteverify` (form: `secret`, `response`, `remoteip`) e devolve `success === true`; erro de rede → `false`.
  - `export function validateBody(body) -> { ok: true, messages } | { ok: false }` — regras das Global Constraints.
  - `export async function handleChat(request, deps) -> Response`, `deps = { env, verify, ask, limiter }`: `env.CHAT_ENABLED === 'true'` liga; `verify(token, ip)`; `ask(messages)`; `limiter.limit({ key: ip })` → `{ success }`.
  - `src/worker/index.js`: `export default { fetch(request, env) }` — `POST /api/chat` → `handleChat` com as dependências reais (`new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })`, `env.CHAT_LIMITER`, `env.TURNSTILE_SECRET_KEY`); outro método em `/api/chat` → `405`; outro caminho → `404`.
  - `wrangler.jsonc`: `"main": "src/worker/index.js"`, `assets.run_worker_first: ["/api/*"]`, `"vars": { "CHAT_ENABLED": "true" }`, `"ratelimits": [{ "name": "CHAT_LIMITER", "namespace_id": "7701", "simple": { "limit": 10, "period": 60 } }]` (conferir a chave `ratelimits` na doc do wrangler 4.166 antes; se mudou, ruling).
  - `cf:dev`: `vite build && wrangler dev --port 8778 --var TURNSTILE_SECRET_KEY:1x0000000000000000000000000000000AA` (chave de teste da Cloudflare que sempre aprova). Para conversar de verdade no local: o Jean acrescenta `--var ANTHROPIC_API_KEY:"$ANTHROPIC_API_KEY"` com a chave vinda do CriptEnv; sem ela, a chamada ao Claude falha com `502`.

- [ ] **Step 1: Testes que falham** — `tests/worker/chat.test.mjs`, montando `Request` reais e dependências falsas (`verify` → true, `limiter` → `{ success: true }`, `ask` → `{ reply: 'Oi', expression: 'happy' }`):

```js
const post = (body, headers = {}) => new Request('https://x/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const good = { messages: [{ role: 'user', content: 'oi' }], turnstileToken: 't' };

test('responde reply e expression', async () => { /* 200, json { reply:'Oi', expression:'happy' } */ });
test('chat desligado dá 503 antes de qualquer coisa', async () => { /* env.CHAT_ENABLED 'false' → 503 chat_disabled; verify/ask não chamados */ });
test('Turnstile inválido dá 403 e não chama o Claude', async () => { /* verify → false → 403 turnstile_failed */ });
test('body inválido dá 400', async () => {
  for (const b of ['não é json', {}, { messages: [] }, { messages: [{ role: 'assistant', content: 'oi' }] },
    { messages: [{ role: 'user', content: '' }] }, { messages: [{ role: 'user', content: 'x'.repeat(1201) }] },
    { messages: [{ role: 'user', content: 'a' }, { role: 'user', content: 'b' }] },
    { messages: Array.from({ length: 13 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'a' })) }])
    /* → 400 bad_request (com turnstileToken presente) */;
});
test('limite estourado dá 429 e usa o IP como chave', async () => { /* limiter → {success:false}; chamado com { key: '1.2.3.4' } → 429 rate_limited */ });
test('falha do Claude dá 502', async () => { /* ask rejeita → 502 upstream_error */ });
test('não registra o conteúdo da conversa', async () => { /* espiona console.log/error/warn durante sucesso e 502: nenhuma chamada contém 'oi' */ });
test('verifyTurnstile manda secret, token e IP e respeita success', async () => { /* fetchFn falso: confere URL e form; {success:false} → false; sem token → false sem chamar fetch */ });
test('index: GET em /api/chat dá 405 e /api/outra dá 404', async () => { /* default.fetch com env falso */ });
```

- [ ] **Step 2: Rodar e ver falhar** — `pnpm test` → FAIL.
- [ ] **Step 3: Implementar** os quatro arquivos e a configuração acima. `index.js` cria o cliente do Claude por requisição (`env` só existe no `fetch`).
- [ ] **Step 4: Rodar** — `pnpm test` → PASS; `pnpm check` → PASS (o e2e de hoje continua verde: nada mudou no site ainda, e o `cf:dev` sobe com o Worker).
- [ ] **Step 5: Commit** — `git commit -am "feat: Worker /api/chat com Turnstile, validação e limite por IP"` (incluir os arquivos novos).

---

### Task 3: O site conversa com o Worker

**Files:**
- Create: `src/chat-history.js`, `tests/chat-history.test.mjs`
- Modify: `src/main.js` (bloco do chat: linhas ~732-814), `index.html` (embaixo de `.chat-input-area`), `public/_headers`, `tests/e2e/cloudflare.spec.js`

**Interfaces:**
- Consumes: contrato `/api/chat` da Task 2.
- Produces:
  - `export function toRequestMessages(history, text, max = 11) -> Array<{role, content}>` — histórico + nova mensagem `user`, cortado para as últimas `max` mensagens começando por `user`.
  - `export function floraErrorReply(status) -> string` — `429` → "Too many messages in a row — give me a minute and try again.", `503` → "I'm taking a short break. Please use the contact section below.", `403` → "I couldn't verify your browser. Reload the page and try again.", outro → "I'm having trouble connecting right now. Try again in a moment."
  - `TURNSTILE_SITE_KEY` em `src/main.js`: `location.hostname` `localhost`/`127.0.0.1` → `1x00000000000000000000BB` (teste invisível que sempre aprova; conferir na página de chaves de teste do Turnstile); senão a chave real do widget (Task 4).

- [ ] **Step 1: Testes que falham**
  - `tests/chat-history.test.mjs`: `toRequestMessages([], 'oi')` → `[{role:'user',content:'oi'}]`; com 14 mensagens no histórico devolve no máximo 11, a primeira e a última `user`; `floraErrorReply(429)` contém "minute".
  - `tests/e2e/cloudflare.spec.js` — trocar o teste "chat responde o aviso local" por estes (com `page.route('**/api/chat', ...)`, sem chamar o Claude):

```js
test('a Flora responde pelo /api/chat e muda a expressão', async ({ page }) => {
  let body;
  await page.route('**/api/chat', (r) => { body = r.request().postDataJSON(); r.fulfill({ json: { reply: 'Hi! I am Flora.', expression: 'happy' } }); });
  /* goto, waitLoader, digita 'oi' e envia */
  await expect(page.locator('#chat-messages .msg-bot').last()).toHaveText('Hi! I am Flora.');
  await expect(page.locator('#exp-happy')).toHaveClass(/active/);
  expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'oi' });
  expect(body.turnstileToken).toBeTruthy();
});
test('a segunda mensagem leva o histórico', async ({ page }) => { /* 2 envios: o 2º body.messages tem user, assistant, user */ });
test('429 vira uma fala da Flora', async ({ page }) => { /* fulfill status 429 → última msg-bot contém 'minute' */ });
test('não duplica o histórico com cliques rápidos', async ({ page }) => { /* clicar enviar 3x rápido com resposta atrasada: 1 requisição */ });
test('sem Turnstile a Flora avisa e o campo continua livre', async ({ page }) => { /* page.route('https://challenges.cloudflare.com/**', r => r.abort()) → msg-bot contém 'verify'; #chat-input habilitado */ });
test('aviso de privacidade aparece embaixo do chat', async ({ page }) => { /* texto "Messages are answered by Claude (Anthropic) and aren't stored." visível */ });
```
  - Em `a CSP deixa o Cloudflare Web Analytics...`, acrescentar: `expect(csp).toMatch(/script-src [^;]*https:\/\/challenges\.cloudflare\.com/)` e `expect(csp).toMatch(/frame-src [^;]*https:\/\/challenges\.cloudflare\.com/)`.

- [ ] **Step 2: Rodar e ver falhar** — `pnpm check` → FAIL nos testes novos.
- [ ] **Step 3: Implementar**
  - `src/main.js`: remover `CHAT_ENABLED`/`CHAT_OFFLINE_REPLY` do site (quem desliga agora é o Worker); carregar `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` sob demanda; renderizar o widget invisível (`execution: 'execute'`) num container novo e pegar um token novo a cada envio (`turnstile.execute` + `turnstile.reset` depois); mandar `{ messages: toRequestMessages(history, text), turnstileToken }`; no `200`, mostrar `reply`, `setExpression(expression)` e acrescentar o par `user`/`assistant` ao `history`; fora do `200`, `floraErrorReply(status)` com a expressão `shock`, sem mexer no `history`. Manter o `chatRequestInFlight` e o resto (voz não é usada).
  - `index.html`: `<div id="flora-turnstile"></div>` e `<p class="chat-privacy">Messages are answered by Claude (Anthropic) and aren't stored.</p>` embaixo de `.chat-input-area`; estilo discreto no bloco "CENA DO FLORA" do `src/style.css`.
  - `public/_headers`: acrescentar `https://challenges.cloudflare.com` em `script-src` e criar `frame-src https://challenges.cloudflare.com`.
- [ ] **Step 4: Rodar e ver passar** — `pnpm check` → todos PASS.
- [ ] **Step 5: Commit** — `git commit -am "feat: o site conversa com a Flora pelo /api/chat"` (incluir os arquivos novos).

---

### Task 4: Ligar em produção (com o Jean)

- [ ] **Step 1 (Jean, painel da Anthropic):** criar o workspace `77code-flora`, definir o teto de gasto mensal dele e gerar uma chave dentro dele.
- [ ] **Step 2 (Jean, painel da Cloudflare):** Turnstile → novo widget, modo **Invisible**, hostnames `77code.com.br` e `www.77code.com.br`; passar a **site key** (pública) para o código.
- [ ] **Step 3:** colocar a site key em `TURNSTILE_SITE_KEY` (`src/main.js`); `pnpm check` → PASS; commit `feat: chave do Turnstile de produção`; push.
- [ ] **Step 4 (Jean, terminal):** `pnpm exec wrangler secret put ANTHROPIC_API_KEY` e `pnpm exec wrangler secret put TURNSTILE_SECRET_KEY` (cola os valores; nada em arquivo).
- [ ] **Step 5:** com a autorização do Jean, `pnpm run deploy`; `PLAYWRIGHT_BASE_URL=https://77code.com.br pnpm test:e2e` → PASS (os testes do chat usam `page.route`, não gastam API).
- [ ] **Step 6:** uma conversa real de 2 perguntas no site (uma em português, uma pedindo preço) e conferir: responde no idioma certo, não dá preço, aponta o contato. Custo ~US$ 0,02.
- [ ] **Step 7:** vault: nota "Portfólio 77code" (chat ligado, workspace, como desligar: `CHAT_ENABLED` em `wrangler.jsonc` + deploy, ou variável no painel), nota "Cloudflare Workers" (rate limit binding e Turnstile, se algo surpreender), [[Pendências]].

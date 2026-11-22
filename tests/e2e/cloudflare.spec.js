import { test, expect } from '@playwright/test';
import { watch, waitLoader } from './helpers.js';

test('cabeçalhos de segurança e cache', async ({ request }) => {
  const home = await request.get('/');
  const h = home.headers();
  expect(h['content-security-policy']).toContain("default-src 'self'");
  expect(h['content-security-policy']).toContain('https://api.web3forms.com');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['strict-transport-security']).toContain('max-age=31536000');
  const frame = await request.get('/static/frames2/Image1.webp');
  expect(frame.headers()['cache-control']).toBe('public, max-age=86400');
});

test('a CSP deixa o Cloudflare Web Analytics (injetado no deploy) carregar e enviar', async ({ request }) => {
  const csp = (await request.get('/')).headers()['content-security-policy'];
  expect(csp).toMatch(/script-src [^;]*https:\/\/static\.cloudflareinsights\.com/);
  expect(csp).toMatch(/connect-src [^;]*https:\/\/cloudflareinsights\.com/);
  expect(csp).toMatch(/script-src [^;]*https:\/\/challenges\.cloudflare\.com/);
  expect(csp).toMatch(/frame-src [^;]*https:\/\/challenges\.cloudflare\.com/);
});

test('rota inexistente dá 404', async ({ request }) => {
  expect((await request.get('/lab/')).status()).toBe(404);
});

test('a página 404 não fica em branco e leva de volta à home', async ({ page }) => {
  const res = await page.goto('/lab/');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('404');
  await expect(page.locator('a[href="/"]')).toBeVisible();
});

// Os testes do chat interceptam /api/chat: nunca chamam o Claude de verdade.
async function send(page, text) {
  await page.evaluate((t) => {
    document.getElementById('chat-input').value = t;
    document.getElementById('chat-send-btn').click();
  }, text);
}
const lastBot = (page) => page.locator('#chat-messages .msg-bot').last();

test('a Flora responde pelo /api/chat e muda a expressão', async ({ page }) => {
  let body;
  await page.route('**/api/chat', (r) => { body = r.request().postDataJSON(); r.fulfill({ json: { reply: 'Hi! I am Flora.', expression: 'happy' } }); });
  await page.goto('/');
  await waitLoader(page);
  await send(page, 'oi');
  await expect(lastBot(page)).toHaveText('Hi! I am Flora.');
  await expect(page.locator('#chat-messages .block-bot .msg-name').last()).toHaveText('FLORA');
  await expect(page.locator('#exp-happy')).toHaveClass(/active/);
  expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'oi' });
  expect(body.turnstileToken).toBeTruthy();
});

test('a segunda mensagem leva o histórico', async ({ page }) => {
  const bodies = [];
  await page.route('**/api/chat', (r) => { bodies.push(r.request().postDataJSON()); r.fulfill({ json: { reply: `resposta ${bodies.length}`, expression: 'warm' } }); });
  await page.goto('/');
  await waitLoader(page);
  await send(page, 'primeira');
  await expect(lastBot(page)).toHaveText('resposta 1');
  await send(page, 'segunda');
  await expect(lastBot(page)).toHaveText('resposta 2');
  expect(bodies[1].messages).toEqual([
    { role: 'user', content: 'primeira' },
    { role: 'assistant', content: 'resposta 1' },
    { role: 'user', content: 'segunda' },
  ]);
});

test('429 vira uma fala da Flora', async ({ page }) => {
  await page.route('**/api/chat', (r) => r.fulfill({ status: 429, json: { error: 'rate_limited' } }));
  await page.goto('/');
  await waitLoader(page);
  await send(page, 'oi');
  await expect(lastBot(page)).toContainText('minute');
});

test('não duplica o histórico com cliques rápidos', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/chat', async (r) => { calls++; await new Promise((ok) => setTimeout(ok, 1500)); r.fulfill({ json: { reply: 'ok', expression: 'warm' } }); });
  await page.goto('/');
  await waitLoader(page);
  await page.evaluate(() => {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    for (let i = 0; i < 3; i++) { input.value = 'oi'; btn.click(); }
  });
  await expect(lastBot(page)).toHaveText('ok');
  expect(calls).toBe(1);
});

test('sem Turnstile a Flora avisa e o campo continua livre', async ({ page }) => {
  let calls = 0;
  await page.route('https://challenges.cloudflare.com/**', (r) => r.abort());
  await page.route('**/api/chat', (r) => { calls++; r.fulfill({ json: { reply: 'x', expression: 'warm' } }); });
  await page.goto('/');
  await waitLoader(page);
  await send(page, 'oi');
  await expect(lastBot(page)).toContainText('verify');
  await expect(page.locator('#chat-input')).toBeEnabled();
  expect(calls).toBe(0);
});

test('aviso de privacidade aparece embaixo do chat', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.chat-privacy')).toHaveText("Messages are answered by Claude (Anthropic) and aren't stored.");
});

test('a CSP deixa o navegador falar com o Web3Forms', async ({ page }) => {
  const w = watch(page);
  await page.route('https://api.web3forms.com/submit', (r) => r.fulfill({ json: { success: true } }));
  await page.goto('/');
  await waitLoader(page);
  const ok = await page.evaluate(() => fetch('https://api.web3forms.com/submit', { method: 'POST', body: '{}' }).then((r) => r.ok));
  expect(ok).toBe(true);
  expect(w.errors).toEqual([]);
});

test('o formulário envia ao Web3Forms com a chave do Jean', async ({ page }) => {
  let body = null;
  await page.route('https://api.web3forms.com/submit', (r) => { body = r.request().postDataJSON(); r.fulfill({ json: { success: true } }); });
  await page.goto('/');
  await waitLoader(page);
  await page.evaluate(() => {
    document.getElementById('c-name').value = 'Teste';
    document.getElementById('c-email').value = 'teste@example.com';
    document.getElementById('c-msg').value = 'Mensagem de teste';
    document.getElementById('contact-form').requestSubmit();
  });
  await expect(page.locator('.submit-btn span')).toHaveText('TRANSMITTED');
  expect(body.access_key).toMatch(/^[0-9a-f-]{36}$/);
  expect(body.access_key).not.toBe('32ed7635-a0ab-4135-b458-17153735f046');
  expect(body.message).toBe('Mensagem de teste');
});

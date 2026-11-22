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

test('rota inexistente dá 404', async ({ request }) => {
  expect((await request.get('/lab/')).status()).toBe(404);
});

test('a página 404 não fica em branco e leva de volta à home', async ({ page }) => {
  const res = await page.goto('/lab/');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('404');
  await expect(page.locator('a[href="/"]')).toBeVisible();
});

test('chat responde o aviso local e não chama /api/chat', async ({ page }) => {
  const calls = [];
  page.on('request', (r) => r.url().includes('/api/chat') && calls.push(r.url()));
  await page.goto('/');
  await waitLoader(page);
  await page.evaluate(() => {
    document.getElementById('chat-input').value = 'oi';
    document.getElementById('chat-send-btn').click();
  });
  await expect(page.locator('#chat-messages .msg-bot').last()).toContainText("I'm still being set up");
  expect(calls).toEqual([]);
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

test('sem chave própria, o formulário não envia nada ao Web3Forms e abre o e-mail', async ({ page }) => {
  let posted = false;
  await page.route('https://api.web3forms.com/submit', (r) => { posted = true; r.fulfill({ json: { success: true } }); });
  await page.goto('/');
  await waitLoader(page);
  await page.evaluate(() => {
    document.getElementById('c-name').value = 'Teste';
    document.getElementById('c-email').value = 'teste@example.com';
    document.getElementById('c-msg').value = 'Mensagem de teste';
    document.getElementById('contact-form').requestSubmit();
  });
  await expect(page.locator('.submit-btn span')).toHaveText('OPENING EMAIL...');
  expect(posted).toBe(false);
});

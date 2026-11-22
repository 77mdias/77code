import { test, expect } from '@playwright/test';

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

import { test, expect, type Page } from '@playwright/test';
import { waitLoader } from './helpers.js';

// Os testes interceptam /api/chat: nunca chamam o Claude de verdade.
async function send(page: Page, text: string) {
  await page.fill('#chat-input', text);
  await page.press('#chat-input', 'Enter');
}
const log = (page: Page) => page.locator('[data-testid="chat-log"]');
const lastFlora = (page: Page) => log(page).locator('[data-from="flora"]').last();
const lastGuest = (page: Page) => log(page).locator('[data-from="guest"]').last();

async function open(page: Page) {
  await page.goto('/');
  await waitLoader(page);
}

test('a IA se chama Flora no título, no campo e na primeira fala', async ({ page }) => {
  await open(page);
  const flora = page.locator('section#flora');
  await expect(flora.locator('h2')).toContainText('Flora');
  await expect(page.locator('#chat-input')).toHaveAttribute('placeholder', /Flora/);
  await expect(log(page).locator('[data-from="flora"]').first()).toHaveText("Hi, I'm Flora — Jean's partner on these cases. Ask me about any of them, how he works, or how to reach him.");
  await expect(page.getByLabel('Message to Flora', { exact: true })).toBeVisible();
  await expect(log(page)).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('img[data-testid="flora"]')).toHaveAttribute('data-expression', 'warm');
});

test('a Flora responde e muda a expressão', async ({ page }) => {
  let body: { messages: unknown[]; turnstileToken: string } | undefined;
  await page.route('**/api/chat', (r) => { body = r.request().postDataJSON(); r.fulfill({ json: { reply: 'Hi! I am Flora.', expression: 'happy' } }); });
  await open(page);
  await send(page, 'oi');
  await expect(lastGuest(page)).toHaveText('oi');
  await expect(lastFlora(page)).toHaveText('Hi! I am Flora.');
  await expect(page.locator('img[data-testid="flora"]')).toHaveAttribute('data-expression', 'happy');
  expect(body!.messages.at(-1)).toEqual({ role: 'user', content: 'oi' });
  expect(body!.turnstileToken).toBeTruthy();
  await expect(page.locator('#chat-input')).toHaveValue('');
});

test('a segunda mensagem leva o histórico', async ({ page }) => {
  const bodies: { messages: unknown[] }[] = [];
  await page.route('**/api/chat', (r) => { bodies.push(r.request().postDataJSON()); r.fulfill({ json: { reply: `resposta ${bodies.length}`, expression: 'warm' } }); });
  await open(page);
  await send(page, 'primeira');
  await expect(lastFlora(page)).toHaveText('resposta 1');
  await send(page, 'segunda');
  await expect(lastFlora(page)).toHaveText('resposta 2');
  expect(bodies[1].messages).toEqual([
    { role: 'user', content: 'primeira' },
    { role: 'assistant', content: 'resposta 1' },
    { role: 'user', content: 'segunda' },
  ]);
});

test('429 vira uma fala da Flora', async ({ page }) => {
  await page.route('**/api/chat', (r) => r.fulfill({ status: 429, json: { error: 'rate_limited' } }));
  await open(page);
  await send(page, 'oi');
  await expect(lastFlora(page)).toContainText('minute');
  await expect(page.locator('img[data-testid="flora"]')).toHaveAttribute('data-expression', 'shock');
});

test('mensagem longa demais nem sai', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/chat', (r) => { calls++; r.fulfill({ json: { reply: 'x', expression: 'warm' } }); });
  await open(page);
  await send(page, 'a'.repeat(1201));
  await expect(lastFlora(page)).toHaveText('Please keep your message under 1,200 characters.');
  expect(calls).toBe(0);
});

test('não duplica o histórico com cliques rápidos', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/chat', async (r) => { calls++; await new Promise((ok) => setTimeout(ok, 1500)); r.fulfill({ json: { reply: 'ok', expression: 'warm' } }); });
  await open(page);
  await page.evaluate(() => {
    const input = document.getElementById('chat-input') as HTMLInputElement;
    const btn = document.querySelector<HTMLButtonElement>('#chat-form button[type="submit"]')!;
    for (let i = 0; i < 3; i++) { input.value = 'oi'; btn.click(); }
  });
  await expect(lastFlora(page)).toHaveText('ok');
  expect(calls).toBe(1);
  await expect(log(page).locator('[data-from="guest"]')).toHaveCount(1);
});

test('sem Turnstile a Flora avisa e o campo continua livre', async ({ page }) => {
  let calls = 0;
  await page.route('https://challenges.cloudflare.com/**', (r) => r.abort());
  await page.route('**/api/chat', (r) => { calls++; r.fulfill({ json: { reply: 'x', expression: 'warm' } }); });
  await open(page);
  await send(page, 'oi');
  await expect(lastFlora(page)).toContainText('verify');
  await expect(page.locator('#chat-input')).toBeEnabled();
  expect(calls).toBe(0);
});

test('aviso de privacidade aparece embaixo do chat', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section#flora p.chat-privacy')).toHaveText("Messages are answered by Claude (Anthropic) and aren't stored.");
  await expect(page.locator('section#flora #flora-turnstile')).toBeAttached();
});

test('Turnstile pendurado não trava o chat', async ({ page }) => {
  test.setTimeout(90_000);
  await page.route('https://challenges.cloudflare.com/**', () => {}); // nunca responde
  await page.route('**/api/chat', (r) => r.fulfill({ json: { reply: 'x', expression: 'warm' } }));
  await open(page);
  await send(page, 'oi');
  await expect(lastFlora(page)).toContainText('verify', { timeout: 25_000 });
  await page.unroute('https://challenges.cloudflare.com/**');
  await send(page, 'de novo'); // o campo voltou a funcionar: outra tentativa sai
  await expect(lastGuest(page)).toHaveText('de novo');
});

test('resposta que nunca chega vira fala de erro', async ({ page }) => {
  test.setTimeout(90_000);
  await page.route('**/api/chat', () => {}); // nunca responde
  await open(page);
  await send(page, 'oi');
  await expect(lastFlora(page)).toContainText('trouble connecting', { timeout: 40_000 });
});

test('resposta longa no celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/chat', (r) => r.fulfill({ json: { reply: 'Long answer. '.repeat(270).slice(0, 3500), expression: 'explain' } }));
  await open(page);
  await send(page, 'tell me everything');
  await expect(lastFlora(page)).toContainText('Long answer.');
  const box = await log(page).evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight }));
  expect(box.sh).toBeGreaterThan(box.ch);
  // Com o log à vista, o campo ainda cabe na tela: o log rola por dentro em vez de empurrar o campo.
  await log(page).evaluate((el) => el.scrollIntoView({ block: 'start' }));
  const input = (await page.locator('#chat-input').boundingBox())!;
  expect(input.y).toBeGreaterThanOrEqual(0);
  expect(input.y + input.height).toBeLessThanOrEqual(844);
});

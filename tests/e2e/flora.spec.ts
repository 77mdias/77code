import { test, expect, type Page } from '@playwright/test';
import { waitLoader, isPinned, scrollThrough, onTop, watch } from './helpers.js';

const SEL = 'section#flora';
const SIZES = [[1440, 900], [390, 844]] as const;

// Os testes interceptam /api/chat: nunca chamam o Claude de verdade.
async function send(page: Page, text: string) {
  await page.fill('#chat-input', text);
  await page.press('#chat-input', 'Enter');
}
const log = (page: Page) => page.locator('[data-testid="chat-log"]');
const lastFlora = (page: Page) => log(page).locator('[data-from="flora"]').last();
const lastGuest = (page: Page) => log(page).locator('[data-from="guest"]').last();

// O chat só entra no fim do trecho preso: quem vai conversar rola até lá antes.
async function open(page: Page) {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, SEL, 1);
}
const face = (page: Page) => page.locator('img[data-testid="flora"]');
const chatOpacity = (page: Page) => page.locator('#chat-form').evaluate((f) => Number(getComputedStyle(f.parentElement!).opacity));

test('a IA se chama Flora no título, no campo e na primeira fala', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
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

// A roda do mouse sobre o histórico não pode prender a página: enquanto ele não tem o que rolar, rola a página.
test('a roda do mouse sobre o histórico rola a página e, com resposta longa, o histórico', async ({ page }) => {
  await page.route('**/api/chat', (r) => r.fulfill({ json: { reply: 'Long answer. '.repeat(270).slice(0, 3500), expression: 'explain' } }));
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, SEL, 0.5);
  await log(page).hover();
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);

  await send(page, 'tell me everything');
  await expect(lastFlora(page)).toContainText('Long answer.');
  await log(page).evaluate((el) => { el.scrollTop = 0; });
  await log(page).hover();
  await page.mouse.wheel(0, 300);
  await expect.poll(() => log(page).evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
});

for (const [width, height] of SIZES) {
  test(`a Flora fica presa (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await waitLoader(page);
    expect(await isPinned(page, SEL)).toBe(true);
  });

  // No fim do pin o chat inteiro está na tela: título, histórico, campo e botão.
  test(`no fim do pin o chat cabe na tela (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await open(page);
    const outside = await page.locator(SEL).evaluate((el) => ['h2', '[data-testid="chat-log"]', '#chat-input', '#chat-form button'].filter((s) => {
      const r = el.querySelector(s)!.getBoundingClientRect();
      return !(r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth);
    }));
    expect(outside).toEqual([]);
    expect(await chatOpacity(page)).toBe(1);
  });
}

// O trecho preso é 1 tela de animação + 2 de espera: `anim(f)` é a fração do pin que equivale a `f` da animação.
const anim = (f: number) => f / 3;

test('a Flora sorri ao entrar', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, SEL, anim(0.2));
  await expect(face(page)).toHaveAttribute('data-expression', 'warm');
  await scrollThrough(page, SEL, anim(0.6));
  await expect(face(page)).toHaveAttribute('data-expression', 'happy');
  // Voltando, ela volta ao rosto de antes.
  await scrollThrough(page, SEL, anim(0.2));
  await expect(face(page)).toHaveAttribute('data-expression', 'warm');
});

test('o chat entra no fim da animação', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, SEL, anim(0.4));
  expect(await chatOpacity(page)).toBeLessThan(0.1);
  await scrollThrough(page, SEL, anim(0.95));
  expect(await chatOpacity(page)).toBeGreaterThanOrEqual(0.9);
});

// Com o chat pronto a cena não solta: fica presa por mais duas telas de rolagem, sem nada se mexer.
test('depois da animação a cena espera presa com o chat pronto', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const state = () => page.locator(SEL).evaluate((el) => ({
    top: Math.round(el.getBoundingClientRect().top),
    chat: getComputedStyle(el.querySelector('#chat-form')!.parentElement!).transform,
  }));
  const shots = [];
  for (const f of [0.34, 0.6, 0.99]) {
    await scrollThrough(page, SEL, f);
    expect(await chatOpacity(page)).toBe(1);
    await expect(face(page)).toHaveAttribute('data-expression', 'happy');
    shots.push(await state());
  }
  expect(shots.every((s) => s.top === 0)).toBe(true);
  expect(new Set(shots.map((s) => s.chat)).size).toBe(1);
  // A espera ocupa duas telas de rolagem.
  const screens = await page.locator(SEL).evaluate((el) => (el.parentElement!.offsetHeight - (el as HTMLElement).offsetHeight) / innerHeight);
  expect(Math.round(screens)).toBe(3);
});

test('focar o campo no meio do pin mostra o chat', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, SEL, anim(0.3));
  await page.locator('#chat-input').focus();
  await expect.poll(() => chatOpacity(page)).toBe(1);
});

test('o chat não tem caixa de papel', async ({ page }) => {
  await open(page);
  const chat = await page.locator('#chat-form').evaluate((f) => {
    const c = f.parentElement!;
    const btn = f.querySelector('button')!;
    return {
      bg: getComputedStyle(c).backgroundColor,
      border: getComputedStyle(c).borderTopStyle,
      btnBg: getComputedStyle(btn).backgroundColor,
      inputBorder: getComputedStyle(f.querySelector('input')!).borderTopStyle,
      formBorder: getComputedStyle(f).borderBottomStyle,
    };
  });
  expect(chat).toEqual({ bg: 'rgba(0, 0, 0, 0)', border: 'none', btnBg: 'rgba(0, 0, 0, 0)', inputBorder: 'none', formBorder: 'solid' });
  await expect(page.locator(`${SEL} h2`)).toHaveText('Interactive Flora AI');
  await expect(page.locator(SEL).getByText('Partner ·')).toBeVisible();
  await expect(page.locator('#chat-form button[type="submit"]')).toHaveText(/send/i);
  expect(await page.locator('#chat-input').evaluate((i) => getComputedStyle(i, '::placeholder').fontStyle)).toBe('italic');
});

// Texto claro com alfa: compõe sobre o --ink (a sombra atrás do chat) e mede o contraste WCAG.
for (const [width, height] of SIZES) {
  test(`textos claros do chat têm contraste ≥ 4.5 (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.route('**/api/chat', (r) => r.fulfill({ json: { reply: 'ok', expression: 'warm' } }));
    await open(page);
    await send(page, 'oi');
    await expect(lastFlora(page)).toHaveText('ok');
    const ratios = await page.locator(SEL).evaluate((el) => {
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
      const rgba = (c: string) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
      const lum = ([r, g, b]: number[]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
        .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const bg = rgba(getComputedStyle(document.documentElement).getPropertyValue('--ink'));
      const ratio = (color: string) => {
        const [r, g, b, a] = rgba(color);
        const fg = [r, g, b].map((v, i) => v * (a / 255) + bg[i] * (1 - a / 255));
        const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
      };
      return {
        privacy: ratio(getComputedStyle(el.querySelector('p.chat-privacy')!).color),
        you: ratio(getComputedStyle(el.querySelector('[data-from="guest"]')!, '::before').color),
        placeholder: ratio(getComputedStyle(el.querySelector('#chat-input')!, '::placeholder').color),
      };
    });
    for (const [name, r] of Object.entries(ratios)) expect(r, name).toBeGreaterThanOrEqual(4.5);
  });
}

// O histórico rolado some em degradê também em cima, em vez de cortar meia linha rente ao subtítulo.
test('o histórico some em degradê em cima e embaixo', async ({ page }) => {
  await open(page);
  const mask = await log(page).evaluate((el) => getComputedStyle(el).maskImage);
  expect(mask.startsWith('linear-gradient(rgba(0, 0, 0, 0)')).toBe(true);
  expect(mask.trim().endsWith('rgba(0, 0, 0, 0))')).toBe(true);
});

// O link direto cai no fim do pin: o chat inteiro à vista e o campo responde.
test('link direto /#flora cai com o chat pronto', async ({ page }) => {
  const w = watch(page);
  await page.route('**/api/chat', (r) => r.fulfill({ json: { reply: 'ok', expression: 'warm' } }));
  await page.goto('/#flora');
  await waitLoader(page);
  await expect.poll(() => chatOpacity(page)).toBe(1);
  await expect.poll(() => onTop(page, '#chat-input')).toBe(true);
  await send(page, 'oi');
  await expect(lastFlora(page)).toHaveText('ok');
  expect(w.errors).toEqual([]);
});

test('menos movimento: nada preso, chat pronto', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/chat', (r) => r.fulfill({ json: { reply: 'Calm reply.', expression: 'kind' } }));
  await page.goto('/');
  await waitLoader(page);
  expect(await isPinned(page, SEL)).toBe(false);
  expect(await chatOpacity(page)).toBe(1);
  await expect(face(page)).toHaveAttribute('data-expression', 'happy');
  await send(page, 'oi');
  await expect(lastFlora(page)).toHaveText('Calm reply.');
});

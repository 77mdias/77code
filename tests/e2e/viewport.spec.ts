import { test, expect } from '@playwright/test';
import { waitLoader, isPinned, scrollThrough } from './helpers.js';

// No celular a barra do navegador some ao rolar e a tela cresce (no iPhone, uns 100px). A cena presa
// fica com a altura medida no carregamento, então ela precisa nascer com a altura MAIOR da tela, senão
// sobra uma faixa vazia embaixo. O Chromium do teste não tem essa barra: simulamos dizendo que a
// altura maior é a tela + EXTRA (os tokens --scene-h e --scene-extra de tokens.css).
const EXTRA = 100;
const SCENES = ['section#opening', 'section#screens', 'section#projects', 'section#profile', 'section#flora', 'section#contact'];

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 744 });
  await page.addInitScript((extra) => {
    // O <html> definitivo só existe quando o documento começa a ser lido: aplica ali, antes de qualquer cena medir.
    const apply = () => {
      const root = document.documentElement.style;
      root.setProperty('--scene-h', `calc(100svh + ${extra}px)`);
      root.setProperty('--scene-extra', `${extra}px`);
    };
    new MutationObserver((_, o) => { if (document.documentElement) { apply(); o.disconnect(); } }).observe(document, { childList: true });
  }, EXTRA);
  await page.goto('/');
  await waitLoader(page);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--scene-extra').trim())).toBe(`${EXTRA}px`);
});

test('toda cena presa cobre a tela inteira mesmo depois de a barra do navegador sumir', async ({ page }) => {
  for (const sel of SCENES) {
    expect(await isPinned(page, sel), sel).toBe(true);
    for (const f of [0.02, 0.5, 0.98]) {
      await scrollThrough(page, sel, f);
      const r = await page.locator(sel).evaluate((el) => { const b = el.getBoundingClientRect(); return { top: b.top, bottom: b.bottom }; });
      expect(r.top, `${sel} @${f}`).toBeLessThanOrEqual(0.5);
      // A tela cresce até innerHeight + EXTRA: a cena tem que chegar lá.
      expect(r.bottom, `${sel} @${f}`).toBeGreaterThanOrEqual(744 + EXTRA - 0.5);
    }
  }
});

test('com a barra do navegador aberta, o que importa continua à vista', async ({ page }) => {
  // Maior borda de baixo entre os elementos: tem que caber na tela pequena (a barra cobre o resto).
  const lowest = (sel: string, items: string) => page.locator(sel).evaluate((el, q) =>
    Math.max(...[...el.querySelectorAll(q)].map((e) => e.getBoundingClientRect().bottom)), items);

  await scrollThrough(page, 'section#projects', 0.6);
  expect(await lowest('section#projects', '[data-testid="project"]')).toBeLessThanOrEqual(744);
  await scrollThrough(page, 'section#profile', 1);
  expect(await lowest('section#profile', '[data-testid="specialty"]')).toBeLessThanOrEqual(744);
  await scrollThrough(page, 'section#flora', 0.6);
  expect(await lowest('section#flora', '#chat-input, #chat-form button')).toBeLessThanOrEqual(744);
  await scrollThrough(page, 'section#contact', 1);
  expect(await lowest('section#contact', '#contact-form input, #contact-form textarea, #contact-form button')).toBeLessThanOrEqual(744);
});

import { test, expect, type Page } from '@playwright/test';
import { waitLoader, scrollThrough, onTop } from './helpers.js';

// Celular: tela de toque e sem mouse (o ScrollTrigger se vê como "só toque").
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const FLORA = 'section#flora';
const CONTACT = 'section#contact';

// Um dedo que toca em (x, y) e arrasta `distance` px para cima: o Chromium rola como no aparelho.
async function swipeUp(page: Page, x: number, y: number, distance: number) {
  const cdp = await page.context().newCDPSession(page);
  const at = (py: number) => ({ touchPoints: [{ x, y: py, id: 1 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', ...at(y) });
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', ...at(y - (distance * i) / 10) });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

// A cena que está no meio da tela.
const sceneAtCenter = (page: Page) =>
  page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('section, footer')?.id ?? null);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  expect(await page.evaluate(() => matchMedia('(hover: none), (pointer: coarse)').matches)).toBe(true);
});

// O histórico ocupa o meio da tela: se ele segurar o gesto, ninguém sai da cena da Flora.
test('arrastar o dedo sobre o histórico do chat rola a página', async ({ page }) => {
  await scrollThrough(page, FLORA, 0.5);
  const box = (await page.locator('[data-testid="chat-log"]').boundingBox())!;
  const before = await page.evaluate(() => scrollY);
  await swipeUp(page, box.x + box.width / 2, box.y + box.height - 30, 250);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
});

// Em vários navegadores de celular (os embutidos do Instagram e do WhatsApp, o Firefox) o teclado
// encolhe a janela. Se o ScrollTrigger recalcular ali, ele desmonta a cena presa: o campo perde o
// foco (o teclado fecha) e a página vai parar em outra cena.
for (const [name, scene, field] of [['Flora', FLORA, '#chat-input'], ['contato', CONTACT, '#contact-form input[name="name"]']] as const) {
  test(`o teclado encolhendo a janela não tira o foco nem troca de cena (${name})`, async ({ page }) => {
    await scrollThrough(page, scene, 0.9);
    await page.tap(field);
    // Com teclado na tela o campo não pode estar num elemento fixo: o navegador não consegue rolar até ele.
    await expect.poll(() => page.locator(scene).evaluate((el) => getComputedStyle(el).position)).not.toBe('fixed');

    // Teclado abre e fecha duas vezes. Com 330px a janela fica mais larga que alta: a orientação troca e o
    // GSAP recalcula por conta própria; a âncora de rolagem (motion.ts) tem que devolver a mesma cena.
    for (const height of [500, 844, 330, 844]) {
      await page.setViewportSize({ width: 390, height });
      await page.waitForTimeout(600); // o recálculo espera 200 ms depois do resize
      expect(await page.locator(field).evaluate((el) => el === document.activeElement), `foco com ${height}px`).toBe(true);
      // O navegador rola até o campo em foco quando o teclado sobe; o Chromium do teste não tem teclado.
      await page.locator(field).evaluate((el) => el.scrollIntoView({ block: 'nearest' }));
      expect(await sceneAtCenter(page), `cena com ${height}px`).toBe(scene.split('#')[1]);
      expect(await onTop(page, field), `campo à vista com ${height}px`).toBe(true);
    }
  });
}

// Girar o aparelho muda a largura: aí o recálculo tem que acontecer, e a pessoa continua na cena em que estava.
test('girar o aparelho recalcula as cenas presas e mantém a cena', async ({ page }) => {
  const pinLength = () => page.locator(FLORA).evaluate((el) => el.parentElement!.offsetHeight - (el as HTMLElement).offsetHeight);
  await scrollThrough(page, FLORA, 0.5);
  const before = await pinLength();
  await page.setViewportSize({ width: 700, height: 390 }); // deitado, ainda no layout de celular
  await expect.poll(pinLength).toBeLessThan(before * 0.6);
  expect(await sceneAtCenter(page)).toBe('flora');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(pinLength).toBe(before);
  expect(await sceneAtCenter(page)).toBe('flora');
});

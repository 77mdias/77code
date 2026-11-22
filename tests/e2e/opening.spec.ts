import { test, expect, type Page } from '@playwright/test';
import { watch, waitLoader, scrollThrough } from './helpers.js';
import { JP } from '../../src/content/jp.ts';

const frameOf = async (page: Page) => {
  const src = await page.getByTestId('jean-frame').getAttribute('src');
  return Number(/Image(\d+)\.webp$/.exec(src ?? '')?.[1]);
};

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
});

test('o loading termina em até 3s', async ({ page }) => {
  for (const slowFrames of [false, true]) {
    // Quadros lentos (inclusive o 1) não podem segurar a página: o teto é 2,5s.
    if (slowFrames) await page.route('**/frames2/**', (r) => { setTimeout(() => r.continue().catch(() => {}), 8000); });
    const t0 = Date.now();
    await page.goto('/', { waitUntil: 'commit' });
    await page.waitForSelector('html[data-loaded="true"]', { state: 'attached', timeout: 3000 });
    expect(Date.now() - t0).toBeLessThanOrEqual(3000);
  }
});

// Quadros 2–40 (o 1 é o da abertura e não atrasa).
const LATER_FRAMES = /\/frames2\/Image([2-9]|[1-3]\d|40)\.webp$/;

test('a abertura aparece antes de os quadros carregarem', async ({ page }) => {
  await page.route(LATER_FRAMES, (r) => { setTimeout(() => r.continue().catch(() => {}), 5000); });
  await page.goto('/', { waitUntil: 'commit' });
  const h1 = page.locator('h1');
  const jean = page.getByTestId('jean-frame');
  await expect(h1).toBeVisible();
  await expect(jean).toBeVisible();
  await expect(page.getByTestId('loading')).toBeVisible();
  // Visível de verdade: o ponto do meio não pode cair numa cobertura por cima da cena.
  const uncovered = (sel: string) => page.locator(sel).first().evaluate((el) => {
    const b = el.getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return hit === el || !!hit?.closest('#opening');
  });
  expect(await uncovered('[data-testid="jean-frame"]')).toBe(true);
  expect(await uncovered('h1')).toBe(true);
});

test('a casca estática desenha a abertura no mesmo lugar que o React', async ({ page }) => {
  let release = () => {};
  const gate = new Promise<void>((r) => { release = r; });
  await page.route('**/assets/index-*.js', async (r) => { await gate; await r.continue(); });
  await page.goto('/', { waitUntil: 'commit' });
  const boxes = (sels: string[]) => page.evaluate(async (s) => {
    await document.fonts.ready;
    return s.map((q) => { const b = document.querySelector(q)!.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; });
  }, sels);
  await page.locator('#shell img').first().waitFor();
  const shell = await boxes(['#shell .bg', '#shell .jean', '#shell .title']);
  release();
  await waitLoader(page);
  await expect(page.locator('#shell')).toHaveCount(0);
  const react = await boxes(['#opening picture img', '[data-testid="jean-frame"]', 'h1']);
  // Até 1% da largura: o quadro do React respira (scale 0.994).
  react.forEach((b, i) => b.forEach((v, j) => expect(Math.abs(v - shell[i][j])).toBeLessThanOrEqual(Math.max(2, b[2] * 0.01))));
});

test('a etiqueta de progresso some ao chegar a 100%', async ({ page }) => {
  let release = () => {};
  const gate = new Promise<void>((r) => { release = r; });
  await page.route(LATER_FRAMES, async (r) => { await gate; await r.continue().catch(() => {}); });
  await page.goto('/');
  await waitLoader(page);
  const tag = page.getByTestId('loading');
  await expect(tag).toHaveText(/opening the file… \d+%/);
  await expect(tag).not.toContainText('100%');
  // Etiqueta no canto de baixo à esquerda, não a tela inteira.
  const b = (await tag.boundingBox())!;
  expect(b.x).toBeLessThan(80);
  expect(b.y + b.height).toBeGreaterThan(900 - 80);
  expect(b.width).toBeLessThan(1440 / 2);
  release();
  await expect(tag).not.toBeAttached({ timeout: 15_000 });
});

test('fundo chegando depois do teto não quebra o loading', async ({ page }) => {
  const w = watch(page);
  // Dois itens essenciais chegando depois do teto de 2,5s.
  await page.route('**/opening/bg-1920.webp', (r) => { setTimeout(() => r.continue().catch(() => {}), 4000); });
  await page.route('**/frames2/Image1.webp', (r) => { setTimeout(() => r.continue().catch(() => {}), 4500); });
  const late = page.waitForResponse((r) => r.url().endsWith('/frames2/Image1.webp'));
  await page.goto('/', { waitUntil: 'commit' });
  await waitLoader(page);
  await page.getByTestId('loading').waitFor({ state: 'detached' });
  await late;
  // Dois quadros de animação para o tween do contador rodar depois da resposta atrasada.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  expect(w.errors).toEqual([]);
});

test('o scroll vira o Jean', async ({ page }) => {
  const last = page.waitForResponse((r) => r.url().endsWith('/frames2/Image40.webp'));
  await page.goto('/');
  await waitLoader(page);
  await last;
  expect(await frameOf(page)).toBe(1);

  // O pin dura 220% da tela; 75% dele dá o quadro ~30.
  await page.evaluate(() => {
    const top = document.querySelector('#opening')!.parentElement!.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + innerHeight * 2.2 * 0.75);
  });
  await expect.poll(() => frameOf(page)).toBeGreaterThan(20);

  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => frameOf(page)).toBe(1);
});

// Recarregar (F5) sempre recomeça do início, esteja a página onde estiver.
test('recarregar no meio da página volta ao início', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await waitLoader(page);
  await page.evaluate(() => document.querySelector('#projects')!.scrollIntoView());
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
  await page.reload();
  await waitLoader(page);
  // Espera fixa curta: o que não pode acontecer é a posição antiga voltar depois do loading.
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await frameOf(page)).toBe(1);
  expect(w.errors).toEqual([]);
  expect(w.bad).toEqual([]);
});

test('recarregar com link direto ou com a ficha de um projeto aberta também volta ao início', async ({ page }) => {
  await page.goto('/#contact');
  await waitLoader(page);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
  await page.reload();
  await waitLoader(page);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(new URL(page.url()).hash).toBe('');

  await scrollThrough(page, '#projects', 0.5);
  await page.locator('#projects [data-testid="project"] button').first().click();
  await expect(page.getByTestId('project-file')).toBeVisible();
  await page.reload();
  await waitLoader(page);
  await page.waitForTimeout(600);
  await expect(page.getByTestId('project-file')).toBeHidden();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('menos movimento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await waitLoader(page);
  expect(await frameOf(page)).toBe(40);
  const parent = await page.locator('section#opening').evaluate((el) => el.parentElement!.className);
  expect(parent).not.toContain('pin-spacer');
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('japonês acessível', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await expect(page.locator('#opening span', { hasText: JP.rain.text })).toHaveAttribute('aria-hidden', 'true');
  const label = page.locator('#opening span', { hasText: JP.caseFile.text });
  await expect(label).toHaveAttribute('lang', 'ja');
  await expect(label).toHaveAttribute('aria-label', 'case file no. 77');
});

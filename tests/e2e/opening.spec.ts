import { test, expect, type Page } from '@playwright/test';
import { watch, waitLoader } from './helpers.js';
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

test('o scroll vira o Jean', async ({ page }) => {
  const last = page.waitForResponse((r) => r.url().endsWith('/frames2/Image40.webp'));
  await page.goto('/');
  await waitLoader(page);
  await last;
  expect(await frameOf(page)).toBe(1);

  // O pin dura 150% da tela; 75% dele dá o quadro ~30.
  await page.evaluate(() => {
    const top = document.querySelector('#opening')!.parentElement!.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + innerHeight * 1.5 * 0.75);
  });
  await expect.poll(() => frameOf(page)).toBeGreaterThan(20);

  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => frameOf(page)).toBe(1);
});

test('recarregar no meio da página', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await waitLoader(page);
  await page.evaluate(() => document.querySelector('#cases')!.scrollIntoView());
  await page.reload();
  await waitLoader(page);
  await expect.poll(() => frameOf(page), { timeout: 15_000 }).toBeGreaterThanOrEqual(30);
  expect(w.errors).toEqual([]);
  expect(w.bad).toEqual([]);
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

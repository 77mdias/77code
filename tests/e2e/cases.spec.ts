import { test, expect, type Locator } from '@playwright/test';
import { waitLoader } from './helpers.js';
import { CASES } from '../../src/content/cases.ts';

const opacity = (el: Locator) => el.evaluate((e) => Number(getComputedStyle(e).opacity));

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
});

test('os 4 casos aparecem na ordem', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const cases = page.locator('#cases article[data-testid="case"]');
  expect(await cases.evaluateAll((els) => els.map((e) => e.id))).toEqual([
    'case-criptenv', 'case-ateliesys', 'case-lene-studio-beauty', 'case-range77',
  ]);
  await expect(cases.locator('h2')).toHaveText(CASES.map((c) => c.name));
  await expect(cases.getByRole('link', { name: 'View the site' })).toHaveCount(CASES.filter((c) => c.url).length);
});

test('o carimbo bate ao rolar até o fim do dossiê', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  // O último caso: posições velhas (fonte que chega depois) se acumulam até ele.
  const article = page.locator('#case-range77');
  const stamp = article.getByTestId('stamp');
  expect(await opacity(stamp)).toBeLessThan(0.1);
  await article.evaluate((el) => el.scrollIntoView({ block: 'end' }));
  // O carimbo do DESIGN.md é levemente transparente (0.9): "visível" é chegar nele.
  await expect.poll(() => opacity(stamp), { timeout: 1500 }).toBeGreaterThanOrEqual(0.9);
});

test('eyecatch antes de cada caso', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const eyecatches = page.locator('#cases [data-testid="eyecatch"]');
  await expect(eyecatches).toHaveCount(4);
  for (const [i, c] of CASES.entries()) {
    await expect(eyecatches.nth(i)).toContainText(`CASE 0${c.number}`);
    // O eyecatch vem logo antes do dossiê do caso (o pin pode embrulhá-lo num pin-spacer).
    const next = await eyecatches.nth(i).evaluate((el) => {
      const box = el.parentElement!.className.includes('pin-spacer') ? el.parentElement! : el;
      return box.nextElementSibling?.id;
    });
    expect(next).toBe(`case-${c.slug}`);
  }
});

test('links externos seguros', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const links = page.locator('#cases a[target="_blank"]');
  await expect(links).toHaveCount(CASES.filter((c) => c.url).length);
  for (const rel of await links.evaluateAll((els) => els.map((e) => e.getAttribute('rel') ?? ''))) {
    expect(rel.split(/\s+/)).toContain('noopener');
  }
});

test('menos movimento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await waitLoader(page);
  const stamps = page.locator('#cases [data-testid="stamp"]');
  await expect(stamps).toHaveCount(4);
  for (const s of await stamps.all()) expect(await opacity(s)).toBeGreaterThanOrEqual(0.9);
  const parents = await page.locator('[data-testid="eyecatch"]').evaluateAll((els) => els.map((e) => e.parentElement!.className));
  for (const p of parents) expect(p).not.toContain('pin-spacer');
});

test('redimensionar depois de carregar', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await page.locator('#case-ateliesys').evaluate((el) => el.scrollIntoView());
  await page.setViewportSize({ width: 390, height: 844 });
  // O refresh do ScrollTrigger tem debounce e não avisa a página: espera fixa curta.
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('#case-ateliesys').evaluate((el) => el.getBoundingClientRect().width)).toBeLessThanOrEqual(390);
});

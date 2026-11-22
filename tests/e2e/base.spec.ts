import { test, expect } from '@playwright/test';
import { watch, waitLoader } from './helpers.js';

const FORBIDDEN = ['Space Grotesk', 'Noto Serif JP', 'Noto Sans JP', 'Dancing Script', 'Kaushan Script'];

for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'celular', width: 390, height: 844 }]) {
  test(`carrega sem erro nem 404 (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const w = watch(page);
    await page.goto('/');
    await waitLoader(page);
    await expect(page.locator('h1')).toHaveText('DIAS77');
    expect(w.errors).toEqual([]);
    expect(w.bad).toEqual([]);
  });
}

test('não existe header', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await expect(page.locator('header')).toHaveCount(0);
});

test('não busca nada fora do site', async ({ page }) => {
  const hosts = new Set<string>();
  page.on('request', (r) => { if (/^https?:/.test(r.url())) hosts.add(new URL(r.url()).host); });
  await page.goto('/');
  await waitLoader(page);
  const own = new URL(page.url()).host;
  const allowed = [own, 'challenges.cloudflare.com', 'static.cloudflareinsights.com'];
  expect([...hosts].filter((h) => !allowed.includes(h))).toEqual([]);
});

test('sem fontes proibidas', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const families = await page.evaluate(() => [...document.fonts].map((f) => f.family.replace(/["']/g, '')));
  for (const f of FORBIDDEN) expect(families).not.toContain(f);
  const h1 = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1).toMatch(/^"?Humane/);
});

test('fonte que não carrega não some com o título', async ({ page }) => {
  await page.route('**/fonts/**', (r) => r.abort());
  await page.goto('/');
  await waitLoader(page);
  await expect(page.locator('h1')).toBeVisible();
  const box = await page.locator('h1').boundingBox();
  expect(box!.height).toBeGreaterThan(40);
});

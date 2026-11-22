import { test, expect } from '@playwright/test';
import { watch, waitLoader } from './helpers.js';

for (const vp of [{ name: 'desktop', width: 1366, height: 768 }, { name: 'celular', width: 390, height: 844 }]) {
  test(`carrega sem erro nem 404 (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const w = watch(page);
    await page.goto('/');
    await expect(page).toHaveTitle('DIAS77');
    await expect(page.locator('#character-sequence')).toHaveAttribute('src', /\/static\/frames2\/Image1\.webp/);
    await waitLoader(page);
    expect(w.errors).toEqual([]);
    expect(w.bad).toEqual([]);
  });
}

test('não busca nada em CDN nem no domínio do autor', async ({ page }) => {
  const hosts = [];
  page.on('request', (r) => hosts.push(new URL(r.url()).host));
  await page.goto('/');
  await page.waitForTimeout(3000);
  expect(hosts.filter((h) => /cdnjs|jsdelivr|tenztan/.test(h))).toEqual([]);
});

test('a hero troca de quadro ao rolar', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await waitLoader(page);
  await page.mouse.move(683, 384);
  // a primeira rolagem logo após destravar é ignorada pelo Lenis (comportamento do site original)
  await expect(async () => {
    await page.mouse.wheel(0, 2500);
    await expect(page.locator('#character-sequence')).not.toHaveAttribute('src', /Image1\.webp$/, { timeout: 1500 });
  }).toPass({ timeout: 15_000 });
});

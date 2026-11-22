import { test, expect } from '@playwright/test';
import { watch } from './helpers.js';

for (const vp of [{ name: 'desktop', width: 1366, height: 768 }, { name: 'celular', width: 390, height: 844 }]) {
  test(`carrega sem erro nem 404 (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const w = watch(page);
    await page.goto('/');
    await expect(page).toHaveTitle('DIAS77');
    await expect(page.locator('#character-sequence')).toHaveAttribute('src', /\/static\/frames2\/Image1\.webp/);
    await page.waitForTimeout(4000); // loader termina
    expect(w.errors).toEqual([]);
    expect(w.bad).toEqual([]);
  });
}

import { test, expect } from '@playwright/test';
import { isPinned, scrollThrough, watch } from './helpers.js';

test.describe('/77codelab', () => {
  test('carrega /77codelab e /77codelab/ sem erros de console ou rede', async ({ page }) => {
    const w = watch(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    const res = await page.goto('/77codelab');
    expect(res?.status()).toBe(200);
    await page.waitForSelector('html[data-loaded="true"]', { state: 'attached', timeout: 15_000 });
    await expect(page.locator('h1')).toContainText('77CODE');
    await expect(page.getByTestId('lab-hero')).toBeVisible();
    await expect(page.getByTestId('lab-board')).toBeVisible();
    await expect(page.getByTestId('lab-closing')).toContainText('Got a tough interface problem?');
    await expect(page.getByTestId('lab-row')).toHaveCount(8);
    expect(w.errors).toEqual([]);
    expect(w.bad).toEqual([]);
  });

  test('hero preso ativa pin e parallax no scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/77codelab/');
    await page.waitForSelector('html[data-loaded="true"]', { state: 'attached' });

    expect(await isPinned(page, '[data-testid="lab-hero"]')).toBe(true);
    await scrollThrough(page, '[data-testid="lab-hero"]', 0.6);

    const copyTransform = await page.locator('[data-testid="lab-hero"] h1').evaluate((el) => getComputedStyle(el.parentElement!).transform);
    expect(copyTransform).not.toBe('none');
  });

  test('filtros, busca e modal do experimento funcionam pelo teclado e clique', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/77codelab/');
    await page.waitForSelector('html[data-loaded="true"]', { state: 'attached' });

    await page.getByRole('button', { name: 'Parallax & Depth' }).click();
    await expect(page.getByTestId('lab-row')).toHaveCount(3);

    await page.getByPlaceholder('Find an experiment').fill('QuickTo Proof');
    await expect(page.getByTestId('lab-row')).toHaveCount(1);

    await page.getByTestId('lab-row').first().locator('button').click();
    const modal = page.getByTestId('lab-inspector');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('QuickTo Proof Preview');

    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
  });

  test('prefers-reduced-motion remove pins e canvas de partículas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/77codelab/');
    await page.waitForSelector('html[data-loaded="true"]', { state: 'attached' });

    expect(await isPinned(page, '[data-testid="lab-hero"]')).toBe(false);
    await expect(page.locator('canvas')).toHaveCount(0);
  });
});

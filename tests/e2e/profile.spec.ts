import { test, expect } from '@playwright/test';
import { waitLoader } from './helpers.js';
import { PROFILE } from '../../src/content/profile.ts';

test('ficha com retrato, especialidades na ordem e texto do Jean', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await waitLoader(page);
  const profile = page.locator('section#profile');
  const img = profile.locator('img');
  await expect(img).toHaveAttribute('src', /image-4\.webp$/);
  expect((await img.getAttribute('alt'))!.trim()).not.toBe('');
  await expect(profile.locator('h3')).toHaveText(PROFILE.specialties.map((s) => s.title));
  await expect(profile).toContainText('UNOESTE');
  await expect(profile).toContainText('Presidente Prudente');
});

test('no celular os três quadros empilham', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await waitLoader(page);
  const boxes = page.locator('section#profile [data-testid="specialty"]');
  await expect(boxes).toHaveCount(3);
  const rects = await boxes.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  expect(new Set(rects.map((r) => Math.round(r.x))).size).toBe(1);
  expect(rects[1].y).toBeGreaterThan(rects[0].y);
  expect(rects[2].y).toBeGreaterThan(rects[1].y);
});

test('movimento reduzido: tudo visível sem rolar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await waitLoader(page);
  const clip = await page.locator('section#profile [data-testid="specialty"]').first().evaluate((e) => getComputedStyle(e).clipPath);
  expect(clip).toBe('none');
});

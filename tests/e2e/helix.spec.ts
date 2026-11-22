import { test, expect, type Page } from '@playwright/test';
import { waitLoader, isPinned, scrollThrough } from './helpers.js';
import { CASES } from '../../src/content/cases.ts';

const SEL = 'section#screens';
// Giro da espiral em graus e quantas telas estão ao menos em parte dentro da cena.
const state = (page: Page) => page.locator(SEL).evaluate((el) => {
  const spiral = el.querySelector('[aria-hidden="true"] > div')!;
  const m = new DOMMatrix(getComputedStyle(spiral).transform);
  const imgs = [...el.querySelectorAll('img')].map((i) => i.getBoundingClientRect());
  return {
    spin: Math.round((Math.atan2(m.m13, m.m11) * 180) / Math.PI),
    y: Math.round(m.m42),
    visible: imgs.filter((r) => r.bottom > 0 && r.top < innerHeight && r.width > 0).length,
    intro: Number(getComputedStyle(el.firstElementChild!).opacity),
  };
});

for (const [width, height] of [[1440, 900], [390, 844]] as const) {
  test(`a hélice vem depois da abertura, fica presa e gira com a rolagem (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await waitLoader(page);
    await expect(page.locator(`${SEL} img`)).toHaveCount(CASES.length * 2);
    expect(await isPinned(page, SEL)).toBe(true);
    // Ordem das cenas: abertura, hélice, projetos.
    expect(await page.evaluate(() => [...document.querySelectorAll('main section')].map((s) => s.id).slice(0, 3)))
      .toEqual(['opening', 'screens', 'projects']);

    await scrollThrough(page, SEL, 0.02);
    const start = await state(page);
    expect(start.intro).toBeGreaterThan(0.9);
    await scrollThrough(page, SEL, 0.5);
    const mid = await state(page);
    expect(mid.intro).toBe(0);
    expect(mid.visible).toBeGreaterThanOrEqual(3);
    expect(mid.y).toBeLessThan(start.y);
    expect(mid.spin).not.toBe(start.spin);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('menos movimento: a hélice não existe e os projetos vêm logo depois da abertura', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await waitLoader(page);
  await expect(page.locator(SEL)).toHaveCount(0);
  await expect(page.locator('#projects')).toHaveCount(1);
});

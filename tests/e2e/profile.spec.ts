import { test, expect, type Page } from '@playwright/test';
import { waitLoader, isPinned, scrollThrough } from './helpers.js';
import { PROFILE } from '../../src/content/profile.ts';

const SEL = 'section#profile';
const SIZES = [[1440, 900], [390, 844]] as const;

async function open(page: Page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await waitLoader(page);
}

// Fração das letras desenhadas do about (a camada visual, escondida do leitor de tela).
const typed = (page: Page) => page.locator(`${SEL} [data-typed]`).evaluate((el) => {
  const chars = [...el.querySelectorAll('span')];
  return chars.filter((c) => Number(getComputedStyle(c).opacity) >= 0.5).length / chars.length;
});

// Assentado: sem transform sobrando e na opacidade cheia.
const settled = (page: Page) => page.locator(`${SEL} [data-testid="specialty"]`).evaluateAll((els) =>
  els.map((e) => {
    const cs = getComputedStyle(e);
    return new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform).isIdentity && Number(cs.opacity) === 1;
  }));

test('ficha com retrato, especialidades na ordem e texto do Jean', async ({ page }) => {
  await open(page);
  const profile = page.locator(SEL);
  const img = profile.locator('img');
  await expect(img).toHaveAttribute('src', /image-4\.webp$/);
  expect((await img.getAttribute('alt'))!.trim()).not.toBe('');
  await expect(profile.locator('h3')).toHaveText(PROFILE.specialties.map((s) => s.title));
  await expect(profile).toContainText('UNOESTE');
  await expect(profile).toContainText('Presidente Prudente');
});

test('no celular os três quadros empilham', async ({ page }) => {
  await open(page, 390, 844);
  await scrollThrough(page, SEL, 1);
  const boxes = page.locator(`${SEL} [data-testid="specialty"]`);
  await expect(boxes).toHaveCount(3);
  const rects = await boxes.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  expect(new Set(rects.map((r) => Math.round(r.x))).size).toBe(1);
  expect(rects[1].y).toBeGreaterThan(rects[0].y);
  expect(rects[2].y).toBeGreaterThan(rects[1].y);
});

for (const [width, height] of SIZES) {
  test(`o profile fica preso (${width}px)`, async ({ page }) => {
    await open(page, width, height);
    expect(await isPinned(page, SEL)).toBe(true);
  });

  // No começo e no fim do trecho preso, o que está na cena cabe na tela e em tamanho de leitura.
  test(`cabe na tela no começo e no fim (${width}px)`, async ({ page }) => {
    await open(page, width, height);
    const outside = (selectors: string[]) => page.locator(SEL).evaluate((el, sels) => sels.filter((s) => {
      const r = el.querySelector(s)!.getBoundingClientRect();
      return !(r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth);
    }), selectors);
    await scrollThrough(page, SEL, 0);
    expect(await outside(['h2', 'img', '[data-typed]'])).toEqual([]);
    await scrollThrough(page, SEL, 1);
    expect(await outside(['h2', 'img', '[data-typed]', '[data-testid="specialty"]:nth-child(1)',
      '[data-testid="specialty"]:nth-child(2)', '[data-testid="specialty"]:nth-child(3)'])).toEqual([]);
    // Encolher para caber não pode deixar o texto pequeno demais.
    const scale = await page.locator(`${SEL} [data-typed]`).evaluate((e) => e.getBoundingClientRect().width / (e as HTMLElement).offsetWidth);
    expect(scale).toBeGreaterThanOrEqual(0.95);
  });
}

for (const [width, height] of SIZES) {
  // O texto ainda descendo do parallax não pode ficar embaixo de um quadro já assentado.
  test(`nenhum quadro cobre o texto durante o pin (${width}px)`, async ({ page }) => {
    await open(page, width, height);
    for (const f of [0.4, 0.6, 0.8, 0.95]) {
      await scrollThrough(page, SEL, f);
      const bad = await page.locator(SEL).evaluate((el) => {
        const rect = (s: string) => el.querySelector(s)!.getBoundingClientRect();
        const boxes = [...el.querySelectorAll('[data-testid="specialty"]')].map((b) => b.getBoundingClientRect());
        const out: string[] = [];
        if (rect('[data-typed]').bottom > boxes[0].top) out.push('about abaixo do topo do 1º quadro');
        for (const s of ['h2', 'img', '[data-typed]']) {
          const t = rect(s);
          boxes.forEach((b, i) => {
            if (b.left < t.right && t.left < b.right && b.top < t.bottom && t.top < b.bottom) out.push(`quadro ${i + 1} sobre ${s}`);
          });
        }
        return out;
      });
      expect(bad, `fração ${f}`).toEqual([]);
    }
  });
}

test('o texto aparece com o scroll', async ({ page }) => {
  await open(page);
  await scrollThrough(page, SEL, 0.1);
  const early = await typed(page);
  await scrollThrough(page, SEL, 0.6);
  const mid = await typed(page);
  expect(early).toBeLessThan(mid);
  // Quem para de rolar depois do pin lê o texto inteiro.
  await scrollThrough(page, SEL, 1);
  expect(await typed(page)).toBe(1);
});

test('os quadros assentam um a um', async ({ page }) => {
  await open(page);
  await scrollThrough(page, SEL, 0.5);
  const half = await settled(page);
  expect(half[0]).toBe(true);
  expect(half[2]).toBe(false);
  await scrollThrough(page, SEL, 0.95);
  expect(await settled(page)).toEqual([true, true, true]);
});

test('leitor de tela lê o texto inteiro', async ({ page }) => {
  await open(page);
  // Antes de rolar: nenhuma letra desenhada, mas o texto todo está na árvore de acessibilidade.
  expect(await typed(page)).toBe(0);
  const tree = await page.locator(SEL).ariaSnapshot();
  for (const p of PROFILE.about) expect(tree).toContain(p);
});

test('menos movimento: nada preso e tudo pronto', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  expect(await isPinned(page, SEL)).toBe(false);
  for (const p of PROFILE.about) await expect(page.locator(SEL).getByText(p, { exact: true })).toBeVisible();
  expect(await settled(page)).toEqual([true, true, true]);
});

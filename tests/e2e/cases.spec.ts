import { test, expect, type Locator } from '@playwright/test';
import { waitLoader, isPinned, scrollThrough } from './helpers.js';
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

test('cada dossiê fica preso', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  for (const c of CASES) expect(await isPinned(page, `#case-${c.slug}`)).toBe(true);
});

test('o carimbo bate no fim do trecho preso', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  // O último caso: posições velhas (fonte que chega depois) se acumulam até ele.
  const sel = '#case-range77';
  const stamp = page.locator(sel).getByTestId('stamp');
  await scrollThrough(page, sel, 0.3);
  expect(await opacity(stamp)).toBeLessThan(0.1);
  await scrollThrough(page, sel, 0.95);
  // O carimbo do DESIGN.md é levemente transparente (0.9): "visível" é chegar nele.
  await expect.poll(() => opacity(stamp), { timeout: 1500 }).toBeGreaterThanOrEqual(0.9);
});

// No celular a prova aparece no meio do trecho preso e o relatório fecha o dossiê.
for (const [width, height, fraction] of [[1440, 900, 0.95], [390, 844, 0.5]]) {
  test(`o fio toca as etiquetas (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await waitLoader(page);
    for (const c of CASES) {
      const sel = `#case-${c.slug}`;
      await scrollThrough(page, sel, fraction);
      // Maior distância entre cada ponta do fio e o centro-topo da etiqueta dela.
      const worst = () => page.locator(sel).evaluate((el) => {
        const ends = [...el.querySelectorAll('[data-end]')].map((e) => e.getBoundingClientRect());
        const tags = [...el.querySelectorAll('ul[aria-label="Stack"] > li')].map((e) => e.getBoundingClientRect());
        if (!tags.length || ends.length !== tags.length) return Infinity;
        return Math.max(...ends.map((p, i) => Math.hypot(
          p.x + p.width / 2 - (tags[i].x + tags[i].width / 2), p.y + p.height / 2 - tags[i].y)));
      });
      await expect.poll(worst, { timeout: 3000 }).toBeLessThanOrEqual(6);
    }
  });
}

// Centro dentro da tela e sem nada por cima: o elementFromPoint acha o próprio elemento.
const revealed = (loc: Locator) => loc.evaluate((e) => {
  const r = e.getBoundingClientRect();
  if (r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth) return false;
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return !!hit && e.contains(hit);
});

test.describe('celular: o relatório fecha o dossiê', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('nome e link legíveis no fim do trecho preso e logo depois', async ({ page }) => {
    await page.goto('/');
    await waitLoader(page);
    for (const c of CASES) {
      const sel = `#case-${c.slug}`;
      const article = page.locator(sel);
      for (const fraction of [0.95, 1.02]) {
        await scrollThrough(page, sel, fraction);
        await expect.poll(() => revealed(article.locator('h2')), { timeout: 1500 }).toBe(true);
        await expect.poll(() => revealed(article.getByRole('link', { name: 'View the site' })), { timeout: 1500 }).toBe(true);
      }
    }
  });

  test('focar o link pelo teclado mostra o relatório', async ({ page }) => {
    await page.goto('/');
    await waitLoader(page);
    const sel = '#case-ateliesys';
    // No meio do trecho preso a prova ocupa o lugar do relatório.
    await scrollThrough(page, sel, 0.5);
    const link = page.locator(sel).getByRole('link', { name: 'View the site' });
    await link.focus();
    await expect(link).toBeFocused();
    await expect.poll(() => revealed(link), { timeout: 3000 }).toBe(true);
  });
});

test('eyecatch antes de cada caso', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const eyecatches = page.locator('#cases [data-testid="eyecatch"]');
  await expect(eyecatches).toHaveCount(4);
  for (const [i, c] of CASES.entries()) {
    await expect(eyecatches.nth(i)).toContainText(`CASE 0${c.number}`);
    // O eyecatch vem logo antes do dossiê do caso (o pin embrulha os dois em pin-spacers).
    const next = await eyecatches.nth(i).evaluate((el) => {
      const box = el.parentElement!.className.includes('pin-spacer') ? el.parentElement! : el;
      const sib = box.nextElementSibling;
      return (sib?.className.includes('pin-spacer') ? sib.firstElementChild : sib)?.id;
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
  for (const c of CASES) expect(await isPinned(page, `#case-${c.slug}`)).toBe(false);
  // O helper avisa em vez de rolar para um lugar sem sentido.
  await expect(scrollThrough(page, '#case-criptenv', 0.5)).rejects.toThrow(/pin-spacer/);
});

test.describe('celular de toque', () => {
  // Com toque, o ScrollTrigger ignora resize só de altura (barra de endereço); o nosso também tem que ignorar.
  test.use({ hasTouch: true, isMobile: true });

  test('barra de endereço não recalcula os pins', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await waitLoader(page);
    await page.evaluate(() => scrollTo(0, innerHeight * 0.75));
    const spacer = () => page.locator('section#opening').evaluate((el) => el.parentElement!.getBoundingClientRect().height);
    const before = await spacer();
    await page.setViewportSize({ width: 390, height: 700 });
    // Esperar um refresh que não deve acontecer: só dá para esperar o tempo do debounce passar.
    await page.waitForTimeout(1000);
    expect(await spacer()).toBe(before);
  });
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

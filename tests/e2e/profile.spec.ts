import { test, expect, type Page } from '@playwright/test';
import { waitLoader, isPinned, scrollThrough, onTop, watch } from './helpers.js';
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

test('no celular os três cards empilham alternando de lado, cada um encostado numa borda', async ({ page }) => {
  await open(page, 390, 844);
  await scrollThrough(page, SEL, 1);
  const boxes = page.locator(`${SEL} [data-testid="specialty"]`);
  await expect(boxes).toHaveCount(3);
  const rects = await boxes.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  expect(rects[1].y).toBeGreaterThan(rects[0].y);
  expect(rects[2].y).toBeGreaterThan(rects[1].y);
  // Ímpares na borda esquerda, o do meio na direita (a ficha pode estar encolhida uns poucos px para caber).
  expect(rects[0].left).toBeLessThanOrEqual(12);
  expect(rects[2].left).toBeLessThanOrEqual(12);
  expect(rects[1].right).toBeGreaterThanOrEqual(390 - 12);
  expect(rects[1].left).toBeGreaterThan(rects[0].left);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('desktop: composição assimétrica de tela cheia, com os cards descendo em escada', async ({ page }) => {
  await open(page);
  await scrollThrough(page, SEL, 1);
  const rects = await page.locator(`${SEL} [data-testid="specialty"]`).evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  // Sem contêiner: o 1º card encosta na borda direita e a folha começa na borda esquerda.
  expect(Math.round(rects[0].right)).toBe(1440);
  for (const i of [1, 2]) {
    expect(rects[i].top).toBeGreaterThanOrEqual(rects[i - 1].bottom);
    expect(rects[i].left).toBeLessThan(rects[i - 1].left - 100);
  }
  const title = await page.locator(`${SEL} h2`).evaluate((e) => e.getBoundingClientRect());
  const paper = await page.locator(`${SEL} img`).evaluate((e) => e.getBoundingClientRect());
  expect(paper.left).toBe(0);
  expect(Math.round(paper.bottom)).toBe(900);
  // O título atravessa o corte da folha (40% da largura no topo).
  expect(title.left).toBeLessThan(1440 * 0.4);
  expect(title.right).toBeGreaterThan(1440 * 0.4);
});

test('entrada: o título sai de dentro do corte; saída: os cards são levantados em velocidades diferentes', async ({ page }) => {
  await open(page);
  const clip = () => page.locator(`${SEL} h2`).evaluate((e) => getComputedStyle(e).clipPath);
  await scrollThrough(page, SEL, 0);
  expect(await clip()).toMatch(/^inset\(100%/);
  await scrollThrough(page, SEL, 0.3);
  expect(await clip()).toMatch(/^inset\(-10%/);

  // Deslocamento vertical de cada card em relação ao próprio lugar no layout (o degrau é quem sobe).
  const lift = () => page.locator(`${SEL} [data-testid="specialty"]`).evaluateAll((els) =>
    els.map((e) => Math.round(new DOMMatrix(getComputedStyle(e.parentElement!).transform).m42)));
  await scrollThrough(page, SEL, 1);
  expect(await lift()).toEqual([0, 0, 0]);
  // Depois do pin (a cena já subindo): o de cima sobe mais que o do meio, que sobe mais que o de baixo.
  await scrollThrough(page, SEL, 1.25);
  const up = await lift();
  expect(up[0]).toBeLessThan(up[1]);
  expect(up[1]).toBeLessThan(up[2]);
  expect(up[2]).toBeLessThan(0);
  // Voltar para dentro do pin devolve tudo ao lugar.
  await scrollThrough(page, SEL, 0.95);
  expect(await lift()).toEqual([0, 0, 0]);
  expect(await settled(page)).toEqual([true, true, true]);
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
    // No começo o retrato ainda está um pouco abaixo da borda (parallax): ele só precisa caber no fim.
    await scrollThrough(page, SEL, 0);
    expect(await outside(['h2', '[data-typed]'])).toEqual([]);
    await scrollThrough(page, SEL, 1);
    expect(await outside(['h2', 'img', '[data-typed]'])).toEqual([]);
    // Os cards podem sair pela lateral (sangram na borda); em altura cabem inteiros, e o texto fica todo na tela.
    const cards = await page.locator(`${SEL} [data-testid="specialty"]`).evaluateAll((els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      const text = [...e.querySelectorAll('h3, dt, dd')].map((t) => t.getBoundingClientRect());
      return r.top >= 0 && r.bottom <= innerHeight && text.every((t) => t.left >= 0 && t.right <= innerWidth);
    }));
    expect(cards).toEqual([true, true, true]);
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

// O link direto cai no fim do pin: texto todo datilografado e quadros assentados.
test('link direto /#profile cai com a ficha completa', async ({ page }) => {
  const w = watch(page);
  await page.goto('/#profile');
  await waitLoader(page);
  await expect.poll(() => typed(page)).toBe(1);
  await expect.poll(() => settled(page)).toEqual([true, true, true]);
  await expect.poll(() => onTop(page, `${SEL} [data-typed]`)).toBe(true);
  expect(w.errors).toEqual([]);
});

test('menos movimento: nada preso e tudo pronto', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  expect(await isPinned(page, SEL)).toBe(false);
  for (const p of PROFILE.about) await expect(page.locator(SEL).getByText(p, { exact: true })).toBeVisible();
  expect(await settled(page)).toEqual([true, true, true]);
});

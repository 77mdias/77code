import { test, expect, type Page } from '@playwright/test';
import { waitLoader, isPinned, scrollThrough, watch } from './helpers.js';
import { CASES } from '../../src/content/cases.ts';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
});

const folds = (page: Page) => page.locator('#projects [data-testid="project"]');
const file = (page: Page) => page.getByTestId('project-file');
// Qual dobra a rolagem abriu (-1: nenhuma).
const active = (page: Page) => folds(page).evaluateAll((els) => els.findIndex((e) => e.hasAttribute('data-active')));

test('os 4 projetos aparecem na ordem, com nome, resumo e botão para a ficha', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await expect(folds(page)).toHaveCount(CASES.length);
  await expect(folds(page).locator('button')).toHaveCount(CASES.length);
  for (const [i, c] of CASES.entries()) {
    await expect(folds(page).nth(i)).toContainText(c.name);
    await expect(folds(page).nth(i)).toContainText(c.theCase);
  }
});

test('a lista fica presa e a rolagem abre um projeto de cada vez', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  expect(await isPinned(page, '#projects')).toBe(true);
  await scrollThrough(page, '#projects', 0.05);
  await expect.poll(() => active(page)).toBe(-1);
  await scrollThrough(page, '#projects', 0.3);
  await expect.poll(() => active(page)).toBe(0);
  await scrollThrough(page, '#projects', 0.95);
  await expect.poll(() => active(page)).toBe(CASES.length - 1);
});

test('a dobra aberta é mais larga que as outras; passar o mouse abre outra', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, '#projects', 0.3);
  const widths = () => folds(page).evaluateAll((els) => els.map((e) => (e as HTMLElement).offsetWidth));
  await expect.poll(async () => { const w = await widths(); return w[0] > w[1] * 2; }, { timeout: 3000 }).toBe(true);
  await folds(page).nth(2).hover();
  await expect.poll(async () => { const w = await widths(); return w[2] > w[0] * 2; }, { timeout: 3000 }).toBe(true);
  // Com o mouse em cima o leque está inclinado em 3D: o clique tem que continuar chegando no link.
  await folds(page).nth(2).locator('button').click();
  await expect(file(page).locator('h2')).toHaveText('LENE STUDIO BEAUTY');
});

test('clicar abre a ficha do projeto; voltar fecha', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, '#projects', 0.5);
  await folds(page).nth(1).locator('button').click();
  // A ficha não mexe no endereço: nada de /#.
  expect(new URL(page.url()).hash).toBe('');
  await expect(file(page)).toBeVisible();
  await expect(file(page).locator('h2')).toHaveText('ATELIESYS');
  await expect(file(page)).toContainText(CASES[1].solution);
  await expect(file(page).locator('ul[aria-label="Stack"] > li')).toHaveText(CASES[1].stack);
  const link = file(page).getByRole('link', { name: 'View the site' });
  await expect(link).toHaveAttribute('href', CASES[1].url!);
  expect((await link.getAttribute('rel'))!.split(/\s+/)).toContain('noopener');

  await file(page).getByRole('button', { name: 'Back to the files' }).click();
  await expect(file(page)).toBeHidden();
  expect(w.errors).toEqual([]);
  expect(w.bad).toEqual([]);
});

test('Esc fecha a ficha', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, '#projects', 0.5);
  await folds(page).nth(0).locator('button').click();
  await expect(file(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(file(page)).toBeHidden();
});

test('o botão voltar do navegador fecha a ficha e a página continua na lista', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, '#projects', 0.5);
  await folds(page).nth(0).locator('button').click();
  await expect(file(page)).toBeVisible();
  await page.goBack();
  await expect(file(page)).toBeHidden();
  await expect(page.locator('#projects')).toBeInViewport();
});

test('o fim da ficha leva ao próximo projeto, e o último volta ao primeiro', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, '#projects', 0.5);
  await folds(page).nth(CASES.length - 2).locator('button').click();
  const next = page.getByTestId('next-project');
  for (const c of [CASES[CASES.length - 1], CASES[0]]) {
    await expect(next).toContainText(c.name);
    await next.click();
    await expect(file(page).locator('h2')).toHaveText(c.name);
    // A ficha nova começa do topo.
    await expect.poll(() => file(page).evaluate((d) => d.scrollTop)).toBe(0);
  }
  // Um voltar só fecha tudo, mesmo depois de passar por vários projetos.
  await page.goBack();
  await expect(file(page)).toBeHidden();
});

test('menos movimento: sem pin, sem chuva, todos os resumos à mostra', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await waitLoader(page);
  expect(await isPinned(page, '#projects')).toBe(false);
  await expect(page.locator('#projects canvas')).toHaveCount(0);
  expect(await folds(page).evaluateAll((els) => els.every((e) => e.hasAttribute('data-active')))).toBe(true);
});

test('celular: o leque cabe na largura e o toque abre a ficha', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, '#projects', 0.5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await folds(page).nth(0).locator('button').click();
  await expect(file(page).locator('h2')).toHaveText('CRIPTENV');
  expect(await file(page).evaluate((d) => d.scrollWidth <= d.clientWidth)).toBe(true);
});

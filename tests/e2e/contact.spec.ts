import { test, expect, type Page } from '@playwright/test';
import { watch, waitLoader } from './helpers.js';
import { CONTACT } from '../../src/content/contact.ts';

const SUBMIT = 'https://api.web3forms.com/submit';

async function fill(page: Page) {
  const form = page.locator('form#contact-form');
  await form.scrollIntoViewIfNeeded();
  await form.getByLabel('Name').fill('Teste');
  await form.getByLabel('Email').fill('teste@example.com');
  await form.getByLabel('Message').fill('Mensagem de teste');
  return form;
}

test('a CSP deixa o navegador falar com o Web3Forms', async ({ page }) => {
  const w = watch(page);
  await page.route(SUBMIT, (r) => r.fulfill({ json: { success: true } }));
  await page.goto('/');
  await waitLoader(page);
  const ok = await page.evaluate((u) => fetch(u, { method: 'POST', body: '{}' }).then((r) => r.ok), SUBMIT);
  expect(ok).toBe(true);
  expect(w.errors).toEqual([]);
});

test('o formulário envia ao Web3Forms com a chave do Jean', async ({ page }) => {
  let body: Record<string, string> | null = null;
  await page.route(SUBMIT, (r) => { body = r.request().postDataJSON(); r.fulfill({ json: { success: true } }); });
  await page.goto('/');
  await waitLoader(page);
  const form = await fill(page);
  await form.getByRole('button').click();
  await expect(form.getByRole('button')).toHaveText('Sent');
  expect(body!.access_key).toBe(CONTACT.web3formsKey);
  expect(body!.access_key).not.toBe('32ed7635-a0ab-4135-b458-17153735f046');
  expect(body).toMatchObject({ name: 'Teste', email: 'teste@example.com', message: 'Mensagem de teste' });
  await expect(form.getByLabel('Message')).toHaveValue('');
});

test('falha do Web3Forms mostra o erro e anuncia', async ({ page }) => {
  await page.route(SUBMIT, (r) => r.fulfill({ status: 500, json: { success: false } }));
  await page.goto('/');
  await waitLoader(page);
  const form = await fill(page);
  await form.getByRole('button').click();
  await expect(form.getByRole('button')).toHaveText('Error — try again');
  await expect(form.getByRole('status')).toContainText('Something went wrong');
  await expect(form.getByLabel('Message')).toHaveValue('Mensagem de teste');
});

test('os campos são obrigatórios e os links de contato abrem fora com rel seguro', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const form = page.locator('form#contact-form');
  for (const l of ['Name', 'Email', 'Message']) await expect(form.getByLabel(l)).toHaveAttribute('required', '');
  const links = page.locator('#contact').getByRole('link');
  await expect(links).toHaveCount(4);
  for (const href of [CONTACT.whatsapp, CONTACT.github, CONTACT.linkedin]) {
    const a = links.and(page.locator(`[href="${href}"]`));
    await expect(a).toHaveAttribute('rel', /noopener/);
    await expect(a).toHaveAttribute('target', '_blank');
  }
  await expect(links.and(page.locator(`[href="mailto:${CONTACT.email}"]`))).toHaveCount(1);
});

test('link do cabeçalho leva à seção', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const top = (id: string) => page.locator(id).evaluate((el) => el.getBoundingClientRect().top);
  const nav = page.locator('header');
  await nav.getByRole('link', { name: 'Contact' }).click();
  await expect.poll(() => top('#contact'), { timeout: 5000 }).toBeGreaterThan(-10);
  await expect.poll(() => top('#contact'), { timeout: 5000 }).toBeLessThan(120);
  await nav.getByRole('link', { name: 'Cases' }).click();
  await expect.poll(() => top('#cases'), { timeout: 5000 }).toBeGreaterThan(-10);
  await expect.poll(() => top('#cases'), { timeout: 5000 }).toBeLessThan(120);
});

test('no celular o cabeçalho tem só o logo e Contact', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await waitLoader(page);
  const nav = page.locator('header');
  await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
  for (const n of ['Cases', 'Profile', 'Flora']) await expect(nav.getByRole('link', { name: n })).toBeHidden();
});

test('og:image aponta para /og.jpg e o arquivo responde', async ({ page, request }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toBe('https://77code.com.br/og.jpg');
  const res = await request.get('/og.jpg');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/jpeg');
});

test('a 404 mostra CASE NOT FOUND e volta para /', async ({ page }) => {
  const res = await page.goto('/nao-existe-mesmo');
  expect(res!.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'CASE NOT FOUND' })).toBeVisible();
  await expect(page.getByRole('link', { name: /DIAS77/ })).toHaveAttribute('href', '/');
});

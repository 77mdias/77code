import { test, expect, type Page } from '@playwright/test';
import { watch, waitLoader, isPinned, scrollThrough, onTop } from './helpers.js';
import { CONTACT } from '../../src/content/contact.ts';

const SUBMIT = 'https://api.web3forms.com/submit';
const SEL = 'section#contact';
const SIZES = [[1440, 900], [390, 844]] as const;

// O formulário só entra no fim do trecho preso: quem vai escrever rola até lá antes.
async function fill(page: Page) {
  await scrollThrough(page, SEL, 1);
  return typeIn(page);
}
async function typeIn(page: Page) {
  const form = page.locator('form#contact-form');
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

// O link direto cai no fim do pin, com a cena inteira: formulário visível e por cima de tudo.
for (const [width, height] of SIZES) {
  test(`link direto /#contact cai com o formulário à vista (${width}px)`, async ({ page }) => {
    const w = watch(page);
    await page.setViewportSize({ width, height });
    await page.goto('/#contact');
    await waitLoader(page);
    await expect.poll(() => formOpacity(page)).toBe(1);
    for (const s of ['#contact-form input[name="name"]', '#contact-form textarea', '#contact-form button']) {
      await expect.poll(() => onTop(page, s), s).toBe(true);
    }
    expect(w.errors).toEqual([]);
  });
}

test('hash malformado não quebra', async ({ page }) => {
  const w = watch(page);
  await page.goto('/#%');
  await waitLoader(page);
  await expect(page.locator('h1')).toBeVisible();
  expect(w.errors).toEqual([]);
});

const formOpacity = (page: Page) => page.locator('form#contact-form').evaluate((f) => Number(getComputedStyle(f.closest('[data-reveal]')!).opacity));

for (const [width, height] of SIZES) {
  test(`o contato fica preso (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await waitLoader(page);
    expect(await isPinned(page, SEL)).toBe(true);
  });

  // No fim do pin a cena inteira cabe na tela: título, campos e botão.
  test(`no fim do pin o formulário cabe na tela (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await waitLoader(page);
    await scrollThrough(page, SEL, 1);
    const outside = await page.locator(SEL).evaluate((el) => ['h2', '#contact-form input[name="name"]', '#contact-form textarea', '#contact-form button'].filter((s) => {
      const r = el.querySelector(s)!.getBoundingClientRect();
      return !(r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth);
    }));
    expect(outside).toEqual([]);
  });
}

test('o formulário entra por último no trecho preso', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, SEL, 0.3);
  expect(await formOpacity(page)).toBeLessThan(0.1);
  await scrollThrough(page, SEL, 0.95);
  expect(await formOpacity(page)).toBeGreaterThanOrEqual(0.9);
});

test('focar um campo no meio do pin mostra o formulário', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, SEL, 0.3);
  await page.locator('form#contact-form input[name="name"]').focus();
  await expect.poll(() => formOpacity(page)).toBe(1);
});

test('o formulário funciona depois do pin e trava o botão enquanto envia', async ({ page }) => {
  let calls = 0;
  let release!: () => void;
  const held = new Promise<void>((ok) => { release = ok; });
  await page.route(SUBMIT, async (r) => { calls++; await held; r.fulfill({ json: { success: true } }); });
  await page.goto('/');
  await waitLoader(page);
  await scrollThrough(page, SEL, 1);
  await page.evaluate(() => scrollBy(0, 300)); // passou do pin: a cena já rola com a página
  const form = await typeIn(page);
  const btn = form.getByRole('button');
  await btn.click();
  await expect(btn).toHaveText('Sending…');
  await expect(btn).toBeDisabled();
  await expect(btn).toHaveAttribute('aria-busy', 'true');
  release();
  await expect(btn).toHaveText('Sent');
  await expect(btn).toBeEnabled();
  expect(calls).toBe(1);
});

test('o rodapé tem END OF FILE e 終 acessível', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const footer = page.locator('footer');
  await expect(footer).toContainText('END OF FILE');
  await expect(footer.getByRole('img', { name: 'the end' })).toHaveText('終');
  await expect(footer.locator('[lang="ja"]')).toHaveText('終');
  for (const t of ['Story & code', 'Jean Dias', 'Partner', 'Lyssxz AI', 'Filed in', 'Presidente Prudente']) await expect(footer.getByText(t, { exact: true })).toBeAttached();
  await expect(footer.getByRole('link')).toHaveCount(4);
  await expect(footer.locator('[data-testid="rewind"]')).toHaveText('Rewind episode ↑');
  // O gato na lua (rabo e duas orelhas animados) no lugar do DIAS77 gigante.
  await expect(footer.locator('svg animate')).toHaveCount(2);
  await expect(footer.locator('svg animateTransform')).toHaveCount(2);
  await expect(footer.getByText('DIAS77', { exact: true })).toHaveCount(0);
});

const toBottom = (page: Page) => page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));

test('rewind volta ao topo', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  await toBottom(page);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
  await page.locator('[data-testid="rewind"]').click();
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 10_000 }).toBeLessThan(10);
});

// Posição dos créditos dentro do rodapé (o transform, não o scroll da página) em duas frações da entrada do rodapé.
test('créditos rolam com o scroll', async ({ page }) => {
  await page.goto('/');
  await waitLoader(page);
  const at = async (f: number) => {
    await page.locator('footer').evaluate((el: HTMLElement, k) => {
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo(0, top - innerHeight + k * Math.min(el.offsetHeight, innerHeight));
    }, f);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    return page.locator('[data-testid="credits"]').evaluate((c) => c.getBoundingClientRect().top - c.closest('footer')!.getBoundingClientRect().top);
  };
  const early = await at(0.3);
  const late = await at(1);
  expect(early - late).toBeGreaterThan(40);
});

test('menos movimento: nada preso, formulário e créditos prontos', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(SUBMIT, (r) => r.fulfill({ json: { success: true } }));
  await page.goto('/');
  await waitLoader(page);
  expect(await isPinned(page, SEL)).toBe(false);
  expect(await formOpacity(page)).toBe(1);
  await expect(page.locator(SEL).locator('h2')).toHaveCSS('clip-path', 'none');
  await expect(page.locator('[data-testid="credits"]')).toHaveCSS('transform', 'none');
  // O gato fica parado.
  await expect(page.locator('footer svg animate, footer svg animateTransform')).toHaveCount(0);
  const form = await typeIn(page);
  await form.getByRole('button').click();
  await expect(form.getByRole('button')).toHaveText('Sent');
  await toBottom(page);
  await page.locator('[data-testid="rewind"]').click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
});

test('chunk das cenas que falha uma vez não trava o site', async ({ page }) => {
  let aborted = 0;
  await page.route('**/assets/Rest-*.js', (r) => { if (aborted++ === 0) return r.abort(); return r.continue(); });
  await page.goto('/');
  await waitLoader(page);
  expect(aborted).toBeGreaterThan(0);
  await expect(page.locator('#contact')).toBeAttached();
});

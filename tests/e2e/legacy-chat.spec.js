import { test, expect } from '@playwright/test';
import { watch, waitLoader } from './helpers.js';

// Reescritos na Task 7 (DOM novo do formulário). Os do chat foram para flora.spec.ts.
test.describe.skip('formulário (DOM antigo)', () => {
test('a CSP deixa o navegador falar com o Web3Forms', async ({ page }) => {
  const w = watch(page);
  await page.route('https://api.web3forms.com/submit', (r) => r.fulfill({ json: { success: true } }));
  await page.goto('/');
  await waitLoader(page);
  const ok = await page.evaluate(() => fetch('https://api.web3forms.com/submit', { method: 'POST', body: '{}' }).then((r) => r.ok));
  expect(ok).toBe(true);
  expect(w.errors).toEqual([]);
});

test('o formulário envia ao Web3Forms com a chave do Jean', async ({ page }) => {
  let body = null;
  await page.route('https://api.web3forms.com/submit', (r) => { body = r.request().postDataJSON(); r.fulfill({ json: { success: true } }); });
  await page.goto('/');
  await waitLoader(page);
  await page.evaluate(() => {
    document.getElementById('c-name').value = 'Teste';
    document.getElementById('c-email').value = 'teste@example.com';
    document.getElementById('c-msg').value = 'Mensagem de teste';
    document.getElementById('contact-form').requestSubmit();
  });
  await expect(page.locator('.submit-btn span')).toHaveText('TRANSMITTED');
  expect(body.access_key).toMatch(/^[0-9a-f-]{36}$/);
  expect(body.access_key).not.toBe('32ed7635-a0ab-4135-b458-17153735f046');
  expect(body.message).toBe('Mensagem de teste');
});
});

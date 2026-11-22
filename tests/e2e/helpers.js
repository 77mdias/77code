// A página fica travada (html.scroll-lock) até o loader terminar; esperar por isso, não por tempo fixo.
export async function waitLoader(page) {
  // ...e até o ScrollTrigger montar as cenas (a página passa a ser mais alta que a tela).
  await page.waitForFunction(
    () => !document.documentElement.classList.contains('scroll-lock')
      && document.documentElement.scrollHeight > innerHeight + 100,
    null, { timeout: 30_000 });
}

// Junta erros de console/página e respostas 4xx/5xx de uma página.
export function watch(page) {
  const errors = [];
  const bad = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`));
  return { errors, bad };
}

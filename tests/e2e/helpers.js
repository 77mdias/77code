// Junta erros de console/página e respostas 4xx/5xx de uma página.
export function watch(page) {
  const errors = [];
  const bad = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`));
  return { errors, bad };
}

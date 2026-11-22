// O App marca html[data-loaded="true"] quando o loading acaba.
export async function waitLoader(page) {
  await page.waitForSelector('html[data-loaded="true"]', { state: 'attached', timeout: 30_000 });
}

// O ScrollTrigger embrulha cada elemento preso num .pin-spacer.
export const isPinned = (page, selector) =>
  page.locator(selector).evaluate((el) => !!el.parentElement?.classList.contains('pin-spacer'));

// Rola até `fraction` (0..1) do trecho preso da cena e espera dois quadros desenharem.
export async function scrollThrough(page, selector, fraction) {
  await page.locator(selector).evaluate((el, [f, sel]) => {
    const spacer = el.parentElement;
    if (!spacer?.classList.contains('pin-spacer')) throw new Error(`scrollThrough: ${sel} não está preso (pai sem .pin-spacer)`);
    const top = spacer.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + f * (spacer.offsetHeight - el.offsetHeight));
  }, [fraction, selector]);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

// O elemento está na tela e é ele (ou um filho) que recebe o clique no centro: nada recortado nem por cima.
export const onTop = (page, selector) =>
  page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
    return el.contains(document.elementFromPoint(x, y));
  });

// Junta erros de console/página e respostas 4xx/5xx de uma página.
export function watch(page) {
  const errors = [];
  const bad = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`));
  return { errors, bad };
}

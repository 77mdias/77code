export const FRAME_COUNT = 40;

export function frameForProgress(progress: number, count = FRAME_COUNT): number {
  const p = Math.min(1, Math.max(0, progress));
  return Math.round(p * (count - 1)) + 1;
}

// Quadro ainda não baixado não pode piscar em branco: usa o vizinho já pronto.
export function nearestLoaded(requested: number, loaded: ReadonlySet<number>): number {
  let best = 1;
  let bestDist = Infinity;
  for (const n of loaded) {
    const d = Math.abs(n - requested);
    if (d < bestDist || (d === bestDist && n < best)) { best = n; bestDist = d; }
  }
  return best;
}

// Caminhos escritos por inteiro com `${i}` para o scripts/check-assets.mjs conferir os 40 de cada pasta.
export const frameUrl = (i: number, mobile: boolean) =>
  mobile ? `/static/frames2/m/Image${i}.webp` : `/static/frames2/Image${i}.webp`;

// Fundo da abertura: a Loading e o <picture> usam as mesmas constantes para o navegador baixar um arquivo só.
export const BG_MOBILE = '/static/opening/bg-960.webp';
export const BG_MOBILE_QUERY = '(max-width: 767px)';
export const BG_SRC = '/static/opening/bg-1920.webp';
export const BG_SRCSET = '/static/opening/bg-1920.webp 1920w, /static/opening/bg-2752.webp 2752w';
export const BG_SIZES = '(min-aspect-ratio: 2752/1536) 100vw, 180vh';

export function loadImage(url: string, opts: { srcset?: string; sizes?: string; low?: boolean } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    if (opts.low) img.fetchPriority = 'low';
    if (opts.srcset) { img.sizes = opts.sizes ?? ''; img.srcset = opts.srcset; }
    img.src = url;
  });
}

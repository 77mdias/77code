import { JP } from '../content/jp.ts';
import { useCanvasLoop, useReducedMotion } from '../lib/motion.ts';

// Só os caracteres da tabela do DESIGN.md §4 (os que o subconjunto da Reggae One tem) e algarismos.
const GLYPHS = [...new Set(Object.values(JP).flatMap((e) => [...e.text]))]
  .filter((c) => /[぀-ヿ一-龯]/.test(c))
  .concat([...'0123456789']);
const CELL = 20;

// Chuva de caracteres em papel sobre nanquim (uma coluna em doze cai em vermelho); a rolagem acelera a queda.
function makeMatrix() {
  let cols: { y: number; wait: number; every: number; red: boolean }[] = [];
  let width = 0;
  let last = scrollY;
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const cell = CELL * devicePixelRatio;
    if (w !== width) {
      width = w;
      cols = Array.from({ length: Math.ceil(w / cell) }, () => ({
        y: Math.floor(Math.random() * (h / cell)), wait: 0, every: 3 + Math.floor(Math.random() * 6), red: Math.random() < 1 / 12,
      }));
    }
    const boost = Math.min(4, Math.abs(scrollY - last) / 12);
    last = scrollY;
    // Apaga um pouco do que já caiu: o rastro some sem pintar fundo (o canvas continua transparente).
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `${cell * 0.8}px "Reggae One", sans-serif`;
    ctx.textAlign = 'center';
    cols.forEach((c, i) => {
      c.wait += 1 + boost;
      if (c.wait < c.every) return;
      c.wait = 0;
      ctx.fillStyle = c.red ? '#c4231c' : '#f3f0e8';
      ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], (i + 0.5) * cell, c.y * cell);
      c.y = c.y * cell > h && Math.random() > 0.9 ? 0 : c.y + 1;
    });
  };
}

function Canvas({ className }: { className: string }) {
  return <canvas ref={useCanvasLoop(makeMatrix)} className={className} aria-hidden="true" />;
}

// Fundo decorativo: quem usa define tamanho, posição e a opacidade baixa. Com menos movimento, não existe.
export function MatrixRain({ className }: { className: string }) {
  return useReducedMotion() ? null : <Canvas className={className} />;
}

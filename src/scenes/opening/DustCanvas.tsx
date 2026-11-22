import { useCanvasLoop } from '../../lib/motion.ts';

function makeDust() {
  const motes = Array.from({ length: 60 }, () => ({
    x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0006, vy: -0.0002 - Math.random() * 0.0004,
    r: 0.6 + Math.random() * 1.6, phase: Math.random() * 6,
  }));
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      m.x += m.vx;
      m.y += m.vy;
      m.phase += 0.02;
      if (m.y < 0) { m.y = 1; m.x = Math.random(); }
      // Só brilha dentro do feixe que desce da janela até o chão.
      if (Math.abs(m.x - 0.15 - m.y * 0.6) > 0.28) continue;
      ctx.fillStyle = `rgba(243, 240, 232, ${0.35 + 0.35 * Math.sin(m.phase)})`;
      ctx.beginPath();
      ctx.arc(m.x * w, m.y * h, m.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }
  };
}

export function DustCanvas({ className }: { className: string }) {
  return <canvas ref={useCanvasLoop(makeDust)} className={className} aria-hidden="true" />;
}

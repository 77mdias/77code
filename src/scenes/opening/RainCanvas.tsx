import { useCanvasLoop } from '../../lib/motion.ts';

function makeRain() {
  const drops = Array.from({ length: 90 }, () => ({
    x: Math.random(), y: Math.random(), v: 0.012 + Math.random() * 0.012, len: 0.04 + Math.random() * 0.05,
  }));
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(243, 240, 232, 0.7)';
    ctx.lineWidth = devicePixelRatio;
    ctx.beginPath();
    for (const d of drops) {
      d.y += d.v;
      d.x += d.v * 0.25;
      if (d.y > 1) { d.y = -d.len; d.x = Math.random(); }
      ctx.moveTo(d.x * w, d.y * h);
      ctx.lineTo((d.x + d.len * 0.25) * w, (d.y + d.len) * h);
    }
    ctx.stroke();
  };
}

export function RainCanvas({ className }: { className: string }) {
  return <canvas ref={useCanvasLoop(makeRain)} className={className} aria-hidden="true" />;
}

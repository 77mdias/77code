import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { LAB_EXPERIMENTS, type LabCategory, type LabExperiment } from '../content/lab.ts';
import { RedLabel } from '../ui/RedLabel.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './LabBoard.module.css';

registerGsap();

type Props = {
  filter: 'all' | LabCategory;
  onSelect: (exp: LabExperiment) => void;
};

type CardSlot = {
  exp: LabExperiment;
  x: number;
  y: number;
  rot: number;
  far: boolean;
};

// Posicionamento assimétrico em duas profundidades (frente e fundo) inspirado no mural infinito.
const SLOTS: readonly Omit<CardSlot, 'exp'>[] = [
  { x: 6, y: 12, rot: -2.2, far: false },
  { x: 38, y: 8, rot: 1.8, far: false },
  { x: 70, y: 16, rot: -1.4, far: false },
  { x: 22, y: 52, rot: 2.1, far: false },
  { x: 54, y: 48, rot: -2.5, far: false },
  { x: 82, y: 58, rot: 1.5, far: false },
  { x: 12, y: 28, rot: 3.1, far: true },
  { x: 64, y: 30, rot: -3.0, far: true },
];

export function LabBoard({ filter, onSelect }: Props) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const farLayer = useRef<HTMLDivElement>(null);
  const nearLayer = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const [hoverTitle, setHoverTitle] = useState<string | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // Estado da inércia 2D fora do ciclo de render para rodar a 60fps
  const dragState = useRef({
    active: false,
    moved: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    ox: 0,
    oy: 0,
    vx: 0,
    vy: 0,
  });

  useGSAP(() => {
    if (reduced) return;

    // Parallax vertical dirigido pelo scroll: camada distante sobe mais devagar, camada frontal desce
    gsap.fromTo(
      farLayer.current,
      { y: -48 },
      {
        y: 48,
        ease: 'none',
        scrollTrigger: { trigger: stage.current, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
    gsap.fromTo(
      nearLayer.current,
      { y: 54 },
      {
        y: -54,
        ease: 'none',
        scrollTrigger: { trigger: stage.current, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  }, { dependencies: [reduced], scope: root });

  useEffect(() => {
    const el = stage.current;
    const cur = cursorRef.current;
    if (!el || !cur) return;

    const cx = gsap.quickTo(cur, 'x', { duration: 0.3, ease: 'power3.out' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.3, ease: 'power3.out' });
    let raf = 0;
    let lastTick = performance.now();
    let coordFrame = 0;

    const wrap = (v: number, span: number) => {
      const half = span / 2;
      return ((((v + half) % span) + span) % span) - half;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - lastTick) / 1000, 0.05);
      lastTick = now;
      const f = dt * 60;
      const s = dragState.current;

      if (!s.active) {
        s.ox += s.vx * f;
        s.oy += s.vy * f;
        const decay = Math.pow(0.935, f);
        s.vx *= decay;
        s.vy *= decay;
      }

      // Envolve em ±360px / ±220px para nunca perder as fichas da mesa
      s.ox = wrap(s.ox, 720);
      s.oy = wrap(s.oy, 440);

      if (nearLayer.current) nearLayer.current.style.setProperty('--pan-x', `${s.ox.toFixed(1)}px`);
      if (nearLayer.current) nearLayer.current.style.setProperty('--pan-y', `${s.oy.toFixed(1)}px`);
      if (farLayer.current) farLayer.current.style.setProperty('--pan-x', `${(s.ox * 0.55).toFixed(1)}px`);
      if (farLayer.current) farLayer.current.style.setProperty('--pan-y', `${(s.oy * 0.55).toFixed(1)}px`);

      if (++coordFrame % 8 === 0) {
        setCoords({ x: Math.round(s.ox), y: Math.round(s.oy) });
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting && !reduced) {
        lastTick = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      gsap.set(cur, { x: e.clientX - r.left, y: e.clientY - r.top });
      el.classList.add(styles.cursorOn);
    };
    const onLeave = () => {
      el.classList.remove(styles.cursorOn);
      setHoverTitle(null);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.pointerType === 'mouse') {
        cx(e.clientX - r.left);
        cy(e.clientY - r.top);
      }
      const s = dragState.current;
      if (!s.active) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.moved += Math.abs(dx) + Math.abs(dy);
      s.ox += dx;
      s.oy += dy;
      const now = performance.now();
      const dt = Math.max(8, now - s.lastT);
      s.vx = dx * (16 / dt);
      s.vy = dy * (16 / dt);
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = now;
      if (s.moved > 8) setWasDragged(true);
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const s = dragState.current;
      s.active = true;
      s.moved = 0;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = performance.now();
      s.vx = 0;
      s.vy = 0;
      el.setPointerCapture(e.pointerId);
      setDragging(true);
    };
    const onUp = () => {
      dragState.current.active = false;
      setDragging(false);
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [reduced]);

  const cards: CardSlot[] = LAB_EXPERIMENTS.map((exp, i) => ({
    exp,
    ...(SLOTS[i % SLOTS.length]),
  }));

  const fmtCoord = (n: number) => `${n < 0 ? '-' : ''}${String(Math.abs(n)).padStart(4, '0')}`;

  return (
    <section id="board" ref={root} className={styles.section} aria-labelledby="board-title">
      <div className={styles.head}>
        <RedLabel>01 · THE BOARD</RedLabel>
        <h2 id="board-title" className={styles.heading}>
          Drag the board.
          <span> Scroll shifts depth.</span>
        </h2>
      </div>

      <div
        ref={stage}
        className={[styles.stage, dragging && styles.isDragging, hoverTitle && styles.isHovering].filter(Boolean).join(' ')}
        data-testid="lab-board"
      >
        <div className={styles.grid} aria-hidden="true" />

        {/* Camada distante (parallax mais lento) */}
        <div ref={farLayer} className={styles.layerFar}>
          {cards.filter((c) => c.far).map((c) => {
            const dimmed = filter !== 'all' && c.exp.tag !== filter;
            return (
              <button
                key={c.exp.id}
                type="button"
                className={[styles.card, styles.cardFar, dimmed && styles.cardDim].filter(Boolean).join(' ')}
                style={{ left: `${c.x}%`, top: `${c.y}%`, ['--rot' as string]: `${c.rot}deg` }}
                onClick={() => { if (dragState.current.moved < 7) onSelect(c.exp); }}
                onPointerEnter={() => setHoverTitle(c.exp.title)}
                onPointerLeave={() => setHoverTitle(null)}
              >
                <span className={styles.pin} aria-hidden="true" />
                <img src={c.exp.cover} alt="" loading="lazy" />
                <span className={styles.cardMeta}>
                  <b>{c.exp.number}</b> · {c.exp.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Camada frontal (parallax mais rápido + arraste completo) */}
        <div ref={nearLayer} className={styles.layerNear}>
          {cards.filter((c) => !c.far).map((c) => {
            const dimmed = filter !== 'all' && c.exp.tag !== filter;
            return (
              <button
                key={c.exp.id}
                type="button"
                data-testid="board-card"
                className={[styles.card, dimmed && styles.cardDim].filter(Boolean).join(' ')}
                style={{ left: `${c.x}%`, top: `${c.y}%`, ['--rot' as string]: `${c.rot}deg` }}
                onClick={() => { if (dragState.current.moved < 7) onSelect(c.exp); }}
                onPointerEnter={() => setHoverTitle(c.exp.title)}
                onPointerLeave={() => setHoverTitle(null)}
              >
                <span className={styles.tape} aria-hidden="true" />
                <span className={styles.pin} aria-hidden="true" />
                <figure className={styles.thumb}>
                  <img src={c.exp.cover} alt={c.exp.title} loading="lazy" />
                </figure>
                <span className={styles.cardFoot}>
                  <span className={styles.cardNum}>{c.exp.number} · {c.exp.badge}</span>
                  <strong className={styles.cardTitle}>{c.exp.title}</strong>
                </span>
              </button>
            );
          })}
        </div>

        <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
          <span>{hoverTitle ? 'Open' : 'Drag'}</span>
        </div>

        <div className={styles.coords} aria-hidden="true">
          X {fmtCoord(coords.x)} · Y {fmtCoord(coords.y)}
        </div>

        {!wasDragged && (
          <div className={styles.hint} aria-hidden="true">
            <span className={styles.hintDot} /> Drag anywhere · Click any proof to inspect
          </div>
        )}
      </div>
    </section>
  );
}

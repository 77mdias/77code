import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { JP } from '../content/jp.ts';
import { PROFILE } from '../content/profile.ts';
import { Sfx } from '../ui/Sfx.tsx';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Caption } from '../ui/Caption.tsx';
import { BG_MOBILE, BG_MOBILE_QUERY, BG_SIZES, BG_SRC, BG_SRCSET, FRAME_COUNT, frameForProgress, frameUrl, loadImage, nearestLoaded } from '../lib/frames.ts';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import { RainCanvas } from './opening/RainCanvas.tsx';
import { DustCanvas } from './opening/DustCanvas.tsx';
import styles from './Opening.module.css';

registerGsap();

// Deslocamento máximo de cada camada com o mouse (DESIGN.md §6); y menor, como no rascunho aprovado.
const PARALLAX = { stage: [-14, -8], me: [10, 4], fg: [22, 12] } as const;

export function Opening({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion();
  // shortcut: decidido na montagem; girar o celular não troca a pasta dos quadros.
  const [mobile] = useState(() => matchMedia('(max-width: 767px)').matches);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const me = useRef<HTMLDivElement>(null);
  const fg = useRef<HTMLDivElement>(null);
  const jean = useRef<HTMLImageElement>(null);
  const loaded = useRef(new Set([1]));
  const wanted = useRef(1);

  const show = () => {
    const url = frameUrl(nearestLoaded(wanted.current, loaded.current), mobile);
    if (jean.current && !jean.current.src.endsWith(url)) jean.current.src = url;
  };

  // Quadros 2–40 só depois do loading, um por vez, na ordem do scroll.
  useEffect(() => {
    if (!ready || reduced) return;
    let stop = false;
    (async () => {
      for (let n = 2; n <= FRAME_COUNT && !stop; n++) {
        try { await loadImage(frameUrl(n, mobile), { low: true }); } catch { continue; }
        loaded.current.add(n);
        show();
      }
    })();
    return () => { stop = true; };
  }, [ready, reduced, mobile]);

  useGSAP(() => {
    if (reduced) return;
    const layers = { stage: stage.current!, me: me.current!, fg: fg.current! };
    const fine = matchMedia('(pointer: fine)').matches;

    // No toque, o parallax vem do próprio scroll da abertura.
    const drift = fine ? undefined : gsap.timeline()
      .to(layers.stage, { y: 14, ease: 'none' })
      .to(layers.me, { y: -10, ease: 'none' }, 0)
      .to(layers.fg, { y: -22, ease: 'none' }, 0);

    const st = ScrollTrigger.create({
      trigger: root.current, pin: true, start: 'top top', end: '+=150%', scrub: true, animation: drift,
      onUpdate: (self) => { wanted.current = frameForProgress(self.progress); show(); },
    });
    wanted.current = frameForProgress(st.progress);
    show();

    gsap.to(jean.current, { scale: 1.006, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    if (!fine) return;
    const movers = (Object.keys(PARALLAX) as (keyof typeof PARALLAX)[]).map((k) => ({
      range: PARALLAX[k],
      x: gsap.quickTo(layers[k], 'x', { duration: 0.6, ease: 'power3.out' }),
      y: gsap.quickTo(layers[k], 'y', { duration: 0.6, ease: 'power3.out' }),
    }));
    const move = (mx: number, my: number) => movers.forEach((m) => { m.x(mx * m.range[0]); m.y(my * m.range[1]); });
    const onMove = (e: PointerEvent) => move((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    const onLeave = () => move(0, 0);
    const el = root.current!;
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
  }, { dependencies: [reduced], scope: root });

  return (
    <section id="opening" ref={root} className={styles.opening}>
      <div ref={stage} className={styles.stage}>
        <picture>
          <source media={BG_MOBILE_QUERY} srcSet={BG_MOBILE} />
          <img className={styles.bg} src={BG_SRC} srcSet={BG_SRCSET} sizes={BG_SIZES} fetchPriority="high" alt="" />
        </picture>
        {!reduced && <RainCanvas className={styles.rain} />}
        <div className={styles.lamp} />
        {!reduced && <DustCanvas className={styles.dust} />}
        <svg className={styles.steam} viewBox="0 0 40 60" aria-hidden="true">
          <path d="M12 58 q-7 -10 0 -20 q7 -10 0 -20" />
          <path d="M20 58 q-7 -10 0 -20 q7 -10 0 -20" />
          <path d="M28 58 q-7 -10 0 -20 q7 -10 0 -20" />
        </svg>
        <Sfx entry={JP.rain} className={styles.rainSfx} />
      </div>
      <div className={styles.cloud} />
      <div ref={me} className={styles.layer}>
        <img
          ref={jean}
          className={styles.jean}
          data-testid="jean-frame"
          fetchPriority="high"
          src={frameUrl(reduced ? FRAME_COUNT : 1, mobile)}
          alt="Jean, the DIAS77 character, at his desk"
        />
      </div>
      <div ref={fg} className={styles.layer}>
        <div className={styles.titleBlock}>
          <RedLabel>CASE FILE 77 · EPISODE 01</RedLabel>
          <h1 className={styles.title}>DIAS77</h1>
          <Caption>{PROFILE.role}</Caption>
        </div>
        <Sfx entry={JP.caseFile} className={styles.vertical} />
      </div>
      <div className={styles.frame} />
    </section>
  );
}

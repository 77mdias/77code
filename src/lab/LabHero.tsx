import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { JP } from '../content/jp.ts';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Sfx } from '../ui/Sfx.tsx';
import { DustCanvas } from '../scenes/opening/DustCanvas.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './LabHero.module.css';

registerGsap();

export function LabHero() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduced) return;

    // Entrada coreografada em corte seco + staggers curtos
    gsap.from(frame.current, {
      clipPath: 'inset(6% 4% 6% 4%)',
      duration: 0.9,
      ease: 'power3.out',
    });
    gsap.from(`.${styles.line}`, {
      yPercent: 60,
      autoAlpha: 0,
      duration: 0.75,
      stagger: 0.09,
      ease: 'power3.out',
    });
    gsap.from([`.${styles.statement}`, `.${styles.desc}`, `.${styles.ctaRow}`], {
      y: 20,
      autoAlpha: 0,
      duration: 0.65,
      stagger: 0.08,
      delay: 0.2,
      ease: 'power3.out',
    });

    // Cena presa no scroll com parallax em 3 planos (fundo, tipografia, carimbo frontal)
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: '+=110%',
        pin: true,
        scrub: true,
      },
    })
      .to(stage.current, { yPercent: -10, scale: 1.04 }, 0)
      .to(copy.current, { yPercent: 14, autoAlpha: 0.85 }, 0)
      .to(stamp.current, { yPercent: -24, rotation: -6 }, 0);

    // Parallax suave ao ponteiro em desktop
    if (!matchMedia('(pointer: fine)').matches) return;
    const sx = gsap.quickTo(stage.current, 'x', { duration: 0.6, ease: 'power3.out' });
    const cx = gsap.quickTo(copy.current, 'x', { duration: 0.6, ease: 'power3.out' });
    const kx = gsap.quickTo(stamp.current, 'x', { duration: 0.6, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      const mx = (e.clientX / innerWidth) * 2 - 1;
      sx(mx * -10);
      cx(mx * 8);
      kx(mx * 18);
    };
    const onLeave = () => { sx(0); cx(0); kx(0); };
    const el = root.current!;
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, { dependencies: [reduced], scope: root });

  return (
    <section id="top" ref={root} className={styles.hero} data-testid="lab-hero" aria-labelledby="lab-hero-title">
      <div ref={frame} className={styles.frame}>
        <div ref={stage} className={styles.stage} aria-hidden="true">
          <div className={styles.tone} />
          <div className={styles.beam} />
          {!reduced && <DustCanvas className={styles.dust} />}
        </div>

        <div ref={copy} className={styles.copy}>
          <div className={styles.kicker}>
            <RedLabel>CASE FILE 77 · LAB EDITION</RedLabel>
            <span className={styles.pulseDot} aria-hidden="true" />
          </div>

          <h1 id="lab-hero-title" className={styles.title}>
            <span className={styles.line}>77CODE</span>
            <span className={styles.line}>
              LAB<em>.</em>
            </span>
          </h1>

          <p className={styles.statement}>Motion studies, parallax rigs &amp; noir systems.</p>
          <p className={styles.desc}>
            Interactive experiments built for Case File 77 — scroll-scrubbed timelines, multi-plane parallax,
            halftone canvas loops and edge AI state contracts.
          </p>

          <div className={styles.ctaRow}>
            <a className={styles.cta} href="#board">
              Wander the board <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div ref={stamp} className={styles.aside}>
          <Sfx entry={JP.caseFile} className={styles.vertical} />
          <div className={styles.seal} aria-hidden="true">
            <span className={styles.sealWord}>EXP · 77</span>
            <Sfx entry={JP.solved} className={styles.sealJp} />
          </div>
        </div>

        <div className={styles.panelBorder} aria-hidden="true" />
      </div>

      <div className={styles.foot}>
        <span>DIAS77 ARCHIVE · PRES. PRUDENTE</span>
        <span className={styles.scrollCue}>
          Scroll to scrub <i aria-hidden="true" />
        </span>
      </div>
    </section>
  );
}

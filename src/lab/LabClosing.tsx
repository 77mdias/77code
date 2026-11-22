import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CHANNELS } from '../scenes/links.ts';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './LabClosing.module.css';

registerGsap();

export function LabClosing() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const rule = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduced) return;

    // Fio vermelho se estende com o scroll ao fechar o laboratório
    gsap.fromTo(
      rule.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 92%', end: 'top 55%', scrub: true },
      },
    );

    gsap.fromTo(
      card.current,
      { y: 18, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.55,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 88%', once: true },
      },
    );
  }, { dependencies: [reduced], scope: root });

  return (
    <footer ref={root} className={styles.wrap} data-testid="lab-closing">
      <div className={styles.ruleTrack} aria-hidden="true">
        <div ref={rule} className={styles.ruleFill} />
      </div>

      <div ref={card} className={styles.ctaBar}>
        <div className={styles.copy}>
          <span className={styles.kicker}>OPEN BENCH · DIAS77</span>
          <h2 className={styles.heading}>Got a tough interface problem?</h2>
          <p className={styles.lead}>
            Every rig in this lab started inside a real product build. Bring the next one.
          </p>
        </div>

        <div className={styles.actions}>
          <a className={styles.primary} href="/#contact">
            Start a project <span aria-hidden="true">→</span>
          </a>
          <a className={styles.secondary} href="/">
            Main portfolio <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          <small>© DIAS77</small>
        </span>

        <ul className={styles.links}>
          {CHANNELS.map((c) => (
            <li key={c.label}>
              <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {c.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.topBtn}
          onClick={() => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
        >
          Top <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { LabExperiment } from '../content/lab.ts';
import { JP } from '../content/jp.ts';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Sfx } from '../ui/Sfx.tsx';
import { InkButton } from '../ui/InkButton.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './LabInspector.module.css';

registerGsap();

type Props = {
  experiment: LabExperiment | null;
  onClose: () => void;
};

export function LabInspector({ experiment, onClose }: Props) {
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!experiment) return;
    const prev = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [experiment, onClose]);

  useGSAP(() => {
    if (!experiment || reduced || !dialogRef.current) return;
    gsap.fromTo(
      dialogRef.current,
      { clipPath: 'inset(0 0 100% 0)', y: 18 },
      { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.45, ease: 'power3.out' },
    );
  }, { dependencies: [experiment?.id, reduced] });

  if (!experiment) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-title"
      data-testid="lab-inspector"
      data-lenis-prevent
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={dialogRef} className={styles.sheet}>
        <div className={styles.top}>
          <RedLabel>EXPERIMENT {experiment.number} · {experiment.badge}</RedLabel>
          <button ref={closeBtnRef} type="button" className={styles.close} onClick={onClose} aria-label="Close experiment dossier">
            Close ✕
          </button>
        </div>

        <div className={styles.head}>
          <div>
            <h2 id="inspector-title" className={styles.title}>{experiment.title}</h2>
            <p className={styles.cat}>{experiment.category}</p>
          </div>
          <Sfx entry={JP[experiment.jpKey]} className={styles.jp} />
        </div>

        <div className={styles.grid}>
          <figure className={styles.cover}>
            <img src={experiment.cover} alt={experiment.title} />
          </figure>

          <div className={styles.details}>
            <h3>WHAT IT DOES</h3>
            <p>{experiment.summary}</p>
            <h3>HOW IT WORKS</h3>
            <p>{experiment.technique}</p>
            <h3>PARAMETERS</h3>
            <p className={styles.params}>{experiment.params}</p>
            <ul className={styles.tools}>
              {experiment.tools.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>

        <pre className={styles.code}><code>{experiment.code}</code></pre>

        <div className={styles.foot}>
          <InkButton href={experiment.caseHref}>Inspect in Case File 77 →</InkButton>
        </div>
      </div>
    </div>
  );
}

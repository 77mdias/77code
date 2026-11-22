import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { CaseFile } from '../content/cases.ts';
import { JP } from '../content/jp.ts';
import { Sfx } from '../ui/Sfx.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './Eyecatch.module.css';

registerGsap();

// Corte de nanquim em diagonal: os pontos da esquerda e da direita andam juntos.
const CUT = {
  before: 'polygon(0% 0%, 0% 0%, -15% 100%, -15% 100%)',
  full: 'polygon(0% 0%, 115% 0%, 100% 100%, -15% 100%)',
  after: 'polygon(115% 0%, 115% 0%, 100% 100%, 100% 100%)',
};

export function Eyecatch({ number, name }: Pick<CaseFile, 'number' | 'name'>) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduced) return;
    const ink = `.${styles.ink}`;
    const title = `.${styles.title}`;
    // O nanquim varre enquanto a vinheta sobe; depois ela fica presa ~1 tela.
    gsap.fromTo(ink, { clipPath: CUT.before }, {
      clipPath: CUT.full, ease: 'power2.inOut',
      scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'top top', scrub: true },
    });
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=100%', pin: true, scrub: true } })
      .fromTo(title, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'power3.out', duration: 0.3 })
      .to(title, { clipPath: 'inset(100% 0 0% 0)', ease: 'power2.inOut', duration: 0.2 }, 0.65)
      .to(ink, { clipPath: CUT.after, ease: 'power2.inOut', duration: 0.2 }, 0.8);
  }, { dependencies: [reduced], scope: root, revertOnUpdate: true });

  return (
    <div ref={root} className={styles.eyecatch} data-testid="eyecatch" aria-hidden="true">
      <div className={styles.ink}>
        <div className={styles.title}>
          <p className={styles.number}>CASE 0{number}</p>
          <p className={styles.name}>{name}</p>
        </div>
        <Sfx entry={JP.caseFile} className={styles.vertical} />
      </div>
    </div>
  );
}

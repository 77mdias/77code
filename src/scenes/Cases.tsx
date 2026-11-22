import { Fragment, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CASES } from '../content/cases.ts';
import { registerGsap } from '../lib/motion.ts';
import { Eyecatch } from './Eyecatch.tsx';
import { CaseDossier } from './CaseDossier.tsx';

registerGsap();

export function Cases() {
  // Os pin-spacers guardam a largura antiga até o refresh; o Lenis recalcula sozinho.
  // As fontes do dossiê chegam depois e mudam a altura das folhas: refresh de novo.
  useEffect(() => {
    let t = 0;
    let alive = true;
    const onResize = () => { clearTimeout(t); t = window.setTimeout(() => ScrollTrigger.refresh(), 200); };
    addEventListener('resize', onResize);
    document.fonts.ready.then(() => alive && ScrollTrigger.refresh());
    return () => { alive = false; clearTimeout(t); removeEventListener('resize', onResize); };
  }, []);

  return (
    <section id="cases" aria-label="Cases">
      {CASES.map((c) => (
        <Fragment key={c.slug}>
          <Eyecatch number={c.number} name={c.name} />
          <CaseDossier data={c} />
        </Fragment>
      ))}
    </section>
  );
}

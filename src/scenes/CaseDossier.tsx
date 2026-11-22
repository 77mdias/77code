import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { CaseFile } from '../content/cases.ts';
import { JP } from '../content/jp.ts';
import { Sfx } from '../ui/Sfx.tsx';
import { Stamp } from '../ui/Stamp.tsx';
import { RedString } from '../ui/RedString.tsx';
import { Typewriter } from '../ui/Typewriter.tsx';
import { InkButton } from '../ui/InkButton.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './CaseDossier.module.css';

registerGsap();

const scrub = (trigger: Element, start: string, end: string) => ({ trigger, start, end, scrub: true });

export function CaseDossier({ data }: { data: CaseFile }) {
  const reduced = useReducedMotion();
  const [stamped, setStamped] = useState(false);
  const root = useRef<HTMLElement>(null);
  const label = `CASE 0${data.number}`;

  useGSAP(() => {
    if (reduced) return;
    const $ = (cls: string) => root.current!.querySelector(`.${cls}`)!;
    const folder = $(styles.folder);

    gsap.timeline({ scrollTrigger: scrub(folder, 'top 85%', 'top 40%') })
      .fromTo($(styles.cover), { rotateY: 0 }, { rotateY: -180, ease: 'power2.inOut' })
      .fromTo($(styles.pasa), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'power3.out' }, 0.1)
      .to($(styles.pasa), { autoAlpha: 0, duration: 0.25 }, 0.75);
    gsap.fromTo($(styles.sheet), { y: 80 }, { y: 0, ease: 'power3.out', scrollTrigger: scrub(folder, 'top 60%', 'top 20%') });
    // Gatilhos nos próprios blocos: no celular eles ficam em coluna, longe do topo da pasta.
    const evidence = $(styles.evidence);
    // Relativo: o GSAP absorve o `rotate` do CSS e a foto tem que terminar torta.
    gsap.from($(styles.photo), { y: -120, rotation: '+=10', ease: 'power3.out', scrollTrigger: scrub(evidence, 'top 80%', 'top 40%') });
    const thread = $(styles.thread);
    gsap.fromTo(thread, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none', scrollTrigger: scrub(thread, 'top 85%', 'top 55%') });
    const tags = $(styles.tags);
    gsap.fromTo(tags, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'power2.inOut', scrollTrigger: scrub(tags, 'top bottom', 'top 82%') });

    // O carimbo bate quando o fim da pasta entra na tela.
    ScrollTrigger.create({
      trigger: folder, start: 'bottom bottom',
      onEnter: () => setStamped(true), onLeaveBack: () => setStamped(false),
    });
  }, { dependencies: [reduced], scope: root });

  useGSAP(() => {
    if (!stamped || reduced) return;
    gsap.fromTo(`.${styles.stampAt}`, { scale: 1.8 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
  }, { dependencies: [stamped, reduced], scope: root });

  return (
    <article ref={root} id={`case-${data.slug}`} className={styles.case} data-testid="case" aria-labelledby={`case-${data.slug}-name`}>
      <div className={styles.folder}>
        <span className={styles.tab}>{label}</span>
        <div className={styles.inside}>
          <div className={styles.sheet}>
            <Typewriter label={`Case report: ${data.name}`}>
              <h2 id={`case-${data.slug}-name`} className={styles.name}>{data.name}</h2>
              <h3 className={styles.part}>THE CASE</h3>
              <p className={styles.text}>{data.theCase}</p>
              <h3 className={styles.part}>THE CLUES</h3>
              <ul className={styles.clues}>{data.clues.map((c) => <li key={c}>{c}</li>)}</ul>
              <h3 className={styles.part}>THE SOLUTION</h3>
              <p className={styles.text}>{data.solution}</p>
              {data.url && (
                <p className={styles.link}>
                  <InkButton href={data.url} external>View the site <span aria-hidden="true">→</span></InkButton>
                </p>
              )}
            </Typewriter>
          </div>

          <div className={styles.evidence}>
            <figure className={styles.photo}>
              <span className={styles.clip} aria-hidden="true" />
              <picture>
                <source media="(max-width: 767px)" srcSet={data.screenshot.mobile} width={684} height={1480} />
                <img src={data.screenshot.desktop} width={1440} height={900} alt={`Screenshot of ${data.name}`} loading="lazy" />
              </picture>
              <figcaption>EVIDENCE #{data.number}</figcaption>
            </figure>
            <div className={styles.thread}>
              <RedString from={[50, 0]} to={[[14, 100], [50, 100], [86, 100]]} />
            </div>
            <ul className={styles.tags} aria-label="Stack">{data.stack.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>

          <div className={styles.stampAt}>
            <Stamp visible={reduced || stamped} />
            {stamped && !reduced && <Sfx entry={JP.stampHit} className={styles.don} />}
          </div>
        </div>

        {!reduced && (
          <div className={styles.cover} aria-hidden="true">
            <span className={styles.coverLabel}>CASE FILE 77 · {label}</span>
            <span className={styles.coverName}>{data.name}</span>
          </div>
        )}
        {!reduced && <Sfx entry={JP.folderOpen} className={styles.pasa} />}
      </div>
    </article>
  );
}

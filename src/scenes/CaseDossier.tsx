import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { CaseFile } from '../content/cases.ts';
import { JP } from '../content/jp.ts';
import { Sfx } from '../ui/Sfx.tsx';
import { Stamp } from '../ui/Stamp.tsx';
import { RedString, type Point } from '../ui/RedString.tsx';
import { Typewriter } from '../ui/Typewriter.tsx';
import { InkButton } from '../ui/InkButton.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './CaseDossier.module.css';

registerGsap();

const small = () => matchMedia('(max-width: 767px)').matches;
// No celular o parallax anda metade.
const depth = (px: number) => () => (small() ? px / 2 : px);
// O fio nasce embaixo da foto: a foto anda 40px a menos que as etiquetas e o começo nunca aparece solto.
const UNDER_PHOTO = 40;
const STAMP_AT = 0.85;

export function CaseDossier({ data }: { data: CaseFile }) {
  const reduced = useReducedMotion();
  const [stamped, setStamped] = useState(false);
  const [string, setString] = useState<{ from: Point; to: Point[] } | null>(null);
  const root = useRef<HTMLElement>(null);
  const label = `CASE 0${data.number}`;

  useGSAP(() => {
    const el = root.current!;
    const $ = (cls: string) => el.querySelector<HTMLElement>(`.${cls}`)!;
    const [folder, sheet, evidence, photo, thread, tags] =
      [styles.folder, styles.sheet, styles.evidence, styles.photo, styles.thread, styles.tags].map($);
    // Posição de layout (sem transform): a foto é filha direta da prova.
    const fromY = () => ((photo.offsetTop + photo.offsetHeight - UNDER_PHOTO) / evidence.clientHeight) * 100;

    const onRefresh = () => {
      if (!reduced) {
        // A cena presa tem que caber na tela: encolhe a pasta se ela passar da altura.
        const cs = getComputedStyle(el);
        const room = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const need = folder.offsetHeight + parseFloat(getComputedStyle(folder).marginTop);
        folder.style.setProperty('--fit', String(Math.min(1, room / need)));
      }
      // Pontas medidas nas etiquetas de verdade; fio e etiquetas andam juntos, então a razão não muda com o parallax.
      const box = thread.getBoundingClientRect();
      setString({
        from: [50, fromY()],
        to: [...tags.children].map((t) => {
          const r = t.getBoundingClientRect();
          return [((r.left + r.width / 2 - box.left) / box.width) * 100, ((r.top - box.top) / box.height) * 100];
        }),
      });
    };
    onRefresh();
    ScrollTrigger.addEventListener('refresh', onRefresh);
    const cleanup = () => ScrollTrigger.removeEventListener('refresh', onRefresh);
    if (reduced) return cleanup;

    // Entradas em xPercent/yPercent e parallax em y: o GSAP soma os dois sem um apagar o outro.
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: '+=150%', pin: true, scrub: true, invalidateOnRefresh: true,
        onUpdate: (st) => setStamped(st.progress >= STAMP_AT),
      },
    })
      .fromTo($(styles.cover), { rotateY: 0 }, { rotateY: -180, ease: 'power2.inOut', duration: 0.15 }, 0)
      .fromTo($(styles.pasa), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, ease: 'power3.out', duration: 0.04 }, 0.02)
      .to($(styles.pasa), { autoAlpha: 0, duration: 0.04 }, 0.11)
      .fromTo(sheet, { yPercent: 10 }, { yPercent: 0, ease: 'power3.out', duration: 0.2 }, 0.1)
      // No celular a folha e a prova dividem o mesmo lugar: a folha sai de lado para a prova cair.
      .fromTo(sheet, { xPercent: 0 }, { xPercent: () => (small() ? -130 : 0), ease: 'power2.inOut', duration: 0.1 }, 0.4)
      // A foto cai de fora da cena. Absoluto: o GSAP absorve o `rotate` do CSS e o invalidate somaria um valor relativo.
      .fromTo(photo, { yPercent: -250, rotation: 13 }, { yPercent: 0, rotation: 3, ease: 'power3.out', duration: 0.15 }, 0.5)
      // O corte começa 6px acima do alfinete de origem: ele não aparece antes da foto. Mesmo formato nas duas pontas para o GSAP interpolar.
      .fromTo(thread, { clipPath: () => `inset(0 0 calc(${100 - fromY()}% + 6px) 0)` }, { clipPath: 'inset(0 0 calc(0% + 0px) 0)', duration: 0.12 }, 0.65)
      .fromTo(tags, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'power2.inOut', duration: 0.1 }, 0.72)
      .fromTo(sheet, { y: depth(40) }, { y: 0, duration: 1 }, 0)
      .fromTo(photo, { y: depth(80) }, { y: 0, duration: 1 }, 0)
      .fromTo([thread, tags], { y: depth(120) }, { y: 0, duration: 1 }, 0);
    return cleanup;
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
              {string && <RedString from={string.from} to={string.to} />}
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

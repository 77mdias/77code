import { useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CASES } from '../content/cases.ts';
import { RedLabel } from '../ui/RedLabel.tsx';
import { MatrixRain } from '../ui/MatrixRain.tsx';
import { registerGsap, useMedia, useReducedMotion } from '../lib/motion.ts';
import { ProjectFile } from './ProjectFile.tsx';
import styles from './Projects.module.css';

registerGsap();

// Trecho preso: as dobras entram até REVEAL; daí em diante a rolagem abre um projeto de cada vez.
const REVEAL = 0.2;

// A ficha aberta mora no estado do histórico, sem mexer no endereço: o botão voltar fecha a ficha.
const CHANGE = 'dias77:project';
const onProject = (cb: () => void) => {
  addEventListener('popstate', cb);
  addEventListener(CHANGE, cb);
  return () => { removeEventListener('popstate', cb); removeEventListener(CHANGE, cb); };
};
const currentSlug = () => (history.state as { project?: string } | null)?.project ?? '';
const show = (slug: string, how: 'pushState' | 'replaceState') => {
  history[how]({ project: slug }, '');
  dispatchEvent(new Event(CHANGE));
};

export function Projects() {
  const reduced = useReducedMotion();
  const phone = useMedia('(max-width: 767px)');
  const built = useRef(false);
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);
  const slug = useSyncExternalStore(onProject, currentSlug);
  const at = CASES.findIndex((c) => c.slug === slug);
  const open = CASES[at] ?? null;
  const next = CASES[(at + 1) % CASES.length];

  useGSAP(() => {
    if (reduced) return;
    const el = root.current!;
    const $ = (cls: string) => el.querySelector<HTMLElement>(`.${cls}`)!;
    // Recriado depois de outros pins (troca de breakpoint): volta para a ordem do documento.
    if (built.current) ScrollTrigger.sort();
    built.current = true;

    const k = phone ? 0.5 : 1; // no celular o parallax anda metade
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: '+=320%', pin: true, scrub: true, invalidateOnRefresh: true,
        onUpdate: (st) => setActive(st.progress < REVEAL ? -1
          : Math.min(CASES.length - 1, Math.floor(((st.progress - REVEAL) / (1 - REVEAL)) * CASES.length))),
      },
    })
      // Corte reto: o leque se abre da esquerda para a direita (de cima para baixo no celular) enquanto desentorta.
      .fromTo($(styles.folds),
        { clipPath: phone ? 'inset(0% 0% 100% 0%)' : 'inset(0% 100% 0% 0%)', rotation: -10 },
        { clipPath: 'inset(-10% -10% -10% -10%)', rotation: phone ? -2 : -3, ease: 'power2.inOut', duration: REVEAL }, 0)
      // Profundidades: o título chega antes, as capturas deslizam dentro das dobras, a chuva sobe devagar.
      .fromTo($(styles.head), { y: 120 * k }, { y: 0, duration: REVEAL }, 0)
      .fromTo(`.${styles.shot}`, { xPercent: -4 * k }, { xPercent: 4 * k, duration: 1 }, 0)
      .fromTo($(styles.rain), { y: 0 }, { y: -80 * k, duration: 1 }, 0);

    // Teclado: foco num projeto antes de o leque abrir leva ao ponto em que ele já está inteiro.
    const st = tl.scrollTrigger!;
    const onFocus = () => requestAnimationFrame(() => {
      if (st.progress < REVEAL) scrollTo(0, st.start + (st.end - st.start) * REVEAL);
    });
    el.addEventListener('focusin', onFocus);

    // Mouse: o leque inclina em 3D e a chuva anda ao contrário (só onde existe ponteiro).
    const fine = matchMedia('(hover: hover)').matches;
    const tilt = $(styles.tilt);
    const to = {
      ry: gsap.quickTo(tilt, 'rotationY', { duration: 0.6, ease: 'power3.out' }),
      rx: gsap.quickTo(tilt, 'rotationX', { duration: 0.6, ease: 'power3.out' }),
      x: gsap.quickTo($(styles.rain), 'x', { duration: 0.8, ease: 'power3.out' }),
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      to.ry(px * 10); to.rx(py * -6); to.x(px * -30);
    };
    const onLeave = () => { to.ry(0); to.rx(0); to.x(0); };
    if (fine) { el.addEventListener('pointermove', onMove); el.addEventListener('pointerleave', onLeave); }
    return () => {
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
    // revertOnUpdate: sem ele o useGSAP não desfaz o pin e a timeline antigos quando as dependências mudam.
  }, { dependencies: [reduced, phone], scope: root, revertOnUpdate: true });

  return (
    <>
      <section ref={root} id="projects" className={styles.projects} aria-labelledby="projects-title">
        <div className={styles.rain}><MatrixRain className={styles.canvas} /></div>
        <div className={styles.head}>
          <RedLabel>Case file 77 · The work</RedLabel>
          <h2 id="projects-title" className={styles.title}>Projects.</h2>
          <p className={styles.hint}>{CASES.length} files · unfold one, click to open it</p>
        </div>
        <div className={styles.stage}>
          <div className={styles.tilt}>
            <ul className={styles.folds} style={{ '--n': CASES.length } as CSSProperties}>
              {CASES.map((c, i) => (
                // Com menos movimento não há rolagem abrindo as dobras: todas já mostram o resumo.
                <li key={c.slug} className={styles.fold} style={{ '--i': i + 1 } as CSSProperties}
                  data-testid="project" data-active={reduced || i === active || undefined}>
                  <button type="button" className={styles.link} onClick={() => show(c.slug, 'pushState')}>
                    <img className={styles.shot} src={c.screenshot.desktop} width={1440} height={900} alt="" loading="lazy" />
                    <span className={styles.num} aria-hidden="true">0{c.number}</span>
                    <span className={styles.spine} aria-hidden="true">{c.name}</span>
                    <span className={styles.body}>
                      <span className={styles.name}>{c.name}</span>
                      <span className={styles.summary}>{c.theCase}</span>
                      <span className={styles.cta}>Open file <span aria-hidden="true">→</span></span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {/* Próximo projeto troca a ficha no mesmo passo do histórico: um voltar fecha tudo. */}
      <ProjectFile data={open} total={CASES.length} next={next} onNext={() => show(next.slug, 'replaceState')} onClose={() => history.back()} />
    </>
  );
}

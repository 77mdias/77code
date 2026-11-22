import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PROFILE } from '../content/profile.ts';
import { Panel } from '../ui/Panel.tsx';
import { Caption } from '../ui/Caption.tsx';
import { RedLabel } from '../ui/RedLabel.tsx';
import { registerGsap, useMedia, useReducedMotion } from '../lib/motion.ts';
import styles from './Profile.module.css';

registerGsap();

// Cada quadro entra torto e assenta reto, um depois do outro (como quadros colados).
// O 1º só cai quando o texto já chegou ao lugar (TEXT_END): senão ele assenta por cima das últimas linhas.
const TILT = [-7, 5, -4];
const TEXT_END = 0.28;
const DROP_AT = [TEXT_END, 0.42, 0.62];
const DROP = 0.1;

export function Profile() {
  const reduced = useReducedMotion();
  const phone = useMedia('(max-width: 767px)');
  const built = useRef(false);
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (reduced) return;
    const el = root.current!;
    const file = el.querySelector<HTMLElement>(`.${styles.file}`)!;
    const boxes = gsap.utils.toArray<HTMLElement>('[data-testid="specialty"]', el);

    // A cena presa tem que caber na tela: encolhe a ficha se ela passar da altura (mesma regra do dossiê).
    const onRefresh = () => {
      const cs = getComputedStyle(el);
      const room = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      file.style.setProperty('--fit', String(Math.min(1, room / file.offsetHeight)));
    };
    onRefresh();
    ScrollTrigger.addEventListener('refresh', onRefresh);
    // Recriado depois de outros pins (troca de breakpoint): volta para a ordem do documento.
    if (built.current) ScrollTrigger.sort();
    built.current = true;

    const k = phone ? 0.5 : 1; // no celular o parallax anda metade
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: 'top top', end: '+=150%', pin: true, scrub: true, invalidateOnRefresh: true },
    })
      // O texto sobe 120px até TEXT_END e o retrato 40px no pin inteiro: o retrato desliza mais devagar.
      .fromTo(`.${styles.portrait}`, { y: 40 * k }, { y: 0, duration: 1 }, 0)
      .fromTo([`.${styles.head}`, `.${styles.about}`], { y: 120 * k }, { y: 0, duration: TEXT_END }, 0)
      // Datilografado: as letras visuais acendem uma a uma; o leitor de tela lê a cópia sr-only.
      .fromTo('[data-typed] span', { opacity: 0 }, { opacity: 1, duration: 0.001, stagger: { amount: TEXT_END - 0.04 } }, 0.04);
    // Caem de cima da cena (o overflow da seção esconde) e assentam. offsetTop é relativo à ficha
    // (o `scale` dela a torna offsetParent) e não carrega transform; o topo da ficha vem do retângulo.
    const fileTop = () => file.getBoundingClientRect().top - el.getBoundingClientRect().top;
    boxes.forEach((box, i) => {
      tl.fromTo(box, { y: () => -(fileTop() + box.offsetTop + box.offsetHeight + 40), rotation: TILT[i] },
        { y: 0, rotation: 0, ease: 'power3.out', duration: DROP }, DROP_AT[i]);
    });
    return () => ScrollTrigger.removeEventListener('refresh', onRefresh);
    // revertOnUpdate: sem ele o useGSAP não desfaz o pin e a timeline antigos quando as dependências mudam.
  }, { dependencies: [reduced, phone], scope: root, revertOnUpdate: true });

  return (
    <section ref={root} id="profile" className={styles.profile} aria-labelledby="profile-title">
      <div className={styles.file}>
        <div className={styles.portrait}>
          <Panel tone>
            <img src={PROFILE.portrait.src} alt={PROFILE.portrait.alt} width={2752} height={1536} loading="lazy" />
          </Panel>
        </div>

        <div className={styles.text}>
          <div className={styles.head}>
            <RedLabel>Personnel file · 77</RedLabel>
            <h2 id="profile-title" className={styles.title}>{PROFILE.name}</h2>
            <Caption>{PROFILE.role}</Caption>
          </div>

          {reduced ? (
            <div className={styles.about}>{PROFILE.about.map((p) => <p key={p}>{p}</p>)}</div>
          ) : (
            <>
              <div className={styles.srOnly}>{PROFILE.about.map((p) => <p key={p}>{p}</p>)}</div>
              <div className={styles.about} data-typed aria-hidden="true">
                {PROFILE.about.map((p) => <p key={p}>{[...p].map((c, i) => <span key={i}>{c}</span>)}</p>)}
              </div>
            </>
          )}
        </div>

        <div className={styles.specialties}>
          {PROFILE.specialties.map((s) => (
            <article key={s.title} data-testid="specialty">
              <Panel className={styles.specialty}>
                <h3>{s.title}</h3>
                <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </Panel>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

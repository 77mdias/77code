import { useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PROFILE } from '../content/profile.ts';
import { JP } from '../content/jp.ts';
import { Caption } from '../ui/Caption.tsx';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Sfx } from '../ui/Sfx.tsx';
import { MatrixRain } from '../ui/MatrixRain.tsx';
import { registerGsap, useMedia, useReducedMotion } from '../lib/motion.ts';
import styles from './Profile.module.css';

registerGsap();

// Trecho preso: título e texto primeiro; depois os cards entram um de cada vez; o fim é pausa de leitura.
const TEXT_END = 0.28;
const CARD_AT = [0.3, 0.46, 0.62];
const CARD_IN = 0.14;
// O corte da folha no desktop: o mesmo polígono do CSS, e ele fechado na esquerda (mesmo nº de pontos).
const PAPER = { closed: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', open: 'polygon(0% 0%, 100% 0%, 82% 100%, 0% 100%)' };
const SHOWN = 'inset(-10% -10% -10% -10%)'; // inserção negativa: o corte não come o contorno nem a letra
// Saída: cada card sobe numa velocidade (o de cima vai primeiro), como folhas sendo levantadas.
const LIFT = [0.5, 0.3, 0.14];
const PEEL = [-7, -4, -2];

export function Profile() {
  const reduced = useReducedMotion();
  const desk = useMedia('(min-width: 1200px)');
  const phone = useMedia('(max-width: 767px)');
  const built = useRef(false);
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (reduced) return;
    const el = root.current!;
    const $ = (cls: string) => el.querySelector<HTMLElement>(`.${cls}`)!;
    const [file, paper, portrait, label, title, role, about, jp, bigNum, rain] = [styles.file, styles.paper,
      styles.portrait, styles.label, styles.title, styles.role, styles.about, styles.jp, styles.bigNum, styles.rain].map($);
    const slots = gsap.utils.toArray<HTMLElement>(`.${styles.slot}`, el);
    const boxes = gsap.utils.toArray<HTMLElement>('[data-testid="specialty"]', el);
    // A unidade da composição do desktop (--u no CSS).
    const u = () => Math.min(innerWidth / 100, innerHeight / 56.25, 19);

    // Pilha (até 1199px): a cena presa tem que caber na tela; encolhe a ficha se ela passar da altura.
    const onRefresh = () => {
      if (desk) { file.style.removeProperty('--fit'); return; }
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

    // Chegada, antes de prender: a folha varre a cena e o personagem sobe de trás da borda.
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top 90%', end: 'top top', scrub: true } })
      .fromTo(paper, desk ? { clipPath: PAPER.closed } : { yPercent: -100 },
        desk ? { clipPath: PAPER.open, ease: 'power2.inOut', duration: 0.8 } : { yPercent: 0, ease: 'power2.inOut', duration: 0.8 }, 0)
      .fromTo(portrait.querySelector('img'), { yPercent: 40 }, { yPercent: 0, ease: 'power3.out', duration: 0.6 }, 0.4);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: 'top top', end: '+=180%', pin: true, scrub: true, invalidateOnRefresh: true },
    })
      // Rótulo e cargo varrem da esquerda; o título sobe de dentro de um corte.
      .fromTo(label, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: SHOWN, duration: 0.08 }, 0)
      .fromTo(title, { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 40 }, { clipPath: SHOWN, yPercent: 0, ease: 'power3.out', duration: 0.14 }, 0.02)
      .fromTo(role, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: SHOWN, duration: 0.08 }, 0.12)
      // Datilografado: as letras visuais acendem uma a uma; o leitor de tela lê a cópia sr-only.
      .fromTo('[data-typed] span', { opacity: 0 }, { opacity: 1, duration: 0.001, stagger: { amount: TEXT_END - 0.04 } }, 0.04)
      .fromTo(jp, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: SHOWN, duration: 0.1 }, 0.2)
      // Profundidades: o personagem quase não anda, o 77 do fundo sobe devagar, a chuva mais ainda.
      .fromTo(portrait, { y: () => 2.5 * u() * k }, { y: 0, duration: 1 }, 0)
      .fromTo(bigNum, { y: () => 7 * u() }, { y: () => -7 * u(), duration: 1 }, 0)
      .fromTo(rain, { y: 0 }, { y: -60 * k, duration: 1 }, 0);
    // Os cards entram tortos e assentam retos, um depois do outro: no desktop vêm da direita, pela escada;
    // na pilha, cada um vem do lado em que encosta.
    boxes.forEach((box, i) => {
      const side = i % 2 ? 1 : -1;
      tl.fromTo(box,
        { x: () => (desk ? innerWidth * 0.62 : side * innerWidth), y: () => (desk ? 6 * u() : 0), rotation: desk ? 9 : side * 4 },
        { x: 0, y: 0, rotation: 0, ease: 'power3.out', duration: CARD_IN }, CARD_AT[i]);
    });

    // Saída, depois do pin (a cena já está subindo): os cards são levantados em velocidades diferentes,
    // a folha e o título se afastam um do outro. Só propriedades e elementos que a entrada não usa,
    // para as duas linhas do tempo nunca disputarem o mesmo valor.
    const pin = tl.scrollTrigger!;
    const out = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: () => pin.end, end: () => pin.end + innerHeight, scrub: true, invalidateOnRefresh: true },
    });
    slots.forEach((slot, i) => {
      const side = i % 2 ? 1 : -1;
      out.fromTo(slot, { x: 0, y: 0, rotation: 0 },
        desk ? { y: () => -innerHeight * LIFT[i], rotation: PEEL[i] } : { x: () => side * innerWidth * 0.35, rotation: side * 3 }, 0);
    });
    if (desk) {
      out.fromTo([paper, portrait, about, label], { x: 0 }, { x: () => -innerWidth * 0.14 }, 0)
        .fromTo(title, { x: 0 }, { x: () => innerWidth * 0.1 }, 0)
        .fromTo(bigNum, { scale: 1 }, { scale: 1.3, transformOrigin: '100% 100%' }, 0);
    }
    return () => ScrollTrigger.removeEventListener('refresh', onRefresh);
    // revertOnUpdate: sem ele o useGSAP não desfaz o pin e as timelines antigas quando as dependências mudam.
  }, { dependencies: [reduced, desk, phone], scope: root, revertOnUpdate: true });

  return (
    <section ref={root} id="profile" className={styles.profile} aria-labelledby="profile-title">
      <div className={styles.rain}><MatrixRain className={styles.canvas} /></div>
      <span className={styles.bigNum} aria-hidden="true">77</span>
      <div className={styles.file}>
        <div className={styles.paper} aria-hidden="true" />
        <div className={styles.portrait}>
          <img src={PROFILE.portrait.src} alt={PROFILE.portrait.alt} width={2752} height={1536} loading="lazy" />
        </div>

        <div className={styles.head}>
          <div className={styles.label}><RedLabel>Personnel file · 77</RedLabel></div>
          <h2 id="profile-title" className={styles.title}>{PROFILE.name}</h2>
          <div className={styles.role}><Caption>{PROFILE.role}</Caption></div>
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
        <Sfx entry={JP.caseFile} className={styles.jp} />

        <div className={styles.specialties}>
          {PROFILE.specialties.map((s, n) => (
            // O degrau (slot) guarda o lugar e faz a saída; o card dentro dele faz a entrada.
            <div key={s.title} className={styles.slot} style={{ '--i': n } as CSSProperties}>
              <article data-testid="specialty" className={styles.card}>
                <span className={styles.index} aria-hidden="true">00{n + 1}</span>
                <h3>{s.title}</h3>
                <dl>
                  {s.items.map((i) => (
                    <div key={i.label}><dt>{i.label}</dt><dd>{i.text}</dd></div>
                  ))}
                </dl>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

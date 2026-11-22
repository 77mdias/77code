import { useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CASES } from '../content/cases.ts';
import { RedLabel } from '../ui/RedLabel.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './Helix.module.css';

registerGsap();

// Hélice 3D de telas (DESIGN_V2.md §8.5), em CSS 3D: sem WebGL e sem dependência nova.
// Duas telas por projeto (desktop e celular), subindo em espiral conforme a rolagem.
const SCREENS = CASES.flatMap((c) => [
  { key: `${c.slug}-d`, src: c.screenshot.desktop, tall: false },
  { key: `${c.slug}-m`, src: c.screenshot.mobile, tall: true },
]);
const TURNS = 1.9; // voltas que as telas ocupam na espiral
const SPIN = 684; // giro total durante o trecho preso (3,8π)
// Em alturas de tela: a espiral começa abaixo da cena e termina acima dela.
const FROM = 1.5;
const TO = -1.65;
const TEXT_OUT = 0.35;

const angleOf = (i: number) => (i / SCREENS.length) * TURNS * 360;

export function Helix() {
  const reduced = useReducedMotion();
  const built = useRef(false);
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (reduced) return;
    const el = root.current!;
    const spiral = el.querySelector<HTMLElement>(`.${styles.spiral}`)!;
    const intro = el.querySelector<HTMLElement>(`.${styles.intro}`)!;
    const cards = gsap.utils.toArray<HTMLElement>(`.${styles.screen}`, el);

    const draw = (p: number) => {
      const spin = p * SPIN;
      gsap.set(spiral, { y: (FROM + (TO - FROM) * p) * el.clientHeight, rotationY: -spin });
      // O texto recua e apaga enquanto as telas sobem.
      gsap.set(intro, { opacity: Math.max(0, 1 - p / TEXT_OUT), scale: Math.max(0.5, 1 - (p / 0.4) * 0.5) });
      // Névoa: quanto mais para trás, mais escura; só a tela de frente ganha cor (DESIGN_V1.md §7).
      cards.forEach((card, i) => {
        const z = Math.cos(((angleOf(i) - spin) * Math.PI) / 180); // 1 = de frente, -1 = de costas
        const light = 0.16 + 0.84 * Math.max(0, (z + 0.6) / 1.6) ** 1.5;
        const gray = 1 - Math.max(0, (z - 0.8) / 0.2);
        card.style.filter = `grayscale(${gray.toFixed(2)}) brightness(${light.toFixed(2)})`;
      });
    };
    draw(0);
    // Recriada depois de outros pins (menos movimento desligado): volta para a ordem do documento.
    if (built.current) ScrollTrigger.sort();
    built.current = true;
    ScrollTrigger.create({
      trigger: el, start: 'top top', end: '+=380%', pin: true, scrub: true,
      onUpdate: (s) => draw(s.progress), onRefresh: (s) => draw(s.progress),
    });
  }, { dependencies: [reduced], scope: root, revertOnUpdate: true });

  // Decorativa: com menos movimento ela não existe (a lista de projetos vem logo depois).
  if (reduced) return null;

  return (
    <section ref={root} id="screens" className={styles.helix} aria-label="Project screens">
      <div className={styles.intro}>
        <RedLabel>Case file 77 · Evidence</RedLabel>
        <p className={styles.big}>The work,<br />on screen.</p>
      </div>
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.spiral}>
          {SCREENS.map((s, i) => (
            <img key={s.key} className={`${styles.screen} ${s.tall ? styles.tall : ''}`} src={s.src} alt="" loading="lazy"
              width={s.tall ? 684 : 1440} height={s.tall ? 1480 : 900}
              style={{ '--a': `${angleOf(i)}deg`, '--y': i / (SCREENS.length - 1) - 0.5 } as CSSProperties} />
          ))}
        </div>
      </div>
    </section>
  );
}

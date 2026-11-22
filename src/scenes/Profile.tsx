import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PROFILE } from '../content/profile.ts';
import { Panel } from '../ui/Panel.tsx';
import { Caption } from '../ui/Caption.tsx';
import { RedLabel } from '../ui/RedLabel.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './Profile.module.css';

registerGsap();

export function Profile() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (reduced) return;
    // Corte reto, um quadro por vez na ordem de leitura (DESIGN.md §6).
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.inOut',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    });
  }, { dependencies: [reduced], scope: root });

  return (
    <section ref={root} id="profile" className={styles.profile} aria-labelledby="profile-title">
      <div className={styles.file}>
        <div data-reveal className={styles.head}>
          <RedLabel>Personnel file · 77</RedLabel>
          <h2 id="profile-title" className={styles.title}>{PROFILE.name}</h2>
          <Caption>{PROFILE.role}</Caption>
        </div>

        <div data-reveal className={styles.portrait}>
          <Panel tone>
            <img src={PROFILE.portrait.src} alt={PROFILE.portrait.alt} width={2752} height={1536} loading="lazy" />
          </Panel>
        </div>

        <div data-reveal className={styles.about}>
          {PROFILE.about.map((p) => <p key={p}>{p}</p>)}
        </div>

        <div className={styles.specialties}>
          {PROFILE.specialties.map((s) => (
            <article key={s.title} data-testid="specialty" data-reveal>
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

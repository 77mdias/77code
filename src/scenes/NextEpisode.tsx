import { useEffect, useRef, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CONTACT } from '../content/contact.ts';
import { JP } from '../content/jp.ts';
import { Panel } from '../ui/Panel.tsx';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Sfx } from '../ui/Sfx.tsx';
import { InkButton } from '../ui/InkButton.tsx';
import { registerGsap, useMedia, useReducedMotion } from '../lib/motion.ts';
import { CHANNELS } from './links.ts';
import styles from './NextEpisode.module.css';

registerGsap();

type State = 'idle' | 'sending' | 'sent' | 'error';
const LABEL: Record<State, string> = { idle: 'Send', sending: 'Sending…', sent: 'Sent', error: 'Error — try again' };

// Prévia de anime: o formulário entra por último e termina antes do fim, para estar inteiro quando o pin solta.
const FORM_IN = [0.6, 0.85];

export function NextEpisode() {
  const reduced = useReducedMotion();
  const phone = useMedia('(max-width: 767px)');
  const [state, setState] = useState<State>('idle');
  const idle = useRef(0);
  const built = useRef(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => () => clearTimeout(idle.current), []);

  useGSAP(() => {
    if (reduced) return;
    const el = root.current!;
    const inner = el.querySelector<HTMLElement>(`.${styles.inner}`)!;

    // A cena presa tem que caber na tela: encolhe quando o conteúdo passa da altura (mesma regra do profile).
    const onRefresh = () => {
      const cs = getComputedStyle(el);
      const room = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      inner.style.setProperty('--fit', String(Math.min(1, room / inner.offsetHeight)));
    };
    onRefresh();
    ScrollTrigger.addEventListener('refresh', onRefresh);
    // Recriado depois de outros pins (troca de breakpoint): volta para a ordem do documento.
    if (built.current) ScrollTrigger.sort();
    built.current = true;

    const k = phone ? 0.5 : 1; // no celular o parallax anda metade
    const [from, to] = FORM_IN;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: 'top top', end: '+=100%', pin: true, scrub: true, invalidateOnRefresh: true },
    })
      // O 77 do fundo anda devagar e ao contrário do texto: profundidade.
      .fromTo(`.${styles.bigNum}`, { y: 160 * k }, { y: -160 * k, duration: 1 }, 0)
      // 次回予告 entra grande e assenta; depois o título varre da esquerda para a direita.
      .fromTo(`.${styles.sfx}`, { scale: 2.2, clipPath: 'inset(0% 0% 100% 0%)' },
        { scale: 1, clipPath: 'inset(-20% -20% -20% -20%)', duration: 0.3, ease: 'power3.out' }, 0)
      .fromTo(`.${styles.title}`, { x: -60 * k, clipPath: 'inset(0% 100% 0% 0%)' },
        { x: 0, clipPath: 'inset(-10% -10% -10% -10%)', duration: 0.3, ease: 'power2.inOut' }, 0.25)
      .fromTo(`.${styles.channels}`, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(-10% -10% -10% -10%)', duration: 0.15 }, 0.45)
      // Corte reto de cima para baixo; a inserção negativa no fim não recorta o contorno de foco.
      .fromTo('[data-reveal]',
        { opacity: 0, y: 24 * k, clipPath: 'inset(0% 0% 100% 0%)' },
        { opacity: 1, y: 0, clipPath: 'inset(-10% -10% -10% -10%)', duration: to - from, ease: 'power3.out' }, from);

    // Quem chega a um campo ou link pelo teclado no meio do pin vai para o fim, onde tudo está inteiro.
    // rAF: o scroll de foco do navegador vem depois do focusin.
    const st = tl.scrollTrigger!;
    const onFocus = () => requestAnimationFrame(() => { if (st.progress < 1) scrollTo(0, st.end); });
    el.addEventListener('focusin', onFocus);
    return () => {
      el.removeEventListener('focusin', onFocus);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
    };
    // revertOnUpdate: sem ele o useGSAP não desfaz o pin e a timeline antigos quando as dependências mudam.
  }, { dependencies: [reduced, phone], scope: root, revertOnUpdate: true });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending') return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    // Sem chave, nenhuma mensagem vai para a caixa de outra pessoa: abre o e-mail.
    if (!CONTACT.web3formsKey) {
      const subject = encodeURIComponent(`Portfolio contact: ${data.name}`);
      const body = encodeURIComponent(`${data.message}\n\n${data.name} <${data.email}>`);
      location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
      return;
    }

    // O "Sent" de um envio anterior não pode voltar a "idle" no meio deste (reabriria o duplo envio).
    clearTimeout(idle.current);
    setState('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: CONTACT.web3formsKey, name: data.name, email: data.email, message: data.message }),
      });
      if (!res.ok || !(await res.json()).success) throw new Error('web3forms');
      form.reset();
      setState('sent');
      idle.current = window.setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('error');
    }
  }

  return (
    <section ref={root} id="contact" className={styles.contact} aria-labelledby="contact-title">
      <span className={styles.bigNum} aria-hidden="true">77</span>
      <div className={styles.inner}>
        <div className={styles.head}>
          <RedLabel>Next episode</RedLabel>
          <Sfx entry={JP.nextEpisode} className={styles.sfx} />
          <h2 id="contact-title" className={styles.title}>Your project.</h2>
          <ul className={styles.channels}>
            {CHANNELS.map((c) => (
              <li key={c.label}>
                <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal>
          <Panel tone className={styles.panel}>
            <form id="contact-form" className={styles.form} onSubmit={onSubmit}>
              <label className={styles.field}>
                <span>Name</span>
                <input name="name" required autoComplete="name" />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label className={styles.field}>
                <span>Message</span>
                <textarea name="message" rows={5} required />
              </label>
              <InkButton type="submit" busy={state === 'sending'}>{LABEL[state]}</InkButton>
              <p role="status" className={styles.status}>
                {state === 'error' && `Something went wrong. Write to ${CONTACT.email} instead.`}
                {state === 'sent' && 'Message received. I will reply soon.'}
              </p>
            </form>
          </Panel>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CONTACT } from '../content/contact.ts';
import { JP } from '../content/jp.ts';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Sfx } from '../ui/Sfx.tsx';
import { InkButton } from '../ui/InkButton.tsx';
import { registerGsap, followKeyboard, useMedia, useReducedMotion } from '../lib/motion.ts';
import { MatrixRain } from '../ui/MatrixRain.tsx';
import { CHANNELS } from './links.ts';
import styles from './NextEpisode.module.css';

registerGsap();

type State = 'idle' | 'sending' | 'sent' | 'error';
const LABEL: Record<State, string> = { idle: 'Send', sending: 'Sending…', sent: 'Sent', error: 'Error — try again' };

// O formulário entra por último e termina antes do fim, para estar inteiro (e parado) quando o pin solta.
const FORM_IN = [0.46, 0.72];
const SHOWN = 'inset(-10% -10% -10% -10%)'; // inserção negativa: o corte não come o contorno de foco

export function NextEpisode() {
  const reduced = useReducedMotion();
  const phone = useMedia('(max-width: 767px)');
  const [state, setState] = useState<State>('idle');
  const idle = useRef(0);
  const built = useRef(false);
  const root = useRef<HTMLElement>(null);
  const spacer = useRef<HTMLDivElement>(null);

  useEffect(() => () => clearTimeout(idle.current), []);

  useGSAP(() => {
    if (reduced) return;
    const el = root.current!;
    const $ = (cls: string) => el.querySelector<HTMLElement>(`.${cls}`)!;
    const [frame, bigNum, band, sfx, side, channels, card, title] =
      [styles.frame, styles.bigNum, styles.band, styles.sfx, styles.side, styles.channels, styles.card, styles.title].map($);

    // A cena presa tem que caber na tela: a folha encolhe quando o conteúdo passa do espaço dela.
    const onRefresh = () => {
      const room = frame.clientHeight; // a área segura, não a cena inteira
      card.style.setProperty('--fit', String(Math.min(1, (0.96 * room - card.offsetTop) / card.offsetHeight)));
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
      scrollTrigger: { trigger: el, start: 'top top', end: '+=200%', pin: true, pinSpacer: spacer.current, scrub: true, invalidateOnRefresh: true },
    })
      // O 77 do fundo anda devagar e ao contrário do resto: profundidade.
      .fromTo(bigNum, { y: 160 * k }, { y: -160 * k, duration: 1 }, 0)
      // A faixa vermelha varre a tela; 次回予告 entra grande e assenta; rótulo e canais vêm atrás.
      .fromTo(band, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.22 }, 0)
      .fromTo(sfx, { scale: 1.8, clipPath: 'inset(0% 0% 100% 0%)' }, { scale: 1, clipPath: SHOWN, ease: 'power3.out', duration: 0.22 }, 0.14)
      .fromTo(side, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: SHOWN, duration: 0.1 }, 0.3)
      .fromTo(channels, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: SHOWN, duration: 0.12 }, 0.32)
      // A folha do formulário sobe torta de baixo da cena e assenta por cima da faixa; o título varre por último.
      .fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.03 }, from)
      .fromTo(card, { y: () => innerHeight * 0.8, rotation: 5 }, { y: 0, rotation: 0, ease: 'power3.out', duration: to - from }, from)
      .fromTo(title, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: SHOWN, ease: 'power2.inOut', duration: 0.12 }, to - 0.06);

    // Saída, depois do pin: a faixa e o 次回予告 se afastam; a folha fica parada (o formulário continua usável).
    const pin = tl.scrollTrigger!;
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: () => pin.end, end: () => pin.end + innerHeight, scrub: true, invalidateOnRefresh: true },
    })
      .fromTo(band, { xPercent: 0 }, { xPercent: -12 }, 0)
      .fromTo(sfx, { y: 0 }, { y: () => -innerHeight * 0.18 * k }, 0);

    // Quem chega a um campo ou link pelo teclado no meio do pin vai para o fim, onde tudo está inteiro.
    // rAF: o scroll de foco do navegador vem depois do focusin.
    const onFocus = () => requestAnimationFrame(() => { if (pin.progress < 1) scrollTo(0, pin.end); });
    el.addEventListener('focusin', onFocus);
    const offKeyboard = followKeyboard(pin);
    return () => {
      el.removeEventListener('focusin', onFocus);
      offKeyboard();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
    };
    // revertOnUpdate: sem ele o useGSAP não desfaz o pin e as timelines antigas quando as dependências mudam.
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
    // O invólucro é o espaçador do pin (pinSpacer): ver FloraStudio.
    <div ref={spacer}>
      <section ref={root} id="contact" className={styles.contact} aria-labelledby="contact-title">
        <MatrixRain className={styles.rain} />
        <span className={styles.bigNum} aria-hidden="true">77</span>
        <div className={styles.frame}>
          {/* A mesma chuva, em nanquim, por cima do vermelho: cai dentro da faixa e anda com ela. */}
          <div className={styles.band} aria-hidden="true"><MatrixRain className={styles.bandRain} /></div>

          {/* A folha: o único papel da cena, mais alta que a faixa. */}
          <div className={styles.card} data-reveal>
            <div className={styles.head}>
              <RedLabel>Next episode</RedLabel>
              <h2 id="contact-title" className={styles.title}>Your project.</h2>
            </div>
            <form id="contact-form" className={styles.form} onSubmit={onSubmit}>
              <label className={styles.field}>
                <span>Name</span>
                <input name="name" required autoComplete="name" />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label className={`${styles.field} ${styles.grow}`}>
                <span>Message</span>
                <textarea name="message" rows={4} required />
              </label>
              <InkButton type="submit" busy={state === 'sending'}>{LABEL[state]}</InkButton>
              <p role="status" className={styles.status}>
                {state === 'error' && `Something went wrong. Write to ${CONTACT.email} instead.`}
                {state === 'sent' && 'Message received. I will reply soon.'}
              </p>
            </form>
          </div>

          <ul className={styles.channels}>
            {CHANNELS.map((c) => (
              <li key={c.label}>
                <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.label}</a>
              </li>
            ))}
          </ul>
          <Sfx entry={JP.nextEpisode} className={styles.sfx} />
          <span className={styles.side} aria-hidden="true">Preview</span>
        </div>
      </section>
    </div>
  );
}

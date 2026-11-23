import { useEffect, useRef, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { JP } from '../content/jp.ts';
import { Sfx } from '../ui/Sfx.tsx';
import { registerGsap, useMedia, useReducedMotion } from '../lib/motion.ts';
import { EXPRESSIONS, useFloraChat } from '../chat/useFloraChat.ts';
import styles from './FloraStudio.module.css';

registerGsap();

// Caminhos por extenso: o check-assets só reconhece caminho literal.
const FACES: Record<(typeof EXPRESSIONS)[number], string> = {
  warm: '/static/char/warm.webp',
  explain: '/static/char/explain.webp',
  happy: '/static/char/happy.webp',
  thinking: '/static/char/thinking.webp',
  shock: '/static/char/shock.webp',
  kind: '/static/char/kind.webp',
  return: '/static/char/return.webp',
  aval_work: '/static/char/aval_work.webp',
};

// O chat entra depois que ela sorri (meio do pin) e termina antes do fim, para estar inteiro quando o pin solta.
// O trecho preso tem duas partes: a animação (1 tela de rolagem) e a espera com o chat já pronto
// (2 telas), para a cena não soltar assim que termina. SMILE_AT e CHAT_IN são frações da animação.
const ANIM = 1;
const HOLD = 2;
const DONE = ANIM / (ANIM + HOLD); // fração do pin em que a animação acaba
const SMILE_AT = 0.5;
const CHAT_IN = [0.65, 0.9];

export function FloraStudio() {
  const reduced = useReducedMotion();
  const phone = useMedia('(max-width: 767px)');
  const { messages, expression, pending, send } = useFloraChat();
  const [greeted, setGreeted] = useState(false);
  const built = useRef(false);
  const root = useRef<HTMLElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Até a primeira conversa, quem muda o rosto é o scroll; depois, as respostas.
  const face = (reduced || greeted) && messages.length === 1 ? 'happy' : expression;

  // O vídeo de fundo (197 KB) só começa a baixar quando a seção está perto da tela.
  useEffect(() => {
    const v = video.current!;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      v.preload = 'auto';
      if (reduced) v.load(); else void v.play().catch(() => {});
    }, { rootMargin: '600px 0px' });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    log.current!.scrollTop = log.current!.scrollHeight;
  }, [messages, pending]);

  useGSAP(() => {
    if (reduced) return;
    const el = root.current!;
    // Recriado depois de outros pins (troca de breakpoint): volta para a ordem do documento.
    if (built.current) ScrollTrigger.sort();
    built.current = true;

    const k = phone ? 0.5 : 1; // no celular o parallax anda metade
    const [from, to] = CHAT_IN;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: `+=${(ANIM + HOLD) * 100}%`, pin: true, pinSpacer: spacer.current, scrub: true, invalidateOnRefresh: true,
        onUpdate: (st) => setGreeted(st.progress / DONE >= SMILE_AT),
      },
    })
      // Câmera entrando: o estúdio todo sai do zoom; fundo e janela andam pouco, a Flora anda mais.
      .fromTo(`.${styles.stage}`, { scale: 1.08 }, { scale: 1, duration: 1 }, 0)
      .fromTo(`.${styles.layer}`, { y: 40 * k }, { y: 0, duration: 1 }, 0)
      .fromTo(`.${styles.flora}`, { y: 140 * k }, { y: 0, duration: SMILE_AT, ease: 'power3.out' }, 0)
      .fromTo(`.${styles.shade}`, { opacity: 0 }, { opacity: 1, duration: to - from }, from)
      // Corte reto de cima para baixo; a inserção negativa no fim não recorta o contorno de foco.
      .fromTo(`.${styles.chat}`,
        { opacity: 0, y: 24 * k, clipPath: 'inset(0% 0% 100% 0%)' },
        { opacity: 1, y: 0, clipPath: 'inset(-10% -10% -10% -10%)', duration: to - from, ease: 'power3.out' }, from)
      // A espera: nada se mexe, a cena só continua presa com o chat pronto.
      .to({}, { duration: HOLD }, ANIM);

    // Quem chega ao campo no meio da animação vai para o começo da espera, onde o chat está inteiro.
    // No celular vai para o fim do pin, onde a cena solta: com o teclado na tela o campo não pode estar
    // num elemento fixo, senão o navegador não consegue rolar até ele.
    // rAF: o scroll de foco do navegador vem depois do focusin.
    const st = tl.scrollTrigger!;
    const park = ScrollTrigger.isTouch === 1 ? 1 : DONE;
    const onFocus = () => requestAnimationFrame(() => { if (st.progress < park) scrollTo(0, st.start + (st.end - st.start) * park); });
    el.addEventListener('focusin', onFocus);
    return () => el.removeEventListener('focusin', onFocus);
    // revertOnUpdate: sem ele o useGSAP não desfaz o pin e a timeline antigos quando as dependências mudam.
  }, { dependencies: [reduced, phone], scope: root, revertOnUpdate: true });

  // Campo sem estado no React: o texto sai do próprio form.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const text = String(new FormData(form).get('message') ?? '').trim();
    if (text && text.length <= 1200) form.reset(); // longa demais fica no campo para a pessoa encurtar
    void send(text);
  };

  return (
    // O invólucro é o espaçador do pin (pinSpacer). Sem ele o ScrollTrigger tira a seção do lugar a cada
    // recálculo, e um campo em foco dentro dela perde o foco: no celular o teclado fecha no meio da digitação.
    <div ref={spacer}>
      <section ref={root} id="flora" className={styles.studio} aria-labelledby="flora-title">
        <div className={styles.stage}>
          <video ref={video} className={styles.layer} src="/static/char/back2.webm" preload="none" loop muted playsInline aria-hidden="true" />
          <img className={styles.layer} src="/static/char/char_back3.webp" alt="" width={2752} height={1536} loading="lazy" />
          <div className={styles.flora}>
            {EXPRESSIONS.map((name) => {
              const on = name === face;
              return (
                <img
                  key={name}
                  className={on ? styles.on : undefined}
                  src={FACES[name]}
                  alt={on ? 'Flora, the AI partner of this case file, at her desk' : ''}
                  data-testid={on ? 'flora' : undefined}
                  data-expression={name}
                  width={2752}
                  height={1536}
                  loading="lazy"
                />
              );
            })}
          </div>
        </div>
        {/* Sombra atrás da coluna do chat: o texto claro fica legível sobre o estúdio sem virar caixa. */}
        <div className={styles.shade} aria-hidden="true" />

        <div className={styles.chat}>
          <div className={styles.head}>
            <h2 id="flora-title" className={styles.title}>Interactive Flora AI</h2>
            <p className={styles.subtitle}>Partner · <Sfx entry={JP.partner} className={styles.jp} /></p>
          </div>

          <div ref={log} className={styles.log} data-testid="chat-log" role="log" aria-live="polite" aria-label="Conversation with Flora">
            {messages.map((m, i) => <p key={i} data-from={m.from} className={styles.msg}>{m.text}</p>)}
            {pending && (
              <p className={styles.typing}>
                <span aria-hidden="true">•••</span>
                <span className={styles.srOnly}>Flora is typing</span>
              </p>
            )}
          </div>

          <form id="chat-form" className={styles.form} onSubmit={onSubmit}>
            <label htmlFor="chat-input" className={styles.srOnly}>Message to Flora</label>
            <input id="chat-input" name="message" className={styles.input} placeholder="Speak to Flora…" autoComplete="off" />
            <button type="submit" className={styles.send}>Send</button>
          </form>
          <div id="flora-turnstile" />
          <p className={`chat-privacy ${styles.privacy}`}>Messages are answered by Claude (Anthropic) and aren't stored.</p>
        </div>
      </section>
    </div>
  );
}

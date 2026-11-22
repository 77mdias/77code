import { useEffect, useRef, type FormEvent } from 'react';
import { JP } from '../content/jp.ts';
import { Panel } from '../ui/Panel.tsx';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Sfx } from '../ui/Sfx.tsx';
import { InkButton } from '../ui/InkButton.tsx';
import { useReducedMotion } from '../lib/motion.ts';
import { EXPRESSIONS, useFloraChat } from '../chat/useFloraChat.ts';
import styles from './FloraStudio.module.css';

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

export function FloraStudio() {
  const reduced = useReducedMotion();
  const { messages, expression, pending, send } = useFloraChat();
  const log = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

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
    <section id="flora" className={styles.studio} aria-labelledby="flora-title">
      <div className={styles.stage}>
        <video ref={video} className={styles.layer} src="/static/char/back2.webm" preload="none" loop muted playsInline aria-hidden="true" />
        <img className={styles.layer} src="/static/char/char_back3.webp" alt="" width={2752} height={1536} loading="lazy" />
        <div className={styles.flora}>
          {EXPRESSIONS.map((name) => {
            const on = name === expression;
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

      {/* Sem retícula: aqui ela cairia atrás do texto do chat (DESIGN.md §5). */}
      <Panel className={styles.chat}>
        <div className={styles.head}>
          <RedLabel>Partner · <Sfx entry={JP.partner} className={styles.jp} /></RedLabel>
          <h2 id="flora-title" className={styles.title}>Ask Flora</h2>
        </div>

        <div ref={log} className={styles.log} data-testid="chat-log" role="log" aria-live="polite" aria-label="Conversation with Flora" data-lenis-prevent>
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
          <InkButton type="submit">Send</InkButton>
        </form>
        <div id="flora-turnstile" />
        <p className={`chat-privacy ${styles.privacy}`}>Messages are answered by Claude (Anthropic) and aren't stored.</p>
      </Panel>
    </section>
  );
}

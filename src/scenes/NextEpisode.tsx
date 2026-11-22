import { useState, type FormEvent } from 'react';
import { CONTACT } from '../content/contact.ts';
import { JP } from '../content/jp.ts';
import { Panel } from '../ui/Panel.tsx';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Sfx } from '../ui/Sfx.tsx';
import { InkButton } from '../ui/InkButton.tsx';
import { CHANNELS } from './links.ts';
import styles from './NextEpisode.module.css';

type State = 'idle' | 'sending' | 'sent' | 'error';
const LABEL: Record<State, string> = { idle: 'Send', sending: 'Sending…', sent: 'Sent', error: 'Error — try again' };

export function NextEpisode() {
  const [state, setState] = useState<State>('idle');

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
      setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('error');
    }
  }

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
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
            <InkButton type="submit">{LABEL[state]}</InkButton>
            <p role="status" className={styles.status}>
              {state === 'error' && `Something went wrong. Write to ${CONTACT.email} instead.`}
              {state === 'sent' && 'Message received. I will reply soon.'}
            </p>
          </form>
        </Panel>
      </div>
    </section>
  );
}

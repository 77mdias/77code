import { CHANNELS } from './links.ts';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.brand}>
        <span className={styles.mark} aria-hidden="true" />
        <small>© DIAS77</small>
      </span>
      <ul className={styles.links}>
        {CHANNELS.map((c) => (
          <li key={c.label}>
            <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.label}</a>
          </li>
        ))}
      </ul>
    </footer>
  );
}

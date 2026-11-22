import type Lenis from 'lenis';
import { useReducedMotion } from '../lib/motion.ts';
import styles from './Header.module.css';

const LINKS = [
  { id: 'cases', label: 'Cases' },
  { id: 'profile', label: 'Profile' },
  { id: 'flora', label: 'Flora' },
  { id: 'contact', label: 'Contact' },
] as const;

export function Header({ lenis }: { lenis: Lenis | null }) {
  const reduced = useReducedMotion();

  // O Lenis conta a altura dos pins (são DOM de verdade); sem ele, salto direto.
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis && !reduced) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: 'instant' });
  };

  return (
    <header className={styles.header}>
      <a className={styles.logo} href="#opening" onClick={go('opening')} aria-label="DIAS77, back to the top">
        <span className={styles.mark} aria-hidden="true" />
      </a>
      <nav aria-label="Sections" className={styles.nav}>
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} data-id={l.id}>{l.label}</a>
        ))}
      </nav>
    </header>
  );
}

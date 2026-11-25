import type Lenis from 'lenis';
import { JP } from '../content/jp.ts';
import { Sfx } from '../ui/Sfx.tsx';
import { Steam } from '../ui/Steam.tsx';
import { LoaderCat } from '../ui/LoaderCat.tsx';
import { CHANNELS } from './links.ts';
import styles from './Footer.module.css';

const CREDITS = [
  ['Story & code', 'Jean Dias'],
  ['Partner', 'Lyssxz AI'],
  ['Filed in', 'Presidente Prudente'],
] as const;

// Encerramento de anime (DESIGN_V1.md §5/§6): os créditos sobem com o scroll (CSS, view timeline)
// e um gato de nanquim abana o rabo numa lua de papel.
export function Footer({ lenis }: { lenis: Lenis | null }) {
  const rewind = () => {
    // Sem Lenis (menos movimento) o salto é seco.
    if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else scrollTo(0, 0);
    // Quem veio pelo teclado continua do topo, e não do rodapé.
    const h1 = document.querySelector('h1');
    h1?.setAttribute('tabindex', '-1');
    h1?.focus({ preventScroll: true });
  };

  return (
    <footer className={styles.footer}>
      <p className={styles.eof}>END OF FILE · <Sfx entry={JP.end} className={styles.jp} /></p>
      <div className={styles.middle}>
        <div className={styles.roll}>
          <dl className={styles.credits} data-testid="credits">
            {CREDITS.map(([role, name]) => (
              <div key={role}>
                <dt>{role}</dt>
                <dd>{name}</dd>
              </div>
            ))}
          </dl>
        </div>
        <LoaderCat className={styles.cat} />
        <div className={styles.cup} aria-hidden="true">
          <Steam className={styles.steam} />
          <svg className={styles.mug} viewBox="0 0 80 64">
            <path d="M10 14 h44 v24 a16 16 0 0 1 -16 16 h-12 a16 16 0 0 1 -16 -16 z" />
            <path d="M54 20 h5 a9 9 0 0 1 0 18 h-5" />
            <path d="M2 61 h70" />
          </svg>
        </div>
      </div>

      <div className={styles.bottom}>
        <ul className={styles.links}>
          {CHANNELS.map((c) => (
            <li key={c.label}>
              <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.label}</a>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.rewind} data-testid="rewind" onClick={rewind}>Rewind episode ↑</button>
        <small className={styles.copy}>© DIAS77</small>
      </div>
    </footer>
  );
}

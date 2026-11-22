import type { ReactNode } from 'react';
import styles from './Typewriter.module.css';

export function Typewriter({ label, children }: { label: string; children: ReactNode }) {
  return <div className={styles.sheet} role="group" aria-label={label}>{children}</div>;
}

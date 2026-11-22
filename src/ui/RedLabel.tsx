import type { ReactNode } from 'react';
import styles from './RedLabel.module.css';

export function RedLabel({ children }: { children: ReactNode }) {
  return <p className={styles.label}>{children}</p>;
}

import type { ReactNode } from 'react';
import styles from './Caption.module.css';

export function Caption({ children }: { children: ReactNode }) {
  return <p className={styles.caption}>{children}</p>;
}

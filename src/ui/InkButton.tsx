import type { ReactNode } from 'react';
import styles from './InkButton.module.css';

type Props = { href?: string; external?: boolean; onClick?: () => void; type?: 'button' | 'submit'; children: ReactNode };

export function InkButton({ href, external, onClick, type = 'button', children }: Props) {
  if (href && external) {
    return <a className={styles.btn} href={href} onClick={onClick} target="_blank" rel="noopener noreferrer">{children}</a>;
  }
  if (href) return <a className={styles.btn} href={href} onClick={onClick}>{children}</a>;
  return <button className={styles.btn} type={type} onClick={onClick}>{children}</button>;
}

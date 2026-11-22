import type { ReactNode } from 'react';
import styles from './InkButton.module.css';

type Props = { href?: string; onClick?: () => void; type?: 'button' | 'submit'; children: ReactNode };

export function InkButton({ href, onClick, type = 'button', children }: Props) {
  if (href) return <a className={styles.btn} href={href} onClick={onClick}>{children}</a>;
  return <button className={styles.btn} type={type} onClick={onClick}>{children}</button>;
}

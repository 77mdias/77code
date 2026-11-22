import type { ElementType, ReactNode } from 'react';
import styles from './Panel.module.css';

type Props = { as?: ElementType; tone?: boolean; className?: string; children?: ReactNode };

export function Panel({ as: Tag = 'div', tone = false, className, children }: Props) {
  const cls = [styles.panel, tone && styles.tone, className].filter(Boolean).join(' ');
  return <Tag className={cls}>{children}</Tag>;
}

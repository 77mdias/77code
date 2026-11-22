import type { JpEntry } from '../content/jp.ts';
import styles from './Sfx.module.css';

type Props = { entry: JpEntry; className?: string };

export function Sfx({ entry, className }: Props) {
  const cls = [styles.sfx, className].filter(Boolean).join(' ');
  if (entry.decorative) return <span className={cls} aria-hidden="true">{entry.text}</span>;
  return <span className={cls} lang="ja" role="img" aria-label={entry.meaning}>{entry.text}</span>;
}

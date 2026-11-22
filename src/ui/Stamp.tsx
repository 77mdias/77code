import { JP } from '../content/jp.ts';
import { Sfx } from './Sfx.tsx';
import styles from './Stamp.module.css';

export function Stamp({ visible }: { visible: boolean }) {
  return (
    <span className={styles.stamp} data-testid="stamp" data-visible={visible} style={{ opacity: visible ? 0.9 : 0 }}>
      <span className={styles.word}>RESOLVED</span>
      <Sfx entry={JP.solved} className={styles.jp} />
    </span>
  );
}

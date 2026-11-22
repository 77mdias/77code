import styles from './RedString.module.css';

export type Point = [number, number];

// Coordenadas em % do pai. Os alfinetes são spans (não círculos do SVG) para não achatar com o viewBox esticado.
export function RedString({ from, to }: { from: Point; to: Point[] }) {
  const pins = [from, ...to];
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none">
        {to.map(([x, y]) => (
          <line key={`${x}-${y}`} x1={from[0]} y1={from[1]} x2={x} y2={y} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {pins.map(([x, y], i) => (
        <span key={`${x}-${y}`} className={styles.pin} data-end={i > 0 || undefined} style={{ left: `${x}%`, top: `${y}%` }} />
      ))}
    </div>
  );
}

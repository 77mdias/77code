import styles from './Steam.module.css';

// Fumaça do café: a mesma na xícara da abertura e na do rodapé. Quem usa decide posição e tamanho.
export function Steam({ className }: { className?: string }) {
  return (
    <svg className={[styles.steam, className].filter(Boolean).join(' ')} viewBox="0 0 40 60" aria-hidden="true">
      <path d="M12 58 q-7 -10 0 -20 q7 -10 0 -20" />
      <path d="M20 58 q-7 -10 0 -20 q7 -10 0 -20" />
      <path d="M28 58 q-7 -10 0 -20 q7 -10 0 -20" />
    </svg>
  );
}

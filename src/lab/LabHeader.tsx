import styles from './LabHeader.module.css';

export function LabHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.wordmark} href="#top" aria-label="77CODE LAB top">
        <span className={styles.mark} aria-hidden="true">77</span>
        <span className={styles.brand}>
          DIAS77<i>/</i>LAB
        </span>
      </a>

      <nav className={styles.nav} aria-label="Lab sections">
        <a href="#board">Board</a>
        <a href="#index">Index</a>
      </nav>

      <a className={styles.home} href="/">
        Case File 77 <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}

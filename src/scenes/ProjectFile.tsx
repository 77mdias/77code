import { useEffect, useRef } from 'react';
import type { CaseFile } from '../content/cases.ts';
import { Panel } from '../ui/Panel.tsx';
import { RedLabel } from '../ui/RedLabel.tsx';
import { InkButton } from '../ui/InkButton.tsx';
import { MatrixRain } from '../ui/MatrixRain.tsx';
import styles from './ProjectFile.module.css';

// Seção de um projeto só, por cima da página (<dialog> modal: Esc fecha e o foco fica preso sozinho).
type Props = { data: CaseFile | null; total: number; next: CaseFile; onNext: () => void; onClose: () => void };

export function ProjectFile({ data, total, next, onNext, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current!;
    if (data && !d.open) d.showModal();
    if (data) d.scrollTop = 0; // abrir e trocar para o próximo começam do topo
    if (!data && d.open) d.close();
  }, [data]);

  return (
    // data-lenis-prevent: a roda do mouse rola a ficha, não a página de trás.
    <dialog ref={ref} className={styles.file} aria-labelledby="project-file-name" data-testid="project-file"
      data-lenis-prevent onClose={() => data && onClose()}>
      {data && (
        <>
          <MatrixRain className={styles.rain} />
          {/* key: trocar de projeto refaz a entrada da ficha. */}
          <div key={data.slug} className={styles.inner}>
            <button type="button" className={styles.back} onClick={onClose}>
              <span aria-hidden="true">←</span> Back to the files
            </button>

            <div className={styles.head}>
              <RedLabel>File 0{data.number} / 0{total}</RedLabel>
              <h2 id="project-file-name" className={styles.name}>{data.name}</h2>
            </div>

            <figure className={styles.photo}>
              <picture>
                <source media="(max-width: 767px)" srcSet={data.screenshot.mobile} width={684} height={1480} />
                <img src={data.screenshot.desktop} width={1440} height={900} alt={`Screenshot of ${data.name}`} />
              </picture>
            </figure>

            <Panel tone className={styles.sheet}>
              <h3 className={styles.part}>The case</h3>
              <p>{data.theCase}</p>
              <h3 className={styles.part}>The clues</h3>
              <ul className={styles.clues}>{data.clues.map((c) => <li key={c}>{c}</li>)}</ul>
              <h3 className={styles.part}>The solution</h3>
              <p>{data.solution}</p>
              <h3 className={styles.part}>Stack</h3>
              <ul className={styles.tags} aria-label="Stack">{data.stack.map((s) => <li key={s}>{s}</li>)}</ul>
              {data.url && (
                <>
                  <h3 className={styles.part}>References</h3>
                  <p className={styles.refs}>
                    <span className={styles.host}>{new URL(data.url).host}</span>
                    <InkButton href={data.url} external>View the site <span aria-hidden="true">→</span></InkButton>
                  </p>
                </>
              )}
            </Panel>

            <button type="button" className={styles.next} onClick={onNext} data-testid="next-project">
              <img src={next.screenshot.desktop} width={1440} height={900} alt="" loading="lazy" />
              <span className={styles.nextLabel}>Next file · 0{next.number} / 0{total}</span>
              <span className={styles.nextName}>{next.name}</span>
              <span className={styles.nextArrow} aria-hidden="true">→</span>
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}

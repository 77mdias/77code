import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { LAB_EXPERIMENTS, LAB_FILTERS, type LabCategory, type LabExperiment } from '../content/lab.ts';
import { JP } from '../content/jp.ts';
import { RedLabel } from '../ui/RedLabel.tsx';
import { Sfx } from '../ui/Sfx.tsx';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './LabIndex.module.css';

registerGsap();

type Props = {
  filter: 'all' | LabCategory;
  onFilter: (next: 'all' | LabCategory) => void;
  onSelect: (exp: LabExperiment) => void;
};

export function LabIndex({ filter, onFilter, onSelect }: Props) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [previewSrc, setPreviewSrc] = useState('');
  const [previewOn, setPreviewOn] = useState(false);

  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const shown = LAB_EXPERIMENTS.filter((item) => {
    const matchCat = filter === 'all' || item.tag === filter;
    const matchQuery = !q || `${item.title} ${item.category} ${item.tools.join(' ')} ${item.badge}`.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  // Batch reveal no scroll ao entrar na tela + follow do preview com quickTo
  useGSAP(() => {
    if (reduced || !listRef.current) return;

    const rows = gsap.utils.toArray<HTMLElement>(`.${styles.row}`, listRef.current);
    gsap.set(rows, { y: 18, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.04, ease: 'power3.out', overwrite: true }),
    });
  }, { dependencies: [reduced, filter, query], scope: root });

  useGSAP(() => {
    if (reduced || !previewRef.current || !listRef.current) return;
    if (!matchMedia('(pointer: fine)').matches) return;

    const px = gsap.quickTo(previewRef.current, 'x', { duration: 0.45, ease: 'power3.out' });
    const py = gsap.quickTo(previewRef.current, 'y', { duration: 0.45, ease: 'power3.out' });
    const listEl = listRef.current;

    const onMove = (e: PointerEvent) => {
      px(e.clientX + 28);
      py(e.clientY - 120);
    };
    listEl.addEventListener('pointermove', onMove);
    return () => listEl.removeEventListener('pointermove', onMove);
  }, { dependencies: [reduced], scope: root });

  return (
    <section id="index" ref={root} className={styles.section} aria-labelledby="index-title">
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <RedLabel>02 · THE INDEX</RedLabel>
          <h2 id="index-title" className={styles.heading}>Choose your next experiment.</h2>
        </div>
        <span className={styles.count} aria-live="polite">
          {String(shown.length).padStart(2, '0')} / {String(LAB_EXPERIMENTS.length).padStart(2, '0')} files
        </span>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters} role="group" aria-label="Filter experiments">
          {LAB_FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                className={[styles.chip, active && styles.chipActive].filter(Boolean).join(' ')}
                aria-pressed={active}
                onClick={() => onFilter(f.id)}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <label className={styles.search}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10" cy="10" r="6" />
            <path d="m15 15 5 5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find an experiment"
            aria-label="Search experiments by title or stack"
          />
        </label>
      </div>

      <ol ref={listRef} className={styles.list}>
        {shown.map((exp) => (
          <li key={exp.id} className={styles.row} data-testid="lab-row">
            <button
              type="button"
              className={styles.rowBtn}
              onClick={() => onSelect(exp)}
              onPointerEnter={() => { setPreviewSrc(exp.cover); setPreviewOn(true); }}
              onPointerLeave={() => setPreviewOn(false)}
            >
              <span className={styles.num}>{exp.number}</span>
              <Sfx entry={JP[exp.jpKey]} className={styles.jp} />
              <span className={styles.title}>{exp.title}</span>
              <span className={styles.meta}>
                <b>{exp.category}</b>
                <span>{exp.tools.join(' · ')}</span>
              </span>
              <span className={styles.tag}>
                <em>{exp.badge}</em>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {shown.length === 0 && (
        <p className={styles.empty}>No experiments match that search. Try another filter or keyword.</p>
      )}

      <div
        ref={previewRef}
        className={[styles.preview, previewOn && styles.previewOn].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        {previewSrc && <img src={previewSrc} alt="" />}
      </div>
    </section>
  );
}

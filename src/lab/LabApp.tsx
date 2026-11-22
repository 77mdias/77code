import { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type LabCategory, type LabExperiment } from '../content/lab.ts';
import { registerGsap, useLenis } from '../lib/motion.ts';
import { LabHeader } from './LabHeader.tsx';
import { LabHero } from './LabHero.tsx';
import { LabBoard } from './LabBoard.tsx';
import { LabIndex } from './LabIndex.tsx';
import { LabClosing } from './LabClosing.tsx';
import { LabInspector } from './LabInspector.tsx';

registerGsap();

export function LabApp() {
  const [filter, setFilter] = useState<'all' | LabCategory>('all');
  const [selected, setSelected] = useState<LabExperiment | null>(null);

  useLenis();

  useEffect(() => {
    document.documentElement.dataset.loaded = 'true';
    let alive = true;
    let width = innerWidth;
    let t = 0;
    const onResize = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        if (innerWidth === width) return;
        width = innerWidth;
        ScrollTrigger.refresh();
      }, 200);
    };
    addEventListener('resize', onResize);
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; clearTimeout(t); removeEventListener('resize', onResize); };
  }, []);

  return (
    <>
      <LabHeader />
      <main>
        <LabHero />
        <LabBoard filter={filter} onSelect={setSelected} />
        <LabIndex filter={filter} onFilter={setFilter} onSelect={setSelected} />
      </main>
      <LabClosing />
      <LabInspector experiment={selected} onClose={() => setSelected(null)} />
    </>
  );
}

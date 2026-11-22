import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Stamp } from '../ui/Stamp.tsx';
import { frameUrl, loadImage } from '../lib/frames.ts';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './Loading.module.css';

registerGsap();

// Rede lenta não segura a página: depois disso a abertura entra com o que tiver.
const CAP_MS = 2500;

export function Loading({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);
  const shown = useRef({ value: 0 });

  useEffect(() => {
    const mobile = matchMedia('(max-width: 767px)').matches;
    const tasks = [
      loadImage('/static/opening/bg-1920.webp'),
      loadImage(frameUrl(reduced ? 40 : 1, mobile)),
      document.fonts.load('700 1em Humane'),
    ];
    let stop = false;
    let count = 0;
    let timer = 0;
    // Item que chega depois do teto não mexe mais no contador (voltaria de 100% e o tween acharia o nó já fora).
    const tick = () => { if (!stop) setPercent(Math.round((++count / tasks.length) * 100)); };
    const all = Promise.all(tasks.map((t) => t.catch(() => {}).then(tick)));
    const cap = new Promise((resolve) => { timer = window.setTimeout(resolve, CAP_MS); });
    Promise.race([all, cap]).then(() => {
      if (stop) return;
      stop = true;
      setPercent(100);
      document.documentElement.dataset.loaded = 'true';
      setDone(true);
      onDone();
    });
    return () => { stop = true; clearTimeout(timer); };
    // Roda uma vez: o loading só acontece na entrada.
  }, []);

  useEffect(() => {
    const t = gsap.to(shown.current, {
      value: percent, duration: reduced ? 0 : 0.4, ease: 'power3.out',
      onUpdate: () => { counter.current!.textContent = `${Math.round(shown.current.value)}%`; },
    });
    return () => { t.kill(); };
  }, [percent, reduced]);

  useGSAP(() => {
    if (!done) return;
    if (reduced) { setGone(true); return; }
    gsap.timeline({ onComplete: () => setGone(true) })
      .from(stamp.current, { scale: 1.8, opacity: 0, duration: 0.35, ease: 'back.out(2)' })
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'power2.inOut' }, '+=0.35');
  }, { dependencies: [done], scope: root });

  if (gone) return null;
  return (
    <div ref={root} className={styles.loading} data-testid="loading" role="status">
      <span ref={counter} className={styles.counter}>0%</span>
      <p className={styles.note}>opening the file…</p>
      {done && <span ref={stamp} className={styles.stamp}><Stamp visible /></span>}
    </div>
  );
}

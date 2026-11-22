import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Stamp } from '../ui/Stamp.tsx';
import { BG_MOBILE, BG_SIZES, BG_SRC, BG_SRCSET, FRAME_COUNT, frameUrl, loadImage } from '../lib/frames.ts';
import { registerGsap, useReducedMotion } from '../lib/motion.ts';
import styles from './Loading.module.css';

registerGsap();

// Rede lenta não segura a página: depois disso a abertura entra com o que tiver.
const CAP_MS = 2500;

// Etiqueta no canto, por cima da abertura já visível: `frames` são os quadros 1–40 resolvidos;
// `onDone` avisa quando o essencial (fundo, quadro de entrada, Humane) chegou, com teto.
export function Loading({ frames, onDone }: { frames: number; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const percent = Math.round((frames / FRAME_COUNT) * 100);
  const done = percent >= 100;

  useEffect(() => {
    const mobile = matchMedia('(max-width: 767px)').matches;
    const tasks = [
      mobile ? loadImage(BG_MOBILE) : loadImage(BG_SRC, { srcset: BG_SRCSET, sizes: BG_SIZES }),
      loadImage(frameUrl(reduced ? FRAME_COUNT : 1, mobile)),
      document.fonts.load('700 1em Humane'),
    ];
    let stop = false;
    let timer = 0;
    const all = Promise.all(tasks.map((t) => t.catch(() => {})));
    const cap = new Promise((resolve) => { timer = window.setTimeout(resolve, CAP_MS); });
    Promise.race([all, cap]).then(() => {
      if (stop) return;
      stop = true;
      onDone();
    });
    return () => { stop = true; clearTimeout(timer); };
    // Roda uma vez: o loading só acontece na entrada.
  }, []);

  useGSAP(() => {
    if (!done) return;
    if (reduced) { setGone(true); return; }
    gsap.timeline({ onComplete: () => setGone(true) })
      .from(`.${styles.stamp}`, { scale: 2.4, opacity: 0, duration: 0.35, ease: 'back.out(2)' })
      .to(root.current, { opacity: 0, y: 8, duration: 0.4, ease: 'power2.in' }, '+=0.6');
  }, { dependencies: [done], scope: root });

  if (gone) return null;
  return (
    <div ref={root} className={styles.tag} data-testid="loading" role="status">
      opening the file… {percent}%
      {done && <span className={styles.stamp}><Stamp visible /></span>}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

let registered = false;
export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

// `query` tem que ser estável (constante): ela vira a assinatura do store.
export function useMedia(query: string) {
  const subscribe = useCallback((cb: () => void) => {
    const m = matchMedia(query);
    m.addEventListener('change', cb);
    return () => m.removeEventListener('change', cb);
  }, [query]);
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches);
}
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');

// Chamar uma vez (App): o Lenis anda no ticker do GSAP para o ScrollTrigger ver o mesmo scroll.
export function useLenis(): Lenis | null {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  useEffect(() => {
    if (reduced) return;
    registerGsap();
    const l = new Lenis();
    l.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    return () => { gsap.ticker.remove(tick); l.destroy(); setLenis(null); };
  }, [reduced]);
  return lenis;
}

const SCROLL_KEY = 'dias77:scrollY';

// Ao recarregar, o navegador devolve o scroll antes de os pins existirem (página ainda curta)
// e para no lugar errado. Guardamos a posição e voltamos quando o loading termina.
export function useScrollMemory(ready: boolean) {
  useEffect(() => {
    history.scrollRestoration = 'manual';
    const save = () => { try { sessionStorage.setItem(SCROLL_KEY, String(scrollY)); } catch { /* sem storage */ } };
    addEventListener('pagehide', save);
    return () => removeEventListener('pagehide', save);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    let y = 0;
    try { y = Number(sessionStorage.getItem(SCROLL_KEY)); sessionStorage.removeItem(SCROLL_KEY); } catch { /* sem storage */ }
    if (!y || (nav?.type !== 'reload' && nav?.type !== 'back_forward')) return;
    ScrollTrigger.refresh();
    scrollTo(0, y);
  }, [ready]);
}

type Draw =(ctx: CanvasRenderingContext2D, w: number, h: number) => void;

// `make` cria o desenho com o próprio estado; o laço só roda com o canvas na tela.
export function useCanvasLoop(make: () => Draw) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const draw = make();
    let raf = 0;
    const loop = () => { draw(ctx, canvas.width, canvas.height); raf = requestAnimationFrame(loop); };
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
    });
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(loop);
    });
    ro.observe(canvas);
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [make]);
  return ref;
}

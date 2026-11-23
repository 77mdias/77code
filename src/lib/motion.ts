import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

let registered = false;
export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // No celular a altura da janela só muda por causa do teclado ou da barra do navegador, e em vários
  // navegadores (os embutidos do Instagram e do WhatsApp, o Firefox) o teclado encolhe a janela. Recalcular
  // ali desmonta as cenas presas: o campo perde o foco (o teclado fecha) e a página vai parar em outra cena.
  // Por isso o resize é nosso: só de toque, apenas a largura (girar o aparelho) pede recálculo.
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
  let width = innerWidth;
  addEventListener('resize', () => {
    if (ScrollTrigger.isTouch === 1 && innerWidth === width) return;
    width = innerWidth;
    ScrollTrigger.refresh(true); // o recálculo de sempre, com a espera de 200 ms
  });
  // Um recálculo muda o comprimento dos pins e o ScrollTrigger devolve o mesmo pixel, que passa a cair em
  // outra cena. Acontece ao girar o aparelho e quando o teclado deixa a janela mais larga que alta: aí a
  // orientação troca e o GSAP recalcula por conta própria, sem passar pelo resize acima. A âncora guarda a
  // cena presa em que a pessoa está (e quanto dela já passou) e a rolagem volta para lá.
  let anchor: { pin: Element; at: number; past: number } | undefined;
  const lastPin = (ok: (t: ScrollTrigger) => boolean) =>
    ScrollTrigger.getAll().filter((t) => t.pin && ok(t)).sort((a, b) => b.start - a.start)[0];
  addEventListener('scroll', () => {
    const st = lastPin((t) => t.start <= scrollY);
    anchor = st && { pin: st.pin!, at: Math.min(1, (scrollY - st.start) / (st.end - st.start)), past: Math.max(0, scrollY - st.end) };
  }, { passive: true });
  ScrollTrigger.addEventListener('refresh', () => {
    const st = anchor && lastPin((t) => t.pin === anchor!.pin);
    if (st) scrollTo(0, st.start + (st.end - st.start) * anchor!.at + anchor!.past);
  });
  registered = true;
}

// Cena presa com campo de texto, no celular: o teclado sobe, o navegador rola a página para mostrar o
// campo e, quando o teclado desce, a página fica onde parou, com a cena cortada. Quando o teclado
// fecha, a cena volta ao fim do pin, inteira na tela. "Teclado na tela" = a área visível
// (visualViewport) está bem menor que a maior altura que já teve nesta largura; 150px separa o
// teclado (250px ou mais) da barra do navegador (uns 100px). Devolve a função que desliga.
export function settleAfterKeyboard(st: ScrollTrigger) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  const size = () => [vv.width * vv.scale, vv.height * vv.scale]; // vezes a escala: zoom de pinça não conta
  let [width, full] = size();
  let open = false;
  const onResize = () => {
    const [w, h] = size();
    if (w !== width) { [width, full, open] = [w, h, false]; return; } // girou o aparelho: mede de novo
    full = Math.max(full, h);
    const was = open;
    open = h < full - 150;
    if (!was || open) return;
    // No quadro seguinte: se a orientação trocou, o recálculo do GSAP vem logo depois deste evento.
    requestAnimationFrame(() => {
      const past = scrollY - st.end;
      if (past > 0 && past < (st.pin as HTMLElement).offsetHeight) scrollTo({ top: st.end, behavior: 'smooth' });
    });
  };
  vv.addEventListener('resize', onResize);
  return () => vv.removeEventListener('resize', onResize);
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
    // allowNestedScroll: a roda do mouse rola o histórico do chat enquanto ele tem para onde ir e a página no resto.
    const l = new Lenis({ allowNestedScroll: true });
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

const navType = () => (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type;

// Recarregar (F5) recomeça do início: no topo, sem hash e sem ficha de projeto aberta (pedido do Jean).
// Só o voltar/avançar do navegador devolve a posição: ele a restauraria antes de os pins existirem
// (página ainda curta) e pararia no lugar errado, então guardamos e voltamos quando o loading termina.
export function useScrollMemory(ready: boolean) {
  useEffect(() => {
    history.scrollRestoration = 'manual';
    if (navType() === 'reload') {
      try { sessionStorage.removeItem(SCROLL_KEY); } catch { /* sem storage */ }
      history.replaceState(null, '', location.pathname + location.search);
      scrollTo(0, 0);
    }
    const save = () => { try { sessionStorage.setItem(SCROLL_KEY, String(scrollY)); } catch { /* sem storage */ } };
    addEventListener('pagehide', save);
    return () => removeEventListener('pagehide', save);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let y = 0;
    try { y = Number(sessionStorage.getItem(SCROLL_KEY)); sessionStorage.removeItem(SCROLL_KEY); } catch { /* sem storage */ }
    if (!y || navType() !== 'back_forward') return;
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

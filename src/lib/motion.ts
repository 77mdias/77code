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

// Cena presa com campo de texto, no celular. "Teclado na tela" = a área visível (visualViewport) está
// bem menor que a maior altura que já teve nesta largura; 150px separa o teclado (250px ou mais) da
// barra do navegador (uns 100px).
// - Com o teclado na tela, o campo em foco fica logo acima dele. No iPhone o teclado cobre a página sem
//   encolher a janela e o navegador nem sempre rola até o campo: quem digita não vê o que escreve. A cena
//   recebe em --kb-lift quantos px faltam para o campo aparecer e o CSS dela sobe o conteúdo esse tanto
//   (por posição, não por transform: o GSAP reescreve o transform dos elementos que anima).
// - Quando o teclado fecha, a página volta ao fim do pin, com a cena inteira na tela: o navegador não
//   desfaz a rolagem que fez para mostrar o campo.
// Devolve a função que desliga.
export function followKeyboard(st: ScrollTrigger) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  const pin = st.pin as HTMLElement;
  const size = () => [Math.round(vv.width * vv.scale), vv.height * vv.scale]; // vezes a escala: zoom de pinça não conta
  let [width, full] = size();
  let open = false;
  let used = false; // o teclado subiu para um campo desta cena
  let lift = 0;

  const place = () => {
    const field = open && pin.contains(document.activeElement) ? document.activeElement : null;
    if (field) used = true;
    // `lift` entra na conta porque o campo já está erguido esse tanto; 12px de respiro acima do teclado.
    const need = field ? lift + field.getBoundingClientRect().bottom + 12 - (vv.offsetTop + vv.height) : 0;
    const next = need > 0 && need < pin.offsetHeight ? need : 0; // mais que uma cena: a pessoa rolou para longe
    if (next !== lift) pin.style.setProperty('--kb-lift', `${(lift = next)}px`);
  };
  const onResize = () => {
    const [w, h] = size();
    const turned = w !== width;
    if (turned) [width, full] = [w, h]; // girou o aparelho: mede de novo
    full = Math.max(full, h);
    const settle = open && used && !turned;
    open = !turned && h < full - 150;
    place();
    if (open) return;
    used = false;
    // No quadro seguinte: se a orientação trocou, o recálculo do GSAP vem logo depois deste evento.
    if (settle) requestAnimationFrame(() => {
      const past = scrollY - st.end;
      if (past > 0 && past < pin.offsetHeight) scrollTo({ top: st.end, behavior: 'smooth' });
    });
  };
  // O campo muda de lugar quando a área visível anda, a página rola, o foco troca ou o GSAP recalcula.
  const onFocus = () => requestAnimationFrame(place); // depois da rolagem de foco da cena
  vv.addEventListener('resize', onResize);
  vv.addEventListener('scroll', place);
  addEventListener('scroll', place, { passive: true });
  pin.addEventListener('focusin', onFocus);
  ScrollTrigger.addEventListener('refresh', place);
  return () => {
    vv.removeEventListener('resize', onResize);
    vv.removeEventListener('scroll', place);
    removeEventListener('scroll', place);
    pin.removeEventListener('focusin', onFocus);
    ScrollTrigger.removeEventListener('refresh', place);
    pin.style.removeProperty('--kb-lift');
  };
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

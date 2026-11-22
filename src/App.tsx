import { useEffect, useState, type ComponentType } from 'react';
import { Loading } from './scenes/Loading.tsx';
import { Opening } from './scenes/Opening.tsx';
import { Footer } from './scenes/Footer.tsx';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis, useScrollMemory } from './lib/motion.ts';

const RELOAD_KEY = 'dias77:chunk-reload';

// Chunk que falha: uma nova tentativa e, se ainda falhar, uma recarga única (guardada no sessionStorage).
async function loadRest() {
  const get = () => import('./scenes/Rest.tsx');
  try { return (await get()).Rest; } catch { /* tenta de novo */ }
  await new Promise((r) => setTimeout(r, 500));
  try { return (await get()).Rest; } catch { /* recarrega */ }
  try { if (!sessionStorage.getItem(RELOAD_KEY)) { sessionStorage.setItem(RELOAD_KEY, '1'); location.reload(); } } catch { /* sem storage */ }
  return null;
}

export function App() {
  const [loaded, setLoaded] = useState(false);
  const [frames, setFrames] = useState(0);
  const [Rest, setRest] = useState<ComponentType | null>(null);
  const lenis = useLenis();
  // A abertura do React já está no DOM, no lugar da casca estática: trocar não pisca.
  useEffect(() => { document.getElementById('shell')?.remove(); }, []);
  // O chunk das demais cenas baixa em paralelo ao loading; a marca de pronto e a volta do scroll esperam as duas coisas.
  useEffect(() => { void loadRest().then((r) => r && setRest(() => r)); }, []);
  const ready = loaded && Rest !== null;
  useEffect(() => { if (ready) document.documentElement.dataset.loaded = 'true'; }, [ready]);
  // Link direto (/#contact): as cenas só existem depois do chunk. Antes do useScrollMemory, que vence numa recarga.
  useEffect(() => {
    if (!ready || !location.hash) return;
    let id: string;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; } // hash malformado (/#%): ignora
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.refresh();
    // Cena presa: o topo é o começo da animação (quase vazia); o fim do pin tem a cena inteira.
    const pin = ScrollTrigger.getAll().find((t) => t.pin === el);
    scrollTo(0, pin ? pin.end : el.getBoundingClientRect().top + scrollY);
  }, [ready]);
  useScrollMemory(ready);
  return (
    <>
      <Loading frames={frames} onDone={() => setLoaded(true)} />
      <main>
        <Opening ready={loaded} onFrames={setFrames} />
        {Rest && <Rest />}
      </main>
      <Footer lenis={lenis} />
    </>
  );
}

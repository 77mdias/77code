import { useEffect, useState, type ComponentType } from 'react';
import { Header } from './scenes/Header.tsx';
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
  const [Rest, setRest] = useState<ComponentType | null>(null);
  const lenis = useLenis();
  // O chunk das demais cenas baixa em paralelo ao loading; a marca de pronto e a volta do scroll esperam as duas coisas.
  useEffect(() => { void loadRest().then((r) => r && setRest(() => r)); }, []);
  useEffect(() => { if (loaded) document.getElementById('shell')?.remove(); }, [loaded]);
  const ready = loaded && Rest !== null;
  useEffect(() => { if (ready) document.documentElement.dataset.loaded = 'true'; }, [ready]);
  // Link direto (/#contact): as cenas só existem depois do chunk. Antes do useScrollMemory, que vence numa recarga.
  useEffect(() => {
    if (!ready || !location.hash) return;
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!el) return;
    ScrollTrigger.refresh();
    scrollTo(0, el.getBoundingClientRect().top + scrollY);
  }, [ready]);
  useScrollMemory(ready);
  return (
    <>
      <Header lenis={lenis} />
      <Loading onDone={() => setLoaded(true)} />
      <main>
        <Opening ready={loaded} />
        {Rest && <Rest />}
      </main>
      <Footer />
    </>
  );
}

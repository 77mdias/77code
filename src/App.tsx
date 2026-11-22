import { useEffect, useState, type ComponentType } from 'react';
import { Header } from './scenes/Header.tsx';
import { Loading } from './scenes/Loading.tsx';
import { Opening } from './scenes/Opening.tsx';
import { Footer } from './scenes/Footer.tsx';
import { useLenis, useScrollMemory } from './lib/motion.ts';

export function App() {
  const [loaded, setLoaded] = useState(false);
  const [Rest, setRest] = useState<ComponentType | null>(null);
  const lenis = useLenis();
  // O chunk das demais cenas baixa em paralelo ao loading; a marca de pronto e a volta do scroll esperam as duas coisas.
  useEffect(() => { void import('./scenes/Rest.tsx').then((m) => setRest(() => m.Rest)); }, []);
  const ready = loaded && Rest !== null;
  useEffect(() => { if (ready) document.documentElement.dataset.loaded = 'true'; }, [ready]);
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

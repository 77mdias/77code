import { useState } from 'react';
import { Header } from './scenes/Header.tsx';
import { Loading } from './scenes/Loading.tsx';
import { Opening } from './scenes/Opening.tsx';
import { Cases } from './scenes/Cases.tsx';
import { Profile } from './scenes/Profile.tsx';
import { FloraStudio } from './scenes/FloraStudio.tsx';
import { NextEpisode } from './scenes/NextEpisode.tsx';
import { Footer } from './scenes/Footer.tsx';
import { useLenis, useScrollMemory } from './lib/motion.ts';

export function App() {
  const [loaded, setLoaded] = useState(false);
  useLenis();
  useScrollMemory(loaded);
  return (
    <>
      <Header />
      <Loading onDone={() => setLoaded(true)} />
      <main>
        <Opening ready={loaded} />
        <Cases />
        <Profile />
        <FloraStudio />
        <NextEpisode />
      </main>
      <Footer />
    </>
  );
}

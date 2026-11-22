import { useEffect } from 'react';
import { Header } from './scenes/Header.tsx';
import { Loading } from './scenes/Loading.tsx';
import { Opening } from './scenes/Opening.tsx';
import { Cases } from './scenes/Cases.tsx';
import { Profile } from './scenes/Profile.tsx';
import { FloraStudio } from './scenes/FloraStudio.tsx';
import { NextEpisode } from './scenes/NextEpisode.tsx';
import { Footer } from './scenes/Footer.tsx';

export function App() {
  // Sem tela de loading ainda (Task 3): a página já nasce carregada.
  useEffect(() => { document.documentElement.dataset.loaded = 'true'; }, []);
  return (
    <>
      <Header />
      <Loading />
      <main>
        <Opening />
        <Cases />
        <Profile />
        <FloraStudio />
        <NextEpisode />
      </main>
      <Footer />
    </>
  );
}

import { Cases } from './Cases.tsx';
import { Profile } from './Profile.tsx';
import { FloraStudio } from './FloraStudio.tsx';
import { NextEpisode } from './NextEpisode.tsx';

// Tudo abaixo da abertura: vem num chunk à parte para o primeiro quadro não esperar esse JS.
export function Rest() {
  return (
    <>
      <Cases />
      <Profile />
      <FloraStudio />
      <NextEpisode />
    </>
  );
}

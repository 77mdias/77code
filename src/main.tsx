import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/special-elite/latin-400.css';
import '@fontsource/familjen-grotesk/latin-400.css';
import '@fontsource/familjen-grotesk/latin-600.css';
import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/fonts.css';
import './styles/global.css';
import { App } from './App.tsx';

// A casca estática do index.html (quadro 1 + loading) precisa pintar antes de o React trocá-la; senão ela nunca vira o LCP.
// Espera o quadro decodificar (no máximo 0,2 s, para o teto do loading de 2,5 s continuar valendo) e um quadro pintado.
const shellImg = document.querySelector<HTMLImageElement>('#shell img');
const shellReady = shellImg ? Promise.race([shellImg.decode().catch(() => {}), new Promise((r) => setTimeout(r, 200))]) : Promise.resolve();
// rAF + timeout: o render só começa depois de o quadro com a casca ter sido pintado.
void shellReady.then(() => requestAnimationFrame(() => setTimeout(() => {
  createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
  // Fica um instante sob o loading do React: removida na hora, a casca perderia a vez de ser o LCP.
  setTimeout(() => document.getElementById('shell')?.remove(), 600);
})));

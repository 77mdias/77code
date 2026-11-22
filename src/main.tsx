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

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

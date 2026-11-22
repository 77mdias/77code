import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Em dev/preview, `/77codelab` (sem barra) entrega `77codelab/index.html` sem afetar `/lab/` (que continua 404).
function labTrailingSlash(): Plugin {
  const rewrite = (req: { url?: string }, next: () => void) => {
    if (req.url === '/77codelab') req.url = '/77codelab/';
    next();
  };
  return {
    name: 'lab-route-rewrite',
    configureServer: (server) => { server.middlewares.use((req, _res, next) => rewrite(req, next)); },
    configurePreviewServer: (server) => { server.middlewares.use((req, _res, next) => rewrite(req, next)); },
  };
}

export default defineConfig({
  plugins: [react(), labTrailingSlash()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        lab: resolve(import.meta.dirname, '77codelab/index.html'),
      },
    },
  },
});

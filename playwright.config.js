import { defineConfig } from '@playwright/test';

// Sem PLAYWRIGHT_BASE_URL, sobe o site local; com ela, testa um endereço publicado.
const external = process.env.PLAYWRIGHT_BASE_URL;
const local = { url: 'http://localhost:8778', command: 'pnpm cf:dev' };

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: external || local.url },
  webServer: external ? undefined : { command: local.command, url: local.url, reuseExistingServer: true, timeout: 120_000 },
});

# 77code em Vite + Cloudflare — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar o site adaptado (hoje rodando pelo `serve.py` da captura) para um repo Vite novo em `~/projects/77code`, publicado na Cloudflare em `77code.com.br`, com o mesmo visual e comportamento.

**Architecture:** Vite sem framework: o `index.html`, o CSS e o JS atuais viram `index.html`, `src/style.css` e `src/main.js`; GSAP e Lenis saem do CDN e vêm do npm; imagens e vídeos ficam em `public/static/` com os mesmos caminhos `/static/...`. A Cloudflare serve o `dist/` como Workers static assets (sem código de Worker), com cabeçalhos em `public/_headers`.

**Tech Stack:** Vite 8, `gsap@3.12.2`, `@studio-freight/lenis@1.0.19`, Wrangler 4, Playwright (e2e), `node:test` (checagens), Node 24, pnpm, Docker Compose no dev.

**Spec:** `docs/superpowers/specs/2026-11-21-77code-vite-cloudflare-design.md` (copiada para o repo novo na Task 1).

**Origem (só leitura):** `SRC=~/Documentos/design-systems-of-web/tenztan.inweb.work/77mdias.inweb/site/www.77code.com.br`
- `index__q3e426d17.html` → página
- `static/css/style__qfd93e13c.css` → CSS (com os blocos "TEMA ESCURO" no fim)
- `static/js/app__qfd93e13c.js` → JS (com `CHAT_ENABLED = false`)

## Global Constraints

- Versões **exatas** no `package.json` (sem `^`): `pnpm add -E`.
- Docs, textos de UI novos e commits em português do Brasil, estilo `feat:` / `fix:` / `chore:` / `docs:` / `test:` / `ci:`.
- Node 24, pnpm. Dev em Docker na porta **5177**.
- Nenhum `.env` com valores no disco.
- O visual e as animações não mudam: nenhuma tarefa reescreve o JS além do que ela diz.
- `CHAT_ENABLED` continua `false`; nenhuma requisição para `/api/chat`.
- Nenhum arquivo com espaço no nome dentro de `public/`.
- Nenhuma ocorrência de `tenztan`, `tanmay` ou `premee` (sem diferenciar maiúsculas) em `index.html` e `src/`.

## Review Focus

1. **Celular (≤ 768 px):** o chat fica embaixo, a personagem aparece (`object-position: 30% 15%`) e não há erro de console. Teste na Task 2 (viewport 390×844).
2. **CSP bloqueando algo que funcionava:** fontes do Google, o POST do formulário para `api.web3forms.com`, estilos inline do HTML. Qualquer bloqueio vira erro de console. Teste na Task 5 (sem erros de console sob `wrangler dev`, e o POST do formulário passa com a rota interceptada).
3. **Caminho quebrado silencioso:** referência a `/static/...` que não existe (como o `back1.jpg` de hoje) ou arquivo que ficou fora do `public/`. Teste na Task 4 (`check-assets`).
4. **Rota inexistente devolvendo a home:** `/lab/` (botão LAB) precisa dar 404 de verdade, não a página inicial disfarçada. Teste na Task 5.
5. **Imagem trocada que não aparece por cache:** `/static/*` não tem hash no nome. Cache curto (1 dia) para `/static/*` e longo só para `/assets/*` (com hash). Teste na Task 5 (cabeçalho `Cache-Control`).

---

### Task 1: Arquivar o portfólio Next.js e abrir o repo novo

**Files:**
- Create: `~/backups/77code-nextjs-2026-11-21.bundle`
- Move: `~/projects/77code` → `~/projects/_arquivo/77code-nextjs`
- Create: `~/projects/77code/` (git novo), `docs/superpowers/specs/2026-11-21-77code-vite-cloudflare-design.md`, `docs/superpowers/plans/2026-11-21-77code-vite-cloudflare.md`

**Interfaces:**
- Produces: repo vazio em `~/projects/77code`, branch `main`, com a spec e este plano.

- [ ] **Step 1: Backup completo do repo antigo (todas as branches e tags)**

```bash
mkdir -p ~/backups ~/projects/_arquivo
git -C ~/projects/77code bundle create ~/backups/77code-nextjs-2026-11-21.bundle --all
git bundle verify ~/backups/77code-nextjs-2026-11-21.bundle
```
Expected: `... is okay`.

- [ ] **Step 2: Conferir que não há trabalho só local** — `git -C ~/projects/77code status --short` vazio ou o Jean decide o que fazer com cada arquivo (o redesign de 2026-11-14 ficou **sem commit**: ver nota "Portfólio 77code" do vault). Não seguir sem a resposta dele.

- [ ] **Step 3: Mover a pasta antiga e criar o repo novo**

```bash
mv ~/projects/77code ~/projects/_arquivo/77code-nextjs
mkdir -p ~/projects/77code/docs/superpowers/{specs,plans} && cd ~/projects/77code && git init -b main
cp "$SRC/../../docs/superpowers/specs/2026-11-21-77code-vite-cloudflare-design.md" docs/superpowers/specs/
cp "$SRC/../../docs/superpowers/plans/2026-11-21-77code-vite-cloudflare.md" docs/superpowers/plans/
```

- [ ] **Step 4: Commit** — `git add -A && git commit -m "docs: spec e plano da migração para Vite + Cloudflare"`

> O repo do GitHub **não** é apagado aqui. Isso só acontece na Task 8, depois do domínio novo no ar.

---

### Task 2: Projeto Vite rodando o site como está (ainda com o CDN)

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/style.css`, `src/main.js`, `public/static/**`, `compose.yaml`, `playwright.config.js`, `tests/e2e/smoke.spec.js`, `.gitignore`, `CLAUDE.md`, `README.md`

**Interfaces:**
- Produces: scripts `pnpm dev` (5177), `pnpm build` (→ `dist/`), `pnpm preview` (4177), `pnpm test:e2e`; `playwright.config.js` lê `PLAYWRIGHT_BASE_URL` (padrão `http://localhost:4177`) e só sobe servidor quando ela não está definida.

- [ ] **Step 1: Instalar as ferramentas** — `pnpm init`, depois `pnpm add -E -D vite@8 @playwright/test` e `pnpm exec playwright install chromium`. Em `package.json`: `"type": "module"`, `"engines": { "node": ">=24" }`, scripts acima.

- [ ] **Step 2: Escrever o teste que falha** — `tests/e2e/smoke.spec.js`:

```js
import { test, expect } from '@playwright/test';

function watch(page) {
  const errors = [], bad = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(String(e)));
  page.on('response', r => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`));
  return { errors, bad };
}

for (const vp of [{ name: 'desktop', width: 1366, height: 768 }, { name: 'celular', width: 390, height: 844 }]) {
  test(`carrega sem erro nem 404 (${vp.name})`, async ({ page }) => {
    await page.setViewportSize(vp);
    const w = watch(page);
    await page.goto('/');
    await expect(page).toHaveTitle('DIAS77');
    await expect(page.locator('#character-sequence')).toHaveAttribute('src', /\/static\/frames2\/Image1\.webp/);
    await page.waitForTimeout(4000); // loader termina
    expect(w.errors).toEqual([]);
    expect(w.bad).toEqual([]);
  });
}
```

- [ ] **Step 3: Rodar e ver falhar** — `pnpm test:e2e` → FAIL (não existe `index.html`).

- [ ] **Step 4: Trazer o site**
  - `index.html` ← `$SRC/index__q3e426d17.html`, trocando `/static/css/style.css?v=…` por `/src/style.css` e o `<script defer src="/static/js/app.js?v=…">` por `<script type="module" src="/src/main.js"></script>` no fim do `<body>`. Tirar o `<link rel="preload">` do CSS. Os 4 `<script>` do CDN ficam por enquanto.
  - `src/style.css` ← `$SRC/static/css/style__qfd93e13c.css`; `src/main.js` ← `$SRC/static/js/app__qfd93e13c.js`, sem mudar nada além do que esta tarefa diz.
  - `public/static/` ← só os arquivos referenciados (a lista sai do comando abaixo), **renomeando** `hero/Image 1.webp` → `hero/image-1.webp`, `hero/Image 3.webp` → `hero/image-3.webp`, `hero/Image 4.webp` → `hero/image-4.webp` e trocando as referências no HTML e no CSS. Fora: `chat kiko generation/`, `*-unsplash.jpg`, `kling_*.mp4`, `frames2/euu-semmarca.mp4`, `diarios-de-uma-apotecaria-4.png`, `ateliesys.png`, `criptenv.png`, `img_v1.webp`, `img_6.webp`, `v07.webp`, `labmobile.webp`, `yumiko/`, `nightlyte/`.
  - Como a JS monta `/static/frames2/Image${i}.webp`, os 40 quadros entram todos.
  - `#project-modal::before` aponta para `/static/back1.jpg`, que nunca existiu: apagar essa regra `background` no CSS.

- [ ] **Step 5: `compose.yaml`** — serviço `web` com `node:24-alpine`, `corepack enable`, `pnpm install --frozen-lockfile && pnpm dev --host 0.0.0.0 --port 5177`, porta `5177:5177`, volume do repo e `develop.watch` (sync de `src/`, `public/`, `index.html`; rebuild em `package.json`).

- [ ] **Step 6: Rodar e ver passar** — `pnpm test:e2e` → PASS nos dois viewports. Conferir à mão `docker compose up` → `http://localhost:5177` com a hero e o scroll funcionando.

- [ ] **Step 7: `CLAUDE.md` e `README.md`** — comandos (`docker compose up`, `pnpm test:e2e`, `pnpm run deploy`), as invariantes deste plano (Global Constraints) e "não editar o visual sem conferir no navegador".

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: site em Vite com os arquivos da adaptação"`

---

### Task 3: GSAP e Lenis pelo npm, sem CDN

**Files:**
- Modify: `index.html` (tirar os 4 `<script>` do cdnjs/jsdelivr), `src/main.js` (imports no topo), `package.json`
- Test: `tests/e2e/smoke.spec.js`

**Interfaces:**
- Consumes: `smoke.spec.js` / `watch()` da Task 2.
- Produces: `src/main.js` como módulo ES que importa `gsap`, `ScrollTrigger`, `ScrollToPlugin` e `Lenis`.

- [ ] **Step 1: Testes que falham**

```js
test('não busca nada em CDN nem no domínio do autor', async ({ page }) => {
  const hosts = [];
  page.on('request', r => hosts.push(new URL(r.url()).host));
  await page.goto('/');
  await page.waitForTimeout(3000);
  expect(hosts.filter(h => /cdnjs|jsdelivr|tenztan/.test(h))).toEqual([]);
});

test('a hero troca de quadro ao rolar', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await page.waitForTimeout(4000);
  await page.mouse.wheel(0, 2500);
  await page.waitForTimeout(1500);
  await expect(page.locator('#character-sequence')).not.toHaveAttribute('src', /Image1\.webp$/);
});
```

- [ ] **Step 2: Rodar** — o primeiro FAIL (CDN ainda no HTML); o segundo deve passar já (é a rede de segurança para o próximo passo).

- [ ] **Step 3: Implementar** — `pnpm add -E gsap@3.12.2 @studio-freight/lenis@1.0.19`; no topo de `src/main.js`:

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Lenis from '@studio-freight/lenis';
```
O resto do arquivo não muda (o `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)` já existe). O script antigo esperava `DOMContentLoaded`; módulo já roda depois do parse, então manter o listener como está funciona.

- [ ] **Step 4: Rodar e ver passar** — `pnpm test:e2e` → PASS (os 4 testes).

- [ ] **Step 5: Commit** — `git commit -am "feat: GSAP e Lenis pelo npm, sem CDN"`

---

### Task 4: Checagem de arquivos estáticos e de restos do autor original

**Files:**
- Create: `scripts/check-assets.mjs`, `tests/check-assets.test.mjs`
- Modify: `package.json` (`"test": "node --test tests/*.test.mjs"`, `"check": "pnpm test && pnpm test:e2e"`)

**Interfaces:**
- Produces: `export function collectRefs(texts: string[]): Set<string>` (caminhos `/static/...`, expandindo `Image${i}` para 1..40), `export function audit(root: string): { missing: string[], unused: string[], spaced: string[], bytes: number, leftovers: string[] }`.

- [ ] **Step 1: Testes que falham** — `tests/check-assets.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audit, collectRefs } from '../scripts/check-assets.mjs';

test('expande os quadros da hero', () => {
  const r = collectRefs(['img.src = `/static/frames2/Image${i}.webp`;']);
  assert.equal(r.size, 40);
  assert.ok(r.has('/static/frames2/Image40.webp'));
});
test('lê caminhos com aspas, url() e query', () => {
  const r = collectRefs([`url('/static/hero/image-1.webp')`, `src="/static/logo.webp?v=2"`]);
  assert.deepEqual([...r].sort(), ['/static/hero/image-1.webp', '/static/logo.webp']);
});
test('o repo está limpo', () => {
  const a = audit(process.cwd());
  assert.deepEqual(a.missing, []);
  assert.deepEqual(a.unused, []);
  assert.deepEqual(a.spaced, []);
  assert.deepEqual(a.leftovers, []);
  assert.ok(a.bytes < 12_000_000, `public/static com ${a.bytes} bytes`);
});
```

- [ ] **Step 2: Rodar e ver falhar** — `pnpm test` → FAIL (módulo não existe).

- [ ] **Step 3: Implementar `scripts/check-assets.mjs`** — lê `index.html`, `src/**/*.{js,css}`; `missing` = referências sem arquivo em `public/`; `unused` = arquivos em `public/static/` sem referência; `spaced` = nomes com espaço em `public/`; `leftovers` = linhas com `/tenztan|tanmay|premee/i` em `index.html` e `src/`; `bytes` = soma de `public/static/`. Rodado direto (`node scripts/check-assets.mjs`), imprime o relatório e sai com código 1 se algo vier preenchido.

- [ ] **Step 4: Rodar e ver passar** — `pnpm test` → PASS. Se `unused` ou `missing` acusar algo, corrigir os arquivos (não o teste).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "test: checagem de arquivos estáticos e de restos do autor original"`

---

### Task 5: Cloudflare local: wrangler, cabeçalhos, 404 e chat bloqueado

**Files:**
- Create: `wrangler.jsonc`, `public/_headers`
- Modify: `package.json` (`"deploy": "vite build && wrangler deploy"`, `"cf:dev": "vite build && wrangler dev --port 8787"`), `playwright.config.js` (servidor padrão passa a ser `pnpm cf:dev` em `http://localhost:8787`)
- Test: `tests/e2e/cloudflare.spec.js`

**Interfaces:**
- Consumes: `watch()` da Task 2 (exportar de `tests/e2e/helpers.js`).
- Produces: `wrangler.jsonc` com `name: "77code"`, `compatibility_date: "2026-11-21"`, `assets: { "directory": "./dist" }` (sem `not_found_handling`: 404 de verdade), `workers_dev: true`.

- [ ] **Step 1: Testes que falham** — `tests/e2e/cloudflare.spec.js`:

```js
import { test, expect } from '@playwright/test';
import { watch } from './helpers.js';

test('cabeçalhos de segurança e cache', async ({ request }) => {
  const home = await request.get('/');
  const h = home.headers();
  expect(h['content-security-policy']).toContain("default-src 'self'");
  expect(h['content-security-policy']).toContain('https://api.web3forms.com');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['strict-transport-security']).toContain('max-age=31536000');
  const frame = await request.get('/static/frames2/Image1.webp');
  expect(frame.headers()['cache-control']).toBe('public, max-age=86400');
});

test('rota inexistente dá 404', async ({ request }) => {
  expect((await request.get('/lab/')).status()).toBe(404);
});

test('chat responde o aviso local e não chama /api/chat', async ({ page }) => {
  const calls = [];
  page.on('request', r => r.url().includes('/api/chat') && calls.push(r.url()));
  await page.goto('/');
  await page.evaluate(() => {
    document.getElementById('chat-input').value = 'oi';
    document.getElementById('chat-send-btn').click();
  });
  await expect(page.locator('#chat-messages .msg-bot').last()).toContainText("I'm still being set up");
  expect(calls).toEqual([]);
});

test('formulário de contato chega ao Web3Forms sem bloqueio de CSP', async ({ page }) => {
  const w = watch(page);
  let posted = false;
  await page.route('https://api.web3forms.com/submit', r => { posted = true; r.fulfill({ json: { success: true } }); });
  await page.goto('/');
  await page.evaluate(() => {
    document.getElementById('c-name').value = 'Teste';
    document.getElementById('c-email').value = 'teste@example.com';
    document.getElementById('c-msg').value = 'Mensagem de teste';
    document.getElementById('contact-form').requestSubmit();
  });
  await expect.poll(() => posted).toBe(true);
  expect(w.errors).toEqual([]);
});
```

- [ ] **Step 2: Rodar e ver falhar** — `pnpm test:e2e` → FAIL (sem `wrangler.jsonc` / `_headers`).

- [ ] **Step 3: Implementar** — `pnpm add -E -D wrangler@4`; `wrangler.jsonc` como em Interfaces; `public/_headers`:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://api.web3forms.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
/static/*
  Cache-Control: public, max-age=86400
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```
(`'unsafe-inline'` em `style-src` é para os `style="..."` que já estão no HTML.)

- [ ] **Step 4: Rodar e ver passar** — `pnpm check` → PASS (node:test + todos os e2e, agora sob `wrangler dev`).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: config da Cloudflare, cabeçalhos de segurança e 404"`

---

### Task 6: Publicar no workers.dev com deploy automático

**Files:**
- Modify: `README.md` (seção "Deploy")

**Interfaces:**
- Consumes: `pnpm run deploy` e `PLAYWRIGHT_BASE_URL` (Tasks 2 e 5).
- Produces: URL `https://77code.<conta>.workers.dev` e deploy automático na `main`.

- [ ] **Step 1: Repo no GitHub** — o Jean cria `77mdias/77code-site` (nome provisório: o `77code` antigo ainda existe até a Task 8) e faz `git push -u origin main`.
- [ ] **Step 2: Primeiro deploy** — o Jean roda `pnpm exec wrangler login` (abre o navegador) e depois `pnpm run deploy`. Expected: a URL `*.workers.dev` no fim.
- [ ] **Step 3: Smoke contra o ar** — `PLAYWRIGHT_BASE_URL=https://77code.<conta>.workers.dev pnpm test:e2e` → PASS.
- [ ] **Step 4: Workers Builds** — no painel: Worker `77code` → Settings → Builds → conectar o repo, branch `main`, comando `pnpm run build`, deploy `pnpm exec wrangler deploy`. Conferir com um commit pequeno que o deploy dispara.
- [ ] **Step 5: Commit** — `git commit -am "docs: deploy na Cloudflare"`

---

### Task 7: Conteúdo antes de trocar o domínio

**Files:**
- Modify: `src/main.js` (`access_key` do Web3Forms), `index.html` (`og:image`, `og:url`, textos), `public/static/og.jpg` (novo)
- Test: `tests/check-assets.test.mjs`

- [ ] **Step 1: Teste que falha** — em `tests/check-assets.test.mjs`:

```js
test('metadados de compartilhamento', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /property="og:image" content="https:\/\/77code\.com\.br\/static\/og\.jpg"/);
  assert.match(html, /property="og:url" content="https:\/\/77code\.com\.br"/);
  assert.ok(existsSync('public/static/og.jpg'));
});
```
- [ ] **Step 2: Rodar e ver falhar** — `pnpm test` → FAIL.
- [ ] **Step 3: `og.jpg` 1200×630** — feito a partir do quadro 40 da hero sobre o fundo escuro, com o texto DIAS77; `og:image` e `og:url` apontando para `https://77code.com.br`. Rodar `pnpm test` → PASS.
- [ ] **Step 4: Chave do Web3Forms** — o Jean cria a chave dele em web3forms.com (o e-mail de destino é o dele) e ela entra no lugar da atual em `src/main.js`. A chave é pública por natureza (vai no navegador). Conferir com um envio real pelo site no `workers.dev`.
- [ ] **Step 5: Textos que ainda são do autor original** — o Jean decide e o código recebe: a frase japonesa da cena 2 (`フルスタックAIエンジニア / クリエイティブコーダー`), as categorias (`WEBGL 2.0 / AI ARCHITECTURE…`), `Koujitsu ~` e se o nome "Kiko" fica.
- [ ] **Step 6: Commit** — `git commit -am "feat: metadados, chave do formulário e textos finais"`

---

### Task 8: Domínio 77code.com.br e aposentar o antigo (manual, nesta ordem)

- [ ] **Step 1:** Zona `77code.com.br` na Cloudflare (Add a site, plano Free); no Registro.br, trocar os servidores DNS pelos dois da Cloudflare. Esperar o "Active" da zona.
- [ ] **Step 2:** Worker `77code` → Settings → Domains & Routes → Custom domain `77code.com.br` (e `www.77code.com.br`, com redirecionamento para o domínio sem `www`).
- [ ] **Step 3:** `PLAYWRIGHT_BASE_URL=https://77code.com.br pnpm test:e2e` → PASS. Testar no celular de verdade.
- [ ] **Step 4:** Só agora: na Vercel, remover o domínio e apagar o projeto do portfólio antigo; no GitHub, apagar o `77mdias/77code` antigo e renomear `77code-site` → `77code` (atualizar o remote local e o repo conectado no Workers Builds).
- [ ] **Step 5:** Vault: nota "Portfólio 77code" (stack, URL, repo, data), "Setup padrão de projeto" (variante Vite estático + Workers), [[Pendências]] e [[Decisões]].

---

## Depois deste plano (planos separados)

- Worker com a API do Claude para o chat (`CHAT_ENABLED = true`, resposta `{ reply, expression }`, chave como segredo no Worker).
- Atualizar GSAP/Lenis; servir as fontes localmente; versão em português.

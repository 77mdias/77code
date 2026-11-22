# Identidade própria do DIAS77 (React) — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever o 77code.com.br do zero em React com a identidade Case File 77 (mangá noir), sem nenhum código ou imagem do site de referência, mantendo o Worker da Flora, o deploy e os testes.

**Architecture:** Vite 8 + React 19 + TypeScript geram `dist/` como hoje; o Worker (`src/worker/`) continua servindo `/api/chat` e o resto é arquivo estático. Todo o texto fica em `src/content/`; cada cena é um componente em `src/scenes/`; os elementos visuais do DESIGN.md ficam em `src/ui/`; GSAP + ScrollTrigger (`@gsap/react`) e Lenis fazem o movimento. Lógica pura em `src/lib/*.ts`, testada com `node --test` (o Node 24 roda TypeScript sem build).

**Tech Stack:** React 19, TypeScript, Vite 8 + `@vitejs/plugin-react`, `gsap` + `@gsap/react`, `lenis`, `@fontsource/*`, Playwright, `node:test`, Cloudflare Workers (wrangler 4.166.0).

**Spec:** `docs/superpowers/specs/2026-11-22-identidade-dias77-design.md` · Sistema visual: `DESIGN.md` (leia os dois antes da Task 1).

## Global Constraints

- Branch `feat/identidade-dias77`; nada vai para a `main` sem o Jean aprovar o PR (Workers Builds publica a `main`).
- pnpm 11 com o `pnpm-workspace.yaml` do projeto; **versões exatas** (`pnpm add -E`); Node 24. Nunca instalar em `~/`.
- Nenhuma linha de `src/main.js`, `src/style.css` ou do `index.html` atual no resultado; nenhuma imagem sem origem em `design/CREDITS.md`.
- Fontes proibidas: Space Grotesk, Noto Serif JP, Noto Sans JP, Dancing Script, Kaushan Script. Textos proibidos no código: `tenztan`, `tanmay`, `premee`, `Tez_leaves`, `Tenz_leaves`, `kiko`.
- Humane: copiar `Humane-Bold.woff2` e `Humane-SemiBold.woff2` de `design/fonts/HUMANE Typeface/HUMANE Typeface/Web-TT/` para `public/fonts/` **sem alterar** (nem renomear o conteúdo, nem cortar subconjunto).
- CSP de `public/_headers` não muda: fontes e scripts só de `'self'` (mais Turnstile e Cloudflare Insights). Nada de CDN.
- Site em inglês (`<html lang="en">`); japonês só pela tabela do DESIGN.md §4, via componente `Sfx`.
- Contrato com o Worker não muda: `POST /api/chat` `{ messages, turnstileToken }` → `{ reply, expression }`; expressões `warm, explain, happy, thinking, shock, kind, return, aval_work`.
- `prefers-reduced-motion: reduce`: sem pin, sem parallax, sem chuva/poeira; quadro 40 parado; carimbos já visíveis.
- Comentários e mensagens de commit em português, curtos, só o porquê. Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Link do cabeçalho com cena presa no scroll:** clicar em "Cases" ou "Contact" tem que parar na seção certa mesmo com a abertura presa e o Lenis ativo (teste na Task 7).
2. **Recarregar no meio da página:** o navegador volta para a posição; a abertura não pode ficar num quadro errado nem a página quebrar (teste na Task 3).
3. **Girar o celular / redimensionar depois de carregar:** os pins do ScrollTrigger recalculam; nada de rolagem horizontal nem dossiê fora do lugar (teste na Task 4).
4. **Fonte que não carrega:** o título e o texto continuam legíveis com a fonte reserva (teste na Task 2).
5. **Resposta longa da Flora no celular:** o histórico rola dentro do painel e o campo de digitar continua visível (teste na Task 6).

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/content/cases.ts`, `profile.ts`, `contact.ts`, `jp.ts` | Todo o texto do site e o dicionário de japonês |
| `src/lib/frames.ts` | Quadro pedido pelo scroll → quadro carregado mais próximo |
| `src/lib/motion.ts` | `useReducedMotion`, `useLenis`, registro do ScrollTrigger |
| `src/ui/*.tsx` + `*.module.css` | Panel, Caption, RedLabel, Stamp, RedString, Typewriter, Sfx, InkButton |
| `src/scenes/*.tsx` + `*.module.css` | Loading, Opening, Eyecatch, CaseDossier, Cases, Profile, FloraStudio, NextEpisode, Header, Footer |
| `src/chat/useFloraChat.ts`, `turnstile.ts` | Chat da Flora portado (Turnstile, envio, histórico, erros) |
| `src/chat-history.js` | Fica como está (já testado) |
| `src/styles/tokens.css`, `fonts.css`, `global.css` | Tokens do DESIGN.md e `@font-face` |
| `src/App.tsx`, `src/main.tsx`, `index.html`, `vite.config.ts`, `tsconfig.json` | Casca do app |
| `scripts/make-images.py` | Gera os `.webp` da abertura, os quadros de 960px e o `og.jpg` |
| `design/CREDITS.md` | Origem e licença de cada fonte e imagem |

**Contrato de DOM para os testes (todas as tasks usam estes nomes):**
`html[data-loaded="true"]` quando o loading acaba · `[data-testid="loading"]` · `section#opening` com `h1` "DIAS77" e `img[data-testid="jean-frame"]` (src `/static/frames2/ImageN.webp` ou `/static/frames2/m/ImageN.webp`) · `section#cases` · `[data-testid="eyecatch"]` · `article[data-testid="case"]#case-<slug>` com `h2`, `[data-testid="stamp"]` e link "View the site" · `section#profile` · `section#flora` com `img[data-testid="flora"][data-expression]`, `form#chat-form`, `input#chat-input`, `[data-testid="chat-log"] > [data-from="flora"|"guest"]`, `#flora-turnstile`, `p.chat-privacy` · `section#contact` com `form#contact-form` (campos `name`, `email`, `message`) · `header` com links `#cases`, `#profile`, `#flora`, `#contact`.

---

### Task 1: Conteúdo do site em `src/content/`

Antes de apagar o código antigo, tirar dele o texto que é do Jean.

**Files:**
- Create: `src/content/cases.ts`, `src/content/profile.ts`, `src/content/contact.ts`, `src/content/jp.ts`
- Test: `tests/content.test.ts`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Produces:
  ```ts
  export type CaseFile = { slug: 'criptenv' | 'ateliesys' | 'lene-studio-beauty' | 'range77'; number: 1 | 2 | 3 | 4;
    name: string; theCase: string; clues: string[]; solution: string; stack: string[]; url: string | null;
    screenshot: { desktop: string; mobile: string } };
  export const CASES: readonly CaseFile[];
  export const PROFILE: { name: 'DIAS77'; role: 'Creative developer · Full cycle & AI'; about: string[];
    specialties: { title: 'Frontend & Product' | 'AI & Automation' | 'Backend & Infrastructure'; items: string[] }[];
    portrait: { src: '/static/hero/image-4.webp'; alt: string } };
  export const CONTACT: { email: 'jean.77mdiasdev@gmail.com'; whatsapp: 'https://wa.me/5518988125925';
    github: 'https://github.com/77mdias'; linkedin: 'https://linkedin.com/in/jeancmdias'; web3formsKey: string };
  export type JpEntry = { text: string; reading: string; meaning: string; decorative: boolean };
  export const JP: Record<'rain' | 'caseFile' | 'solved' | 'stampHit' | 'folderOpen' | 'nextEpisode' | 'partner', JpEntry>;
  ```
- `JP` com os valores exatos da tabela do DESIGN.md §4 (`rain`, `stampHit`, `folderOpen` são `decorative: true`; os outros `false`).
- `web3formsKey`: a chave que está hoje em `src/main.js` (`WEB3FORMS_KEY`).

- [ ] **Step 1: Escrever `tests/content.test.ts`** com estes testes:
  - `os 4 casos na ordem do site`: `CASES.map(c => c.slug)` igual a `['criptenv','ateliesys','lene-studio-beauty','range77']` e `number` igual a `[1,2,3,4]`.
  - `cada caso tem 2 a 4 pistas, stack e captura que existe`: `clues.length` entre 2 e 4; `stack.length >= 2`; `existsSync('public' + screenshot.desktop)` e `.mobile`.
  - `links dos casos são https ou null` (AtelieSys pode ser `null` se não houver site público — conferir `projectData`).
  - `nenhum preço no texto`: o JSON de `CASES`, `PROFILE` e `CONTACT` não casa `/R\$\s?\d|US\$\s?\d|\$\d/`.
  - `japonês com sentido`: toda entrada de `JP` tem `text`, `reading` e `meaning` não vazios e `text` tem caractere japonês (`/[぀-ヿ一-龯]/`).
  - `o perfil tem as três especialidades`: títulos exatamente `['Frontend & Product','AI & Automation','Backend & Infrastructure']`.
- [ ] **Step 2: Rodar e ver falhar.** Trocar o script `test` para `node --test tests/*.test.mjs tests/*.test.ts tests/worker/*.test.mjs` e rodar `pnpm test`. Esperado: FAIL, `Cannot find module '../src/content/cases.ts'`.
- [ ] **Step 3: Escrever os quatro arquivos.** Casos a partir de `projectData` em `src/main.js` (overview vira `theCase` + `solution`, details viram `clues` e `stack`), reescritos no formato THE CASE / THE CLUES / THE SOLUTION do DESIGN.md §9, em inglês. Especialidades a partir da cena 5 do `index.html` atual (só o que aparece nos casos). `about`: 21 anos, UNOESTE, Presidente Prudente, experiência de balcão de vendas (sem vida pessoal). Imports entre arquivos `.ts` com a extensão `.ts`.
- [ ] **Step 4: Rodar `pnpm test`.** Esperado: todos verdes (os testes antigos continuam passando).
- [ ] **Step 5: Commit** `feat: conteúdo do site novo em src/content`.

---

### Task 2: Casca em React, tokens, fontes e créditos

**Files:**
- Create: `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/styles/fonts.css`, `src/styles/global.css`, `src/ui/{Panel,Caption,RedLabel,Stamp,RedString,Typewriter,Sfx,InkButton}.tsx` (+ `.module.css`), `public/fonts/` (Humane Bold/SemiBold, Cabinet Grotesk 800), `design/CREDITS.md`, `tests/e2e/base.spec.ts`
- Replace: `index.html` (só casca: metas atuais de título, descrição, `og:*`, favicons; `<div id="root">`; `<noscript>` com nome, e-mail e GitHub)
- Delete: `src/main.js`, `src/style.css`, `tests/e2e/smoke.spec.js`; em `tests/check-assets.test.mjs`, o teste `a frase japonesa da cena 2…`
- Modify: `package.json`, `tests/e2e/helpers.js` (`waitLoader` → espera `html[data-loaded="true"]`), `scripts/check-assets.mjs` (lê `src/**/*.{ts,tsx,css}` e `index.html`; procura as fontes e textos proibidos das Global Constraints), `tests/check-assets.test.mjs` (`o repo está limpo` deixa de exigir `unused` vazio até a Task 8, porque os quadros, a Flora e as capturas só voltam a ser usados nas Tasks 3–6)
- `tsconfig.json`: `strict`, `jsx: react-jsx`, `noEmit`, `allowImportingTsExtensions` (os `.ts` se importam com extensão, para o `node --test` rodar sem build), `allowJs` (para `src/chat-history.js`).

**Interfaces:**
- Produces: `App` monta, nesta ordem, `Header`, `Loading`, `main > [Opening, Cases, Profile, FloraStudio, NextEpisode]`, `Footer`. Nesta task cada cena é um `<section id=…>` vazio com o título (a `Opening` já com o `h1` "DIAS77" no estilo do DESIGN.md); as tasks seguintes preenchem.
- Produces: componentes de `src/ui/` com estas props:
  `Panel({ as?, tone?: boolean, className?, children })`, `Caption({ children })`, `RedLabel({ children })`,
  `Stamp({ visible: boolean })` (texto "RESOLVED" + `JP.solved`), `RedString({ from: [number, number], to: [number, number][] })` (coordenadas em % do pai),
  `Typewriter({ label: string, children })`, `Sfx({ entry: JpEntry, className? })`, `InkButton({ href?, onClick?, type?, children })`.
- `Sfx`: `decorative` → `aria-hidden="true"`; senão `lang="ja"` e `aria-label={meaning}`.
- Dependências (versões exatas atuais): `react`, `react-dom`, `gsap` (a mais nova 3.x), `@gsap/react`, `lenis`, `@fontsource/reggae-one`, `@fontsource/special-elite`, `@fontsource/familjen-grotesk`; dev: `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`. Remover `@studio-freight/lenis`.
- Cabinet Grotesk: baixar o pacote oficial do Fontshare (pedir o OK do Jean antes do download) e copiar o `.woff2` 800 para `public/fonts/`.
- Script novo `typecheck`: `tsc --noEmit`; `check` passa a ser `pnpm typecheck && pnpm test && pnpm test:e2e`.

- [ ] **Step 1: Escrever `tests/e2e/base.spec.ts`:**
  - `carrega sem erro nem 404` (desktop 1440×900 e celular 390×844): `watch(page)` sem `errors` nem `bad`; `h1` com texto "DIAS77".
  - `não busca nada fora do site` (exceto Turnstile e Cloudflare Insights): nenhum host além do próprio, `challenges.cloudflare.com` e `static.cloudflareinsights.com`.
  - `sem fontes proibidas`: `document.fonts` sem nenhuma das famílias proibidas; `getComputedStyle(h1).fontFamily` começa com `Humane`.
  - `fonte que não carrega não some com o título` (Review Focus 4): `page.route('**/fonts/**', r => r.abort())`; `h1` visível com `boundingBox().height > 40`.
- [ ] **Step 2: Rodar `pnpm test:e2e tests/e2e/base.spec.ts`.** Esperado: FAIL (o site ainda é o antigo, sem `html[data-loaded]` e com Space Grotesk).
- [ ] **Step 3: Implementar a casca.** `@font-face` locais em `fonts.css` com `font-display: swap` e pilhas de reserva (`Humane, 'Arial Narrow', Impact, sans-serif`); `<link rel="preload">` só para `Humane-Bold.woff2`. Tokens exatamente como DESIGN.md §2 e §3. Enquanto não houver `Loading` (Task 3), o `App` marca `data-loaded="true"` ao montar.
- [ ] **Step 4: `design/CREDITS.md`** com cada fonte (nome, autor, licença, link) e cada imagem da spec §7.1.
- [ ] **Step 5: Rodar `pnpm check`.** Esperado: typecheck limpo; unit verdes; e2e verdes **exceto** os de chat e formulário em `tests/e2e/cloudflare.spec.js`, que dependem do DOM antigo: movê-los para `tests/e2e/legacy-chat.spec.js` com `test.describe.skip` e o comentário "reescritos nas Tasks 6 e 7". Cabeçalhos, CSP e 404 continuam valendo.
- [ ] **Step 6: Commit** `feat: casca em React com tokens, fontes e elementos do DESIGN.md`.

---

### Task 3: Loading e abertura (quadros no scroll, ambiente vivo)

**Files:**
- Create: `src/lib/frames.ts`, `src/lib/motion.ts`, `src/scenes/Loading.tsx`, `src/scenes/Opening.tsx`, `src/scenes/opening/{RainCanvas,DustCanvas}.tsx`, `scripts/make-images.py`, `public/static/opening/bg-1920.webp`, `bg-2752.webp`, `public/static/frames2/m/Image{1..40}.webp`
- Test: `tests/frames.test.ts`, `tests/e2e/opening.spec.ts`

**Interfaces:**
- Produces (`src/lib/frames.ts`):
  `frameForProgress(progress: number, count = 40): number` — 1-based, `progress` 0..1 com clamp.
  `nearestLoaded(requested: number, loaded: ReadonlySet<number>): number` — o carregado mais próximo; empate fica com o menor; conjunto vazio devolve 1.
- Produces (`src/lib/motion.ts`): `useReducedMotion(): boolean`; `useLenis(): Lenis | null` (uma instância, ligada ao ticker do GSAP e ao `ScrollTrigger.update`); `registerGsap()` (registra `ScrollTrigger` e `useGSAP` uma vez).
- Consumes: `JP.rain`, `JP.caseFile`, `PROFILE.role`, `Sfx`, `RedLabel`.
- Composição: a de `design/rascunhos/hero-vivo.html` (título em cima à esquerda, Jean à direita, ザアア… sobre a janela, rótulo vertical na borda direita, fumaça sobre a xícara). Valores de movimento: DESIGN.md §6.
- Pin: `ScrollTrigger` com `pin: true`, `end: '+=150%'`, `scrub: true`; `onUpdate` → `frameForProgress` → `nearestLoaded` → troca o `src` do `img[data-testid="jean-frame"]`. Celular (<768px) usa `/static/frames2/m/`.
- Loading: espera `bg-1920.webp`, `Image1.webp` e `document.fonts.load('700 1em Humane')`, teto 2,5s; depois põe `data-loaded="true"` no `<html>` e sai com o carimbo. Os quadros 2–40 baixam depois, em ordem.
- `scripts/make-images.py` (Pillow): fundo de `design/fundo-hero/delegacia-noir-gemini.jpeg` → webp 1920 e 2752 (qualidade 82); quadros de `public/static/frames2/` → 960px em `m/`; `og.jpg` 1200×630 (usado na Task 7). Roda com `python3 -I scripts/make-images.py`.

- [ ] **Step 1: `tests/frames.test.ts`:**
  `frameForProgress(0) === 1`, `(1) === 40`, `(0.5) === 21` (`Math.round(p*39)+1`), `(-1) === 1`, `(2) === 40`;
  `nearestLoaded(10, new Set([1,9,12])) === 9`, `nearestLoaded(10, new Set([8,12])) === 8` (empate → menor), `nearestLoaded(5, new Set()) === 1`, `nearestLoaded(7, new Set([7])) === 7`.
- [ ] **Step 2: `pnpm test`.** Esperado: FAIL, módulo não encontrado.
- [ ] **Step 3: Implementar `src/lib/frames.ts`; `pnpm test` verde.**
- [ ] **Step 4: `tests/e2e/opening.spec.ts`:**
  - `o loading termina em até 3s`: `html[data-loaded="true"]` em ≤ 3000ms (rota normal); com `page.route('**/frames2/**', r => setTimeout(() => r.continue(), 8000))` também ≤ 3000ms.
  - `o scroll vira o Jean`: depois do loading e de esperar `Image40.webp` carregar, rolar 0 → 75% da altura do pin muda o `src` de `jean-frame` de `Image1` para um número maior que 20; voltar ao topo traz `Image1`.
  - `recarregar no meio da página` (Review Focus 2): rolar até `#cases`, `page.reload()`, esperar o loading; sem erros (`watch`), `jean-frame` em `Image40` (ou no mais próximo carregado ≥ 30).
  - `menos movimento`: `emulateMedia({ reducedMotion: 'reduce' })`; `jean-frame` é `Image40`; `section#opening` não tem `pin-spacer` como pai; nenhum `canvas` animando (`RainCanvas` e `DustCanvas` não montam).
  - `japonês acessível`: o elemento ザアア… tem `aria-hidden="true"`; 事件ファイル・第七十七号 tem `lang="ja"` e `aria-label` "case file no. 77".
- [ ] **Step 5: Rodar o spec.** Esperado: FAIL (abertura vazia).
- [ ] **Step 6: Gerar as imagens com o script e implementar `Loading`, `Opening`, `RainCanvas`, `DustCanvas`, `motion.ts`.** Canvases pausam fora da tela (`IntersectionObserver`). Parallax de mouse só com `(pointer: fine)`; no toque, parallax leve de scroll.
- [ ] **Step 7: `pnpm check` verde. Captura da abertura (1440×900 e 390×844) em `test-results/` para mandar ao Jean.**
- [ ] **Step 8: Commit** `feat: abertura com os 40 quadros no scroll e cena viva`.

---

### Task 4: Eyecatch e os 4 dossiês

**Files:**
- Create: `src/scenes/Cases.tsx`, `src/scenes/Eyecatch.tsx`, `src/scenes/CaseDossier.tsx` (+ `.module.css`)
- Test: `tests/e2e/cases.spec.ts`

**Interfaces:**
- Consumes: `CASES`, `JP.folderOpen`, `JP.stampHit`, `Stamp`, `RedString`, `Typewriter`, `InkButton`, `useReducedMotion`.
- `Cases` renderiza, para cada caso, `Eyecatch({ number, name })` e `CaseDossier({ data: CaseFile })` dentro de `section#cases`.
- Eyecatch: tela cheia `--ink`, "CASE 0N" em Humane, nome em monospace; preso no scroll ~1 tela; corte de nanquim por `clip-path`.
- Dossiê (DESIGN.md §5): pasta abre (パサッ), folha com THE CASE / THE CLUES / THE SOLUTION em Special Elite, captura em cinza com clipe (`alt` = "Screenshot of <name>"), fio vermelho da prova até as etiquetas da stack, carimbo no fim (ドン). Link `InkButton` "View the site" com `target="_blank" rel="noopener noreferrer"` só se `url` não for `null`. Celular: coluna (folha, prova, etiquetas).

- [ ] **Step 1: `tests/e2e/cases.spec.ts`:**
  - `os 4 casos aparecem na ordem`: `article[data-testid="case"]` com ids `case-criptenv, case-ateliesys, case-lene-studio-beauty, case-range77` e `h2` com os nomes de `CASES`.
  - `o carimbo bate ao rolar até o fim do dossiê`: antes, `[data-testid="stamp"]` com opacidade < 0.1; depois de `scrollIntoView` do fim do artigo e 1,5s, opacidade > 0.9.
  - `eyecatch antes de cada caso`: 4 `[data-testid="eyecatch"]` com "CASE 01" a "CASE 04".
  - `links externos seguros`: todo `a[target="_blank"]` em `#cases` tem `rel` com `noopener`.
  - `menos movimento`: os 4 carimbos já visíveis sem rolar; eyecatch sem pin.
  - `redimensionar depois de carregar` (Review Focus 3): abrir em 1440×900, rolar até o caso 2, `setViewportSize(390×844)`, esperar 1s; `scrollWidth <= innerWidth`; `#case-ateliesys` com largura ≤ 390.
- [ ] **Step 2: Rodar.** Esperado: FAIL.
- [ ] **Step 3: Implementar.** `ScrollTrigger.refresh()` no `resize` com debounce de 200ms (o Lenis também recalcula).
- [ ] **Step 4: `pnpm check` verde; capturas de um dossiê aberto (desktop e celular).**
- [ ] **Step 5: Commit** `feat: eyecatch e dossiês dos 4 casos`.

---

### Task 5: Profile

**Files:**
- Create: `src/scenes/Profile.tsx` (+ `.module.css`)
- Test: `tests/e2e/profile.spec.ts`

**Interfaces:**
- Consumes: `PROFILE`, `Panel`, `RedLabel`, `Caption`.
- Ficha em papel: retrato em cor (`PROFILE.portrait`) recortado num `Panel`, `about` em Familjen, especialidades em três quadros com título em Cabinet Grotesk. Visual de ficha, texto normal (spec §5). Quadros entram na ordem de leitura com corte reto (DESIGN.md §6).

- [ ] **Step 1: `tests/e2e/profile.spec.ts`:** `section#profile` tem `img` com `alt` não vazio e src `image-4.webp`; os três títulos de especialidade na ordem; o texto contém "UNOESTE" e "Presidente Prudente"; no celular os três quadros empilham (`x` iguais).
- [ ] **Step 2: Rodar; FAIL.**
- [ ] **Step 3: Implementar.**
- [ ] **Step 4: `pnpm check` verde. Commit** `feat: seção profile`.

---

### Task 6: Estúdio da Flora com o chat em React

**Files:**
- Create: `src/chat/turnstile.ts`, `src/chat/useFloraChat.ts`, `src/scenes/FloraStudio.tsx` (+ `.module.css`)
- Test: `tests/e2e/flora.spec.ts`; Delete: os testes de chat de `tests/e2e/legacy-chat.spec.js`

**Interfaces:**
- Consumes: `toRequestMessages`, `floraErrorReply` de `src/chat-history.js`; `JP.partner`; `RedLabel`, `Panel`.
- Produces (`src/chat/turnstile.ts`): `getTurnstileToken(container: string): Promise<string>` — mesma lógica de hoje (`src/main.js` linhas 734–783 antes da Task 2; está no histórico do git): script `render=explicit`, `execution: 'execute'`, `appearance: 'interaction-only'`, `reset` antes de cada `execute`, prazo único de 15s cobrindo carregar + gerar, e reabrir o script na próxima tentativa se ele nunca carregou. Site key: `1x00000000000000000000BB` em `localhost`/`127.0.0.1`, senão `0x4AAAAAAGMqWO7gw7Me7Zju`.
- Produces (`src/chat/useFloraChat.ts`): `useFloraChat(): { messages: { from: 'flora' | 'guest'; text: string }[]; expression: string; pending: boolean; send(text: string): Promise<void> }` — mesma regra de hoje: ignora vazio e envio em andamento; > 1200 caracteres responde "Please keep your message under 1,200 characters."; `thinking` enquanto espera; `fetch('/api/chat')` com `AbortSignal.timeout(30_000)`; sucesso guarda o par no histórico e segura a expressão por `clamp(reply.length*50, 2500, 7000)`ms antes de voltar a `warm`; erro → `floraErrorReply(status)` com `shock` por 2,5s; falha do Turnstile → `floraErrorReply(403)`. Primeira fala da Flora: a mesma saudação do `index.html` atual.
- Cena: estúdio como hoje — `char_back3.webp` de fundo, `back2.webm` na janela (`autoplay loop muted playsinline`), Flora à esquerda em 85% com as 8 expressões (`img[data-testid="flora"][data-expression]`), chat à direita num `Panel` com `RedLabel` "PARTNER · 相棒" (`Sfx` com `JP.partner`), `#flora-turnstile`, `p.chat-privacy` "Messages are answered by Claude (Anthropic) and aren't stored.". Sem áudio.

- [ ] **Step 1: `tests/e2e/flora.spec.ts`** — portar, com o DOM novo e `page.route('**/api/chat', …)` simulado, os casos que hoje estão em `cloudflare.spec.js`: `a Flora responde e muda a expressão` (`data-expression` vira a do mock), `a segunda mensagem leva o histórico` (corpo do 2º POST tem 3 mensagens), `429 vira uma fala da Flora`, `não duplica o histórico com cliques rápidos`, `sem Turnstile a Flora avisa e o campo continua livre`, `aviso de privacidade aparece embaixo do chat`, `Turnstile pendurado não trava o chat`, `resposta que nunca chega vira fala de erro`. Novo (Review Focus 5): `resposta longa no celular` — 390×844, mock com `reply` de 3.500 caracteres; `[data-testid="chat-log"]` tem `scrollHeight > clientHeight` e `#chat-input` continua dentro da tela.
- [ ] **Step 2: Rodar; FAIL.**
- [ ] **Step 3: Implementar `turnstile.ts`, `useFloraChat.ts` e a cena.**
- [ ] **Step 4: `pnpm check` verde (os testes do Worker não mudam). Commit** `feat: estúdio da Flora com o chat em React`.

---

### Task 7: Próximo episódio, cabeçalho, rodapé, 404 e imagem de compartilhamento

**Files:**
- Create: `src/scenes/NextEpisode.tsx`, `Header.tsx`, `Footer.tsx` (+ `.module.css`), `public/og.jpg` (do script da Task 3)
- Replace: `public/404.html` ("CASE NOT FOUND", mesmo estilo, CSS embutido, link para `/`)
- Modify: `index.html` (`og:image` → `https://77code.com.br/og.jpg`)
- Test: `tests/e2e/contact.spec.ts`; Delete: `tests/e2e/legacy-chat.spec.js` (os de formulário viram os novos)

**Interfaces:**
- Consumes: `CONTACT`, `JP.nextEpisode`, `InkButton`, `useLenis`.
- Próximo episódio: tela `--ink`, "NEXT EPISODE · 次回予告", "Your project.", formulário com `name`, `email`, `message` → `POST https://api.web3forms.com/submit` com `access_key: CONTACT.web3formsKey` (estados do botão: "Sending…", "Sent", "Error — try again"); sem chave, abre `mailto:` como hoje. Links: e-mail, WhatsApp, GitHub, LinkedIn.
- Header: logo C7 (`/favicon.svg`) + "Cases · Profile · Flora · Contact"; no celular, só logo e "Contact". Clique usa `lenis.scrollTo('#id')` (com reduced motion, `scrollIntoView` sem animação).
- Footer: logo C7, "© DIAS77", os mesmos links.

- [ ] **Step 1: `tests/e2e/contact.spec.ts`:** portar `a CSP deixa o navegador falar com o Web3Forms` e `o formulário envia ao Web3Forms com a chave do Jean` (corpo com `access_key` igual a `CONTACT.web3formsKey`); `link do cabeçalho leva à seção` (Review Focus 1): na abertura (pin ativo), clicar "Contact" e, após 2s, `#contact` com `top` entre -10 e 120px; o mesmo para "Cases" saindo do contato; `og:image` aponta para `/og.jpg` e o arquivo responde 200; a 404 mostra "CASE NOT FOUND" e link para `/`.
- [ ] **Step 2: Rodar; FAIL.**
- [ ] **Step 3: Implementar.**
- [ ] **Step 4: `pnpm check` verde. Commit** `feat: contato como próximo episódio, cabeçalho, rodapé e 404`.

---

### Task 8: Limpeza, auditoria completa e entrega

**Files:**
- Delete: `public/static/hero/` exceto `image-4.webp`; `public/static/img_v2.jpg`, `public/static/og.jpg`, `public/static/rain.m4a`, `public/static/sound/`
- Modify: `scripts/check-assets.mjs` + `tests/check-assets.test.mjs` (volta a exigir zero arquivo sem uso; referências também em `.ts/.tsx`, incluindo os padrões `frames2/Image${i}` e `frames2/m/Image${i}`); `README.md`, `CLAUDE.md` do repo (stack nova, comandos, DESIGN.md)

- [ ] **Step 1: Ampliar o teste de auditoria:** `o repo está limpo` exige `missing`, `unused`, `spaced` e `leftovers` vazios; novo `toda fonte de public/fonts está em design/CREDITS.md`; novo `nenhuma fonte proibida no código`.
- [ ] **Step 2: `pnpm test`.** Esperado: FAIL listando os arquivos antigos sem uso.
- [ ] **Step 3: Apagar os arquivos e atualizar README/CLAUDE.md. `pnpm test` verde.**
- [ ] **Step 4: Verificação final:** `pnpm check` verde; `pnpm build` sem aviso de pacote > 500 KB; Lighthouse no celular contra `pnpm cf:dev` (ou a prévia do Workers Builds) com LCP ≤ 2,5s e CLS ≤ 0,1; capturas de todas as cenas em 1440×900 e 390×844 enviadas ao Jean.
- [ ] **Step 5: Commit** `chore: tira o que sobrou do site antigo e fecha a auditoria`; push da branch e PR para a `main` com as capturas. Não fazer merge: o Jean aprova.

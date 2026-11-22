# 77code — portfólio DIAS77

React 19 + TypeScript + Vite 8, identidade "Case File 77". Publicado na Cloudflare (Workers static assets + Worker em `src/worker/` para o chat da Flora). O histórico das decisões está em `docs/superpowers/` (spec e plano de 2026-11-22). **`DESIGN.md` é a fonte da verdade visual** (tokens, tipografia, japonês §4, elementos §5, movimento §6, texto §9); ler antes de mexer em UI.

## Comandos

| O quê | Comando |
|---|---|
| Dev (Vite, porta 5177) | `pnpm dev` (ou `docker compose up`) |
| Build | `pnpm build` (gera `dist/`) |
| Tipos | `pnpm typecheck` |
| Testes unitários + auditoria de arquivos | `pnpm test` (`node scripts/check-assets.mjs` mostra o relatório) |
| Testes no navegador | `pnpm test:e2e` (sobe o `cf:dev`) |
| Tudo | `pnpm check` |
| Como na Cloudflare (local, porta 8778) | `pnpm cf:dev` (build + `wrangler dev`; aplica `public/_headers`) |
| Publicar | `pnpm run deploy` |
| Imagens derivadas | `python3 -I scripts/make-images.py` (fundo da abertura, quadros em 960px, `public/og.jpg`) |

E2E contra um servidor seu em outra porta (a 8778 pode estar servindo build velho; a 8787 é de outro projeto): `pnpm build && pnpm exec wrangler dev --port 8779 --var TURNSTILE_SECRET_KEY:1x0000000000000000000000000000000AA`, depois `PLAYWRIGHT_BASE_URL=http://localhost:8779 pnpm test:e2e --workers=2`.

## Onde fica cada coisa

- `src/App.tsx`, `src/main.tsx`: montagem das cenas.
- `src/scenes/`: Loading, Opening (rolagem presa com os 40 quadros), Cases/Eyecatch/CaseDossier, Profile, FloraStudio, NextEpisode (contato), Header, Footer; CSS Modules ao lado.
- `src/content/`: textos e dados (`cases.ts`, `profile.ts`, `contact.ts`, `jp.ts` com a tabela de japonês do DESIGN.md §4).
- `src/chat/`, `src/worker/`: chat da Flora no navegador e o Worker (`POST /api/chat`, Turnstile, API do Claude).
- `src/lib/`: quadros (`frames.ts`) e movimento (`motion.ts`).
- `public/static/`: imagens e vídeos servidos em `/static/...`; `public/fonts/`: Humane e Cabinet Grotesk sem alteração; as outras fontes vêm do `@fontsource/*`.
- `tests/`: unitários e auditoria (`*.test.mjs/ts`), `tests/e2e/` (Playwright), `tests/worker/`.
- `design/`: `CREDITS.md` (obrigatório para toda fonte e imagem), referências locais (gitignored: `fonts/`, `fundos-delegacia/`, `capturas/`).

## Invariantes

- Versões **exatas** no `package.json` (`pnpm add -E`).
- `pnpm-workspace.yaml` na raiz é obrigatório: sem ele o pnpm usa o `~/pnpm-workspace.yaml` e instala fora do projeto.
- Segredos só via `wrangler secret put` (`ANTHROPIC_API_KEY`, `TURNSTILE_SECRET_KEY`); **nunca** `.env` com valores no disco.
- Contrato do Worker: `POST /api/chat` `{ messages, turnstileToken }` → `{ reply, expression }`; expressões `warm, explain, happy, thinking, shock, kind, return, aval_work`.
- CSP em `public/_headers`: fontes e scripts só de `'self'` (mais Turnstile e Cloudflare Insights); nada de CDN.
- `scripts/check-assets.mjs` (rodado por `pnpm test`): nenhuma referência a `/static/...` sem arquivo, nenhum arquivo em `public/static` sem uso, nenhum nome com espaço, nenhum resto do autor do site original, toda fonte de `public/fonts` em `design/CREDITS.md`. Fontes proibidas: Space Grotesk, Noto Serif JP, Noto Sans JP, Dancing Script, Kaushan Script.
- Humane e Cabinet Grotesk: usar os `.woff2` oficiais sem converter nem cortar subconjunto (licença).
- `prefers-reduced-motion: reduce`: sem pin, parallax, chuva ou poeira; quadro 40 parado; carimbos visíveis.
- Site em inglês (`<html lang="en">`); japonês só pela tabela do DESIGN.md §4, via `Sfx`.
- Mudou algo visual? Conferir no navegador (desktop e celular) antes de dar por pronto.
- Docs, comentários e commits em português do Brasil (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- Nada vai para a `main` sem o Jean aprovar o PR (Workers Builds publica a `main`).

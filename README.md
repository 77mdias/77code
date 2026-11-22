# 77code

Portfólio de DIAS77 (Jean Carlos Moreira Dias): "Case File 77", um arquivo de casos contado como mangá noir. React 19 + TypeScript + Vite, publicado na Cloudflare (Workers static assets + Worker do chat da Flora).

## Rodar

```bash
pnpm install
pnpm dev        # Vite em http://localhost:5177 (sem o Worker do chat)
pnpm cf:dev     # build + wrangler dev em http://localhost:8778 (headers e /api/chat como em produção)
```

Também há `docker compose up` (Vite na porta 5177).

## Conferir

```bash
pnpm check      # typecheck + testes unitários/auditoria + e2e
```

Scripts: `dev`, `build`, `typecheck`, `test`, `test:e2e`, `check`, `cf:dev`, `deploy`. O e2e sobe o `cf:dev`; contra outra porta ou site publicado: `PLAYWRIGHT_BASE_URL=http://localhost:8779 pnpm test:e2e`.

O visual é decidido em `DESIGN.md`. Créditos de fontes e imagens em `design/CREDITS.md`. Mais detalhes em `CLAUDE.md`.

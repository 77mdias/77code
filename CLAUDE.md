# 77code — portfólio DIAS77

Site estático em Vite (sem framework), publicado na Cloudflare (Workers static assets). Veio da adaptação de um site capturado; o histórico das decisões está em `docs/superpowers/`.

## Comandos

| O quê | Comando |
|---|---|
| Dev (Docker, porta 5177) | `docker compose up` (ou `docker compose watch`) |
| Dev sem Docker | `pnpm dev` |
| Build | `pnpm build` (gera `dist/`) |
| Testes no navegador | `pnpm test:e2e` (contra um endereço publicado: `PLAYWRIGHT_BASE_URL=https://... pnpm test:e2e`) |

## Onde fica cada coisa

- `index.html`: a página inteira (cenas em ordem: hero, award, galeria, Kiko, cena 5, contato, rodapé, painel de projeto).
- `src/style.css`: CSS; os blocos "TEMA ESCURO" e "CENA DO KIKO" no fim sobrescrevem o tema claro original.
- `src/main.js`: animações (GSAP + ScrollTrigger + Lenis), galeria/painel de projeto (`projectData`), chat do Kiko, formulário.
- `public/static/`: imagens e vídeos, servidos em `/static/...` com o mesmo caminho.

## Invariantes

- Versões **exatas** no `package.json` (`pnpm add -E`).
- `pnpm-workspace.yaml` na raiz é obrigatório: sem ele o pnpm usa o `~/pnpm-workspace.yaml` e instala fora do projeto.
- `CHAT_ENABLED = false` em `src/main.js` até existir o Worker com a API do Claude; o chat não pode chamar a rede.
- Nenhum arquivo com espaço no nome em `public/`; nenhuma referência a `/static/...` sem arquivo.
- Sem `.env` com valores no disco.
- Mudou algo visual? Conferir no navegador (desktop e celular) antes de dar por pronto.
- Docs, textos novos e commits em português do Brasil (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

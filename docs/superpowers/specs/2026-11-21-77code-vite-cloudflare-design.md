# 77code em Vite + Cloudflare — desenho

**Data:** 2026-11-21 · **Autor:** Jean (decisões) + Claude

## Objetivo

Transformar o site adaptado do Tenztan (hoje em `~/Documentos/design-systems-of-web/tenztan.inweb.work/77mdias.inweb`, rodando pelo `serve.py` com o service worker de replay) num projeto Vite próprio em `~/projects/77code`, publicado na Cloudflare e servindo em `77code.com.br`. Ele substitui o portfólio Next.js atual (repo `77mdias/77code`, na Vercel).

## Decisões

1. **Vite puro, sem framework.** O site é HTML + CSS + um JS de ~1.400 linhas com GSAP. Reescrever em React não traz nada agora; o ganho do Vite é build com hash, dependências no npm e dev server.
2. **Mudar o mínimo do código que já funciona.** `index.html`, o CSS e o JS são os mesmos arquivos, com três mudanças: (a) GSAP e Lenis vêm do npm em vez do CDN; (b) os nomes com espaço viram kebab-case; (c) sai tudo que só existia por causa da captura (`serve.py`, `site/_wd3/`, `index.html` de bootstrap, `?v=` nos links).
3. **Versões iguais às do CDN de hoje, exatas:** `gsap@3.12.2` e `@studio-freight/lenis@1.0.19`. Atualizar o GSAP/Lenis é outra tarefa, depois (a API do Lenis mudou no pacote `lenis`).
4. **Arquivos estáticos em `public/static/`**, mantendo os caminhos `/static/...` que o JS e o CSS já usam. Só entra o que o site referencia (~8 MB); os 58 MB de sobras ficam fora.
5. **Cloudflare Workers com static assets, sem código de Worker por enquanto.** `wrangler.jsonc` só com `assets`. O Worker com a API do Claude (chat do Kiko) é um plano separado; quando vier, entra `main` e o `@cloudflare/vite-plugin` (ver nota "Cloudflare Workers" do vault).
6. **Chat continua bloqueado** (`CHAT_ENABLED = false`); nada sai do navegador.
7. **Cabeçalhos de segurança em `public/_headers`** (o Workers static assets lê esse arquivo): CSP só com o necessário (Google Fonts, Web3Forms), HSTS, `X-Frame-Options: DENY`, `Referrer-Policy`.
8. **Dev em Docker**, como o padrão do Jean (`compose.yaml` com Node 24 + pnpm, porta 5177). Sem segredos nesta fase (a chave do Web3Forms é pública por natureza: vai no código).
9. **Troca de domínio sem queda:** publicar primeiro no `*.workers.dev`, conferir, só então apontar `77code.com.br`, e só depois apagar o projeto da Vercel e o repo antigo.

## Fora deste plano

- Worker do chat com a API do Claude e memória do portfólio.
- Atualizar GSAP/Lenis; servir as fontes localmente; i18n PT/EN.
- Reescrever o conteúdo (textos do autor original que ainda sobram: frase japonesa da cena 2, categorias, "Koujitsu").

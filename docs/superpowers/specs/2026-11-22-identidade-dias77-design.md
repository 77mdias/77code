# Identidade própria do DIAS77 — design

Data: 2026-11-22 · Status: rascunho para aprovação do Jean · Sistema visual: [`DESIGN.md`](../../../DESIGN.md)

## 1. Por que

O 77code.com.br no ar é o desenho do tenztan.in com dados e fotos do Jean: o código (`src/main.js`, `src/style.css`, `index.html`), o roteiro de cenas, a tipografia, a estética japonesa e o movimento vieram do site capturado. Copiar o desenho e a marca visual de outro site não é permitido. O Jean quer uma identidade e um layout únicos, dele, e o site reescrito do zero.

**Para quem:** recrutadores e outros devs. **Sucesso:** a pessoa sai pensando "nunca vi uma identidade assim, ele sabe frontend, resolve problema de software de empresa — vou contratar". O site é a prova do frontend; os casos são a prova de que ele resolve problema real; a Flora conversa de verdade.

## 2. Objetivos, não objetivos, anti-objetivos

**Objetivos**
- Site novo, conceito **Case File 77** (série criminal contada como episódios de mangá noir), conforme `DESIGN.md`.
- Nenhuma linha de HTML, CSS ou JS do site de referência no resultado; nenhuma imagem sem licença registrada.
- Manter tudo o que já é do Jean e funciona: Worker `/api/chat` da Flora, Turnstile, limite por IP, Web3Forms, deploy na Cloudflare com Workers Builds, testes do Worker.
- Inglês, com japonês solto (DESIGN.md §4).

**Não objetivos**
- Mudar o backend da Flora, o modelo, o manual dela ou as proteções de custo.
- Blog, páginas extras, painel de admin, versão em português (fica para depois, se o Jean pedir).
- Som. Os arquivos de som atuais (`rain.m4a`, `sound/*.mp3`) têm origem desconhecida e saem.

**Anti-objetivos (falha mesmo que funcione)**
- Parecer o Tenztan com outra cor: folhas em primeiro plano, kanji gigante no contato, serifa JP, galeria horizontal com parede.
- Parecer template de portfólio de dev (hero com gradiente, cards com glow, lista de skills com barras de porcentagem).
- Animação que trava, pesa no celular ou atrasa a leitura dos casos: isso depõe contra "sabe frontend".
- Usar imagem, fonte ou trecho de código sem licença conhecida.

## 3. Restrições

- **Hospedagem:** Cloudflare Workers com static assets (`wrangler.jsonc`: `assets.directory ./dist`, `not_found_handling 404-page`, `run_worker_first ["/api/*"]`, rate limit `CHAT_LIMITER`, `CHAT_ENABLED`). O build continua gerando `dist/`; o Worker (`src/worker/`) não muda.
- **CSP** (`public/_headers`): `default-src 'self'`; scripts só de `'self'`, Cloudflare Insights e Turnstile; fontes `'self'`. Por isso as fontes são servidas pelo próprio site.
- **Deploy:** Workers Builds publica a cada push na `main`. Todo o trabalho fica na branch `feat/identidade-dias77`; o site no ar só muda no merge, aprovado pelo Jean.
- **Pacotes:** pnpm 11 com `pnpm-workspace.yaml` do projeto (por causa do `~/pnpm-workspace.yaml`); versões exatas; `allowBuilds` para esbuild e workerd. Node 24.
- **Licenças:** Humane (freeware, uso comercial liberado, arquivos não podem ser modificados — usar os `.woff2` do pacote como vieram); Google Fonts (OFL); Fontshare (ITF Free Font License); GSAP (gratuito inclusive comercial); Lenis (MIT).
- **Segredos:** nenhum no código. `ANTHROPIC_API_KEY` e `TURNSTILE_SECRET_KEY` continuam como segredos do Worker.

## 4. Abordagens consideradas

1. **Reescrever do zero com Vite sem framework.** Menos dependências, mesma estrutura de hoje. Contra: os 4 dossiês e as cenas repetem estrutura, e sem componentes o código tende a virar um arquivo grande como o atual.
2. **Reescrever do zero com React (escolha do Jean).** Componentes para dossiê, eyecatch e quadros; os casos viram dados; `@gsap/react` dá o ciclo de vida certo das animações. Custo: React no pacote (~45 KB gzip) e trocar o build para o plugin do React. O Worker e o deploy não mudam.
3. **Repintar o código atual cena por cena.** Descartada: o código do Tenztan ficaria misturado durante semanas, que é o problema a resolver.

**Escolhida: 2 (React), pedido do Jean em 2026-11-22.**

## 5. Decisões do Jean (2026-11-22)

- Público: recrutadores e devs; "contratar" vale para vaga e para projeto do 77dev.
- Conceito: **Caso aberto contado em episódios** (série criminal + anime). Jean = personagem principal; Flora = parceira.
- Estilo: **mangá noir**; **o Jean em cor sobre o mundo em nanquim**.
- Café: sem piada, em foco na abertura (a xícara fumegando na mesa).
- Abertura: fundo autoral gerado pelo Jean no Gemini (`design/fundo-hero/delegacia-noir-gemini.jpeg`), **título solto sobre a cena**, e mais vida que só o café: aprovou o rascunho com o Jean animado, chuva, nuvem na lua, poeira no feixe, abajur, fumaça e câmera em camadas.
- Casos: **dossiê que abre** (relatório datilografado, prova presa com clipe, fio vermelho até a stack, carimbo).
- **Eyecatch** entre os casos: aprovado.
- **Contato como "próximo episódio"**: aprovado.
- **A Flora continua no estúdio/setup dela** (cenário não muda).
- **Os 40 quadros do Jean acompanham o scroll** na abertura.
- A "ficha" das habilidades é só linguagem visual; o texto é normal, sem fingir ficha policial.
- **Site em inglês**, com frases e palavras soltas em japonês.
- Fontes: **Humane** (título principal), **Cabinet Grotesk**, **Reggae One** (japonês), **Special Elite** (dossiê), **Familjen Grotesk** (texto).
- **React** como framework.

## 6. O site, de cima para baixo

Página única. Cada cena segue `DESIGN.md`.

| # | Cena | Conteúdo | Situação |
|---|---|---|---|
| 0 | **Loading** | Contador 0–100% enquanto o fundo da abertura e o primeiro quadro carregam (§7.2); "opening the file…"; fecha com carimbo | Proposta do Claude (o Jean não comentou) |
| 1 | **Opening** | Fundo autoral em nanquim, Jean em cor (40 quadros), "CASE FILE 77 · EPISODE 01", **DIAS77**, "Creative developer · Full cycle & AI", ザアア…, 事件ファイル・第七十七号, café fumegando, ambiente vivo, câmera em camadas | Decidido |
| 2 | **Eyecatch + Dossiê** ×4 | Para cada caso: eyecatch "CASE 0N", depois o dossiê. Ordem: CriptEnv, AtelieSys, Lene Studio Beauty, RANGE77 | Decidido (a ordem é do Claude: a de hoje no site) |
| 3 | **Profile** | Retrato do Jean em cor numa ficha em papel (`hero/image-4.webp`, recortado num quadro; o Jean pode trocar por um retrato novo depois); quem ele é (21, UNOESTE, Presidente Prudente, balcão de vendas); especialidades em três grupos (Frontend & Product, AI & Automation, Backend & Infrastructure) com o que aparece nos casos | Visual decidido; texto do Claude |
| 4 | **Flora** | O estúdio dela como está hoje (fundo `char_back3.webp`, janela `back2.webm`, 8 expressões), personagem à esquerda (85%), chat à direita; rótulo "PARTNER · 相棒" | Cenário decidido; o painel do chat é redesenhado com os elementos do DESIGN.md |
| 5 | **Next episode** | Tela `--ink`: "NEXT EPISODE · 次回予告", "Your project.", formulário (Web3Forms, com `mailto:` de reserva), e-mail, WhatsApp, GitHub, LinkedIn | Decidido |
| 6 | **Footer** | Logo C7, "© DIAS77", links | Do Claude |

Conteúdo dos casos e das habilidades: migrado de `projectData` em `src/main.js` e da cena 5 do `index.html` atuais, reescrito no formato THE CASE / THE CLUES / THE SOLUTION (DESIGN.md §9).

## 7. Arquitetura

- **Build:** Vite 8 + `@vitejs/plugin-react`, **React 19 + TypeScript** (TypeScript é escolha do Claude: é o padrão dos outros projetos do Jean). Saída em `dist/`, igual hoje. `index.html` vira só a casca do React com os metadados (`og:*`, favicon, título).
- **Movimento:** `gsap` + `ScrollTrigger` com `@gsap/react` (`useGSAP`); scroll suave com o pacote `lenis` (sucessor de `@studio-freight/lenis`), integrado ao ticker do GSAP. Canvas próprio para chuva e poeira.
- **Estrutura proposta:**
  - `src/content/` — `cases.ts` (os 4 casos), `profile.ts`, `contact.ts`: todo o texto num lugar.
  - `src/scenes/` — `Loading`, `Opening`, `Eyecatch`, `CaseDossier`, `Profile`, `FloraStudio`, `NextEpisode`, `Footer`.
  - `src/ui/` — elementos do DESIGN.md §5: `Panel`, `Caption`, `RedLabel`, `Stamp`, `RedString`, `Typewriter`, `Sfx` (japonês com regras de acessibilidade), `InkButton`.
  - `src/motion/` — `useReducedMotion`, `useLenis`, `FrameSequence` (os 40 quadros), `RainCanvas`, `DustCanvas`.
  - `src/chat/` — a lógica atual do chat portada para React: envio para `/api/chat`, Turnstile invisível com `render=explicit`, `chat-history` (o arquivo atual `src/chat-history.js` é reaproveitado), expressões da Flora, erros por status (403/429/503/502), debounce. O contrato com o Worker não muda (`{ messages, turnstileToken }` → `{ reply, expression }`).
  - `src/styles/` — tokens do DESIGN.md em variáveis CSS e `@font-face` locais. CSS simples por componente (CSS Modules), sem biblioteca de UI.
  - `src/worker/` — sem mudança.
- **Fontes:** `.woff2` em `public/fonts/` (Humane copiada do pacote sem alteração; as demais baixadas das fontes oficiais). `font-display: swap`; pré-carregar só Humane Bold e Familjen 400.
- **Imagens:** fundo da abertura convertido para `.webp`/`.avif` (1920 e 2752px) a partir do `.jpeg` em `design/fundo-hero/`; quadros e Flora como estão. No celular, os 40 quadros usam uma versão de 960px.

### 7.1 Origem das imagens do Jean (registrar em `design/CREDITS.md`)

- **40 quadros** (`public/static/frames2/`): tirados do vídeo do próprio Jean (`euu-semmarca.mp4`), recortados para fundo transparente em 2026-11-21 (script `padroes/recorte-fundo-liso.py` do vault). Personagem do Jean.
- **Retrato** (`public/static/hero/image-4.webp`, 2752×1536): personagem do Jean, mesma arte.
- **Flora** (`public/static/char/*.webp`, `char_back3.webp`, `back2.webm`): personagem e estúdio gerados pelo Jean a partir de prompts nossos (`PROMPTS-cena-kiko.md`, 2026-11-21); a janela em vídeo foi montada do vídeo que ele gerou no Kling.
- **Fundo da abertura:** gerado pelo Jean no Gemini em 2026-11-22.
- Os nomes das expressões (`warm`, `happy`…) são o contrato com o Worker (`EXPRESSIONS` em `src/worker/flora.js`) e ficam.

**Sobre parecer com o Tenztan:** o Jean decidiu manter o estúdio da Flora e o personagem animado. A sequência de quadros é uma técnica; o que muda é tudo em volta (cena autoral em nanquim, título, ambiente, câmera). **A sequência acompanha o scroll** (decisão do Jean, 2026-11-22): a abertura fica presa enquanto o visitante rola, e o scroll vira o Jean para a câmera, do quadro 1 ao 40 (e volta ao rolar para cima). Parado, ele respira.

### 7.2 Carregamento (decisão do Claude)

A tela de loading espera só o que pinta a abertura: o fundo (1920px), o primeiro quadro e a Humane Bold. Teto de 2,5s; passou disso, abre assim mesmo. Os outros 39 quadros continuam baixando depois; enquanto não chegaram, o scroll mostra o quadro carregado mais próximo do que foi pedido. Com `prefers-reduced-motion`, a abertura não fica presa e mostra o último quadro parado.

### 7.3 Rascunhos aprovados

Os rascunhos que o Jean viu estão em `design/rascunhos/` (`hero-vivo.html` é a abertura aprovada: posição do título, do personagem e dos efeitos sobre o fundo). Eles apontam para imagens do servidor de rascunho e servem como referência de composição, não como código.

## 8. O que sai

- `src/main.js`, `src/style.css` e o corpo atual de `index.html` (código do site de referência).
- `public/static/hero/` inteiro exceto o que for do Jean (`image-4.webp` é o personagem; o resto é arte do site de referência: folhas `Tez_leaves*`, `Tenz_leaves_1`, `clean_background_16_9`, `image-1`, `image-3`, `Image_1_2`).
- `public/static/img_v2.jpg`, `public/static/og.jpg` (imagem de compartilhamento nova a partir da abertura), `public/static/rain.m4a`, `public/static/sound/`.
- Dependência `@studio-freight/lenis` (troca por `lenis`).
- `public/404.html` é redesenhado no novo estilo ("CASE NOT FOUND").

## 9. Testes e verificação

- **Mantidos:** testes do Worker (`tests/worker/*`) e de `chat-history`.
- **Auditoria de assets** (`tests/check-assets.test.mjs`), ampliada: nenhum arquivo ou texto do site de referência (nomes `Tez_leaves`, `Tenz`, `tenztan`; fontes proibidas do DESIGN.md §3); toda fonte em `public/fonts/` listada com licença em `design/CREDITS.md`; meta `og:` presente; site em inglês (`<html lang="en">`).
- **e2e (Playwright), reescritos para o DOM novo:** página carrega e o loading termina; abertura mostra DIAS77 e o personagem; os 4 casos aparecem com carimbo; chat da Flora com `/api/chat` simulado (resposta, histórico, 429, Turnstile falhando, timeout — os casos que já existem hoje); formulário de contato (com e sem chave); CSP e cabeçalhos de segurança; 404 com status 404; **`prefers-reduced-motion`** (sem parallax, carimbo já visível); **celular 390×844** (sem rolagem horizontal, cenas empilhadas).
- **Desempenho:** Lighthouse no celular com LCP ≤ 2,5s e CLS ≤ 0,1 na prévia do Workers Builds; o loading nunca segura mais de ~4s.
- **Conferência visual:** capturas de cada cena (desktop e celular) enviadas ao Jean antes do merge.

## 10. Entrega

1. Branch `feat/identidade-dias77`, commits por etapa (base React + tokens; abertura; dossiês e eyecatch; profile; Flora; contato e rodapé; limpeza do código antigo; testes).
2. PR para a `main`; o Jean revisa na prévia do Workers Builds (confirmar no primeiro push que a branch ganha URL de prévia; se não ganhar, a revisão e o Lighthouse rodam no `pnpm cf:dev` local) e aprova.
3. Merge publica 77code.com.br. Até lá, o site atual continua no ar.

## 11. Deixado para quem constrói

- Texto final dos casos e do profile em inglês, dentro do formato do §6 e do DESIGN.md §9 (o Jean revisa no PR).
- O desenho exato do corte de nanquim do eyecatch e da abertura do dossiê, dentro do DESIGN.md §6.
- O prompt do eventual cenário extra (se precisar de outro fundo gerado, o Jean gera).
- Cabeçalho fixo: proposta do Claude é logo C7 à esquerda e "Cases · Profile · Flora · Contact" à direita (no celular, só logo e "Contact"), em `--t-label`.

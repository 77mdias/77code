# Grilled Pixels (Ecommerce) — design system e identidade visual

> Engenharia reversa de **https://www.grilledpixels.com/ecommerce/?ref=onepagelove** em 22/11/2026. Medido no navegador (Chromium 1440×900 e 390×844, cópia local offline com 0 faltas) + lido diretamente nos chunks Turbopack/Next.js, no CSS SSR do `styled-components` e no pipeline WebGL2 do Unicorn Studio. Tudo o que é interpretação está marcado como tal.
>
> Arquivos: [tokens.json](design-system/tokens.json) (fonte da verdade) · [tokens.css](design-system/tokens.css) · [tailwind-theme.css](design-system/tailwind-theme.css) · [motion.ts](design-system/motion.ts) · [preview.html](design-system/preview.html) (espécime clicável) · [assets/](design-system/assets/) · medição bruta em [design/summary.md](design/summary.md) · cópia local em [site/](site/) (`./abrir.sh`).
>
> Estudo técnico de um site de terceiros: logotipo, textos, capturas de clientes, ilustrações e código pertencem a Grilled Pixels / Adam Roberts e ficam apenas como referência visual.

![Hero limpo da página Ecommerce da Grilled Pixels](design-system/assets/01_hero.jpg)

---

## 0. Ficha

| item | valor |
|---|---|
| O que é | landing page de serviço de design & UX para e-commerce de **Adam Roberts / Grilled Pixels** (consultoria focada em CRO, AOV e retenção) |
| Stack | **Next.js 16.1.6** (App Router + Turbopack) · **React 19.3.0-canary** · **styled-components 6.3.8** (SSR) · **GSAP 3.14.2** (`ScrollTrigger`, `SplitText`, `ScrambleTextPlugin`) · **Lenis 1.3.17** (`ReactLenis`) · **Three.js r181** + **`@react-three/fiber`** + **`postprocessing`** · **Unicorn Studio 1.4.6** (Curtains.js / WebGL2) · **Cal.com** embed. *(Nota: `tech.json` reportou `gsap 3.11.0`, mas o código real dos bundles é `3.14.2`; além disso, ~3,3 MB de Rapier3D WASM, Mux/HLS e Howler são carregados sem uso nesta rota)* |
| Fontes | 3 famílias auto-hospedadas via `next/font/local`: **Untitled Sans** (`400`, `400i`, `500`, `Bold` mapeado como `600`), **Tronica Mono** (`400`, pixel display) e **At Hauss Mono** (`400`, `500`) |
| Paleta-chave | `#000000` palco absoluto · `#121212` superfície de cards (`bc2`) · `#ffffff` texto principal (e `@70%`, `@60%`, `@40%`) · **`#EE344A`** (`bc1` / `--red`) único acento de marca + gradiente térmico no fogo final (`#380408 → #EE344A → #FF6612 → #FFC733 → #FFF7E0`) |
| Raio | **`0px` em 100% da interface** (botões, cards, inputs, imagens). Único `50%`: contêiner do cursor customizado (cuja forma visível `::after` ainda é um quadrado `0px`) |
| Motion em uma linha | Lenis acoplado ao `gsap.ticker` conduzindo **6 atos sticky sobrepostos por margens negativas (`-110vh` a `-190vh`)**, 3 cenas WebGL2 (hélice com pixelação por velocidade, órbita de logos, fogo DOOM Fire interativo), 3 curvas autorais (`--bezzy`, `--bezzy2`, `--bezzy3`) e ruído de filme 2D a 30fps |
| Temas | modo escuro único (`html.is-ecommerce` sobrescreve o fundo vermelho padrão `body { background: var(--red) }` do restante do site para `#000000`) |
| Breakpoints (min-width) | `320` (`s`) · `390` (`sm`) · `700` (`m`) · **`1024`** (`l`, virada desktop) · `1200` (`xl`) · `1400` (`xxl`) · `1500×1000` (escala raiz `0.594vw`) · `1600` (`huge`) · `1800` (`uber`) |
| Altura e escala raiz | **17 640 px** no desktop 1440×900 (**19,6 telas**), com `html { font-size: 62.5% }` (`1rem = 10px`) |

---

## 1. Marca

**Essência** *(interpretação)*. Grilled Pixels vende consultoria de UX/CRO para lojas virtuais sob a promessa *"Commerce, Elevated — not just how your store looks"*. O visual sustenta o posicionamento por tensão deliberada: a base é de **consultoria analítica severa** (preto absoluto, caixa alta estruturada, numeração `001`–`012`, zero adorno gratuito), mas cada momento-chave injeta **artesanato digital literal de "pixels grelhados"** — tipografia pixelada em palavras de virada, pixelação em WebGL que reage à velocidade do seu scroll, cursor quadrado com rastro vermelho pixelado e um encerramento com fogo em autômato celular que literalmente acalma quando você se aproxima do CTA.

**Personalidade** *(interpretação ← evidência)*

| traço | evidência medida/lida |
|---|---|
| Confrontador e direto | abre o diagnóstico dizendo *"Most ecommerce stores don't have a traffic problem. They have a conversion problem."* e pergunta *"Is this you right now?"* |
| Engenheiro-artesão | 3 cenas Three.js escritas sob medida (geometria cilíndrica calculada vértice a vértice, shader GLSL de pixelação por derivada temporal, simulação DOOM Fire em `Uint8Array`) |
| Retro-tátil | monograma `G` em blocos quadrados, ampulheta 8-bit giratória no preloader, `Tronica Mono` nas palavras de impacto, grade de 60×60px na transição de rotas |
| Disciplinado no cromatismo | 99% da área da página é `#000000`, `#121212` e `#ffffff`; `#EE344A` aparece apenas no preço, nos hovers, no rastro do mouse e nas brasas do fogo |
| Transparente | declara o modelo de cobrança e o valor mensal (*"Typical investment: $2,500 per month"*) sem esconder atrás de formulário |

**Logo**

![Monograma pixelado G da Grilled Pixels](design-system/assets/logo.png)

- **Construção** *(medido + lido em `brand/logo.svg`)*: um único `<path>` SVG inline em `viewBox="0 0 36 36"`, renderizado em `3.6rem × 3.6rem` (`36×36px`) no canto superior esquerdo do cabeçalho, preenchimento sólido `#ffffff`. Desenha a letra **"G"** com **6 nós quadrados** nos vértices (~`8.33 × 8.33` unidades) ligados por hastes finas (`3.54` unidades), unindo a linguagem de pixel-art e pontos de controle vetoriais.
- **Favicon**: [favicon.ico](design-system/assets/favicon.ico) (`32×32px`, `icon.ico`).
- **Área de respiro**: posicionada a `2.4rem` (`24px`) do topo e da borda esquerda no grid de 12 colunas (`grid-column: 1/6` desktop; `1/2` mobile).
- **Versões**: apenas branco sólido (`#ffffff`) sobre preto (`#000000`) na rota `/ecommerce`.
- **Usos proibidos** *(interpretação)*: arredondar os cantos dos nós quadrados; aplicar sombras, degradês ou contorno vazado; reduzir abaixo de `24px` (perde-se a diferença entre os nós e as hastes).

**Voz e texto** *(exemplos reais medidos no DOM)*

- **Títulos em duas vozes (sans + pixel)**: *"Commerce, **Elevated**"*, *"Design decisions backed by **data**, UX, and real buying **behaviour**"*, *"E-commerce **Transformation** Engagement"*, *"Ready to **unlock** what you're **missing**?"*.
- **Oposição explícita ao mercado**: *"Most will run A/B tests, change button colours and have no testing strategy. I will..."*.
- **Diagnósticos curtos em imperativo/sintoma**: *"High traffic, low conversion rates"*, *"Checkout friction killing sales"*, *"Mobile UX that leaks revenue"*.
- **Ortografia britânica consistente**: *"behaviour"*, *"colours"*.
- **CTA único repetido em toda a jornada**: *"Schedule a Call"* (no cabeçalho, no hero e no ato final — todos abrindo o mesmo embed `grilledpixels/30min` do Cal.com).

**O que a marca NÃO é** *(interpretação)*: SaaS colorido de bordas arredondadas, agência genérica com fotos de banco de imagens, estética "cyberpunk neon" (não há ciano/roxo nem glow difuso — só preto, branco e vermelho-coral `#EE344A`).

---

## 2. Cor

O site define suas cores num objeto `theme.colors` (`73d5b3d8.js`) que gera automaticamente mapas de opacidade de `0` a `100` (`white[60]`, `white[40]`, `bc1.solid`), além de 3 variáveis CSS em `html` (`--black`, `--white`, `--red`).

### Paleta principal e tokens

| token (`tokens.json`) | valor | nome no site | contraste sobre `#000` | onde é usado |
|---|---|---|---|---|
| `bg` | `#000000` | `--black` / `global.black.solid` | — | fundo global da página (`html.is-ecommerce`), preloader, seções sticky |
| `surface` | `#121212` | `brand.bc2.solid` | 1,1:1 (degrau de plano) | 5 cards de problema (`#problem`) e 12 cards orbitais (`#solution`) |
| `surface-glass` | `rgba(255, 255, 255, 0.024)` | `#ffffff06` | — | fundo do botão glass `Schedule a Call` (com `blur(8px)`) |
| `surface-input` | `rgba(255, 255, 255, 0.06)` | `rgba(255,255,255,0.06)` | — | inputs, textarea e radio buttons do modal de contato |
| `text` | `#ffffff` | `--white` / `global.white.solid` | **21,0:1 ✓ AAA** | todos os títulos, texto dos cards, parágrafo de investimento, ícones |
| `text-soft` | `rgba(255, 255, 255, 0.70)` | `global.white[70]` | **10,0:1 ✓ AAA** | título `"25+ Years..."` em `#why` atrás/frente da órbita 3D |
| `text-muted` | `rgba(255, 255, 255, 0.60)` | `global.white[60]` | **7,4:1 ✓ AAA** | subtítulo do hero e ponte *"Most will run A/B tests..."* em `#solution` |
| `text-dim` | `rgba(255, 255, 255, 0.40)` | `global.white[40]` | **3,66:1 ✗ AA** | links inativos da navegação lateral (`11px`) e placeholders *(defeito de contraste)* |
| `border` | `rgba(255, 255, 255, 0.14)` | `#ffffff24` | — | borda `1px solid` do CTA glass |
| `border-subtle` | `rgba(255, 255, 255, 0.06)` | `rgba(255,255,255,0.06)` | — | bordas de inputs, fieldsets e divisória inferior do modal |
| `border-focus` | `rgba(255, 255, 255, 0.12)` | `rgba(255,255,255,0.12)` | — | borda de foco em `input`/`textarea` |
| `accent` | `#EE344A` | `--red` / `brand.bc1.solid` | **5,23:1 ✓ AA** | preço mensal (`$2,500`), hover de todos os CTAs, underline do header, rastro Unicorn Studio (`vec3(0.933,0.204,0.290)`), transição 60×60px, erros do form. Texto `#fff` sobre `#EE344A` = **4,02:1 ✗ AA** para 12px (só passa em AA Large ≥24px) |

### Paleta térmica do shader de fogo (`#get-started`, lida em `1c6f0368.js`)

O fogo pixelado interpola o campo de calor `h ∈ [0, 1]` através de 6 paradas que incorporam o próprio vermelho da marca no passo `0.14 → 0.36`:

| parada `h` | token | GLSL `vec3` | hex equivalente | papel |
|---|---|---|---|---|
| `0.00` | `bg` | `(0.0, 0.0, 0.0)` | `#000000` | fumaça/fundo transparente |
| `0.14` | `fire-ember` | `(0.22, 0.015, 0.03)` | `#380408` | brasa externa |
| `0.36` | `accent` | `(0.933, 0.204, 0.290)` | `#EE344A` | vermelho oficial da marca |
| `0.58` | `fire-orange` | `(1.0, 0.40, 0.07)` | `#FF6612` | chama média |
| `0.82` | `fire-gold` | `(1.0, 0.78, 0.20)` | `#FFC733` | chama quente |
| `1.00` | `fire-core` | `(1.0, 0.97, 0.88)` | `#FFF7E0` | núcleo sob o cursor e base |

**Cores definidas no `theme.colors` mas não exibidas em `/ecommerce`**: `feedback.positive` (`#3ADB76`), `feedback.negative` (`#CC4B37`), `feedback.warning` (`#FACE10`) e cores sociais (`facebook`, `twitter`, `instagram`, `dribbble`, `linkedin`, `slack`, `creativeMarket`). Note também que o `body` global do site tem `background: var(--red)` (`#EE344A`) — é a classe `html.is-ecommerce` que comuta o palco para `#000000`.

**Proporção medida** *(área computada em 1440×900)*: `#000000` ocupa **9,07 M px² (~98%)**, `#ffffff @6%` 141k px², `#ffffff @2%` 22k px², `#EE344A` 6,9k px² (<0,1%), `#ffffff` 3,8k px². Em caracteres visíveis ao longo da rolagem: `#ffffff` = 1 221 · `#ffffff @60%` = 203 · `#ffffff @40%` = 50 · `#EE344A` = 36.

**Regras de uso**: nunca colocar texto colorido fora do preço em `#investment` e do hover do header; nunca usar `#EE344A` como fundo de seção nesta landing (ele pertence ao hover, ao rastro e à chama); cartões só existem em `#121212` sobre `#000000`, sem borda.

---

## 3. Tipografia

### Famílias e carregamento (`f25331da.css`, `next/font/local`, `font-display: swap`)

| papel no `theme` | família real | arquivos `.woff2` | pesos declarados | pesos usados | fallback métrico (`next/font`) | substituta aberta (`preview.html`) |
|---|---|---|---|---|---|---|
| `heading` / `body` (`--untitled-sans`) | **Untitled Sans** *(Klim Type Foundry)* | 4 arquivos (87 KB) | `400`, `400 italic`, `500`, **`600` (arquivo `Bold`!)** | `400`, `500`, `500 italic` | `Arial` (`size-adjust: 105.08%`, `ascent: 95.35%`) | **Inter** |
| `headingSpan` (`--tronica-mono`) | **Tronica Mono** *(pixel display)* | 1 arquivo (10 KB) | `400` | `400` | `Arial` (`size-adjust: 142.43%`, `ascent: 56.16%`) | **Silkscreen** |
| `mono` (`--atHauss-mono`) | **At Hauss Mono** *(Arillatype.Studio)* | 2 arquivos (45 KB) | `400`, `500` | `400`, `500` | `Arial` (`size-adjust: 131.41%`, `ascent: 72.31%`) | **IBM Plex Mono** |

**Achados técnicos de tipografia** *(medidos + lidos)*:
1. **Sistema de raiz `1rem = 10px`**: `e48638cc.css` define `html { font-size: 62.5% }` e, em monitores grandes (`@media (min-width: 1500px) and (min-height: 1000px)`), muda para `html { font-size: 0.594vw }`. Assim, toda a escala em `rem` cresce proporcionalmente em telas ultrawide/4K sem precisar de `clamp()` em cada regra.
2. **Peso Bold mapeado como 600 sem uso na rota**: `UntitledSans_Bold-s.p.e6f0b14d.woff2` (21,5 KB) está declarado como `font-weight: 600` e pré-carregado no `<head>`, mas nenhum texto visível da página `/ecommerce` usa peso `600` (apenas o modal oculto de contato).
3. **Itálico falsificado**: o contador do preloader (`<em>`) usa `untitledSans` itálico, e há trechos com `500 italic` sem arquivo correspondente — o navegador sintetiza a espessura a partir do `400 italic`.
4. **Regra de `headingXXL` com `clamp` invertido no helper**: o mixin global `headingXXL` (`b1963cf5.js`) tem `font-size: clamp(24rem, 8.333vw, 12rem)` em `>=1200px` (mínimo maior que máximo — em CSS o mínimo sempre vence, resultando em `24rem`!). Por isso o autor precisou usar `!important` em `q` (`EcommerceHero`) e `em`/`eh` (`EcommerceProblem`) para sobrescrever o mixin.

### Escala tipográfica real (desktop 1440px × mobile 390px)

| token | uso / exemplo real | família | CSS do autor (`1rem = 10px`) | 1440px | 390px | lh | tracking | peso | caixa |
|---|---|---|---|---|---|---|---|---|---|
| `hero` / `hero-pixel` | H1 *"Commerce, Elevated"* | Untitled Sans + Tronica Mono | `4.2rem` → `8rem` (700) → `12rem` (1024) → `14rem` (1200) `!important` | **140px** | **42px** | `0.88` | `-0.04em` / `0` | 400 | UPPER |
| `cylinder` | Cilindro 3D *"DESIGN DECISIONS..."* | Untitled Sans + Tronica Mono | `clamp(3.2rem, 8.2vw, 4.8rem)` · ≥1024: `clamp(6.4rem, 7.2vw, 11.2rem)` | **103.7px** | **32px** | `0.88` | `-0.04em` / `0` | 400 | UPPER |
| `cta-display` | H2 *"Ready to unlock..."* (`#get-started`) | Untitled Sans + Tronica Mono | `clamp(3.2rem, 5.2vw, 6.4rem)` | **64px** | **32px** | `0.90` | `-0.03em` / `0` | 400 | UPPER |
| `section-lg` | H2 `#investment` (`4.4vw`) e `#why` (`4.2vw`) | Untitled Sans + Tronica Mono | `clamp(2.8rem, 4.4vw, 5.6rem)` | **56px** | **28px** | `0.92` (`0.8` span / `1` em) | `-0.03em` / `0` | 400 | UPPER |
| `statement` / `-pixel` | H2 `#problem` (*"Most ecommerce..."* / *"Is this you"*) | Untitled Sans + Tronica Mono | `3.2rem` → `4.8rem` (≥700) `!important` | **48px** | **32px** | `0.90` | `-0.03em` / `0` | 400 | UPPER |
| `card-orbit` | 12 cards em `#solution` (*"Evaluate and redesign..."*) | Untitled Sans | `1.9rem` → `2.4rem` (≥1024) | **24px** | **19px** | `1.20` | `-0.03em` | 400 | UPPER |
| `card-problem` | 5 cards em `#problem` (*"High traffic..."*) | Untitled Sans | `1.5rem` → `1.8rem` (700) → `2.2rem` (1024) | **22px** | **15px** | `1.12` | `-0.02em` | 400 | UPPER |
| `body` | Parágrafo de `#investment` | Untitled Sans | `1.5rem` → `1.7rem` (≥1024) | **17px** | **15px** | `1.50` | `0` | 400 | normal |
| `lead-mono` | Subtítulo hero + ponte `#solution` | At Hauss Mono | `1.3rem` → `1.6rem` (≥1024) | **16px** | **13px** | `1.45`–`1.50` | `0.04–0.1em` | 500 | UPPER |
| `eyebrow-price` | *"Typical investment: $2,500 per month"* | At Hauss Mono | `1.3rem` → `1.5rem` (≥1024) | **15px** | **13px** | `1.30` | `0.04em` | 400 | UPPER |
| `ui-mono` | Botão header + índices `001`–`012` | At Hauss Mono | `1.3rem` | **13px** | **13px** | `1.00` | `0.08em` / `0.1rem` | 500 | UPPER |
| `button` | Texto do CTA glass (`Schedule a Call`) | Untitled Sans | `1.2rem` | **12px** | **12px** | `1.20` | `0.02em` | 500 | UPPER |
| `nav-side` | Itens da navegação lateral | At Hauss Mono | `1.1rem` | **11px** | — | `1.00` | `0.12em` | 500 | UPPER |

**Regras tipográficas**: (1) todo display é `font-weight: 400`, `text-transform: uppercase` e `line-height` ultra-apertado (`0.88–0.92`); (2) sempre que uma palavra troca para `Tronica Mono`, o `letter-spacing` zera (`0`) para não colar os glifos pixelados; (3) `Untitled Sans` em minúsculas (sentence case) aparece **em apenas um lugar da página inteira**: o parágrafo explicativo de `#investment`, criando um respiro racional na hora da proposta comercial.

---

## 4. Layout

### Grid, contêineres e espaçamento

- **Grid (`<waffl-grid>`, `94473`)**:
  - Mobile (`< 700px`): **2 colunas**, `column-gap: 2.4rem` (`24px`), `padding-inline: 2.4rem` (`24px`).
  - Tablet (`≥ 700px`): **6 colunas**, `column-gap: 2.4rem` (`24px`), `padding-inline: 1.2rem` (`12px`).
  - Desktop (`≥ 1024px`): **12 colunas**, `column-gap: 3.6rem` (`36px`), `padding-inline: 2.4rem` (`24px`), `max-width` opcional `1440px`.
- **Padding padrão de seção**: `8.4rem 2.4rem 4.8rem` (`84px` topo para respeitar o header fixo, `24px` laterais, `48px` base).
- **Contêineres internos de leitura**: Hero `110rem` (`1100px`) · Subtítulo hero e título de problema `48rem` (`480px`) · Ponte `#solution` `56rem` (`560px`) · Bloco `#investment` `78rem` (`780px`) · Bloco `#get-started` `90rem` (`900px`).
- **Escala de espaçamento (`theme.gap` + `theme.space`)**: `3 · 4 · 8 · 12 · 16 · 24 · 32 · 36 · 40 · 48 · 60 · 84 · 120 px`. Os valores mais repetidos no DOM são `24px` (20×), `8px` (20×), `12px` (16×) e `36px` (10×).

### Breakpoints e o que muda em cada um

| breakpoint | chave | mudança estrutural real |
|---|---|---|
| `320px` | `s` | grid de 2 colunas; logo `1/2`, header CTA `2/3` |
| `390px` | `sm` | cards horizontais de `#problem` sobem de `6.4rem` para `7.2rem` de altura |
| `700px` | `m` | grid passa a 6 colunas; H1 sobe `42→80px`; `#problem` H2 sobe `32→48px`; `#investment` parágrafo limita a `max-width: 60%` |
| **`1024px`** | **`l`** | **maior virada do layout**: grid 12 colunas; **navegação lateral fixa (`.NRtBY`) aparece**; cursor customizado ativa; os 5 cards de `#problem` viram **5 colunas verticais (`height: 32rem`)** ancoradas na base; cilindro 3D pula para `clamp(6.4rem, 7.2vw, 11.2rem)`; cards orbitais crescem para `26.4×38.4rem` |
| `1200px` | `xl` | H1 atinge `14rem` (`140px`); modal de contato restringe largura para 5 colunas (`41.67vw`) |
| `1400px` | `xxl` | modal de contato restringe para 4 colunas (`33.33vw`) |
| `1500px × 1000px` | — | `html { font-size: 0.594vw }` escala proporcionalmente todos os `rem` da página |

### Mapa das 6 seções (arquitetura sticky com margens negativas sobrepostas)

Em vez de empilhar blocos sequenciais, a página cria uma **câmara contínua de 17 640 px** (em 1440×900) sobrepondo cada seção sobre a anterior com `margin-top` negativo e `z-index` crescente (`2 → 6 → 7 → 8 → 9 → 10`):

| # | id | altura CSS | `margin-top` | `offsetTop` (1440×900) | `z-index` | sticky? | ato visual |
|---|---|---|---|---|---|---|---|
| 1 | `#intro` | `500vh` (4 500 px) | `0` | `0 px` | `2` | sim (`100vh`) | Hero *"Commerce, Elevated"* + Hélice 3D de 10 e-commerces |
| 2 | `#problem` | `740vh` (6 660 px) | `-180vh` (-1 620 px) | `2 880 px` | `6` | sim (`100vh`) | Texto palavra-por-palavra + 5 cards Bézier + wipe *"Is this you right now?"* |
| 3 | `#solution` | `760vh` (6 840 px) | `-160vh` (-1 440 px) | `8 100 px` | `7` | sim (`100vh`) | Cilindro tipográfico 3D + manifesto mono + 12 cards orbitais (`001`–`012`) |
| 4 | `#investment` | `400vh` (3 600 px) | `-190vh` (-1 710 px) | `13 230 px` | `8` | sim (`100vh`) | Proposta *"E-commerce Transformation Engagement"* + `$2,500/mo` em `#EE344A` |
| 5 | `#why` | `100vh` (900 px) | `-110vh` (-990 px) | `15 840 px` | `9` | não (scroll direto) | *"25+ Years..."* atravessado por anel 3D de 12 logotipos |
| 6 | `#get-started` | `100vh` (900 px) | `0` | `16 740 px` | `10` | não | *"Ready to unlock what you're missing?"* + CTA sobre fogo pixelado interativo |

| Ato 1 — Hélice 3D (`#intro`)                         | Ato 2 — 5 Cards (`#problem`)                                      | Ato 2b — Wipe (`#problem`)                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| ![Hélice 3D](design-system/assets/02_hero_helix.jpg) | ![5 cards de problema](design-system/assets/03_problem_cards.jpg) | ![Punchline Is this you right now](design-system/assets/04_problem_punchline.jpg) |

| Ato 3 — Cilindro 3D (`#solution`) | Ato 3b — 12 Cards orbitais (`#solution`) | Ato 4 — Proposta (`#investment`) |
|---|---|---|
| ![Cilindro 3D](design-system/assets/05_solution_cylinder.jpg) | ![Cards orbitais numerados](design-system/assets/06_solution_orbit_cards.jpg) | ![Seção de investimento](design-system/assets/07_investment.jpg) |

| Ato 5 — Órbita 3D (`#why`) | Ato 6 — Fogo pixelado (`#get-started`) | Mobile — Hero e Problema (`390×844`) |
|---|---|---|
| ![Órbita 3D de logos](design-system/assets/08_why_orbit.jpg) | ![Fogo pixelado DOOM Fire](design-system/assets/09_get_started_fire.jpg) | ![Hero mobile](design-system/assets/10_mobile_hero.jpg) |

---

## 5. Forma e profundidade

- **Raio**: `0px` absoluto em toda a página. Embora o `theme.br` contenha `0.3rem` a `999rem` para outras rotas, nenhum botão, card ou imagem de `/ecommerce` tem canto arredondado.
- **Sombras**: **zero `box-shadow`** em toda a página. A única sombra existe em texto: `text-shadow: 0 0.4rem 3.2rem rgba(0, 0, 0, 0.85)` no H2 de `#get-started` para destacá-lo sobre o fogo.
- **Bordas**: apenas `1px solid #ffffff24` (`rgba(255,255,255,0.14)`) no botão CTA glass e `1px solid rgba(255,255,255,0.06)` nos campos do modal oculto. Cards `#121212` são **completamente sem borda**.
- **Profundidade sem sombras** *(como o site cria camadas)*:
  1. **Desfoque dinâmico (`filter: blur`)**: todas as transições entre texto e cena borram o bloco de saída até `18px–24px` (em `#problem`, `#solution` e `#investment`).
  2. **Vidro fosco (`backdrop-filter`)**: `blur(8px)` no botão CTA glass sobre o fogo e a hélice; `blur(2px)` nos inputs do modal.
  3. **Vinhetas de legibilidade**: `radial-gradient(ellipse 58% 48% at 50% 46%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.2) 52%, transparent 74%)` em `#get-started`; e um plano 3D com `CanvasTexture` radial (`rgba(5,5,5,0.88) → 0`) em `renderOrder: 5` no centro da órbita de `#why`.
  4. **Blending**: `mix-blend-mode: lighten` nos 5 PNGs wireframe de `#problem` para fundir o fundo preto da imagem diretamente sobre `#121212`.
  5. **Névoa 3D**: `<fog args={['#000000', 6, 13]} />` na hélice do hero, fazendo os cartões de trás da espiral mergulharem no preto.
- **Pilhas de `z-index` (lidas no código)**: fundo `0` → `#intro` `2` → `#problem` `6` → `#solution` `7` → `#investment` `8` → `#why` `9` → `#get-started` `10` → nav lateral `20` → Unicorn Studio cursor trail `600` → header `2500` → pixel route transition `99999` → preloader & modal `99999999` → cursor customizado & film grain `9999999999`.

---

## 6. Imagem e ícones

### Tratamento de imagem e 3D (4 sistemas distintos)

1. **Hélice de portfólio (`#intro`, `/helix/ecommerce-*.png`)**: 10 capturas PNG de projetos reais de e-commerce (`mariaakerberg`, `uj`, `uj-cart`, `mos`, `retreats`, `studio713`, `photoscoper`, `gamermerch`, `pyb`, `mariaakerberg-home`), 2,7 MB no total. Cada captura é mapeada em `PlaneGeometry(w, 1.38, 32, 1)` curvada num arco cilíndrico (`curveRadius: 2.35`), proporção limitada a `[0.85, 1.7]`, `SRGBColorSpace`, `toneMapped: false`, `DoubleSide`.
2. **Ilustrações de diagnóstico (`#problem`, `/icon_*.png`)**: 5 PNGs (`29–97 KB` cada, proporção `1.00–1.09`), traço branco fino estilo esquema técnico/wireframe (gráfico de tráfego vs conversão, página de produto com estrelas vazias, checkout bloqueado, grade de loja, smartphone rachado vazando moedas). Aplicados com `object-fit: contain` e `mix-blend-mode: lighten`.
3. **Logotipos de prova social (`#why`, `/logos/*.png`)**: 6 PNGs monocromáticos brancos (`urbanjungle`, `halfords`, `missguided`, `cooplands`, `maria-akerberg`, `pyb`, `2,4–4,2 KB` cada), duplicados para formar 12 painéis curvos (`curveRadius: 1.6`, altura `0.5` unidades) em órbita contínua.
4. **Fogo generativo (`#get-started`)**: textura procedural em `Uint8Array` (`DataTexture` `RGBAFormat`, `NearestFilter`, sem mipmap) com resolução de 1 célula a cada `10px` (desktop) ou `7px` (mobile) — ou seja, `144×90` células em 1440×900 — colorida por fragment shader.

### Ícones SVG

- **9 SVGs inline** no DOM, todos **preenchidos (`fill`), zero stroke** (`0` ícones de traço):
  - Monograma `G` (`36×36px`, `viewBox 0 0 36 36`)
  - Ampulheta pixelada do preloader (`60×66px` em `viewBox 0 0 50 55`, composta por 19 `<rect>` e 2 `<path>`)
  - Balão de fala no botão CTA (`16×16px`, `viewBox 0 0 16 16`)
  - Ícones do modal oculto: fechar (`16×16`), check (`16×16`), avião de papel no `Send` (`18×18`), seta diagonal (`7.5×7.5`), LinkedIn, Instagram e Dribbble (`16×16`).

---

## 7. Componentes

### 1. Cabeçalho fixo (`Header`, `.bgXeYF`)

![Cabeçalho fixo da página](design-system/assets/comp_nav.png)

- **Anatomia**: `position: fixed; top: 2.4rem; left: 0; right: 0; z-index: 2500`, altura medida `39px`, fundo transparente. Dentro de `<waffl-grid>`, apenas 2 elementos na rota `/ecommerce`: monograma `G` à esquerda (`1/6`) e botão textual `SCHEDULE A CALL` à direita (`7/13`, `justify-content: flex-end`).
- **Entrada**: nasce escondido em `translateY(calc(-100% - 2.4rem))` e desliza para `0` em `1.2s cubic-bezier(0.43, 0.195, 0.02, 1)` quando `loaderComplete === true`.
- **Mobile**: mantém exatamente os mesmos 2 itens (`390×39px`), sem menu hambúrguer nesta landing.

### 2. Botão textual do cabeçalho (`Header CTA`, `.dGFJrX`)

| Repouso | Hover (medido) |
|---|---|
| ![Header CTA repouso](design-system/assets/comp_header_cta.png) | ![Header CTA hover](design-system/assets/comp_header_cta_hover.png) |

- **Valores**: `At Hauss Mono` `1.3rem` (`13px`), peso `500`, `uppercase`, `letter-spacing: 0.1rem`, `padding: 0`, cor `#ffffff`, fundo transparente.
- **Hover (medido + lido)**: `color: #ffffff → #EE344A` + pseudo-elemento `::after` (`height: 1px`, `bottom: -0.2rem`, `background: #EE344A`) expande `width: 0 → 100%` (`131.9px`) em `0.6s cubic-bezier(0.8, 0, 0, 1)` + **GSAP `ScrambleText`** embaralha os caracteres em maiúsculas por `0.4s` (`speed: 0.3`).
- **Foco**: **nenhuma mudança visível** (`button:focus { outline: none }` global) — lacuna de acessibilidade; no `tokens.json` foi adicionado `:focus-visible` com `outline: 2px solid #EE344A`.

### 3. CTA principal Glass (`Button $isGhosted`, `.iYCpwP`)

| Repouso | Hover (medido) |
|---|---|
| ![CTA glass repouso](design-system/assets/comp_cta_glass.png) | ![CTA glass hover](design-system/assets/comp_cta_glass_hover.png) |

- **Anatomia**: retângulo `0px` de raio com ícone `chat` SVG (`1.6rem`) + rótulo `<span>` em `Untitled Sans` `1.2rem` peso `500`, `tracking: 0.02em`, `uppercase`, `gap: 1.2rem`.
- **Valores**: `padding: 1.6rem 2.4rem` (mobile) / `1.6rem 3.6rem` (`≥1024px`); `background: #ffffff06` (`rgba(255,255,255,0.024)`); `border: 1px solid #ffffff24`; `backdrop-filter: blur(8px)`.
- **Hover (medido)**: `background-color` transiciona para `#EE344A` em `0.4s cubic-bezier(0.8, 0, 0, 1)`. Em `#get-started`, `onPointerEnter` também define `tb.calmTarget = 1`, acalmando o fogo atrás do botão.
- **Ação**: carrega dinamicamente `@calcom/embed-react` (`namespace: "30min"`, `grilledpixels/30min`, `theme: "dark"`, `layout: "month_view"`) no hover ou clique.
- **Foco**: nenhuma mudança visível (corrigir com `:focus-visible`).

### 4. Navegação lateral fixa (`EcommerceNav`, `.NRtBY`)

| Link inativo | Hover (medido) |
|---|---|
| ![Side nav inativo](design-system/assets/comp_sidenav_link.png) | ![Side nav hover](design-system/assets/comp_sidenav_link_hover.png) |

- **Visibilidade**: oculta em `<1024px`; em desktop fixa em `top: 50%; left: 2.4rem; transform: translateY(-50%); z-index: 20`, `gap: 1.2rem`.
- **Itens**: 6 âncoras (`Intro`, `The Problem`, `The Solution`, `Investment`, `Why Me`, `Get Started`), `At Hauss Mono` `1.1rem` (`11px`), peso `500`, `letter-spacing: 0.12em`, `padding: 0.2rem 0 0.2rem 1.7rem`, cor inativa `#ffffff @40%` → ativa/hover `#ffffff` (`0.4s --bezzy`).
- **Indicador ativo (`.bzTKyI`)**: quadrado sólido `0.7rem × 0.7rem` (`7×7px`) branco posicionado via `gsap.to(dot, { y, duration: 0.55, ease: 'power3.out' })`.
- **Clique**: aciona `lenis.scrollTo(el, { offset: overlapOffset + 2, duration: 1.2, force: true })` (compensa automaticamente as margens negativas de `#solution` e `#investment`).

### 5. Card de diagnóstico (`#problem`, `.egAGmF`)

- **Mobile (`<1024px`)**: faixa horizontal compacta (`height: 6.4rem → 7.2rem → 8.8rem`, `padding: 0.8–1.4rem 1.2–1.8rem`, `flex-direction: row`), texto à esquerda (`1.5rem → 1.8rem`) e ícone wireframe à direita (`5.6–7.2rem`).
- **Desktop (`≥1024px`)**: 5 colunas iguais (`flex: 1 1 0`), `height: 32rem` (`320px`), `padding: 2.4rem`, `flex-direction: column`, fundo `#121212`, raio `0px`, título H3 `2.2rem` no topo e ilustração wireframe ocupando o espaço restante abaixo com `mix-blend-mode: lighten`.

### 6. Card orbital numerado (`#solution`, `.hEjksP`)

- **Dimensões**: `21.6rem × 31.2rem` (mobile) / `26.4rem × 38.4rem` (`264×384px`, `≥1024px`), `padding: 2.2rem 2.2rem 2.4rem`, `justify-content: space-between`, fundo `#121212`, raio `0px`.
- **Anatomia**: índice mono `001`–`012` no topo (`At Hauss Mono` `1.3rem`, peso `500`, tracking `0.08em`) + entrega em caixa alta na base (`Untitled Sans` `2.4rem`, peso `400`, lh `1.2`, tracking `-0.03em`).

### 7. Formulário do modal de contato *(lido no CSS SSR — fechado na carga)*

- **Container**: overlay fixo `#000000` (`z-index: 99999999`), largura responsiva `50vw → 41.67vw → 33.33vw`.
- **Inputs/Textarea (`.gSSSaf`)**: `height: 60px`, `padding: 24px`, `background: rgba(255,255,255,0.06)`, `border: 1px solid rgba(255,255,255,0.06)`, `backdrop-filter: blur(2px)`, raio `0px`. Foco muda borda para `rgba(255,255,255,0.12)`; erro aplica `border-color: #EE344A` + `background: rgba(255,107,107,0.1)`.
- **Label flutuante**: placa sólida branca `#ffffff` posicionada na borda superior esquerda (`top: 0; left: 2.4rem; transform: translateY(-50%)`), texto preto `#000000` em `Tronica Mono` `1.4rem` uppercase.
- **Radio pills**: retângulos `0px` com checkbox quadrado `1.6rem`; marcado preenche o fundo com `#EE344A`.
- **Botão `Send` (`.cyfrEu`)**: fundo sólido `#EE344A`, `Tronica Mono` `1.4rem`, `padding: 1.6rem 3.6rem`; desabilitado recebe `opacity: 0.5; filter: blur(2px)`; durante envio, um `<span>` interno faz wipe `width: 0 → 100%` (`0.24s --bezzy2`) exibindo `"Sending…"`.

**Faça / Não faça (componentes)**
- **Faça**: mantenha bordas vivas (`0px`), espaçamentos múltiplos de `12px`/`24px` e apenas um CTA vermelho-ao-hover por tela.
- **Não faça**: nunca misture cards `#121212` com bordas brancas fortes ou `border-radius`, nem remova `:focus-visible` sem fornecer anel explícito.

---

## 8. Motion

### Princípios e tokens do autor (`html` + `theme.easing`)

O sistema de motion combina **transições CSS cirúrgicas com curvas snap** (para chrome e hover) e **cenas controladas por progresso de scroll via `ScrollTrigger` + `Lenis` + matemática pura** (Bézier quadrática, trigonometria 3D, autômato celular).

| token | valor exato | uso principal |
|---|---|---|
| `--bezzy` | `cubic-bezier(0.8, 0, 0, 1)` | hovers de botão (`0.4s`), header CTA + underline (`0.6s`), links da nav lateral (`0.4s`) |
| `--bezzy2` | `cubic-bezier(0.430, 0.195, 0.020, 1)` | entrada do header (`1.2s`), preloader (`0.4s`/`0.6s`), modal de contato (`0.6s`/`1.2s`) |
| `--bezzy3` | `cubic-bezier(0.5, 0, 0, 1)` | fade-in do hero (`1s`), nav lateral (`1s`), shader de fogo (`0.9s`) |
| `--ease` | `0.3s ease-in-out` | radio buttons e micro-estados de formulário |
| `power3.out` | GSAP `power3.out` | cursor customizado (`0.95s`) e indicador quadrado da nav lateral (`0.55s`) |
| `easeOutCubic` | `1 - (1 - t)^3` | função JS pura usada em `#problem`, `#solution` e `#investment` |
| **Scroll engine** | **Lenis 1.3.17** (`autoRaf: false`, `lerp: 0.1`) | acoplado ao `gsap.ticker.add(t => lenis.raf(t * 1000))` |

### Catálogo completo de animações (14 sistemas)

#### 1. Preloader com ampulheta pixelada (`63ccaffd.js`)
![Preloader da Grilled Pixels](design-system/assets/00_preloader.jpg)
- **O que é**: ampulheta SVG pixelada gira `180°` a cada `2s` (`4000ms` loop infinito) enquanto 7 pixels quadrados caem pelo gargalo; ao concluir o carregamento da página, contador sobe `0% → 100%` (4ms/passo = ~400ms), ampulheta e número encolhem (`scale: 0.5`, `opacity: 0`) e o overlay apaga liberando o scroll.
- **Gatilho**: carga inicial; saída quando `isReady.page === true` (hero + why montados).
- **Parâmetros**: entrada `kUrRZO` `400ms --bezzy2` (delay `200ms` ícone, `400ms` texto); giro `gbmbJk` `4000ms cubic-bezier(0.445,0.05,0.55,0.95) infinite`; saída GSAP `0.2s` × 3 `power2.out`.
- **Feito com**: CSS `@keyframes` + GSAP timeline.
```js
gsap.timeline()
  .to(hourglass, { duration: 0.2, opacity: 0, scale: 0.5, delay: 0.1, ease: 'power2.out' })
  .to(counter,   { duration: 0.2, opacity: 0, scale: 0.5, ease: 'power2.out' })
  .to(overlay,   { duration: 0.2, opacity: 0, ease: 'power2.out', onComplete: unlockScroll });
```

#### 2. Entrada coreografada Pós-Preloader (Header + Hero + Nav lateral)
- **O que é**: logo após o preloader desmontar (`loaderComplete: true`), o cabeçalho desliza de cima (`-100% - 2.4rem → 0`), o bloco central do hero surge por fade e a navegação lateral esquerda aparece por último.
- **Gatilho**: `isReady.loaderComplete === true`.
- **Parâmetros**: Header `1200ms --bezzy2` (delay `0ms`) · Hero `1000ms --bezzy3` (delay `600ms`) · Nav lateral `1000ms --bezzy3` (delay `800ms`).
- **Feito com**: CSS `transition`.
```css
.header   { transform: translateY(calc(-100% - 2.4rem)); transition: transform 1.2s cubic-bezier(0.43, 0.195, 0.02, 1); }
.hero     { opacity: 0; transition: opacity 1s cubic-bezier(0.5, 0, 0, 1) 0.6s; }
.sidenav  { opacity: 0; transition: opacity 1s cubic-bezier(0.5, 0, 0, 1) 0.8s; }
.is-ready .header { transform: translateY(0); }
.is-ready .hero, .is-ready .sidenav { opacity: 1; }
```

#### 3. Header CTA Hover + ScrambleText (`63ccaffd.js`)
- **O que é**: ao passar o mouse em *"Schedule a Call"* no cabeçalho, o texto fica `#EE344A`, um sublinhado de `1px` varre da esquerda para a direita e as letras embaralham em maiúsculas antes de assentar.
- **Gatilho**: `:hover` + `onMouseEnter`.
- **Parâmetros**: cor e `width: 0 → 100%` em `600ms --bezzy`; `ScrambleText` `400ms`, `chars: "upperCase"`, `speed: 0.3`.
- **Feito com**: CSS `transition` + GSAP `ScrambleTextPlugin 3.14.2`.
```js
el.addEventListener('mouseenter', () => {
  gsap.to(el, { duration: 0.4, scrambleText: { text: 'Schedule a Call', chars: 'upperCase', speed: 0.3 } });
});
```

#### 4. Botão Glass CTA Fill (`48d69c1b.js`)
- **O que é**: botão translúcido (`blur(8px)`, borda `14%`) inunda de `#EE344A` sólido no hover. Em `#get-started`, o mesmo hover acalma as chamas do fundo (`calmTarget = 1`).
- **Gatilho**: `:hover` / `pointerenter`.
- **Parâmetros**: `400ms cubic-bezier(0.8, 0, 0, 1)`.
- **Feito com**: CSS `transition`.
```css
.cta-glass {
  background: rgba(255, 255, 255, 0.024); border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px); transition: background-color 0.4s cubic-bezier(0.8, 0, 0, 1);
}
.cta-glass:hover { background-color: #EE344A; }
```

#### 5. Hero: Recuo do Texto + Hélice 3D de E-commerces (`1c6f0368.js`)
- **O que é**: nos primeiros `500vh` (`0 → 4500px`), o bloco central do hero desbota (`0–35%`) e encolhe de `scale(1)` para `scale(0.5)` (`0–40%`), enquanto 10 telas curvadas sobem em espiral 3D (`radius: 1.55`, `turns: 2.35`, `totalHeight: 7.4`, `y: -8.2 → 13.2`, giro `3.8π rad`, `curveRadius: 2.35`, câmera em `[0, -1.1, 8.2]`, `fov: 38`, névoa preta `6–13`).
- **Gatilho**: `ScrollTrigger` em `#intro` (`start: "top top"`, `end: "bottom bottom"`, `scrub: true`).
- **Feito com**: `@react-three/fiber` + Three.js r181 + GSAP `ScrollTrigger`.
```js
ScrollTrigger.create({
  trigger: '#intro', start: 'top top', end: 'bottom bottom', scrub: true,
  onUpdate: ({ progress: p }) => {
    helixState.progress = p;
    const opacity = Math.max(0, 1 - p / 0.35);
    const scale   = Math.max(0.5, 1 - (p / 0.4) * 0.5);
    gsap.set(heroContent, { opacity, scale, pointerEvents: opacity < 1 ? 'none' : 'auto' });
  }
});
```

#### 6. Post-processing `HelixPixelation` reativo à velocidade do scroll (`1c6f0368.js`)
- **O que é**: efeito customizado no `EffectComposer` mede a derivada da posição do scroll (`|Δprogress| / dt`) e pixeliza a hélice 3D dinamicamente: parado = `1px` (nítido); rolando rápido = até `1 + 18 * dpr` pixels, com amortecimento assimétrico (`damp` λ=`14` acelerando, λ=`5` assentando).
- **Gatilho**: `useFrame` a cada quadro dentro da cena `#intro`.
- **Feito com**: `postprocessing` (`Effect`) + GLSL fragment shader.
```glsl
uniform float uPixelSize;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float pixelSize = max(uPixelSize, 1.0);
  vec2 grid = pixelSize / resolution;
  outputColor = texture(inputBuffer, grid * (floor(uv / grid) + 0.5));
}
```

#### 7. Ato 2 (`#problem`): Revelação de palavras + 5 Cards em arco Bézier + Wipe `clip-path` (`1c6f0368.js`)
- **O que é** (ao longo de `740vh`, progresso `p ∈ [0, 1]`):
  - **`0.00–0.28`**: `SplitText` revela cada palavra com `easeOutCubic` em escada (`step = 0.28 / n`, largura `0.62 * step`).
  - **`0.28–0.58`**: 5 cards `#121212` voam da direita inferior (`108vw`, `14vh`) até a base seguindo uma **curva Bézier quadrática** (ponto de controle `(48 - 4i vw, -10vh)`) enquanto desrotacionam `10° → 0°` (stagger `0.055` por card).
  - **`0.66–0.74`**: título original borra (`blur: 0 → 18px`), apaga (`opacity: 1 → 0`) e recua (`scale: 1 → 0.97`).
  - **`0.66–0.86`**: os 5 cards disparam para cima (`-170vh`) em escada quadrática (`f²`) e **a média de seus `getBoundingClientRect().bottom` controla diretamente o `clip-path: inset(Npx 0 0 0)`** do texto *"IS THIS YOU RIGHT NOW?"* — os próprios cards "puxam a cortina" revelando a pergunta!
  - **`0.91–1.00`**: *"IS THIS YOU RIGHT NOW?"* borra até `24px`, desbota e sai (`scale: 0.97`).
- **Gatilho**: `ScrollTrigger` em `#problem` (`scrub: true`).
- **Feito com**: GSAP 3.14.2 (`SplitText` + `ScrollTrigger`) + matemática pura.
```js
const quad = (a, b, c, t) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c;
const easeOut = t => 1 - (1 - t) ** 3;
// Cortina guiada pela posição real dos 5 cards no desktop:
const avgBottom = cards.reduce((s, el) => s + el.getBoundingClientRect().bottom, 0) / cards.length;
gsap.set(punchline, { clipPath: `inset(${Math.max(0, avgBottom - punchRect.top)}px 0 0 0)` });
```

#### 8. Ato 3 (`#solution`): Cilindro Tipográfico 3D em CSS (`1c6f0368.js`)
- **O que é**: 6 linhas gigantes (`DESIGN` … `BEHAVIOUR`) são dispostas sobre a superfície de um cilindro virtual 3D (`perspective: 100vw`, `transform-style: preserve-3d`, raio `R = 0.6 * vh`, ângulo entre linhas `2 * asin(lineH / 2R)`, cada face em `translateZ(R)` com `backface-visibility: hidden`). De `p = 0.00` a `0.52` da seção (`760vh`), o cilindro inteiro gira em `rotateX` atravessando o viewport.
- **Gatilho**: `ScrollTrigger` em `#solution` (`scrub: true`).
- **Feito com**: CSS 3D (`preserve-3d`) + GSAP `ScrollTrigger`.
```js
const R = 0.6 * window.innerHeight;
const stepDeg = 2 * Math.asin(Math.min(lines[0].offsetHeight / (2 * R), 0.99)) * (180 / Math.PI);
lines.forEach((line, i) => {
  gsap.set(line, { xPercent: -50, yPercent: -50, rotateX: -i * stepDeg });
  gsap.set(line.children, { z: R });
});
gsap.set(cylinder, { z: 0.26 * window.innerWidth - R, rotateX: lerp(startDeg, endDeg, progress) });
```

#### 9. Ato 3b (`#solution`): Manifesto Mono + 12 Cards Orbitais (`001`–`012`) (`1c6f0368.js`)
- **O que é**: o texto central *"Most will run A/B tests… I will..."* emerge de `blur(16px)` em `p = 0.34–0.42`, permanece fixo no centro enquanto **12 cards `#121212`** sobem de `+122vh` até `-122vh` (`p = 0.42–0.93`, stagger `0.15`), abrindo lateralmente em arco senoidal alternado (esquerda/direita `±min(22vw, 360px) * sin(u·π)^1.25`) com inclinação dinâmica (`±(6 + 12·arc) * cos(u·π)` graus). Entre `0.80–0.88` o texto central borra (`18px`); entre `0.93–1.00` os cards finais borram (`18px`) e somem.
- **Gatilho**: mesmo `ScrollTrigger` de `#solution` (`scrub: true`).
- **Feito com**: GSAP `ScrollTrigger`.
```js
const maxX = Math.min(0.22 * window.innerWidth, 360);
const side = index % 2 === 0 ? -1 : 1;
const arc  = Math.pow(Math.sin(u * Math.PI), 1.25);
const yPos = gsap.utils.mapRange(0, 1, 1.22 * vh, -1.22 * vh, clamp(0, 1, u + 0.12 * Math.sin(2 * Math.PI * u)));
gsap.set(card, { xPercent: -50, yPercent: -50, x: side * maxX * arc, y: yPos, rotation: side * (6 + 12 * arc) * Math.cos(u * Math.PI) });
```

#### 10. Ato 4 (`#investment`): Blur-Slide de Entrada e Saída (`1c6f0368.js`)
- **O que é**: ao longo de `400vh`, o bloco da oferta sobe `60px → 0` saindo de `blur(18px)` (`p = 0.05–0.22`, `easeOutCubic`), fica perfeitamente imóvel por 50% do percurso (`0.22–0.72` = 1 800 px de leitura calma) e volta a desfocar (`0 → 18px`) saindo de `0.72` a `1.00`.
- **Gatilho**: `ScrollTrigger` em `#investment` (`scrub: true`).
- **Feito com**: GSAP `ScrollTrigger`.
```js
const tIn  = clamp(0, 1, mapRange(0.05, 0.22, 0, 1, p));
const tOut = clamp(0, 1, mapRange(0.72, 1.00, 0, 1, p));
const alpha = (1 - (1 - tIn) ** 3) * (1 - tOut);
gsap.set(el, { autoAlpha: alpha, filter: `blur(${(1 - tIn) * 18 + tOut * 18}px)`, y: 60 * (1 - tIn) ** 3 });
```

#### 11. Ato 5 (`#why`): Órbita 3D de 12 Logotipos (`1c6f0368.js`)
- **O que é**: 12 painéis curvos (6 logos × 2) orbitam uma elipse (`radiusX: 2.2`, `radiusZ: 2.0`) em giro contínuo (`0.16 rad/s`) + rotação extra por scroll (`0.85` voltas), enquanto o plano da órbita bascula em 3D (`tiltX: 16° → -22°`, `tiltZ: 28° → -6°`). Logos na metade traseira (`z ≤ 0`) recebem `renderOrder: 0` (atrás do halo escuro `renderOrder: 5`), e na frente (`z > 0`) recebem `renderOrder: 10`, passando por cima do título `"25+ Years..."`.
- **Gatilho**: `IntersectionObserver` (`rootMargin: "40% 0px"`) liga `frameloop="always"`; `ScrollTrigger` (`top bottom → bottom top`) dirige inclinação e giro.
- **Feito com**: `@react-three/fiber` + Three.js r181 + `ScrollTrigger`.
```js
const theta = baseAngle + smoothProgress * Math.PI * 2 * 0.85 + clock.elapsedTime * 0.16;
pos.set(Math.sin(theta) * 2.2, 0, Math.cos(theta) * 2.0).applyEuler(tiltEuler);
mesh.position.copy(pos);
mesh.renderOrder = pos.z > 0 ? 10 : 0;
```

#### 12. Ato 6 (`#get-started`): Fogo Pixelado DOOM Fire Interativo (`1c6f0368.js`)
- **O que é**: autômato celular térmico 2D rodando em CPU (`Uint8Array` de `W×H` com passo `10px` desktop / `7px` mobile), propagando calor de baixo para cima com resfriamento aleatório e vento lateral proporcional à velocidade `vx` do ponteiro. O mouse injeta faíscas com rastro de 16 amostras; **passar o mouse no botão CTA ativa `calmTarget = 1`**, aumentando o resfriamento (`+5`) e reduzindo a chama base para legibilidade máxima. Um `ShaderMaterial` converte o canal vermelho da `DataTexture` (`NearestFilter`) na paleta de 6 cores e dissolve o topo (`smoothstep(1.0, 0.7, vUv.y)`).
- **Gatilho**: `IntersectionObserver` (`rootMargin: "240% 0px"`) monta o canvas antecipadamente; fade-in `0.9s --bezzy3` após compilar 3 frames; reage a `pointermove` e hover no CTA.
- **Feito com**: Three.js `DataTexture` + `ShaderMaterial` GLSL.
```glsl
float h = pow(texture2D(uHeat, vUv).r, 0.9);
float roof = smoothstep(1.0, 0.7, vUv.y);
gl_FragColor = vec4(palette(h), smoothstep(0.03, 0.2, h) * roof);
```

#### 13. Cursor Squash-and-Stretch + Rastro WebGL2 Unicorn Studio (`63ccaffd.js` + `afdc7478.js` + `cursor-trail.json`)
- **O que é**: duas camadas sincronizadas ao mouse (somente desktop `≥1024px`):
  1. **Cursor DOM (`.dkwlAp`, `z-index: 9999999999`)**: quadrado branco `12×12px` segue o cursor com `gsap.to(..., { duration: 0.95, ease: 'power3.out' })`, rotaciona para `atan2(dy, dx)` e deforma proporcionalmente à velocidade (`scaleX: 1 + s`, `scaleY: 1 - s`, teto `0.5`). Desaparece (`opacity: 0`, `250ms ease-out`) sobre qualquer `[data-label="cursor"]`.
  2. **Rastro WebGL2 (`section#unicorn`, `z-index: 600`)**: cena Unicorn Studio (`GP Cursor`, `/cursor-trail.json`) com 3 shaders GLSL 300 es — `mouseDraw` com FBO ping-pong + distorção `liquify` colorida em `#EE344A` (`vec3(0.933, 0.204, 0.290)`) seguido por um shader `pixelate` (`gridSize ≈ 0.035`).
- **Feito com**: GSAP + Unicorn Studio 1.4.6 (Curtains.js).
```js
const angle = Math.atan2(dy, dx) * 180 / Math.PI;
const s = Math.min(Math.hypot(dx, dy) / 400, 0.5);
gsap.set(cursorEl, { x, y, rotate: angle, scaleX: 1 + s, scaleY: 1 - s });
```

#### 14. Film Grain 30fps (`a2128ee2.js`) + Transição Pixelada de Rota (`9c62f6e7.js`) + Indicador da Nav (`1c6f0368.js`)
- **Film Grain (`Noise`, `canvas.fSFySd`, `z-index: 9999999999`)**: canvas 2D em `opacity: 0.06` e `image-rendering: pixelated` preenchendo um `Uint32Array` (95% preto `0xff000000`, 5% branco `0xffffffff`) frame sim, frame não (~30fps). **Desliga** quando `isReducedMotion || isLowPowerMode`.
- **Transição Pixelada (`PixelatedOverlayProvider`, `z-index: 99999`)**: ao sair da página (ex.: clique no logo `G` para `/`), gera uma grade de blocos `#EE344A` de `60×60px` (360 blocos em 1440×900) e os liga em ordem aleatória (`duration: 0.001, delay: 0.05, stagger: { each: 0.5 / N, from: 'random' }`), navega e apaga da mesma forma.
- **Indicador da Nav lateral (`.bzTKyI`)**: quadrado branco `7×7px` desliza para o item ativo via `gsap.to(dot, { y, duration: 0.55, ease: 'power3.out', overwrite: true })`.

### Coreografia da página (linha do tempo)

- **Carga (`t = 0s → ~2.6s`)**: `body` travado + `lenis.stop()` → ampulheta entra (`+0.2s`) e texto `0%` (`+0.4s`) → ao montar hero+why, conta `0→100%` (`~0.4s`) → preloader sai (`0.6s`) → libera `Lenis` → header desce (`1.2s`), hero surge (`+0.6s`, `1.0s`), nav lateral surge (`+0.8s`, `1.0s`).
- **Rolagem (`0 px → 17 640 px`)**:
  - `0 – 4 500 px` (`#intro`): hero some nos primeiros 1 575 px; hélice 3D gira e pixeliza na velocidade.
  - `2 880 – 9 540 px` (`#problem`, entra sobrepondo 1 620 px): palavras → 5 cards Bézier → blur + subida dos cards puxando `clip-path` de *"Is this you right now?"*.
  - `8 100 – 14 940 px` (`#solution`, sobrepõe 1 440 px): cilindro 3D gira → manifesto entra → 12 cards orbitam em zigue-zague → blur de saída.
  - `13 230 – 16 830 px` (`#investment`, sobrepõe 1 710 px): blur-up → leitura estática de 1 800 px → blur-out.
  - `15 840 – 16 740 px` (`#why`, sobrepõe 990 px): anel 3D inclina e gira em volta dos 25+ anos.
  - `16 740 – 17 640 px` (`#get-started`): fogo pixelado interativo + CTA final.

### `prefers-reduced-motion`

- **O que o site respeita** *(lido)*: `PerformanceProvider` consulta `window.matchMedia('(prefers-reduced-motion: reduce)')`; quando ativo, **desliga o canvas de ruído (`Noise`)**, **congela a interação de mouse e vento do fogo** (deixando uma chama calma de base) e remove a transição de `0.9s` do wrapper do fogo (`@media (prefers-reduced-motion: reduce) { transition: none }`).
- **O que não respeita**: 0 regras CSS globais para reduzir transições; a hélice 3D, a órbita 3D, o cilindro 3D, o rastro Unicorn Studio e o smooth scroll do Lenis continuam ativos. **Ao reconstruir**: desative Lenis, congele rotações contínuas e troque cenas sticky de `500–760vh` por blocos estáticos.

---

## 9. Stack e ferramentas

| ferramenta | versão | papel em `/ecommerce` | evidência |
|---|---|---|---|
| **Next.js** | `16.1.6` | App Router, SSR, Turbopack, `next/font/local` | `window.next.version` em `69be3981.js` |
| **React** | `19.3.0-canary` | UI + reconciler WebGL | `exports.version` em `9c7c5d38.js` |
| **styled-components** | `6.3.8` | estilos SSR + objeto `theme` | `<style data-styled-version="6.3.8">` |
| **GSAP** | `3.14.2` | `ScrollTrigger`, `SplitText`, `ScrambleTextPlugin`, `ticker` | `b7f41434.js`, `ab544e0a.js`, `3dc7127d.js`, `63ccaffd.js` |
| **Lenis** | `1.3.17` | rolagem suave (`ReactLenis`, `autoRaf: false`) | `window.lenisVersion` em `48d69c1b.js` |
| **Three.js + R3F** | `r181` | 3 cenas WebGL2 (`#intro`, `#why`, `#get-started`) | `THREE__="181"` em `23e81395.js` + `1c6f0368.js` |
| **postprocessing** | n/d | `EffectComposer` + `HelixPixelation` | `5ddbffe3.js` + `1c6f0368.js` |
| **Unicorn Studio** | `1.4.6` | rastro WebGL2 pixelado (`cursor-trail.json`, motor Curtains.js) | `unicornStudio.umd.8d7f08a7.js` + `afdc7478.js` |
| **Cal.com** | `embed.js` | modal de agendamento `grilledpixels/30min` | `app.cal.com/embed/embed.js` |
| **Ferramenta de design** | **não determinável** | sem metadados de Figma/Blender nos arquivos | — |

### Peso da página e código ocioso (achado crítico)

- **Peso total capturado**: **9,7 MB** em **77 arquivos** (37 JS/JSON, 23 imagens, 7 fontes `.woff2` = 142 KB, 3 CSS = 3,8 KB + inline SSR).
- **Código carregado mas NÃO usado nesta página (~3,3 MB — 34% do peso total!)**:
  1. **`@dimforge/rapier3d-compat` (WASM embutido em `e58a2bf8.js` — 2,23 MB!)**: motor de física 3D em Rust carregado no layout/chunk compartilhado com a home, mas sem nenhum corpo rígido em `/ecommerce`.
  2. **Mux Player + `hls.js` (`97484b9c.js` 500 KB + `fef6e8be.js` 508 KB + thumbnail `image.mux.com`)**: player de vídeo do showreel da home, sem vídeo algum nesta página.
  3. **Howler.js (`ce008d83.js`, 36 KB)**: player de áudio dos estudos de caso da home, sem áudio aqui.
  4. **GSAP `ScrollSmoother` (`9f2bb0c4.js`, 43 KB)**: carregado no bundle, mas quem faz o smooth scroll é o **Lenis 1.3.17**.
  5. **Framer Motion (`AnimatePresence`)** e **`UntitledSans_Bold` (`font-weight: 600`, 21,5 KB)**: sem uso visível na rota.

---

## 10. Acessibilidade e performance

### Acessibilidade (fatos medidos)

- **Pontos positivos**: `lang="en"`, marcos `<header>` e `<nav aria-label="Page sections">`, único `<h1>`, `aria-current="true"` dinâmico na nav lateral, 22 `aria-label` em botões e links sociais, 5 ilustrações marcadas corretamente como decorativas (`alt=""`), contraste `21:1` no texto principal e `5,23:1` no `#EE344A` sobre preto.
- **Lacunas reais**:
  1. **Foco de teclado apagado**: `input:focus, select:focus, textarea:focus, button:focus { outline: none; }` e **0 regras `:focus-visible`** — usuários de teclado não enxergam onde está o foco nos botões *"Schedule a Call"*.
  2. **Contraste baixo na nav lateral e no hover do CTA**: `#ffffff @40%` em `11px` entrega **`3,66:1`**, e texto `#ffffff` sobre `#EE344A` no hover do CTA glass (`12px`) entrega **`4,02:1`** (ambos abaixo de `4,5:1` WCAG AA para texto pequeno).
  3. **Ordem de headings quebrada (`333122333332222`)**: os três `<h3>` do modal de contato oculto vêm antes do `<h1>` no DOM.
  4. **Sem skip link** e `prefers-reduced-motion` apenas parcial.

### Performance

- **4–5 canvas simultâneos** (2 fixos full-viewport: Film Grain 2D + Unicorn Studio WebGL2; + 3 cenas Three.js WebGL2, sendo `#why` e `#get-started` ligadas sob demanda por `IntersectionObserver` — boa prática!).
- **Laço contínuo em repouso**: `requestAnimationFrame` nunca para (GSAP ticker + Lenis + Film Grain 30fps + Unicorn Studio + Three.js), consumindo bateria mesmo com a aba parada.
- **Maior oportunidade de ganho**: isolar o bundle da rota `/ecommerce` (removendo Rapier3D, Mux/HLS, Howler e ScrollSmoother) cortaria **~3,3 MB de JS** de imediato, acelerando o TTI e o tempo de preloader no mobile.

---

## 11. Como reconstruir

### Ordem recomendada de construção

1. **Base tipográfica e escala raiz**: configure `html { font-size: 62.5% }` (ou use os `clamp()` em `px` de [tokens.css](design-system/tokens.css)), `background: #000000`, `color: #ffffff`, e carregue o trio de fontes (neo-grotesca + pixel display + mono técnica).
2. **Layout estático bonito sem scroll-jacking**: monte primeiro o header fixo, a nav lateral e as 6 seções empilhadas em `100vh` normais, garantindo legibilidade e hierarquia sem nenhuma animação.
3. **Engine de scroll unificada**: instale `lenis` + `gsap` (`ScrollTrigger`) e conecte `gsap.ticker.add(t => lenis.raf(t * 1000))` com `autoRaf: false` — nunca deixe dois loops competindo.
4. **Coreografia das seções sticky**: aplique as alturas (`500vh / 740vh / 760vh / 400vh / 100vh / 100vh`) e as margens negativas (`-180vh / -160vh / -190vh / -110vh`) com `z-index` crescente, escrevendo os `onUpdate(progress)` puros dentro de `gsap.context()` para cleanup seguro em SPA.
5. **Camadas WebGL2 sob demanda**: adicione as 3 cenas Three.js com `IntersectionObserver` controlando `frameloop="always" | "demand"` e `gl.dispose()` no unmount.
6. **Acabamento e acessibilidade**: adicione o film grain 2D (desligado em `prefers-reduced-motion`), cursor/hover e **restaure `:focus-visible`** + fallback estático para `prefers-reduced-motion: reduce`.

### Armadilhas encontradas no código original

- **Sobreposição de âncoras**: ao usar `margin-top` negativo em seções sticky, `scrollIntoView()` cai no lugar errado — o autor resolveu com `er(el)` somando `Math.abs(marginTop)` ao `offset` do `lenis.scrollTo`.
- **Cilindro CSS 3D**: sem `backface-visibility: hidden` no filho de cada linha, o texto aparece espelhado atrás do cilindro.
- **DOOM Fire nítido**: sem `texture.minFilter = texture.magFilter = THREE.NearestFilter`, o WebGL borra os pixels e destrói a estética pixel-art.

---

## 12. Como adaptar para outro projeto (modo ADAPT)

| manter (o ofício) | trocar (a identidade) |
|---|---|
| Estrutura narrativa em 6 atos (Promessa → Dor → Método → Oferta → Credibilidade → Ação) | Marca, monograma, copy, preço e capturas de portfólio |
| Contraste de **duas vozes tipográficas na mesma manchete** (neutra + expressiva) | Trocar `Tronica Mono` por outra fonte de acento do nicho (ex.: serifa editorial itálica para luxo, condensada para esportes) |
| Disciplina cromática 98% neutro + 1 cor de ação exclusiva | Trocar `#000000/#121212/#EE344A` pela paleta do seu produto |
| Curvas `--bezzy` (`0.8,0,0,1`) e `--bezzy2` (`0.43,0.195,0.02,1`), pausas de leitura em seções sticky e wipe `clip-path` guiado por elementos | Trocar a metáfora "pixels grelhados" (fogo pixelado, pixelação por velocidade, grade 60×60px) pela metáfora visual do seu nicho |
| Carregamento sob demanda de WebGL via `IntersectionObserver` + `frameloop="demand"` | Remover completamente Rapier3D, Mux e Howler se não forem usados |

---

## 13. Medido × lido × interpretado (e o que ficou de fora)

- **Medido (Chromium via `site_design.mjs` + captura Playwright complementar)**: dimensões, 17 640 px de altura, geometria das 6 seções, cores computadas, pesos usados vs declarados, 19 estilos tipográficos, estados de repouso e hover dos 4 componentes visíveis, ausência de `:focus-visible`, 15 animações CSS, 3 `IntersectionObserver`, telas desktop/mobile.
- **Lido diretamente no código-fonte (`site/www.grilledpixels.com/`)**: objeto `theme` completo, versões reais das bibliotecas (`GSAP 3.14.2`, `Next 16.1.6`, `Three r181`, `Lenis 1.3.17`, `Unicorn Studio 1.4.6`), todas as fórmulas de `ScrollTrigger`, os 3 shaders GLSL (`HelixPixelation`, `cursor-trail.json`, `DOOM Fire`), os parâmetros de câmera/órbita/hélice, o CSS SSR do modal de contato e o peso ocioso de Rapier3D/Mux/Howler.
- **Interpretado (análise editorial)**: essência da marca, traços de personalidade, regras "não faça", escolhas de fontes substitutas abertas e plano de adaptação.
- **O que ficou de fora da medição em runtime**: interação interna do modal de agendamento do **Cal.com** (serviço externo em iframe), abertura/validação ao vivo do modal de contato (fechado por padrão em `/ecommerce`, estilos lidos no CSS SSR) e demais rotas do domínio (`/`, casos de estudo).

---

## Por trás do código

- **Por que `margin-top` negativo (`-180vh`) em seções sticky funciona tão bem**: em sites sticky comuns, há um "vazio morto" quando uma seção solta e a próxima ainda está subindo. Sobrepor as seções com `margin-top` negativo e `z-index` crescente faz o próximo ato começar a emergir *enquanto* o anterior desbota em `blur(18px)` — criando um corte cinematográfico contínuo sem WebGL de tela cheia.
- **Por que o fogo pixelado roda em CPU (`Uint8Array`) + `DataTexture` em vez de ping-pong FBO**: numa grade propositalmente baixa (`144×90 = 12 960` células), iterar um `Uint8Array` em JS leva menos de `0.2ms` por frame, permite injetar lógica complexa de mouse/calma/aleatoriedade sem gerenciar múltiplos render targets WebGL e ainda funciona em GPUs modestas.
- **Por que o `HelixPixelation` usa `THREE.MathUtils.damp` com dois lambdas (`14` e `5`)**: resposta rápida quando o usuário acelera o scroll (`λ=14` — o efeito aparece instantaneamente) e recuperação elástica mais lenta ao parar (`λ=5` — a imagem "entra em foco" suavemente). Esse conceito de *attack rápido / release suave* (vindo de compressores de áudio) é um dos segredos de motion tátil.
- **Por que `Untitled Sans` + `Tronica Mono` funcionam juntas na mesma palavra**: têm pesos visuais compatíveis em `400` e compartilham o mesmo `line-height: 0.88`, mas geometrias opostas (curvas neo-grotescas vs. grade retangular). O segredo está no `letter-spacing: 0` exclusivo da `Tronica Mono` — sem isso, o tracking negativo (`-0.04em`) fundiria os pixels.
- **O que estudar para dominar este nível de front-end**: (1) `ScrollTrigger.create({ onUpdate })` com funções matemáticas puras (`mapRange`, `clamp`, Bézier quadrática, `sin/cos`) em vez de timelines rígidas; (2) CSS 3D `preserve-3d` + trigonometria de cilindro (`2 * asin(h / 2R)`); (3) `postprocessing` custom `Effect` no R3F; (4) `DataTexture` com `NearestFilter` para shaders retro-generativos; e (5) auditoria de chunks no Next.js App Router para não vazar 3 MB de bibliotecas de outras rotas numa landing de conversão.

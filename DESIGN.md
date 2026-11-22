# DESIGN.md — DIAS77

Sistema visual do portfólio 77code.com.br. Vale para todo código, imagem e texto novo do site. Decidido com o Jean em 2026-11-22; o histórico das escolhas está em `docs/superpowers/specs/2026-11-22-identidade-dias77-design.md`.

## 1. A ideia

**Case File 77.** O site é um arquivo de casos contado como episódios de um mangá noir. Cada projeto do Jean é um caso resolvido para uma empresa. O Jean é o personagem principal; a Flora é a parceira que atende no chat.

- **Para quem:** recrutadores e outros devs.
- **O que a pessoa deve pensar ao sair:** "nunca vi uma identidade assim, ele sabe frontend de verdade, e resolve problema de software de empresa".
- **O tom:** a estética é de série criminal e mangá; o texto não finge ser polícia. Rótulos como "CASE 03" e "RESOLVED" são linguagem visual; o conteúdo é sobre trabalho real (o problema da empresa, o que foi construído, a stack).

### Regras que não mudam

1. **O mundo é nanquim, os personagens são cor.** Cenários, molduras, texturas e provas são preto e papel. Só o Jean e a Flora (e o estúdio dela) têm cor. O vermelho é a única cor de interface.
2. **Japonês é tempero, não enfeite.** Aparece como onomatopeia e rótulo de mangá, sempre com significado real e tradução acessível (ver §4).
3. **Nada de outro site.** Nenhum código, imagem, fonte ou composição copiada de referência. Fundo novo é gerado por nós ou tem licença livre registrada (§7).
4. **O café aparece, a piada não.** A xícara fumegante faz parte da cena; nada de frase de efeito sobre café.

## 2. Cor

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#0d0d0d` | Traço, texto, sombras chapadas, fundo do eyecatch e do contato |
| `--paper` | `#f3f0e8` | Papel da página, quadros, caixas de legenda |
| `--paper-shade` | `#e4dfd3` | Papel em segundo plano, retícula clara |
| `--ink-soft` | `#5b5750` | Texto secundário sobre papel (contraste 6.3:1) |
| `--red` | `#c4231c` | Rótulo de episódio, carimbo, fio vermelho, foco (5.1:1 sobre papel) |
| `--kraft` | `#cdb88f` | Pasta do dossiê |
| `--kraft-ink` | `#3a2d1c` | Texto sobre a pasta (6.9:1) |
| `--desk` | `#1c1712` | Mesa escura atrás do dossiê |

- Contraste mínimo de texto: 4.5:1. Branco sobre `--red` passa (5.1:1); `--red` sobre `--ink` não é usado para texto.
- Sem gradientes coloridos, sem glow, sem neon. Luz é sempre feita de papel sobre preto (retícula, feixe, poeira).
- Exceção de cor: as imagens do Jean (`public/static/frames2/`), da Flora e do estúdio dela.

## 3. Tipografia

| Papel | Fonte | Fonte de origem | Pesos |
|---|---|---|---|
| Título principal (DIAS77, eyecatch, nome do caso) | **Humane** | Rajesh Rajput, Gumroad (freeware, uso comercial liberado; arquivos não podem ser modificados) | SemiBold, Bold |
| Títulos de seção e rótulos fortes | **Cabinet Grotesk** | Fontshare (ITF Free Font License) | 800 |
| Japonês (onomatopeia, rótulos) | **Reggae One** | Google Fonts (OFL) | 400 |
| Texto datilografado (dossiê, relatório) | **Special Elite** | Google Fonts (Apache 2.0) | 400 |
| Texto corrido e interface (chat, formulário) | **Familjen Grotesk** | Google Fonts (OFL) | 400, 600 |
| Números técnicos e etiquetas pequenas | `ui-monospace` do sistema | — | 700 |

- **Humane:** usar os `.woff2` que vêm no pacote (`design/fonts/`, fora do git), copiados sem alteração para `public/fonts/`. Não converter, não cortar subconjunto, não renomear o arquivo interno.
- As outras fontes são servidas pelo próprio site (arquivos em `public/fonts/`), não por CDN, para a CSP continuar `font-src 'self'`.
- Fontes proibidas (eram do site de referência): Space Grotesk, Noto Serif JP, Noto Sans JP, Dancing Script.

### Escala

| Token | Tamanho | Fonte | Uso |
|---|---|---|---|
| `--t-hero` | `clamp(96px, 18vw, 280px)`, entrelinha 0.8 | Humane Bold | DIAS77 na abertura |
| `--t-eyecatch` | `clamp(80px, 16vw, 240px)` | Humane Bold | "CASE 01" |
| `--t-case` | `clamp(56px, 9vw, 128px)` | Humane SemiBold | Nome do caso no dossiê |
| `--t-section` | `clamp(28px, 4vw, 48px)`, `letter-spacing: -0.02em` | Cabinet Grotesk 800 | Títulos de seção |
| `--t-type` | `16px` / 1.55 | Special Elite | Relatório do dossiê |
| `--t-body` | `17px` / 1.55 (celular `16px`) | Familjen Grotesk 400 | Texto corrido |
| `--t-label` | `11px`, `letter-spacing: 0.22em`, caixa alta | monospace 700 | Rótulos ("CASE FILE 77 · EPISODE 01") |
| `--t-sfx` | `clamp(24px, 4vw, 56px)` | Reggae One | Onomatopeia |

- Título sobre a cena (abertura): letra `--paper`, contorno `2px --ink` (`-webkit-text-stroke` com `paint-order: stroke fill`) e sombra chapada `5px 5px 0 --ink`. Nunca sombra borrada.

## 4. Japonês

- **Onde:** onomatopeia perto da ação (chuva, carimbo, pasta abrindo) e rótulos verticais nas bordas dos quadros. No máximo dois elementos em japonês por tela.
- **O quê:** só palavras com sentido no contexto. Lista inicial:

| Japonês | Leitura | Sentido | Onde |
|---|---|---|---|
| ザアア… | zaaa | barulho de chuva | Abertura, perto da janela |
| 事件ファイル・第七十七号 | jiken fairu dai 77 gō | arquivo de casos nº 77 | Abertura, rótulo vertical |
| 解決 | kaiketsu | resolvido | Ao lado do carimbo RESOLVED |
| ドン | don | batida (o carimbo) | Quando o carimbo bate |
| パサッ | pasa' | papel/pasta abrindo | Quando o dossiê abre |
| 次回予告 | jikai yokoku | prévia do próximo episódio | Contato |
| 相棒 | aibō | parceira | Cena da Flora |
| 終 | owari | the end | Rodapé ("END OF FILE · 終") |

- **Acessibilidade:** onomatopeia é decorativa (`aria-hidden="true"`). Rótulo com sentido leva `lang="ja"` e a tradução em `aria-label` ou texto escondido para leitor de tela.

## 5. Elementos

- **Quadro (panel):** borda `3px --ink`, fundo `--paper`, cantos retos. Moldura externa da página: borda `3px --ink` com respiro de papel (`outline` de 10px `--paper`). Espaço entre quadros (sarjeta): `8px` no celular, `12px` no desktop.
- **Retícula (tone):** pontos `--ink` em `radial-gradient`, célula de 5 a 7px, opacidade 0.15 a 0.3. Usada em sombra de quadro e fundo de seção, nunca atrás de texto corrido.
- **Caixa de legenda:** `--paper`, borda `2px --ink`, texto monospace ou Familjen. Para frases curtas sobre imagem.
- **Rótulo vermelho:** fundo `--red`, texto `--paper`, `--t-label`. Um por bloco (ex.: "CASE FILE 77 · EPISODE 01").
- **Carimbo:** borda `3px --red`, texto `--red` em Cabinet Grotesk 800 ou monospace 900, girado entre -8° e -14°, levemente transparente (0.9). Texto: "RESOLVED". Sempre acompanhado de 解決 pequeno.
- **Dossiê:** pasta `--kraft` com aba ("CASE 03"), sobre `--desk`. Dentro: folha de relatório `--paper` em Special Elite (THE CASE / THE CLUES / THE SOLUTION), foto de prova (captura do projeto em escala de cinza, com moldura de papel e clipe), fio vermelho ligando a prova às etiquetas de stack (etiquetas `--ink` com texto `--paper`), carimbo no fim. Link "VIEW THE SITE →" como botão de quadro.
- **Botão:** retângulo `--ink` com texto `--paper` em `--t-label`, sombra chapada `4px 4px 0 --red` no hover; foco com contorno `3px --red` deslocado 3px.
- **Fio vermelho:** SVG, `stroke --red`, 1.5px, com pontos de alfinete (círculo `--red` 9px).
- **Eyecatch:** tela cheia `--ink`, "CASE 0N" em Humane `--paper`, nome do projeto em monospace, rótulo vertical em japonês.
- **Chat da Flora (exceção pedida pelo Jean):** mantém o visual do chat antigo, só com as nossas fontes: sem caixa nem papel, texto claro (`--paper`) direto sobre o estúdio; título em caixa alta espaçada (Cabinet Grotesk) com subtítulo pequeno; o nome (FLORA / YOU) acima de cada fala em `--t-label`; histórico que some em degradê embaixo (máscara); campo só com uma linha embaixo, placeholder em itálico, botão de texto "SEND" com sublinhado que cresce no hover. Código escrito por nós (não copiar o CSS antigo).
- **Sem cabeçalho** (decisão do Jean): não há barra fixa nem menu.
- **Rodapé:** "END OF FILE · 終" em `--t-label`, DIAS77 enorme em Humane só com contorno (`-webkit-text-stroke`, preenchimento transparente) sobre `--ink`, créditos em monospace, a xícara fumegante, links (e-mail, WhatsApp, GitHub, LinkedIn) e o botão "Rewind episode ↑".

## 6. Movimento

Bibliotecas: GSAP + ScrollTrigger (via `@gsap/react`) e Lenis para o scroll suave.

| Momento | O que acontece | Duração / gatilho |
|---|---|---|
| Carregando | A abertura aparece na hora; uma etiqueta pequena num canto ("opening the file… 67%", monospace sobre `--ink`) mostra o progresso dos 40 quadros por cima da cena e some com um carimbo pequeno ao chegar a 100% | Não bloqueia nada; ambiente e scroll ligam quando prontos |
| Abertura | A cena fica presa e o scroll vira o Jean para a câmera (quadro 1 → 40, volta ao subir; quadro ainda não carregado usa o mais próximo). Parado, ele respira (escala 1→1.006, 4s) | Atrelado ao scroll da abertura (~1,5 tela) |
| Abertura, ambiente | Chuva atrás da persiana, nuvem passando na lua (a sala escurece até 30% e volta, 11s), poeira no feixe de luz, abajur piscando (a cada ~6s), fumaça do café (3.6s) | Contínuo |
| Abertura, câmera | Fundo, personagem e título se movem em camadas com o mouse (±14px, ±10px, ±22px); no celular, com o scroll | Contínuo |
| Eyecatch | Um corte de nanquim varre a tela, "CASE 0N" entra, segura, sai | Preso no scroll (~1 tela) |
| Dossiê | **Preso.** A pasta abre (パサッ), a folha desliza, a prova cai com o clipe, o fio se desenha até as etiquetas, o carimbo bate (ドン); folha, foto e etiquetas em parallax (profundidades diferentes) | Preso, atrelado ao scroll (~1,5 tela por caso) |
| Profile | **Preso.** O retrato desliza mais devagar que o resto (parallax), o texto "about" é datilografado conforme o scroll, os três quadros de especialidade são assentados um a um como quadros de mangá | Preso (~1,5 tela) |
| Flora | **Presa.** A câmera entra no estúdio em camadas (janela/chuva mais lenta, Flora mais rápida), ela troca de expressão ao ver o visitante (warm → happy) e só então o chat aparece | Preso (~1 tela); o chat funciona depois do pin |
| Próximo episódio | **Preso.** Prévia de anime: 次回予告 entra grande, "Your project." varre a tela, um "77" gigante ao fundo em parallax, o formulário entra por último | Preso (~1 tela) |
| Rodapé | "END OF FILE · 終", DIAS77 enorme vazado em Humane, créditos rolando como encerramento de anime (Story & code: Jean Dias · Partner: Flora · Filed in Presidente Prudente), xícara fumegando, "Rewind episode ↑" volta ao topo | Créditos atrelados ao scroll do rodapé |
| Seções (regra) | **Toda cena tem trava de scroll (pin) com parallax ou outra animação** (decisão do Jean, 2026-11-22). Quadros entram na ordem de leitura com corte reto (clip-path), sem fade genérico | — |

- **Curvas:** `power3.out` para entradas, `power2.inOut` para cortes, `back.out(2)` só no carimbo.
- **Preferência por menos movimento** (`prefers-reduced-motion`): sem parallax, sem chuva/poeira, sem eyecatch preso; os quadros aparecem prontos; a animação dos 40 quadros vira o quadro final parado; o carimbo já está lá.
- **Desempenho:** 60fps no desktop médio. Canvas só para chuva e poeira, pausado fora da tela (IntersectionObserver). Imagens em `.webp`/`.avif` com largura certa.

## 7. Imagens

- **Cenários novos:** gerados pelo Jean (ex.: Gemini) a partir de prompt nosso, em nanquim e retícula, 16:9, pelo menos 1920px, sem texto e sem logo, com área livre para personagem e título. Se vier foto, passa pelo filtro de nanquim (script em `scripts/`).
- **Licença registrada:** cada imagem de terceiros entra com a origem e a licença num comentário ou em `design/CREDITS.md`. Sem origem conhecida, não entra.
- **Fundo da abertura:** `design/fundo-hero/delegacia-noir-gemini.jpeg` (gerado pelo Jean, 2752×1536).
- **Capturas dos projetos:** em escala de cinza dentro do dossiê; em cor só quando o visitante abre a captura ampliada.
- **Flora:** o estúdio dela (`public/static/char/`) continua como está, em cor; é a base da parceira.

## 8. Layout

- Página única, rolagem vertical. Largura de leitura máxima do texto corrido: 64ch.
- **Quebras:** celular até 767px, tablet 768–1199px, desktop a partir de 1200px.
- **Celular:** cada cena vira uma pilha de quadros; a abertura mantém o personagem embaixo e o título em cima; o dossiê abre em coluna (folha, depois prova, depois etiquetas); o parallax do mouse vira um parallax leve de scroll.
- Moldura de página (borda + respiro de papel) em todas as cenas, inclusive no celular (respiro de 6px).

## 9. Texto

- Site em **inglês**. Frases curtas. Rótulo em caixa alta; conteúdo em caixa normal.
- Estrutura do caso: **THE CASE** (o problema da empresa, uma frase), **THE CLUES** (o que se descobriu sobre os usuários), **THE SOLUTION** (o que foi construído), stack em etiquetas.
- Sem preço, sem vida pessoal além do que está na seção "about" (21 anos, UNOESTE, Presidente Prudente, experiência de balcão de vendas).

## 10. Acessibilidade

- Contraste conforme §2. Foco visível em tudo que é clicável (§5, botão).
- Toda imagem de conteúdo com `alt`; cenário e onomatopeia com `alt=""`/`aria-hidden`.
- O site funciona inteiro com teclado; o chat é um formulário de verdade.
- `prefers-reduced-motion` respeitado conforme §6.

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
3. **Nada de outro site.** Nenhum código, imagem, fonte ou composição copiada de referência. Fundo novo é gerado por nós ou tem licença livre registrada (§7). Exceção escolhida pelo Jean (2026-11-22): dois pens de licença MIT serviram de base, reescritos na nossa identidade e registrados em `design/CREDITS.md` (o leque de projetos e a chuva de caracteres, §5). O `DESIGN_V2.md` é o estudo de um site de terceiros: dele vêm só ideias de arquitetura (card numerado, hélice de telas), com código e tokens nossos.
4. **O café aparece, a piada não.** A xícara fumegante faz parte da cena; nada de frase de efeito sobre café.

## 2. Cor

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#0d0d0d` | Traço, texto, sombras chapadas, fundo dos projetos e do contato |
| `--paper` | `#f3f0e8` | Papel da página, quadros, caixas de legenda |
| `--paper-shade` | `#e4dfd3` | Papel em segundo plano, retícula clara |
| `--ink-soft` | `#5b5750` | Texto secundário sobre papel (contraste 6.3:1) |
| `--red` | `#c4231c` | Rótulo de episódio, carimbo, fio vermelho, foco (5.1:1 sobre papel) |
| `--kraft` | `#cdb88f` | Reserva (era a pasta do dossiê) |
| `--kraft-ink` | `#3a2d1c` | Texto sobre a pasta (6.9:1) |
| `--desk` | `#1c1712` | Fundo escuro de cena (profile, Flora, dobra sem captura) |

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
| `--t-eyecatch` | `clamp(80px, 16vw, 240px)` | Humane Bold | Nome na ficha do projeto |
| `--t-case` | `clamp(56px, 9vw, 128px)` | Humane SemiBold | Títulos "Projects." e "Your project." |
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
| 次回予告 | jikai yokoku | prévia do próximo episódio | Contato |
| 相棒 | aibō | parceira | Cena da Flora |
| 終 | owari | the end | Rodapé ("END OF FILE · 終") |

- **Chuva de caracteres (§5):** fundo decorativo; usa só os caracteres desta tabela e algarismos, nunca japonês novo.
- **Acessibilidade:** onomatopeia é decorativa (`aria-hidden="true"`). Rótulo com sentido leva `lang="ja"` e a tradução em `aria-label` ou texto escondido para leitor de tela.

## 5. Elementos

- **Card numerado** (pedido do Jean, 2026-11-22; arquitetura do card orbital do `DESIGN_V2.md` §7.6, com os nossos tokens; é o card padrão de conteúdo): superfície lisa `--desk` sobre cena `--ink` (ou `--ink` sobre cena mais clara), **sem borda, sem sombra e sem raio**, `padding: 22px 22px 24px`, conteúdo distribuído de cima a baixo. No topo, o índice em monospace 500 (`001`, 13px, `letter-spacing: 0.08em`, `--paper` a 60%); no meio, linhas com rótulo mono a 60% à esquerda e texto em Familjen à direita; na base, o título em caixa alta em Familjen 400, 24px, entrelinha 1.2, `letter-spacing: -0.03em`. Sem estado de hover. No celular vira uma faixa compacta (`padding: 12px 14px`, título 17px) com o índice no canto de baixo à direita, na linha do título. Hoje: as três especialidades do profile.
- **Personnel file (profile)** (refeito a pedido do Jean, 2026-11-22: assimétrico, tela cheia, sem contêiner): cena `--ink` com uma **folha `--paper` cortada na diagonal** ocupando 40% da esquerda (retícula na beira do corte). Na folha: rótulo vermelho, o texto "about" em nanquim e o personagem em pé no rodapé, recortado e sem moldura (a imagem tem fundo transparente). "DIAS77" enorme em Humane atravessa o corte com `mix-blend-mode: difference` (nanquim sobre o papel, papel sobre o nanquim). À direita, os três cards numerados descem **em escada** da borda direita para a esquerda, paralelos ao corte; um "77" gigante vazado ocupa o canto que a escada deixa livre, o rótulo vertical 事件ファイル・第七十七号 fica na margem do corte e a chuva de caracteres cai ao fundo. No desktop tudo é medido em `--u` (1/100 da largura de um quadro 16:9 que cabe na janela), então a cena cresce e encolhe com a tela. Até 1199px vira pilha: a folha em cima (retrato, título em nanquim, texto) com corte inclinado embaixo, e os cards alternando de lado, cada um saindo por uma borda.
- **Hélice de telas** (pedido do Jean, 2026-11-22; ideia da hélice 3D do `DESIGN_V2.md` §8.5, refeita em CSS 3D, sem WebGL): logo depois da abertura, sobre `--ink`. Oito telas (captura desktop e celular de cada projeto) presas a uma espiral de 1,9 volta, cada uma olhando para fora do eixo. Névoa: quanto mais para trás, mais escura (brilho de 0.16 a 1); só a tela de frente ganha cor, o resto fica em cinza. No centro, rótulo vermelho e uma frase em Humane que recua. Decorativa (`aria-hidden`); não tem a pixelação por velocidade do original.
- **Quadro (panel):** borda `3px --ink`, fundo `--paper`, cantos retos. Moldura externa da página: borda `3px --ink` com respiro de papel (`outline` de 10px `--paper`). Espaço entre quadros (sarjeta): `8px` no celular, `12px` no desktop.
- **Retícula (tone):** pontos `--ink` em `radial-gradient`, célula de 5 a 7px, opacidade 0.15 a 0.3. Usada em sombra de quadro e fundo de seção, nunca atrás de texto corrido.
- **Caixa de legenda:** `--paper`, borda `2px --ink`, texto monospace ou Familjen. Para frases curtas sobre imagem.
- **Rótulo vermelho:** fundo `--red`, texto `--paper`, `--t-label`. Um por bloco (ex.: "CASE FILE 77 · EPISODE 01").
- **Carimbo:** borda `3px --red`, texto `--red` em Cabinet Grotesk 800 ou monospace 900, girado entre -8° e -14°, levemente transparente (0.9). Texto: "RESOLVED". Sempre acompanhado de 解決 pequeno.
- **Leque de projetos** (pedido do Jean, 2026-11-22; substitui o eyecatch e o dossiê): sobre `--ink`, uma dobra por projeto, lado a lado, com as bordas inclinadas em zigue-zague e sombra de dobra. Fechada: captura em cinza e escura, número em etiqueta `--ink` e o nome em pé (Humane). Aberta (rolagem, mouse, foco ou toque): fica 3× mais larga, a captura ganha cor e uma faixa `--ink` embaixo traz nome, resumo de uma frase e "OPEN FILE →" com sublinhado `--red`. Clicar abre a ficha. No celular o leque fica em pé (uma dobra por linha).
- **Ficha do projeto:** tela cheia `--ink` por cima da página (`<dialog>`; o endereço não muda, a ficha aberta fica no estado do histórico e o botão voltar fecha): "← BACK TO THE FILES", rótulo vermelho "FILE 0N / 0T", nome em Humane, captura em cor com moldura `--paper` e uma folha `--paper` (quadro com retícula) com THE CASE / THE CLUES / THE SOLUTION, STACK (etiquetas `--ink` com texto `--paper`) e REFERENCES (endereço e botão "VIEW THE SITE →"). No fim, **próximo projeto**: uma dobra larga com a captura do projeto seguinte escura e em cinza, rótulo vermelho "NEXT FILE · 0N / 0T", o nome em Humane e uma seta; apontar dá cor à captura e empurra a seta. Depois do último vem o primeiro.
- **Contato (próximo episódio)** (refeito a pedido do Jean, 2026-11-22, a partir de um print de referência): cena `--ink` com uma **faixa `--red`** atravessando a tela (de 16% a 84% da altura) e a **folha do formulário**, o único papel, mais alta que a faixa e por cima dela (sombra chapada `10px 10px 0 --ink`). Na folha: rótulo vermelho "NEXT EPISODE", "Your project." em Humane, um traço, os campos só com a linha de baixo e o botão "SEND" de largura inteira. A faixa tem a chuva de caracteres por cima, em nanquim (opacidade 0.34). Nela, à esquerda da folha, os canais em coluna; à direita, 次回予告 enorme em pé com o rótulo "PREVIEW" e um traço ao lado. O 77 vazado e a chuva de caracteres ficam ao fundo. No celular a faixa vai de borda a borda, os canais ficam na tira de cima e o 次回予告 na tira da direita.
- **Chuva de caracteres:** canvas de fundo com colunas de caracteres caindo em `--paper` (uma em doze em `--red`), opacidade 0.10 a 0.14, sobre `--ink`: projetos, ficha do projeto, profile e contato. Sobre o vermelho (faixa do contato) ela cai em nanquim. Nunca verde, nunca com brilho.
- **Botão:** retângulo `--ink` com texto `--paper` em `--t-label`, sombra chapada `4px 4px 0 --red` no hover; foco com contorno `3px --red` deslocado 3px.
- **Chat da Flora (exceção pedida pelo Jean):** mantém o visual do chat antigo, só com as nossas fontes: sem caixa nem papel, texto claro (`--paper`) direto sobre o estúdio; título em caixa alta espaçada (Cabinet Grotesk) com subtítulo pequeno; o nome (FLORA / YOU) acima de cada fala em `--t-label`; histórico que some em degradê embaixo (máscara); campo só com uma linha embaixo, placeholder em itálico, botão de texto "SEND" com sublinhado que cresce no hover. Código escrito por nós (não copiar o CSS antigo).
- **Sem cabeçalho** (decisão do Jean): não há barra fixa nem menu.
- **Rodapé:** "END OF FILE · 終" em `--t-label`, um **gato de nanquim sentado numa lua de papel** abanando o rabo (no lugar do DIAS77 gigante, a pedido do Jean, 2026-11-22; SVG gerado do Lottie `design/Loader cat.json` por `scripts/make-cat.py`, recolorido: corpo `--desk`/`--ink`, peito `--paper`, focinho `--red`) sobre `--ink`, créditos em monospace, a xícara fumegante, links (e-mail, WhatsApp, GitHub, LinkedIn) e o botão "Rewind episode ↑".

## 6. Movimento

Bibliotecas: GSAP + ScrollTrigger (via `@gsap/react`) e Lenis para o scroll suave.

| Momento | O que acontece | Duração / gatilho |
|---|---|---|
| Carregando | A abertura aparece na hora; uma etiqueta pequena num canto ("opening the file… 67%", monospace sobre `--ink`) mostra o progresso dos 40 quadros por cima da cena e some com um carimbo pequeno ao chegar a 100% | Não bloqueia nada; ambiente e scroll ligam quando prontos |
| Abertura | A cena fica presa e o scroll vira o Jean para a câmera (quadro 1 → 40, volta ao subir; quadro ainda não carregado usa o mais próximo). Parado, ele respira (escala 1→0.994, 4s; para dentro, para o repaint não ficar maior que o quadro da casca) | Atrelado ao scroll da abertura (~2,2 telas) |
| Abertura, ambiente | Chuva atrás da persiana, nuvem passando na lua (a sala escurece até 30% e volta, 11s), poeira no feixe de luz, abajur piscando (a cada ~6s), fumaça do café (3.6s) | Contínuo |
| Abertura, câmera | Fundo, personagem e título se movem em camadas com o mouse (±14px, ±10px, ±22px); no celular, com o scroll | Contínuo |
| Hélice de telas | **Presa.** A frase do centro apaga (0 a 35%) e encolhe até metade (0 a 40%) enquanto a espiral sobe de baixo da cena até sair por cima e gira 684° (3,8π) | Presa (~3,8 telas) |
| Projetos | **Preso.** O leque se abre em corte reto enquanto desentorta; depois a rolagem abre uma dobra de cada vez. Parallax: título, capturas dentro das dobras e chuva andam em profundidades diferentes; com mouse, o leque inclina em 3D (±5° / ±3°) e a dobra apontada abre | Preso (~3,2 telas) |
| Ficha do projeto | Entra como uma dobra (corte inclinado da esquerda para a direita, 0,6s) | Ao clicar num projeto |
| Chuva de caracteres | Cai sem parar; a rolagem acelera a queda | Contínuo, pausada fora da tela |
| Profile | **Preso.** Chegada (antes de prender): a folha varre a cena da esquerda (na pilha ela já vem com a seção) e o personagem, escondido por inteiro até a folha estar atrás dele, sobe de trás da borda de baixo. Preso: rótulo e cargo varrem, "DIAS77" sobe de dentro de um corte, o "about" é datilografado, o rótulo vertical desce, os três cards entram tortos pela direita e assentam um a um; personagem, 77 do fundo e chuva em profundidades diferentes; o fim é pausa de leitura. **Saída** (depois do pin, a cena já subindo): os cards são levantados em velocidades diferentes e entortam, a folha com o personagem vai para a esquerda e o título para a direita, o 77 cresce | Preso (~2,6 telas) + saída (1 tela) |
| Flora | **Presa.** A câmera entra no estúdio em camadas (janela/chuva mais lenta, Flora mais rápida), ela troca de expressão ao ver o visitante (warm → happy) e só então o chat aparece | Preso (~3 telas: 1 de animação e 2 de espera com o chat pronto, para a cena não soltar assim que termina); o chat funciona durante a espera e depois do pin |
| Próximo episódio | **Preso.** A faixa vermelha varre a tela, 次回予告 entra grande e assenta, rótulo e canais vêm atrás; a folha do formulário sobe torta de baixo da cena e assenta por cima da faixa, e "Your project." varre por último; um "77" gigante ao fundo em parallax. Saída: a faixa e o 次回予告 se afastam, a folha fica parada | Preso (~2 telas) + saída |
| Rodapé | "END OF FILE · 終", o gato na lua sobe com a entrada do rodapé e abana o rabo em laço de 1,28s (as orelhas mexem), créditos rolando como encerramento de anime (Story & code: Jean Dias · Partner: Flora · Filed in Presidente Prudente), xícara fumegando, "Rewind episode ↑" volta ao topo | Créditos atrelados ao scroll do rodapé |
| Seções (regra) | **Toda cena tem trava de scroll (pin) com parallax ou outra animação** (decisão do Jean, 2026-11-22). Cena nova ou refeita tem também **animação de saída** e composição assimétrica de tela cheia, sem contêiner de largura máxima (pedido do Jean, 2026-11-22). Quadros entram na ordem de leitura com corte reto (clip-path), sem fade genérico | — |

- **Curvas:** `power3.out` para entradas, `power2.inOut` para cortes, `back.out(2)` só no carimbo.
- **Preferência por menos movimento** (`prefers-reduced-motion`): sem parallax, sem chuva/poeira/chuva de caracteres, sem pin, sem hélice de telas; o leque mostra o resumo de todos os projetos; os quadros aparecem prontos; a animação dos 40 quadros vira o quadro final parado; o carimbo já está lá.
- **Desempenho:** 60fps no desktop médio. Canvas só para chuva, poeira e chuva de caracteres, pausado fora da tela (IntersectionObserver). Imagens em `.webp`/`.avif` com largura certa.

## 7. Imagens

- **Cenários novos:** gerados pelo Jean (ex.: Gemini) a partir de prompt nosso, em nanquim e retícula, 16:9, pelo menos 1920px, sem texto e sem logo, com área livre para personagem e título. Se vier foto, passa pelo filtro de nanquim (script em `scripts/`).
- **Licença registrada:** cada imagem de terceiros entra com a origem e a licença num comentário ou em `design/CREDITS.md`. Sem origem conhecida, não entra.
- **Fundo da abertura:** `design/fundo-hero/delegacia-noir-gemini.jpeg` (gerado pelo Jean, 2752×1536).
- **Capturas dos projetos:** em escala de cinza nas dobras fechadas; em cor na dobra aberta e na ficha do projeto.
- **Flora:** o estúdio dela (`public/static/char/`) continua como está, em cor; é a base da parceira.

## 8. Layout

- Página única, rolagem vertical. **Recarregar (F5) sempre volta ao início**: topo da página, sem hash e sem ficha de projeto aberta (pedido do Jean, 2026-11-22); só o voltar/avançar do navegador devolve a posição. Largura de leitura máxima do texto corrido: 64ch.
- **Altura das cenas presas:** `--scene-h` (`100lvh`, a altura maior da tela), nunca `100svh`. No celular a barra do navegador some ao rolar e a tela cresce uns 100px; a cena presa fica com a altura medida no carregamento, e com `svh` sobrava uma faixa vazia embaixo (visto no iPhone 16, 2026-11-22). O que precisa estar sempre à vista (campo do chat, formulário, cards, leque) fica dentro de `--safe-h` (`100svh`): a faixa de baixo (`--scene-extra`) leva só o fundo da cena. Tokens em `src/styles/tokens.css`.
- **Quebras:** celular até 767px, tablet 768–1199px, desktop a partir de 1200px.
- **Celular:** cada cena vira uma pilha de quadros; a abertura mantém o personagem embaixo e o título em cima; o leque de projetos fica em pé e a ficha vira uma coluna (captura, depois folha); o parallax do mouse vira um parallax leve de scroll.
- Moldura de página (borda + respiro de papel) em todas as cenas, inclusive no celular (respiro de 6px).

## 9. Texto

- Site em **inglês**. Frases curtas. Rótulo em caixa alta; conteúdo em caixa normal.
- Na lista, cada projeto mostra nome e uma frase (THE CASE). Estrutura da ficha: **THE CASE** (o problema da empresa, uma frase), **THE CLUES** (o que se descobriu sobre os usuários), **THE SOLUTION** (o que foi construído), stack em etiquetas.
- Sem preço, sem vida pessoal além do que está na seção "about" (21 anos, UNOESTE, Presidente Prudente, experiência de balcão de vendas).

## 10. Acessibilidade

- Contraste conforme §2. Foco visível em tudo que é clicável (§5, botão).
- Toda imagem de conteúdo com `alt`; cenário e onomatopeia com `alt=""`/`aria-hidden`.
- O site funciona inteiro com teclado; o chat é um formulário de verdade.
- `prefers-reduced-motion` respeitado conforme §6.

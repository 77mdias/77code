# Chat da Flora com a API do Claude — desenho

**Data:** 2026-11-22 · **Decisões:** Jean · **Redação:** Claude

## Por quê

O site já tem a cena da Flora AI com um chat, mas ele está desligado (`CHAT_ENABLED = false` em `src/main.js`): responde um aviso fixo. O Jean quer que a Flora converse de verdade com quem visita o portfólio.

## O que a Flora é

A **guia do portfólio**. Responde perguntas sobre o Jean, os projetos e o que ele faz, **sem inventar nada**. Quando o visitante mostra interesse em contratar ou fazer um projeto, ela aponta o contato. Escolhe uma das 8 expressões da personagem para cada resposta.

### Metas
- Responder, em 3 ou 4 frases, perguntas de clientes e recrutadores com o que está no "manual" dela.
- Puxar para o contato quem quer orçamento, projeto ou entrevista.
- Responder no idioma de quem escreve (o site é em inglês; muitos visitantes escrevem em português).
- Lembrar o que foi dito na mesma conversa.

### Fora do escopo
- Guardar conversas, painel de conversas, login.
- Voz (o `audio_base64` que o código já aceita fica sem uso).
- Ferramentas, busca na web, ações em nome do Jean.

### Seria um fracasso se
- Inventasse projeto, número, cliente, preço ou experiência.
- Desse preço (regra do portfólio: valor só na conversa direta).
- Contasse vida pessoal do Jean (família, saúde, finanças, onde trabalha, endereço).
- Um visitante conseguisse gastar sem limite.
- A chave da API aparecesse no navegador.

## Abordagens consideradas

| | Abordagem | Troca | Decisão |
|---|---|---|---|
| **A** | Worker no mesmo projeto `77code`: o Worker que já serve o site ganha código para `/api/chat` | Nada novo para manter; mesmo deploy e domínio. Não serve para trabalho pesado (não é o caso) | **Escolhida pelo Jean** |
| B | Backend próprio na VPS do Jean (Node/Python + Docker) | Controle total e banco possível, mas mais um serviço para manter, CORS e dois lugares no ar | Só faria sentido para guardar conversas, que está fora do escopo |
| C | Managed Agents da Anthropic | Feito para agentes com ferramentas e área de trabalho; exagero para perguntas e respostas | Descartada |

## Decisões do Jean

- **Hospedagem:** abordagem A.
- **Controle de gasto (decidido em 2026-11-22, nível "anti-robô"):** o Jean tem outras aplicações na mesma conta da Anthropic; o chat **não pode** derrubar as outras se estourar. Por isso, todas juntas:
  1. **Workspace próprio na Anthropic** (ex.: `77code-flora`) com **teto de gasto mensal só dele**; a `ANTHROPIC_API_KEY` do Worker é criada dentro desse workspace. Feito pelo Jean no painel da Anthropic antes do deploy.
  2. **Turnstile** (Cloudflare, modo invisível) antes de cada mensagem: o site obtém um token e manda junto; o Worker confere no `siteverify` antes de chamar o Claude. Sem token válido → `403`.
  3. **Limite por visitante:** 10 mensagens por minuto por IP (binding de rate limit dos Workers).
  4. **Desligar sem republicar o site:** uma variável do Worker (ex.: `CHAT_ENABLED`) que, desligada, faz `/api/chat` responder `503` e o site mostrar uma fala da Flora de "chat em pausa".
- **Modelo:** `claude-sonnet-5-5` (estimativa ~US$ 0,01 por mensagem, ~US$ 10 por 1.000 mensagens). Trocar de modelo deve ser uma linha.
- **O que a Flora sabe** (lista aprovada em 2026-11-22), e nada além disso:
  - Jean (DIAS77), 21 anos, cursa Análise e Desenvolvimento de Sistemas na UNOESTE, mora em Presidente Prudente (SP); trabalha do front ao back e cuida da infraestrutura (sites, sistemas, APIs, deploy, automações).
  - Há 3 anos atende e vende no balcão de uma loja: sabe ouvir o cliente e explicar sem tecniquês.
  - Serviços: sites e landing pages; sistemas de agendamento (salões, barbearias, clínicas); dashboards; dados, automação e IA.
  - Como funciona: contato → entende e manda proposta → contrato e entrega em etapas → suporte e manutenção mensal.
  - Projetos: CriptEnv, AtelieSys, Lene Studio Beauty, RANGE77 (o mesmo texto de `projectData` em `src/main.js`, com os links).
  - Habilidades: os três módulos da cena 5 (`index.html`, `.sys-module`).
  - Contato: formulário do site, `jean.77mdiasdev@gmail.com`, WhatsApp `+55 18 98812-5925` (`https://wa.me/5518988125925`), GitHub `github.com/77mdias`, LinkedIn `linkedin.com/in/jeancmdias`.
  - **Não sabe:** preços, vida pessoal (família, saúde, finanças, onde trabalha, endereço). Pergunta fora do manual → diz que não sabe e sugere falar com o Jean.

## Como funciona (contrato)

**Navegador → `POST /api/chat`** (mesmo domínio; a CSP `connect-src 'self'` já permite):

```json
{ "messages": [ { "role": "user" | "assistant", "content": "texto" } ], "turnstileToken": "..." }
```
O site manda a conversa inteira desta página (só os textos), terminando numa mensagem `user`. Ao recarregar a página, a conversa recomeça.

**Resposta 200:** `{ "reply": "texto", "expression": "warm" }` — `expression` é uma de `warm, explain, happy, thinking, shock, kind, return, aval_work` (os ids `exp-*` em `index.html`; `longidle` é só o estado parado).

**Erros:** `400` entrada inválida, `403` Turnstile inválido, `429` limite de uso, `502` falha no Claude, `503` chat desligado. Sempre JSON `{ "error": "<código>" }`; o site mostra uma frase amigável da Flora para cada caso (e nunca o erro cru).

**No Worker** (nesta ordem, do mais barato para o mais caro):
- Chat desligado (`CHAT_ENABLED` do Worker) → `503`.
- Confere o token do Turnstile no `siteverify` da Cloudflare (segredo `TURNSTILE_SECRET_KEY`) → `403` se inválido.
- Valida a entrada: no máximo 12 mensagens (as mais antigas são descartadas no site antes de enviar), cada uma com até 1.200 caracteres, papéis alternados, última é `user`. Fora disso → `400`.
- Limite de uso por visitante: 10 mensagens por minuto por IP, com o limitador nativo de Workers (binding de rate limit). Estourou → `429`.
- Chama o Claude com o SDK oficial `@anthropic-ai/sdk`, chave no segredo `ANTHROPIC_API_KEY` do Worker.
- O manual da Flora vai no `system`, com cache de prompt (o manual é igual em toda requisição).
- Saída estruturada (`output_config.format` com JSON schema) garante `{ reply, expression }` com `expression` restrita à lista.
- Esforço `low` (chat), respostas curtas pedidas no prompt, `max_tokens` com folga para não cortar a resposta.
- Recusa do modelo: tratar `stop_reason: "refusal"`; usar o fallback do servidor (`fallbacks: "default"`) para o Sonnet 5.5.
- **Não registra o conteúdo das conversas** (nem em log).

**No site (`src/main.js`):**
- `CHAT_ENABLED = true`; o fetch manda `{ messages }` e guarda o histórico em memória.
- Mostra `reply` e chama `setExpression(expression)`.
- Erros viram falas da Flora (ex.: 429 → "Calma, muitas mensagens seguidas — tenta de novo em um minuto").

## Restrições

- Stack atual: Vite 8 sem framework, Workers static assets (`wrangler.jsonc`), testes Playwright + `node:test`, versões exatas, sem `.env` com valor no disco (no dev local o segredo vem do CriptEnv / variável de ambiente; ver nota "Cloudflare Workers" do vault: `secrets.required` lê do `process.env`).
- O Worker passa a ter `main`; os arquivos estáticos continuam servidos como hoje (o código só roda para `/api/*`).
- Testes automáticos **não podem chamar o Claude de verdade** (custo): o Worker precisa permitir trocar o cliente por um falso nos testes.
- Antes de ligar em produção (o Jean, nos painéis): workspace `77code-flora` na Anthropic com teto mensal e a chave criada nele; widget do Turnstile na Cloudflare para `77code.com.br` e `www` (chave do site vai no código; a secreta vira segredo do Worker).
- O Turnstile exige liberar `https://challenges.cloudflare.com` na CSP (`script-src` e `frame-src`, em `public/_headers`).

## Decisões do Claude (o Jean pode corrigir)

- **Chat no desenvolvimento:** funciona só no `pnpm cf:dev` (que já roda o Worker). No `pnpm dev` / `docker compose up` (Vite puro) não existe `/api/chat`, e a Flora mostra uma fala amigável de "chat indisponível aqui". Evita o `@cloudflare/vite-plugin` e não leva a chave da API para o container.
- **Aviso de privacidade:** uma linha discreta embaixo do campo do chat: *"Messages are answered by Claude (Anthropic) and aren't stored."* O IP só é usado na hora, como chave do limite, e não é guardado.
- **Testes automáticos:** usam a chave de teste do Turnstile que sempre passa (a Cloudflare publica chaves de teste) e um cliente falso no lugar do Claude.
- **`fallbacks: "default"`:** em caso de recusa, o servidor da Anthropic escolhe outro modelo sozinho; se mesmo assim houver recusa, a Flora responde que não pode ajudar com isso e sugere o contato.

## O que fica para quem implementar

- Texto final do prompt da Flora (personalidade: simpática, direta, poucas frases; guia do portfólio).
- Como montar o manual (texto fixo num arquivo do Worker, gerado ou escrito à mão a partir do site).
- Frases exatas de erro e quantas mensagens o site mantém visíveis.
- Se o manual for menor que o mínimo de cache do modelo, o cache simplesmente não acontece; medir e seguir.

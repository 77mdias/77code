<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=auto&height=200&section=header&text=77code%20Portfolio&fontSize=50&animation=fadeIn&fontAlignY=38&desc=Jean%20Carlos&descAlignY=62&descAlign=62" width="100%" />

# 💻🚀 Jean Carlos — Developer Portfolio

**Um portfólio moderno, minimalista e de extrema performance construído para a nova geração da web.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)

</div>

---

## ✨ Sobre o Projeto

Este repositório abriga o código-fonte do meu portfólio pessoal. O foco principal duranto o desenvolvimento foi garantir uma arquitetura extremamente limpa e uma **UX (Experiência do Usuário)** premium, validando meu amor por design e atenção aos mínimos detalhes.

A aplicação vai muito além do visual, ela é **dinâmica e inteligente**:

- 🔗 **Sincronização com o GitHub**: Todo o conteúdo de trabalhos entregues (nas áreas de Projetos e Engenharia) é buscado de forma dinâmica direto do meu perfil do GitHub (`77mdias`). A listagem utiliza a poderosa **API GraphQL** para exibir repositórios em formato _Pinned_ com detalhes valiosos (como as imagens de pré-visualização oficiais geradas na nuvem e etiquetas de linguagem em tempo real).
- 🎨 **Design System Nativo e Temático**: Toda a interface é adaptável, possuindo suporte total a _Dark Mode_ e _Light Mode_ (mantidos de forma fluida através de propriedades customizadas do CSS no `globals.css`).
- 💠 **Microinterações Elegantes**: O site não é estático — inclui o padrão _scroll-reveal_ (os elementos surgem suavemente de acordo com a sua rolagem de tela), acabamentos em _glassmorphism_ (efeitinhos de vidro polido) e componentes bem separados.

## 🛠️ Tecnologias Utilizadas

- **[Next.js 16 (App Router)](https://nextjs.org/)** — Framework backend/frontend com renderização SSR.
- **[React.js](https://react.dev/)** — Base do sistema modular de componentes.
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Pipeline CSS via integração direta pelo PostCSS.
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática pesada eliminando quebras em tempo de execução.
- **[Bun](https://bun.sh/)** — Runtime e gerenciador de pacotes ultrarrápido responsável pelo ambiente de desenvolvimento limpo.

---

## 🚀 Como Executar Localmente

Siga os passos abaixo para rodar o projeto na sua máquina local:

1. **Clone o repositório**

   ```bash
   git clone https://github.com/77mdias/77code.git
   cd 77code
   ```

2. **Instale as dependências usando o Bun**

   ```bash
   bun install
   ```

3. **Configure as Variáveis de Ambiente**
   Copie o arquivo de exemplo e insira seu Token Pessoal do GitHub:

   ```bash
   cp .env.example .env.local
   ```

   > 💡 _Nota: A chave \`GITHUB_TOKEN\` é super recomendada para que os projetos consigam realizar fetch dos itens fixados (Pinned) com alta qualidade visual._

4. **Inicie o servidor de desenvolvimento**

   ```bash
   bun dev
   ```

5. O servidor abrirá magicamente em **[http://localhost:3000](http://localhost:3000)**! ✨

---

## 📁 Arquitetura Simplificada (Overview)

\`\`\`text
src/
├── app/ # Central do App Router (Rotas, page.tsx e layout global)
├── components/ # Componentes modulares de UI (Hero, Navbar, Projects, etc)
└── lib/ # Utilitários e Integração com APIs externas (github.ts)
\`\`\`

---

## 🤝 Autor e Contato

Desenvolvido com ☕, boas músicas e foco extremo no ofício da Engenharia de Software por **Jean Carlos**.
_Sinta-se à vontade para enviar mensagens para conversar, perguntar ou conectar!_

<div align="center">
  <br />
  <a href="https://github.com/77mdias" target="_blank">
    <img src="https://img.shields.io/badge/GitHub_Meu_Perfil-100000?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://linkedin.com/in/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn_Conectar-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
</div>

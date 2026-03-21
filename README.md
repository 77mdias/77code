<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=auto&height=200&section=header&text=77code%20Portfolio&fontSize=50&animation=fadeIn&fontAlignY=38&desc=Jean%20Carlos&descAlignY=62&descAlign=62" width="100%" />

# 💻🚀 Jean Carlos — Developer Portfolio

**A modern, minimalist, and high-performance portfolio built for the next generation of the web.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)

</div>

---

## ✨ About the Project

This repository hosts the source code for my personal portfolio. The main focus during development was to ensure an extremely clean architecture and a premium **UX (User Experience)**, highlighting my love for design and attention to precise details.

The application goes far beyond just visuals; it is **dynamic and smart**:

- 🔗 **GitHub Synchronization**: All showcased work (in the Projects and Engineering sections) is fetched dynamically straight from my GitHub profile (`77mdias`). The list utilizes the powerful **GraphQL API** to display _Pinned_ repositories with rich details (such as official social preview images generated in the cloud and real-time language tags).
- 🎨 **Native & Themed Design System**: The entire interface is adaptable, featuring full support for _Dark Mode_ and _Light Mode_ (seamlessly maintained through CSS custom properties in `globals.css`).
- 💠 **Elegant Micro-interactions**: The site is never static — it includes _scroll-reveal_ patterns (elements softly fade in as you scroll), _glassmorphism_ finishes (frosted glass effects), and cleanly separated components.

## 🛠️ Tech Stack

- **[Next.js 16 (App Router)](https://nextjs.org/)** — Backend/frontend framework with SSR.
- **[React.js](https://react.dev/)** — The core of the modular component system.
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS pipeline via direct PostCSS integration.
- **[TypeScript](https://www.typescriptlang.org/)** — Strict static typing aiming for zero runtime errors.
- **[Bun](https://bun.sh/)** — Ultra-fast runtime and package manager responsible for a clean development environment.

---

## 🚀 Getting Started Locally

Follow the steps below to run the project on your local machine:

1. **Clone the repository**

   ```bash
   git clone https://github.com/77mdias/77code.git
   cd 77code
   ```

2. **Install dependencies using Bun**

   ```bash
   bun install
   ```

3. **Set up Environment Variables**
   Copy the example file and insert your GitHub Personal Access Token:

   ```bash
   cp .env.example .env.local
   ```

   > 💡 _Note: The `GITHUB_TOKEN` key is highly recommended so the app can fetch Pinned items with high visual quality._

4. **Start the development server**

   ```bash
   bun dev
   ```

5. The server will magically open at **[http://localhost:3000](http://localhost:3000)**! ✨

---

## 📁 Simple Architecture Overview

\`\`\`text
src/
├── app/ # App Router Core (Routes, page.tsx, and global layout)
├── components/ # Modular UI Components (Hero, Navbar, Projects, etc)
└── lib/ # Utilities and External API Integrations (github.ts)
\`\`\`

---

## 🤝 Author & Contact

Developed with ☕, great music, and extreme focus on the Software Engineering craft by **Jean Carlos**.
_Feel free to drop a message to chat, ask questions, or connect!_

<div align="center">
  <br />
  <a href="https://github.com/77mdias" target="_blank">
    <img src="https://img.shields.io/badge/GitHub_Profile-100000?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://linkedin.com/in/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn_Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
</div>

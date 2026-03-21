<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev      # Start dev server (Turbopack) at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

Personal portfolio for Jean Carlos — a single-page Next.js 16 app with App Router.

**Entry point:** `src/app/page.tsx` composes all sections in order: `Navbar → Hero → About → Projects → Engineering → EngineeringMindset → Contact → Footer`.

**Components:** Each section lives in `src/components/` as an independent file. No shared data layer — content is hardcoded inline in each component.

**Theme system:** `ThemeProvider` (`src/components/ThemeProvider.tsx`) wraps the app in `layout.tsx`. It sets `data-theme="dark|light"` on `<html>` via localStorage. Consume theme with the exported `useTheme()` hook. CSS custom properties in `globals.css` switch automatically based on `[data-theme="light"]`.

**Styling approach:** Tailwind CSS v4 (via PostCSS) is imported with `@import "tailwindcss"` in `globals.css`. Layout, animation, and reusable patterns are defined as plain CSS classes in `globals.css` — not as Tailwind utilities in component files. Key classes: `.section-wrap` (max-width container), `.section-pad` (vertical spacing), `.glass` (glassmorphism surface), `.label` (mono uppercase label), `.reveal` / `.reveal.visible` (scroll-reveal pattern).

**Path alias:** `@/*` maps to `src/*`.

**Design tokens:** All colors, spacing, shadows, and radii are CSS custom properties defined in `:root` (dark defaults) and overridden in `[data-theme="light"]`. Never hardcode color values — always use tokens like `var(--bg)`, `var(--ink)`, `var(--stroke)`.

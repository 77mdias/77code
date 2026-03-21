# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-19] Next.js 16 / React 19 — may differ from training data**
   Do instead: read `node_modules/next/dist/docs/` before writing Next.js-specific code; heed deprecation notices.

## Domain Behavior Guardrails
1. **[2026-03-19] Always use design tokens, never hardcode colors**
   Do instead: use `var(--bg)`, `var(--ink)`, `var(--stroke)` etc. from globals.css — never raw hex or rgb values in components.

2. **[2026-03-19] Layout classes live in globals.css, not in component Tailwind utilities**
   Do instead: add `.section-wrap`, `.section-pad`, `.glass`, `.reveal` etc. to globals.css; keep Tailwind for minor adjustments only.

3. **[2026-03-19] Theme is controlled via data-theme HTML attribute, not CSS classes**
   Do instead: set `document.documentElement.setAttribute("data-theme", value)` — never toggle a class like `.dark` or `.light`.

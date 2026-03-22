export type StackPalette = {
  accent: string;
  accentBg: string;
};

const STACK_PALETTES: StackPalette[] = [
  { accent: "var(--blue)", accentBg: "var(--blue-bg)" },
  { accent: "var(--lavender)", accentBg: "var(--lavender-bg)" },
  { accent: "var(--sage)", accentBg: "var(--sage-bg)" },
  { accent: "var(--amber)", accentBg: "var(--amber-bg)" },
  { accent: "var(--rose)", accentBg: "var(--rose-bg)" },
  { accent: "var(--teal)", accentBg: "var(--teal-bg)" },
  { accent: "var(--cyan)", accentBg: "var(--cyan-bg)" },
  { accent: "var(--peach)", accentBg: "var(--peach-bg)" },
];

const STACK_COLOR_BY_TECH: Record<string, StackPalette> = {
  "next.js": STACK_PALETTES[0],
  nextjs: STACK_PALETTES[0],
  typescript: STACK_PALETTES[1],
  react: STACK_PALETTES[2],
  postgresql: STACK_PALETTES[3],
  prisma: STACK_PALETTES[4],
  stripe: STACK_PALETTES[5],
  "tailwind css v4": STACK_PALETTES[6],
  tailwindcss: STACK_PALETTES[6],
  vercel: STACK_PALETTES[7],
};

function normalizeStackKey(tech: string): string {
  const key = tech.trim().toLowerCase();

  if (key.startsWith("next.js") || key.startsWith("nextjs")) return "next.js";
  if (key.startsWith("tailwind css") || key.startsWith("tailwindcss")) return "tailwindcss";
  if (key.startsWith("typescript")) return "typescript";
  if (key.startsWith("react")) return "react";
  if (key.startsWith("postgresql") || key.startsWith("postgres")) return "postgresql";
  if (key.startsWith("prisma")) return "prisma";
  if (key.startsWith("stripe")) return "stripe";
  if (key.startsWith("vercel")) return "vercel";

  return key.replace(/\s+v?\d+(\.\d+)*$/g, "");
}

export function getStackPalette(tech: string): StackPalette {
  const key = normalizeStackKey(tech);
  const mapped = STACK_COLOR_BY_TECH[key];

  if (mapped) return mapped;

  const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return STACK_PALETTES[hash % STACK_PALETTES.length];
}

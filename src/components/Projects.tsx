"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/github";

type StackPalette = {
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

const DESCRIPTION_MAX_LINES = 6;

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

function getStackPalette(tech: string): StackPalette {
  const key = normalizeStackKey(tech);
  const mapped = STACK_COLOR_BY_TECH[key];

  if (mapped) return mapped;

  // Deterministic fallback so unknown tags keep a stable color across all cards.
  const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return STACK_PALETTES[hash % STACK_PALETTES.length];
}

function ProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const canExpandDescription = project.description.length > 180;

  const openProject = () => {
    window.open(project.href, "_blank", "noopener,noreferrer");
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button")) return;
    openProject();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openProject();
  };

  const handleMouseEnter = () => {
    if (!ref.current) return;
    ref.current.style.background = "var(--surface-hover)";
    ref.current.style.transform = "translateY(-4px)";
    ref.current.style.boxShadow = "var(--shadow-lg)";
    ref.current.style.borderColor = "var(--stroke-em)";
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.background = "var(--surface)";
    ref.current.style.transform = "translateY(0)";
    ref.current.style.boxShadow = "var(--shadow-sm)";
    ref.current.style.borderColor = "var(--stroke)";
  };

  return (
    <div
      ref={ref}
      className="reveal"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--stroke)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        height: "100%",
        boxShadow: "var(--shadow-sm)",
        transition:
          "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, background 0.25s ease, border-color 0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Open ${project.title}`}
    >
      {/* Preview area — thumbnail */}
      <div
        style={{
          height: "200px",
          background: project.image
            ? `url('${project.image}') center/cover no-repeat`
            : `radial-gradient(ellipse at 30% 40%, ${project.accent}22 0%, ${project.accentBg} 60%, transparent 100%)`,
          borderBottom: "1px solid var(--stroke)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Camada de sobreposição para melhor leitura de números e grid em imagens */}
        {project.image && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--surface)", opacity: 0.2 }} />
        )}

        {/* Project number — watermark style */}
        <span
          style={{
            position: "absolute",
            bottom: "1.25rem",
            right: "1.5rem",
            fontFamily: "var(--font-geist-mono)",
            fontSize: "11px",
            color: project.accent,
            opacity: 0.6,
            letterSpacing: "0.08em",
          }}
        >
          {project.id}
        </span>

        {/* Decorative lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${project.accent}08 1px, transparent 1px), linear-gradient(90deg, ${project.accent}08 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Card body */}
      <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", height: "100%" }}>
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
            marginBottom: "0.625rem",
          }}
        >
          {project.title}
        </h3>

        <p
          style={{
            fontSize: "13.5px",
            color: "var(--ink-2)",
            lineHeight: 1.7,
            fontWeight: 300,
            marginBottom: "0.5rem",
            display: descriptionExpanded ? "block" : "-webkit-box",
            WebkitLineClamp: descriptionExpanded ? undefined : DESCRIPTION_MAX_LINES,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: descriptionExpanded ? undefined : `calc(1.7em * ${DESCRIPTION_MAX_LINES})`,
          }}
          title={project.description}
        >
          {project.description}
        </p>

        <div style={{ minHeight: "1.35rem", marginBottom: "1.1rem" }}>
          {canExpandDescription && (
            <button
              type="button"
              onClick={() => setDescriptionExpanded((prev) => !prev)}
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "10px",
                color: "var(--ink-3)",
                background: "transparent",
                border: "none",
                padding: 0,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {descriptionExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Stack tags */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            minHeight: "4.1rem",
            alignContent: "flex-start",
          }}
        >
          {project.stack.map((tech) => {
            const palette = getStackPalette(tech);

            return (
              <span
                key={tech}
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  background: palette.accentBg,
                  color: palette.accent,
                  letterSpacing: "0.04em",
                  border: `1px solid ${palette.accent}20`,
                }}
              >
                {tech}
              </span>
            );
          })}
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "13px",
              color: "var(--ink-2)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-2)")}
          >
            View Project →
          </a>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "13px",
              color: "var(--ink-3)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-2)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-3)")}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Projects({ projects = [] }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    sectionRef.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="work" ref={sectionRef} className="section-pad">
      <div className="section-wrap">
        {/* Header */}
        <div className="reveal" style={{ marginBottom: "4rem" }}>
          <p className="label" style={{ marginBottom: "1.25rem" }}>
            Selected Work
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 300,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "var(--ink)",
            }}
          >
            Things I&apos;ve built.
          </h2>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {projects.length > 0 ? (
            projects.map((p) => <ProjectCard key={p.id} project={p} />)
          ) : (
            <p style={{ color: "var(--ink-3)", fontSize: "14px" }}>Nenhum projeto encontrado.</p>
          )}
        </div>
      </div>
    </section>
  );
}

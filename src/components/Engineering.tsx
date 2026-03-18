"use client";

import { useEffect, useRef } from "react";

const projects = [
  {
    name: "project-alpha",
    description: "High-performance web app with focus on rendering optimizations and clean component architecture.",
    lang: "TypeScript",
    langColor: "#3178c6",
    type: "Web App",
    status: "active",
    github: "#",
    live: "#",
  },
  {
    name: "project-beta",
    description: "Design system and component library built from scratch. Storybook-documented, fully typed.",
    lang: "TypeScript",
    langColor: "#3178c6",
    type: "Library",
    status: "active",
    github: "#",
    live: null,
  },
  {
    name: "project-gamma",
    description: "CLI tool for automating repetitive dev tasks. Node.js-based, built for developer experience.",
    lang: "JavaScript",
    langColor: "#f7df1e",
    type: "CLI",
    status: "wip",
    github: "#",
    live: null,
  },
  {
    name: "project-delta",
    description: "REST API with authentication, rate limiting, and structured error handling.",
    lang: "TypeScript",
    langColor: "#3178c6",
    type: "API",
    status: "archived",
    github: "#",
    live: null,
  },
  {
    name: "project-epsilon",
    description: "Minimal portfolio experiment — exploring motion and 3D without sacrificing performance.",
    lang: "TypeScript",
    langColor: "#3178c6",
    type: "Web App",
    status: "active",
    github: "#",
    live: "#",
  },
];

const statusConfig = {
  active: { label: "active", color: "var(--sage)", bg: "var(--sage-bg)" },
  wip: { label: "in progress", color: "var(--lavender)", bg: "var(--lavender-bg)" },
  archived: { label: "archived", color: "var(--ink-3)", bg: "rgba(68,68,76,0.12)" },
};

function RepoRow({ project }: { project: (typeof projects)[0] }) {
  const status = statusConfig[project.status as keyof typeof statusConfig];

  return (
    <div
      className="reveal repo-row"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {/* Left: name + description + meta */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            marginBottom: "0.375rem",
            flexWrap: "wrap",
          }}
        >
          {/* Name */}
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "13.5px",
              fontWeight: 500,
              color: "var(--blue)",
              letterSpacing: "0.01em",
              transition: "opacity 0.15s ease",
            }}
          >
            {project.name}
          </span>

          {/* Type badge */}
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "100px",
              border: "1px solid var(--stroke-em)",
              color: "var(--ink-3)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {project.type}
          </span>

          {/* Status badge */}
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "100px",
              background: status.bg,
              color: status.color,
              letterSpacing: "0.06em",
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: "13px",
            color: "var(--ink-2)",
            fontWeight: 300,
            lineHeight: 1.6,
            marginBottom: "0.75rem",
            maxWidth: "560px",
          }}
        >
          {project.description}
        </p>

        {/* Language */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: project.langColor,
              flexShrink: 0,
              boxShadow: `0 0 6px ${project.langColor}60`,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "11px",
              color: "var(--ink-3)",
              letterSpacing: "0.04em",
            }}
          >
            {project.lang}
          </span>
        </div>
      </div>

      {/* Right: links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexShrink: 0,
        }}
      >
        <a
          href={project.github}
          aria-label="GitHub"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "11px",
            color: "var(--ink-3)",
            textDecoration: "none",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            transition: "color 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--ink-2)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--ink-3)")
          }
        >
          GitHub ↗
        </a>

        {project.live && (
          <a
            href={project.live}
            aria-label="Live"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "11px",
              color: "var(--ink-3)",
              textDecoration: "none",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--blue)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--ink-3)")
            }
          >
            Live ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function Engineering() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    sectionRef.current?.querySelectorAll(".reveal").forEach((el) =>
      observer.observe(el)
    );
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="engineering"
      ref={sectionRef}
      className="section-pad"
      style={{ borderTop: "1px solid var(--stroke)" }}
    >
      <div className="section-wrap">
        {/* Header */}
        <div
          className="reveal"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p className="label" style={{ marginBottom: "1.25rem" }}>
              Engineering
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
              Things I&apos;ve shipped.
            </h2>
          </div>

          {/* Project count */}
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              color: "var(--ink-3)",
              letterSpacing: "0.06em",
              paddingBottom: "0.5rem",
            }}
          >
            {projects.length} projects
          </span>
        </div>

        {/* Top border */}
        <div style={{ borderTop: "1px solid var(--stroke-em)" }} />

        {/* Repo list */}
        {projects.map((p) => (
          <RepoRow key={p.name} project={p} />
        ))}
      </div>
    </section>
  );
}

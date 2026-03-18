"use client";

import { useEffect, useRef } from "react";

const projects = [
  {
    id: "01",
    title: "Project Alpha",
    description:
      "A high-performance web application crafted with precision. Built with a focus on smooth interactions and maintainable architecture.",
    stack: ["React", "TypeScript", "Node.js"],
    accent: "var(--blue)",
    accentBg: "var(--blue-bg)",
    href: "#",
    github: "#",
  },
  {
    id: "02",
    title: "Project Beta",
    description:
      "Design-first interface with deep attention to UX detail. Every interaction considered, every transition earned.",
    stack: ["Next.js", "Tailwind", "PostgreSQL"],
    accent: "var(--lavender)",
    accentBg: "var(--lavender-bg)",
    href: "#",
    github: "#",
  },
  {
    id: "03",
    title: "Project Gamma",
    description:
      "An elegant tool that simplifies complex workflows. Performance and clarity as first-class concerns.",
    stack: ["React", "Zustand", "Vite"],
    accent: "var(--sage)",
    accentBg: "var(--sage-bg)",
    href: "#",
    github: "#",
  },
];

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const ref = useRef<HTMLDivElement>(null);

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
        boxShadow: "var(--shadow-sm)",
        transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, background 0.25s ease, border-color 0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Preview area — gradient thumbnail */}
      <div
        style={{
          height: "200px",
          background: `radial-gradient(ellipse at 30% 40%, ${project.accent}22 0%, ${project.accentBg} 60%, transparent 100%)`,
          borderBottom: "1px solid var(--stroke)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
      <div style={{ padding: "1.75rem" }}>
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
            marginBottom: "1.5rem",
          }}
        >
          {project.description}
        </p>

        {/* Stack tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {project.stack.map((tech) => (
            <span
              key={tech}
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "100px",
                background: project.accentBg,
                color: project.accent,
                letterSpacing: "0.04em",
                border: `1px solid ${project.accent}20`,
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <a
            href={project.href}
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

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    sectionRef.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="work" ref={sectionRef} style={{ padding: "9rem 0" }}>
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
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

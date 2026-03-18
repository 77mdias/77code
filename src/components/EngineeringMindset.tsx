"use client";

import { useEffect, useRef } from "react";

const pillars = [
  {
    number: "01",
    title: "Clean Architecture",
    description:
      "Code that scales isn't just functional — it's structured. I think in layers: clear separation of concerns, predictable data flow, components that do one thing well.",
    accent: "var(--blue)",
    accentBg: "var(--blue-bg)",
    tags: ["Composition", "Separation of Concerns", "Reusability"],
  },
  {
    number: "02",
    title: "Performance by Default",
    description:
      "Every millisecond is a design decision. Lazy loading, code splitting, minimal re-renders — performance isn't an afterthought, it's a first-class concern baked into how I build.",
    accent: "var(--lavender)",
    accentBg: "var(--lavender-bg)",
    tags: ["Core Web Vitals", "Code Splitting", "Rendering Strategy"],
  },
  {
    number: "03",
    title: "UI/UX Thinking",
    description:
      "I don't just implement designs — I question them. Good UI is invisible; great UX makes users feel capable. I bridge the gap between what looks right and what works right.",
    accent: "var(--sage)",
    accentBg: "var(--sage-bg)",
    tags: ["Accessibility", "Micro-interactions", "Visual Hierarchy"],
  },
];

export default function EngineeringMindset() {
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
    <section
      id="engineering"
      ref={sectionRef}
      className="section-pad"
      style={{ borderTop: "1px solid var(--stroke)" }}
    >
      <div className="section-wrap">
        {/* Header */}
        <div className="reveal" style={{ marginBottom: "4rem", maxWidth: "680px" }}>
          <p className="label" style={{ marginBottom: "1.25rem" }}>
            Engineering Mindset
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 300,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "var(--ink)",
              marginBottom: "1.25rem",
            }}
          >
            How I think about code.
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--ink-2)",
              fontWeight: 300,
              lineHeight: 1.75,
            }}
          >
            Building something beautiful that breaks under load isn&apos;t craftsmanship.
            I hold both sides of the equation — elegance and engineering — in equal tension.
          </p>
        </div>

        {/* Pillars */}
        <div className="pillars-grid">
          {pillars.map(({ number, title, description, accent, accentBg, tags }) => (
            <div
              key={number}
              className="reveal"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--stroke)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                boxShadow: "var(--shadow-sm)",
                transition: "border-color 0.25s ease, background 0.25s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--stroke-em)";
                el.style.background = "var(--surface-hover)";
                el.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--stroke)";
                el.style.background = "var(--surface)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Number */}
              <p
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "11px",
                  color: accent,
                  letterSpacing: "0.1em",
                  marginBottom: "1.5rem",
                  opacity: 0.8,
                }}
              >
                {number}
              </p>

              {/* Title */}
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  marginBottom: "0.875rem",
                }}
              >
                {title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--ink-2)",
                  lineHeight: 1.75,
                  fontWeight: 300,
                  marginBottom: "1.5rem",
                }}
              >
                {description}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "11px",
                      color: accent,
                      opacity: 0.7,
                      letterSpacing: "0.04em",
                    }}
                  >
                    — {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

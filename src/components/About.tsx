"use client";

import { useEffect, useRef } from "react";

const skills = [
  { label: "Languages", items: ["TypeScript", "JavaScript", "HTML/CSS"] },
  { label: "Frameworks", items: ["React", "Next.js", "Tailwind CSS"] },
  { label: "Tools", items: ["Git", "Figma", "VS Code"] },
  { label: "Interests", items: ["UI/UX", "Performance", "Design Systems"] },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-pad"
    >
      <div className="section-wrap">
        {/* Header */}
        <div className="reveal" style={{ marginBottom: "4rem" }}>
          <p className="label" style={{ marginBottom: "1.25rem" }}>About</p>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 300,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "var(--ink)",
              maxWidth: "640px",
            }}
          >
            Crafting interfaces with intention.
          </h2>
        </div>

        {/* Content grid */}
        <div className="about-grid">
          {/* Bio */}
          <div className="reveal">
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.8,
                color: "var(--ink-2)",
                fontWeight: 300,
                marginBottom: "1.5rem",
              }}
            >
              I&apos;m Jean — 20 years old, studying Systems Analysis and Development.
              For me, programming is more than a career path — it&apos;s a refuge.
              A space to think, to create, to discover something about myself through
              the act of building.
            </p>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.8,
                color: "var(--ink-2)",
                fontWeight: 300,
              }}
            >
              I obsess over the gap between design and code — the place where
              a pixel-perfect interface meets a clean, performant implementation.
              Every project is an opportunity to close that gap just a little more.
            </p>
          </div>

          {/* Skills grid */}
          <div
            className="reveal"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            {skills.map(({ label, items }) => (
              <div key={label}>
                <p
                  className="label"
                  style={{ marginBottom: "0.75rem" }}
                >
                  {label}
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {items.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontSize: "13.5px",
                        color: "var(--ink-2)",
                        fontWeight: 300,
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

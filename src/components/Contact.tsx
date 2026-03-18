"use client";

import { useEffect, useRef } from "react";

const socials = [
  { label: "GitHub", href: "https://github.com", mono: "gh" },
  { label: "LinkedIn", href: "https://linkedin.com", mono: "in" },
  { label: "Twitter", href: "https://twitter.com", mono: "tw" },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1 }
    );

    sectionRef.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section-pad-lg"
      style={{ borderTop: "1px solid var(--stroke)" }}
    >
      <div className="section-wrap">
        <div
          className="reveal"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "2rem",
          }}
        >
          <p className="label">Get in Touch</p>

          <h2
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              fontWeight: 300,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--ink)",
            }}
          >
            Let&apos;s build
            <br />
            <span style={{ color: "var(--ink-2)" }}>something together.</span>
          </h2>

          <p
            style={{
              fontSize: "1rem",
              color: "var(--ink-2)",
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: "440px",
            }}
          >
            Open to opportunities, collaborations, and interesting projects.
            If you think we could make something great — I&apos;d love to hear it.
          </p>

          {/* Email CTA */}
          <a
            href="mailto:jean@example.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.875rem 2rem",
              borderRadius: "var(--radius-md)",
              background: "var(--ink)",
              color: "var(--bg)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              marginTop: "0.5rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.85";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Say hello →
          </a>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "linear-gradient(to bottom, var(--stroke-em), transparent)",
              marginTop: "1rem",
            }}
          />

          {/* Social links */}
          <div style={{ display: "flex", gap: "2rem" }}>
            {socials.map(({ label, href, mono }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem",
                  textDecoration: "none",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <span
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface)",
                    border: "1px solid var(--stroke-em)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "11px",
                    color: "var(--ink-2)",
                    letterSpacing: "0.04em",
                    transition: "background 0.2s ease, color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink-2)";
                  }}
                >
                  {mono}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--ink-3)",
                    fontWeight: 300,
                  }}
                >
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

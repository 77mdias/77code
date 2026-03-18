"use client";

import FloatingOrb from "./FloatingOrb";

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background decoration — subtle radial glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(147,197,253,0.04) 0%, rgba(196,181,253,0.03) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Build-complete trace line */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "1px",
          width: "0",
          background:
            "linear-gradient(to right, var(--blue), var(--lavender), var(--sage))",
          animation: "trace-in 1.4s cubic-bezier(0.16,1,0.3,1) 0.3s forwards",
        }}
      />

      <div className="section-wrap hero-layout">
        {/* Left: Text content */}
        <div className="hero-text">
          {/* Role label */}
          <p
            className="label"
            style={{
              marginBottom: "2rem",
              opacity: 0,
              animation:
                "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards",
            }}
          >
            Full-Stack Developer | DevOps
          </p>

          {/* Name */}
          <h1
            style={{
              fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              marginBottom: "1.5rem",
              opacity: 0,
              animation:
                "fade-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.65s forwards",
            }}
          >
            Jean Carlos
            <br />
            <span style={{ color: "var(--ink-2)", fontWeight: 200 }}>
              Moreira Dias
            </span>
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              color: "var(--ink-2)",
              fontWeight: 300,
              lineHeight: 1.65,
              maxWidth: "480px",
              marginBottom: "3rem",
              opacity: 0,
              animation:
                "fade-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.8s forwards",
            }}
          >
            From interface to infrastructure — I build the full stack
            and keep it running. Frontend precision, backend logic, pipelines that don&apos;t wake you up at 3am.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              opacity: 0,
              animation:
                "fade-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.95s forwards",
            }}
          >
            <a
              href="#work"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius-md)",
                background: "var(--ink)",
                color: "var(--bg)",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "opacity 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.85";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              View Work
            </a>

            <a
              href="#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                color: "var(--ink-2)",
                fontSize: "14px",
                fontWeight: 400,
                textDecoration: "none",
                border: "1px solid var(--stroke-em)",
                transition:
                  "color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--ink)";
                el.style.borderColor = "var(--stroke-em)";
                el.style.background = "var(--surface)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--ink-2)";
                el.style.borderColor = "var(--stroke-em)";
                el.style.background = "transparent";
                el.style.transform = "translateY(0)";
              }}
            >
              Contact
            </a>
          </div>
        </div>

        {/* Right: 3D orb — acima do texto no mobile, à direita no desktop */}
        <div className="hero-orb-wrap">
          <div className="hero-orb-scale">
            <FloatingOrb />
          </div>
        </div>
      </div>

      {/* Scroll indicator — hidden on mobile */}
      <div
        className="hero-scroll"
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          opacity: 0,
          animation: "fade-in 1s ease 1.6s forwards",
        }}
      >
        <span className="label" style={{ fontSize: "10px" }}>
          scroll
        </span>
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(to bottom, var(--ink-3), transparent)",
          }}
        />
      </div>
    </section>
  );
}

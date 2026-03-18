"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import Logo from "./Logo";

const links = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        transition:
          "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
        background: scrolled
          ? theme === "dark"
            ? "rgba(8,8,8,0.82)"
            : "rgba(247,247,247,0.88)"
          : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--stroke)"
          : "1px solid transparent",
      }}
    >
      {/* Logo */}
      <Logo size="sm" href="#" />

      {/* Nav links */}
      <nav style={{ display: "flex", gap: "2rem" }}>
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              fontSize: "13px",
              color: "var(--ink-2)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--ink)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--ink-2)")
            }
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "var(--surface)",
          border: "1px solid var(--stroke-em)",
          color: "var(--ink-2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          transition: "background 0.2s ease, color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "var(--surface-hover)";
          el.style.color = "var(--ink)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "var(--surface)";
          el.style.color = "var(--ink-2)";
        }}
      >
        {theme === "dark" ? "○" : "●"}
      </button>
    </header>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

const scales = {
  sm: { num: "13px", sep: "10px", word: "12px", gap: "4px" },
  md: { num: "16px", sep: "12px", word: "14px", gap: "5px" },
  lg: { num: "22px", sep: "16px", word: "19px", gap: "7px" },
};

export default function Logo({ size = "sm", href = "#" }: LogoProps) {
  const s = scales[size];

  const inner = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: s.gap,
        textDecoration: "none",
        letterSpacing: 0,
        userSelect: "none",
      }}
    >
      {/* 77 — mono, bold, neutral */}
      <span
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: s.num,
          fontWeight: 700,
          color: "var(--ink)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        77
      </span>

      {/* M — mono, medium, secondary — visible but not competing */}
      <span
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: s.sep,
          fontWeight: 500,
          color: "var(--ink-2)",
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        M
      </span>

      {/* DEV — sans, semibold, primary — the profession */}
      <span
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: s.word,
          fontWeight: 600,
          color: "var(--ink)",
          letterSpacing: "0.1em",
          lineHeight: 1,
        }}
      >
        DEV
      </span>
    </span>
  );

  return (
    <a
      href={href}
      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
    >
      {inner}
    </a>
  );
}

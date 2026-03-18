import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--stroke)",
        padding: "2rem 0",
      }}
    >
      <div
        className="section-wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo size="sm" />

        <span
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "11px",
            color: "var(--ink-3)",
            letterSpacing: "0.04em",
          }}
        >
          © {year} Jean Carlos
        </span>
      </div>
    </footer>
  );
}

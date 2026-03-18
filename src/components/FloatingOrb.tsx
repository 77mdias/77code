export default function FloatingOrb() {
  return (
    <div
      style={{
        position: "relative",
        width: "380px",
        height: "380px",
        flexShrink: 0,
      }}
    >
      {/* Ambient glow — outermost layer */}
      <div
        style={{
          position: "absolute",
          inset: "-30%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(147,197,253,0.10) 0%, rgba(196,181,253,0.07) 45%, transparent 70%)",
          filter: "blur(32px)",
          animation: "glow-pulse 5s ease-in-out infinite",
        }}
      />

      {/* Outer orbit ring */}
      <div
        style={{
          position: "absolute",
          inset: "-12%",
          borderRadius: "50%",
          border: "1px solid rgba(196,181,253,0.12)",
          animation: "orbit 28s linear infinite",
        }}
      >
        {/* Dot on ring */}
        <div
          style={{
            position: "absolute",
            top: "-3px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--lavender)",
            boxShadow: "0 0 8px rgba(196,181,253,0.7)",
          }}
        />
      </div>

      {/* Inner orbit ring */}
      <div
        style={{
          position: "absolute",
          inset: "6%",
          borderRadius: "50%",
          border: "1px solid rgba(147,197,253,0.08)",
          animation: "orbit-reverse 18s linear infinite",
        }}
      >
        {/* Dot on inner ring */}
        <div
          style={{
            position: "absolute",
            bottom: "-3px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "var(--blue)",
            boxShadow: "0 0 6px rgba(147,197,253,0.7)",
          }}
        />
      </div>

      {/* The sphere */}
      <div
        style={{
          position: "absolute",
          inset: "10%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 32% 28%, rgba(255,255,255,0.12) 0%, rgba(196,181,253,0.5) 22%, rgba(147,197,253,0.4) 48%, rgba(134,239,172,0.18) 72%, rgba(8,8,8,0.95) 100%)",
          boxShadow: `
            inset -10px -10px 24px rgba(0,0,0,0.7),
            inset 5px 5px 14px rgba(255,255,255,0.06),
            0 24px 64px rgba(147,197,253,0.08),
            0 8px 24px rgba(0,0,0,0.5)
          `,
          animation: "float 9s ease-in-out infinite",
        }}
      />

      {/* Specular highlight */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "22%",
          width: "22%",
          height: "14%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 100%)",
          filter: "blur(4px)",
          transform: "rotate(-20deg)",
          animation: "float 9s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

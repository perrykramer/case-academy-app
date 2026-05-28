export function Wordmark(_props: { fontSize?: number } = {}) {
  return (
    <svg
      width="280"
      height="48"
      viewBox="0 0 280 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Case Academy"
    >
      <text
        x="0"
        y="34"
        style={{
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "34px",
          letterSpacing: "-0.01em",
        }}
        fill="#1e3a5f"
      >
        Case Academy
      </text>
      <path
        d="M255 17L265 7M265 7H257M265 7V15"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

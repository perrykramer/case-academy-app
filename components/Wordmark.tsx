import { C } from "@/lib/tokens";

export function Wordmark({ fontSize = 17 }: { fontSize?: number }) {
  return (
    <span style={{ position: "relative", display: "inline-block", paddingBottom: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontWeight: 500,
          fontSize,
          color: C.ink,
          letterSpacing: "-0.012em",
        }}
      >
        Case Academy
      </span>
      <svg
        style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 6 }}
        viewBox="0 0 130 6"
        preserveAspectRatio="none"
      >
        <path
          d="M 2 3 Q 35 5, 65 3 T 128 3"
          stroke={C.red}
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

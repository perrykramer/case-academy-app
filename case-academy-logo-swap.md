# Claude Code Prompt — Swap wordmark back to original Space Grotesk + amber-arrow logo

## Goal
Replace the current Inter + red-hand-drawn-underline wordmark with the ORIGINAL Case Academy
logo: "Case Academy" in **Space Grotesk Bold, navy `#1e3a5f`**, with an **amber `#f59e0b`
northeast arrow**.

**Scope is the logo ONLY.** Do NOT touch any other font, color, or accent anywhere else in
the app. The body font stays Inter. The paper canvas stays. Red brand accents elsewhere stay
(a separate prompt handles those). This prompt changes the wordmark and nothing else.

---

## Important context (read before editing)
- The wordmark renders from a shared component: **`components/Wordmark.tsx`**, imported by
  `app/page.tsx` (landing) and `app/dashboard/page.tsx`. Editing this one component updates
  every place the logo appears. Do NOT edit the call sites' logos individually.
- The component currently takes a `fontSize` prop. After this change the logo is a fixed-aspect
  inline SVG, so `fontSize` no longer controls rendered text size. **Keep the `fontSize` prop in
  the signature as an accepted-but-ignored (no-op) prop** so existing call sites don't break.
  Do NOT go edit the call sites to remove it.
- The logo MUST render in real Space Grotesk Bold (700). The source SVG loads the font via an
  `@import`, which will NOT work if loaded as an external image. So we inline the SVG as JSX
  inside the component (below) AND ensure Space Grotesk 700 is loaded by the app.

---

## Step 1 — Load Space Grotesk 700 in the app
Check whether Space Grotesk is already loaded. Run:

```
Select-String -Path "app\layout.tsx","app\**\*.tsx","app\globals.css" -Pattern "Space Grotesk"
```

- If it IS already imported (e.g. via `next/font/google` or a `<link>`), confirm it includes
  weight **700** and do nothing further here.
- If it is NOT loaded, add it in `app/layout.tsx` using `next/font/google`, weight 700, and make
  it available app-wide (e.g. a CSS variable `--font-space-grotesk`). Do this in a way that does
  NOT change the default body font — Inter must remain the default. Space Grotesk should only be
  reachable by the logo, not applied globally.

REPORT which path you took (already-present vs. added) and paste the lines you added/changed.

---

## Step 2 — Replace the body of `components/Wordmark.tsx`
Open `components/Wordmark.tsx`. Replace its render output with the inline SVG below. Keep the
component's existing export name and keep accepting a `fontSize` prop (typed optional) even though
it is now ignored. Preserve any `className`/style passthrough the component already supports.

The render should be this inline SVG (inline JSX, NOT an `<img>` to a file):

```tsx
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
      fontFamily: "'Space Grotesk', sans-serif",
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
```

Notes:
- If in Step 1 you exposed Space Grotesk as a CSS variable, set `fontFamily` to
  `"var(--font-space-grotesk), 'Space Grotesk', sans-serif"` so it picks up the loaded font.
- Make the SVG scale to its container if the component was previously sized by callers: allow a
  `className` to override width via CSS, but the default 280×48 / viewBox must stay so the aspect
  ratio is correct.
- Do NOT keep any of the old red-underline JSX. It's fully replaced.

---

## Step 3 — Verify (do not skip)
1. Run `npm run build` and confirm it compiles green (no implicit `any`, no unused vars — these
   pass `dev` but fail `next build`).
2. Confirm no leftover references to the old wordmark treatment:
   ```
   Select-String -Path "components\Wordmark.tsx" -Pattern "underline|C8302E|red"
   ```
   Expected: no matches (the new logo has no red and no underline).
3. REPORT: paste the final `components/Wordmark.tsx` in full, and confirm the build result.

---

## Constraints / do-nots
- Do NOT modify `app/dashboard/layout.tsx` (load-bearing auth gate).
- Do NOT change Inter, the paper canvas, or any red accent outside the logo.
- Do NOT edit call sites to remove the `fontSize` prop.
- Test on **localhost:3000**, not the live Vercel URL.

When done, report: (1) how Space Grotesk got loaded, (2) the full final Wordmark.tsx,
(3) build status. Do not proceed to any color changes — that's a separate prompt.

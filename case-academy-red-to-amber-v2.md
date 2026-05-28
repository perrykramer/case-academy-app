# Claude Code Prompt — Swap red brand accent → amber (v2, deterministic)

## Goal
Change the brand accent color from pen-red `#C8302E` → amber `#f59e0b` so the site matches the
restored Space Grotesk + amber-arrow logo.

We have ALREADY confirmed (via manual search) that the deadline urgency badge does NOT use the
`red` token — it uses its own dedicated hex values in `deadlinePillStyle` (`#FEE2E2/#B91C1C/#FECACA`
for ≤14d, `#FEF3C7/#92400E/#FDE68A` for ≤30d). So the token change does NOT affect it and you must
NOT touch `deadlinePillStyle`. Leave the deadline badges entirely alone.

Scope: color only. Do NOT touch fonts, layout, the logo, the paper canvas, or the deadline badges.

---

## IMPORTANT — execution rules (a previous run hung)
- Run every `Select-String` with a **SINGLE `-Path`** only. Do NOT chain multiple comma-separated
  paths in one command — that is what hung the prior session. One file per search command.
- Do the searches exactly as written below, one at a time.

---

## Step 1 — The main change (one line)
Open **`lib/tokens.ts`**. Find the `red` key in the `C` token object. Change ONLY its value:

```
red: '#f59e0b'
```

Keep the key named `red` (do not rename — it would break every import). Paste the before/after line.

This flips every brand accent that inherits `C.red`: eyebrows, section labels, feature checkmarks,
status badges, hero hand-drawn underline, hand-drawn SVG marks. Including the dashboard eyebrow at
`app/dashboard/page.tsx` line ~128 (`color: C.red`), which correctly becomes amber.

---

## Step 2 — Catch any hardcoded `#C8302E` in the two files NOT yet checked
The dashboard (`app/dashboard/page.tsx`) and `components/DeadlinesTable.tsx` have already been
verified clean of `#C8302E`. Two surfaces remain unchecked: the landing page and global CSS.

Run these as SEPARATE single-path commands:

```
Select-String -Path "app\page.tsx" -Pattern "C8302E"
```
```
Select-String -Path "app\globals.css" -Pattern "C8302E"
```

If there's also a landing-nav or other component that renders red and isn't covered, check it the
same way (single path each). For EACH `#C8302E` hit found:
- If it's a brand accent (underline, eyebrow, checkmark, badge, mark) → replace with `#f59e0b`.
- If by any chance it's a functional/urgency color → leave it. (None expected.)

REPORT every hit and what you did. If a search returns nothing, say so and move on.

---

## Step 3 — Verify
1. `npm run build` → must compile green.
2. Re-run the two searches from Step 2 (single-path each). Brand-accent hits should now be zero.
3. On **localhost:3000**, eyeball:
   - Landing: hero underline, eyebrows, checkmarks, status badges → amber.
   - Dashboard: section eyebrow (line ~128) → amber; deadline badges UNCHANGED (≤14d still red
     family, ≤30d still amber family, visibly distinct).
4. REPORT: build result + confirmation deadline badges look unchanged.

---

## Constraints / do-nots
- Do NOT modify `deadlinePillStyle` or any deadline badge color.
- Do NOT modify `app/dashboard/layout.tsx` (load-bearing).
- Do NOT change fonts, the logo, layout, or the paper canvas.
- Do NOT rename the `red` token key — value only.
- Single-path `Select-String` only. Test on localhost:3000, not live Vercel.

When done, report Step 1 (before/after line), Step 2 (hits + fixes), Step 3 (build + badge check).

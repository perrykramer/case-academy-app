# Claude Code Prompt — Swap red brand accent → amber

## Goal
Change the brand accent color from **pen-red `#C8302E` → amber `#f59e0b`** across the app, so the
site matches the original Space Grotesk + amber-arrow logo we just brought back.

**One critical exception:** the deadline urgency badge in the dashboard uses red as a FUNCTIONAL
signal (≤14 days = red = urgent, ≤30 days = amber). That red must STAY. We are only changing
*brand* red, not *functional* red. See Step 3.

Scope: color only. Do NOT touch fonts, layout, the logo (already done), the paper canvas, or any
other token. Inter stays, Space Grotesk logo stays.

---

## Step 1 — Find every red before changing anything (report first)
The palette is centralized in **`lib/tokens.ts`** as `C.red`. But some files may have hardcoded
the hex inline instead of using the token. Find all of them. Run:

```
Select-String -Path "app\*.tsx","app\**\*.tsx","components\*.tsx","components\**\*.tsx","lib\*.ts","app\globals.css" -Pattern "C8302E|c8302e|C\.red"
```

REPORT the full list of hits (file + line) BEFORE editing anything. For each hit, note whether it
looks like a brand accent (eyebrow, checkmark, badge, hero underline, hand-drawn mark) or a
functional signal (deadline urgency). We decide per-hit; do not blanket-replace yet.

---

## Step 2 — Change the token (the main move)
In **`lib/tokens.ts`**, change the brand red token value to amber:

```
red: '#f59e0b'
```

(Keep the key named `red` — renaming it would ripple through every import. Only the VALUE changes.)

This alone flips everything that correctly inherits `C.red`: eyebrows, section labels, feature
checkmarks, status badges (GROWING WEEKLY / COMING SOON), hero hand-drawn underline, and the
hand-drawn SVG vocabulary.

---

## Step 3 — Protect the deadline urgency signal (DO NOT make this amber)
Find the deadline countdown badge logic. It lives in the dashboard deadline feed — likely
**`components/DeadlinesTable.tsx`** and/or `app/dashboard/page.tsx`. The rule is:
≤14 days → red, ≤30 days → amber, else neutral.

- If the ≤14-day "urgent" color is currently `C.red` or `#C8302E`, it MUST be pinned to an
  explicit red hex (`#C8302E`) so it does NOT follow the token change to amber. Otherwise ≤14d and
  ≤30d both become amber and the urgency tier collapses.
- If it already uses a hardcoded red separate from the token, leave it as-is.

REPORT exactly how the urgency badge gets its red, and what you did to keep it red.

After this step, confirm the two urgency tiers are still visually distinct: ≤14d red, ≤30d amber.

---

## Step 4 — Sweep hardcoded brand-red hits from Step 1
For each `#C8302E` / `c8302e` hit identified in Step 1 as a BRAND accent (not the urgency badge),
replace with `#f59e0b`. Skip any that are the functional urgency red from Step 3.

Also check `app/globals.css` — if any retired tokens or hardcoded red live there (e.g. an old
`--red` / accent var), update brand ones to amber. Leave functional reds alone.

---

## Step 5 — Verify (do not skip)
1. `npm run build` → must compile green.
2. Re-run the Step 1 search. Every remaining `C8302E` hit should be ONLY the deadline urgency
   badge. If any brand-accent red remains, fix it.
3. On **localhost:3000**, eyeball:
   - Landing: hero underline, eyebrows, checkmarks, status badges → all amber.
   - Dashboard: section accents amber; deadline badges still show RED for ≤14d items and AMBER
     for ≤30d items (distinct).
4. REPORT: the Step 1 re-run output, the build result, and confirmation the urgency tiers are
   still distinct.

---

## Constraints / do-nots
- Do NOT modify `app/dashboard/layout.tsx` (load-bearing).
- Do NOT change fonts, the logo, layout, or the paper canvas.
- Do NOT make the deadline ≤14d urgency badge amber.
- Do NOT rename the `red` token key — change its value only.
- Test on localhost:3000, not live Vercel.

When done, report Steps 1, 3, and 5 outputs.

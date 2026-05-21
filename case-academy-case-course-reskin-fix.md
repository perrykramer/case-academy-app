# Claude Code task: Re-skin the case-course page (this file was skipped last run)

## Why
In the previous pass you rebuilt the dashboard and extracted tokens to `lib/tokens.ts`
(confirmed present), but `app/case-course/page.tsx` was NOT recolored — it still has the old
amber/slate theme hardcoded. Confirmed: `#f59e0b` is still at lines ~56 and ~89.
This is a PURE RECOLOR of one file. Do NOT change structure, data, or logic.

## STEP 1 — read the tokens first
Open `lib/tokens.ts` and report the exact export name and key names (e.g. is it
`export const C = { canvas, ink, red, body, muted, hairline, ... }` or renamed?).
Use the REAL names from that file in all edits below — do not assume.

## STEP 2 — recolor `app/case-course/page.tsx` ONLY
Import the tokens from `lib/tokens.ts`. Replace every hardcoded color with the token equivalent.
PRESERVE everything else exactly: the `auth()` call, the Supabase `lesson_progress` read keyed on
`clerk_user_id`, the `lessons` map, `completedSlugs`/`completedCount`/`percentComplete` logic,
all links to `/case-course/[slug]`, and the "Back to dashboard" link.

Color mapping (use the actual token keys from Step 1 — names below assume the `C.*` shape):
- Page background `#f8fafc` → `C.canvas` (warm paper `#FBFAF5`).
- H1 "The Case Course" `#0f172a` → `C.ink`. **Also set its font to Inter** (the shared
  `var(--font-inter)` / sans variable used elsewhere) — it currently inherits a serif default.
  Headings in this design system are Inter Medium, NOT serif.
- Body/description `#475569` → `C.body`. Muted text `#64748b` and `#94a3b8` → `C.muted`.
- Card/list-item backgrounds: keep white (or a very light paper surface). Card borders
  `#e2e8f0` → `C.hairline`.
- **Progress bar fill `#f59e0b` (line ~56) → `C.ink` (G2 blue).**
- **Completed-lesson circle (line ~89): `isComplete ? '#f59e0b' : '#e2e8f0'` →
  `isComplete ? C.ink : <light muted>` ** — completed = blue fill with white check;
  incomplete = light/muted circle (map `#e2e8f0` to `C.hairline` or a light paper tone).
- The progress-bar track `#e2e8f0` → light hairline tone.

## STEP 3 — grid behind the header block ONLY
Add the same 6%-opacity blue gridlines from the landing page hero behind the HEADER block only
(the "Back to dashboard" link + H1 + description + progress-bar card). Do NOT put the grid behind
the lesson list — that stays plain warm paper. If the landing page / dashboard already has a
reusable grid component or CSS, reuse it so it matches exactly.

## DO NOT
- Do NOT touch `app/case-course/[slug]/page.tsx` (individual lessons) in this task.
- Do NOT change any data-fetching, auth, or progress logic.
- Do NOT reintroduce Space Grotesk or any amber/slate hardcoded values.

## VERIFY
- localhost:3000 (NOT Vercel). Hard-refresh / restart dev server.
- `/case-course`: warm paper bg, Inter sans heading (no serif), blue progress bar,
  blue completed checkmarks, grid behind header only.
- `Select-String -Path "app\case-course\page.tsx" -Pattern "f59e0b"` returns NOTHING.
- Progress count + bar still reflect real Supabase data; lesson links + back link still work.

## REPORT
- The real token export/key names you found in `lib/tokens.ts`.
- Confirm `#f59e0b` is fully gone from the file.

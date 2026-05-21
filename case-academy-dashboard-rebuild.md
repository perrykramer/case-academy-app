# Claude Code task: Rebuild the post-signin dashboard (new layout + re-skin)

## Goal
Replace the current tab-based dashboard with a single scrolling three-tier layout, and
re-skin it to the new "ink-on-paper" design system so the post-login experience matches
the new pre-signin landing page. The dashboard and the landing page must look like one
unified site.

## STEP 0 — Discover and report BEFORE editing (do this first, then pause for review)
Read and report back the following, then WAIT for confirmation before making changes:
1. The current dashboard page (the client component with the `Courses/Practice/Resources/
   Community` tabs and the "Wine Market Sizing" practice problem). Confirm its file path.
2. The dashboard auth layout (the `"use client"` component that uses `useAuth` and redirects
   to `/sign-in`). **DO NOT MODIFY THIS FILE** — the auth redirect is load-bearing.
3. The **landing page's** global stylesheet / `:root` block — wherever the new design-system
   CSS variables are defined (warm paper bg, G2 blue, pen red, graphite text, Inter +
   Source Serif). Report the EXACT variable names and values you find.
4. Confirm whether a Crash Course route exists at `/case-course` and what it renders.

Report all four, then proceed.

## Design system — REUSE the landing page's tokens (do not invent new ones)
The single most important rule: the dashboard must draw from the SAME design tokens as the
landing page, not a near-duplicate set. After Step 0, reuse the landing page's existing CSS
variables. If the landing page defines them in a shared globals file, import/reference that
same source. The locked palette (for reference — match the landing page's actual variable
names to these values):
- Canvas / page bg: `#FBFAF5` (warm off-white paper)
- Primary ink (headings, primary buttons, links): `#1B3D8F` (G2 blue)
- Pen red (single accent — eyebrows, marks, badges): `#C8302E`
- Body text: `#4A4A47` (warm graphite — never pure black)
- Muted text: `#6B6B68`
- Fonts: Inter (400/500) for sans, Source Serif 4 used sparingly. **Retire Space Grotesk
  entirely** — it was rejected. The old dashboard wordmark uses Space Grotesk; replace it.

Retire the entire old dark dashboard theme (navy-darker backgrounds, white text, amber
accents). The new dashboard is LIGHT: warm-paper background, graphite text, blue + red ink.
This is a dark→light inversion, so move text color, surface color, border color, and any
shadows together — don't leave white text on light surfaces.

## Wordmark
Replace the old SVG wordmark (Space Grotesk, white text, amber arrow) in the top nav with
the new wordmark: "Case Academy" in Inter Medium, dark ink (`#1B3D8F` or graphite per the
landing page's treatment), with the hand-drawn RED underline SVG (`#C8302E`) — matching the
landing page wordmark exactly. If the landing page already has a wordmark component, reuse it.

## NEW LAYOUT — single scrolling stack, three tiers (no tabs)
Remove the tab system entirely (`Courses/Practice/Resources/Community` tabs and all
`activeTab` state). Remove the practice-problem feature entirely (the "Wine Market Sizing"
card, hints, answer textarea, submit/success states, and all related state:
`showProblemDetail`, `answerSubmitted`, `showHint`, `answerText`). Remove the "First Practice
Problem is Live!" banner.

Keep the top nav (rebranded per above) with the user's first name and Clerk `<UserButton />`.
Keep the welcome line ("Welcome back, {firstName}").

Then render three stacked sections in this order:

### Tier 1 — Upcoming deadlines (TOP)
A section titled "Upcoming deadlines" with a small "live from Airtable" label.
Render as a TABLE (not cards): columns = Firm | Program | Deadline | Apply.
- Deadline column shows a countdown badge: "{date} · {N}d" where N = days until deadline.
  Color the badge by urgency: red (`--color-danger`-ish) if ≤14 days, amber if ≤30 days,
  neutral/muted otherwise.
- Apply column = external-link icon linking to the firm's application URL (new tab).
- Data source: Airtable. **The Airtable connection does NOT exist yet.** Scaffold it:
  - Create a server-side fetch (this tier should be a server component or use a server
    action / route handler — do NOT expose the Airtable key client-side).
  - Read the key from an env var named `AIRTABLE_API_KEY` and base/table from
    `AIRTABLE_BASE_ID` / `AIRTABLE_DEADLINES_TABLE`. Add these to `.env.local` with
    placeholder values and leave a clear `// TODO: Perry to add Airtable credentials` comment.
  - Cache the result (e.g. Next `revalidate` ~3600s) — deadlines change daily, not per-request;
    do not hammer Airtable on every page load.
  - If the env vars are missing/unset, render the table with a graceful empty state
    ("Deadlines loading soon") rather than crashing. The page must render fine before the
    key is added.

### Tier 2 — Interview prep (MIDDLE)
Section titled "Interview prep" containing two labeled sub-rows:

**Case** (sub-label) — three cards:
1. Case Crash Course — desc "The fundamentals, start here" — status pill "Available now"
   (green/success) — links to `/case-course`.
2. Case Library — desc "Practice cases, self-paced" — status pill "Growing weekly"
   (blue/info) — links to `/library`.
3. Video Walkthroughs — desc "Full cases, end to end" — status pill "Coming soon"
   (neutral) — no link yet (placeholder).

**Behavioral** (sub-label) — two cards:
1. Fit & Behavioral Guide — desc "Story frameworks, common Qs" — status pill "Resources"
   (blue/info) — placeholder link for now.
2. Behavioral Walkthrough — desc "Answering fit questions well" — status pill "Coming soon"
   (neutral) — no link yet (placeholder).

### Tier 3 — Application prep (BOTTOM)
Section titled "Application prep". Two slim horizontal download rows (lighter weight than the
prep cards — these are file downloads, not content pillars):
1. Resume Template — "Editable .docx" — download link to the resume .docx in `/public/resources/`
   (use the `download` attribute). If the file isn't there yet, leave a TODO with the expected path.
2. Cover Letter Template — "Editable .docx" — same treatment.

## Footer
Keep a footer. Include:
- "© 2026 Case Academy · Built by Perry Kramer"
- A QUIET text link to the Slack community (keep the existing invite URL:
  `https://join.slack.com/t/case-academy-group/shared_invite/zt-3rdo65h1w-Y7ehVZCRws8NHu7Mw29~ZQ`,
  new tab). Small, muted — a footer link, not a prominent CTA.

## PRESERVE (do not break)
- Clerk `useUser` (first name) and `<UserButton />`.
- The `/library` internal link.
- The Slack invite URL (now in footer).
- The auth layout file (untouched).

## DO NOT
- Do NOT modify the dashboard auth layout component.
- Do NOT keep any tabs, the practice problem, or the old dark theme / Space Grotesk.
- Do NOT expose the Airtable key to the client.
- Do NOT invent new design tokens if the landing page already defines them — reuse.

## VERIFY (per standing dev rule)
- Test on **localhost:3000**, NOT the live Vercel URL.
- Page renders with no console errors even though the Airtable key is not set yet
  (graceful empty state on the deadlines tier).
- Visual check: dashboard background, text, buttons, and wordmark match the landing page
  (same warm paper, same blue/red ink, Inter — no leftover navy/amber/Space Grotesk anywhere).
- Crash Course card → `/case-course`; Library card → `/library`; Slack footer link works.
- `<UserButton />` and first name still work.

## REPORT BACK
- File(s) edited and the exact landing-page token source you reused.
- Confirmation the three tiers render in order (deadlines → interview prep → application prep).
- Any leftover old-theme references you had to chase down.
- The env var names you scaffolded for Airtable so Perry knows what to add.

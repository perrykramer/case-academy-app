# Claude Code task: Landing page — relabel CTAs + add subtle sign-in for members

Single file: `app/page.tsx` (the landing page). Small change. Do NOT alter layout, design
tokens, copy elsewhere, or any other file except as noted for the auth components.

## STEP 1 — read first
Report: is `app/page.tsx` a server or client component? Is `<ClerkProvider>` in `layout.tsx`
(so Clerk components are available in this tree)? Confirm before editing.

## CHANGE 1 — relabel every primary CTA
Find EVERY button/link currently labeled "Become a founding member" on this page (nav, hero,
final CTA section — there may be 2–3) and change the label to **"Join today"**.
- Keep each button's existing styling, link target (Stripe/checkout), and position unchanged.
- Only the visible text changes. Do not miss any instance — search the whole file.

## CHANGE 2 — add a subtle, auth-aware sign-in entry (nav, top-right)
Add a quiet "Sign in" affordance in the nav, next to the "Join today" CTA. Make it
auth-aware using Clerk's `<SignedOut>` / `<SignedIn>` components:
- `<SignedOut>`: show a subtle text link "Sign in" → `/sign-in`. Styling: muted graphite
  (`C.muted` / the muted token), normal weight, small — a text link, NOT a button. It should
  read as secondary to the "Join today" button sitting beside it.
- `<SignedIn>`: instead of "Sign in", show a subtle "Go to dashboard" text link → `/dashboard`
  (same muted styling). Optionally also render Clerk's `<UserButton />` if it fits the nav
  cleanly, but the dashboard link is the priority.
- Import from `@clerk/nextjs`. If `app/page.tsx` is a server component and these client
  components require it, wrap ONLY the nav auth affordance in a tiny client component
  (e.g. `components/NavAuth.tsx`) rather than converting the whole page to client. Keep the
  blast radius minimal.

## DO NOT
- Do NOT change any other copy, the hero, pricing, or design tokens.
- Do NOT convert the whole landing page to a client component if a small wrapper avoids it.
- Do NOT touch the Stripe link targets on the CTAs.

## VERIFY (localhost:3000, restart + hard-refresh)
- All former "Become a founding member" buttons now read "Join today" (check nav, hero, final CTA).
- Logged OUT: nav shows "Join today" + a subtle "Sign in" link → `/sign-in` works.
- Logged IN: nav shows "Go to dashboard" link → `/dashboard` (no stale "Sign in").
- Landing page otherwise looks identical (no layout/color regressions).
- `Select-String -Path "app\page.tsx" -Pattern "founding member"` returns nothing (label fully replaced).

## REPORT
- Whether page is server/client, and whether you added a NavAuth wrapper.
- How many "Become a founding member" instances you found and replaced.

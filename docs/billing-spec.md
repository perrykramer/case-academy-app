# Billing & Subscriptions — Build Spec

Status: **Approved and built in test mode** (2026-11-11). Go-live (section 11) not done yet.

Scripts: `node --env-file=.env.local scripts/stripe-setup.mjs` (price + portal, run once per Stripe mode) · `node --env-file=.env.local scripts/backfill-clerk-ids.mjs` (link users rows to Clerk; run once per Clerk instance).

## Goal

A new visitor can: sign up → pick a plan → enter card on Stripe Checkout → get access to Case Academy immediately → later update their card, switch plans, or cancel themselves.

## Target user flow

```
Landing "Get started"
  → /sign-up (Clerk)
  → /subscribe            Founding Member $9.99/mo (signed-out visitors can view; button sends them to sign up first)
  → Stripe Checkout       hosted page: card / Apple Pay / Google Pay, promo codes
  → /dashboard?checkout=success&session_id=…
        server verifies the session with Stripe and writes access right away
        (webhook also writes it; whichever lands first wins — no "wait for access" gap)
  → /case-course + all library cases unlocked
Dashboard "Manage subscription"
  → Stripe Customer Portal  update card, cancel (at end of period), download invoices
  → back to /dashboard
```

Already-subscribed users who hit /subscribe get sent to the portal instead of a second checkout.

## Decisions (confirmed 2026-11-11)

| Topic | Decision |
|---|---|
| Pricing (now) | **One plan: Founding Member, $9.99/month, locked for life** — matches the landing page. Stripe test prices today are $29/mo and $199/yr → create a new $9.99/mo price; checkout uses only it. |
| Pricing (full launch, later) | $29/month and $249/year. Switching the checkout to those prices does **not** change existing $9.99 subscriptions — Stripe keeps each subscription on its original price, which is what makes "locked for life" true. |
| Cancel & rejoin | Matches landing copy: a founding member who cancels and rejoins after launch pays the then-current price (new checkout = current price). |
| Free trial | None. Promo codes stay enabled. |
| `founding_member` flag | Marks $9.99 payers. Set automatically by the webhook when the subscription is on the founding price. Does **not** grant access on its own. |
| Free access | `is_tester = true` (pilots/testers) = full access permanently, no Stripe needed. |
| Failed renewal | Keep access while Stripe retries (`past_due`); lose it when Stripe cancels. |
| Customer Portal | Not configured yet (0 configs in test mode) → create via API: update card, cancel at period end, invoice history. **No plan switching** (only one plan; and switching would drop the founding rate). |

## What exists today (keep)

- Clerk auth + `middleware.ts` gating `/dashboard` (signed in) and `/case-course` (paid).
- `/api/checkout` (creates subscription Checkout session), `/api/stripe/webhook`, `/api/clerk/webhook`.
- `lib/access.ts` — active/trialing + period not expired.
- Library cases locked unless `free_preview`.

## Changes

### 1. Database (Supabase `users` table) — migration
- Add `clerk_user_id text unique` — link rows to the Clerk account, not just email.
- Add `cancel_at_period_end boolean default false` — so the dashboard can say "Ends on Dec 3".
- Index `stripe_customer_id`, `stripe_subscription_id`.
- Backfill `clerk_user_id` for existing users (one-time script using the Clerk API, matched by email).

### 2. Identity linking
- Access check keys on **Clerk user ID** (always available in middleware), falling back to email. Removes the dependency on a custom Clerk session-token claim and survives email changes.
- Clerk webhook `user.created` writes `clerk_user_id`; `user.updated` syncs email changes.

### 3. `/api/checkout`
- Price comes from a single server-side setting (`STRIPE_PRICE_CURRENT`, = founding $9.99 now). At full launch you change one env var; the `monthly | annual` choice gets added then.
- Reuse the user's existing Stripe customer if they have one (no duplicate customers on re-subscribe); otherwise create one tagged with `clerk_user_id`.
- Put `clerk_user_id` on the session (`client_reference_id`) and on the subscription metadata.
- If already active → return portal URL instead.
- Drop the hard-coded `payment_method_types: ['card']` so Apple/Google Pay show up.
- Success URL carries `{CHECKOUT_SESSION_ID}`; optional free trial (see questions).

### 4. `/api/billing-portal` (new)
- Signed-in only; creates a Stripe Customer Portal session for the user's customer ID, returns to `/dashboard`.

### 5. `/api/stripe/webhook`
- Handle `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`.
- One shared `syncSubscription()` function that writes status, plan, period end, `cancel_at_period_end`, and sets `founding_member = true` when the subscription is on the founding price — looked up by Stripe customer ID / Clerk ID.
- Stop force-writing `past_due` on a failed invoice; let Stripe's subscription status drive it (see grace-period question).

### 6. `lib/access.ts`
- Look up by Clerk ID → email fallback.
- Access if: status `active` / `trialing` / `past_due` (grace while Stripe retries) **or** `is_tester = true`.
- Return a small status object (plan, renews/ends date) for the dashboard, not just true/false.

### 7. `/subscribe` page
- Reskin to the dashboard design system (`lib/tokens`, Wordmark).
- Founding Member card matching the landing page: $9.99/mo, "$29 at full launch" struck through, "locked for life".
- Signed-out → "Create account" → `/sign-up?redirect_url=/subscribe`.
- Also fix the stale "Subscribe — $29/month" button in `components/CaseLockedPreview.tsx`.

### 8. Sign-up redirect
- After Clerk sign-up, land on `/subscribe` (not the dashboard).

### 9. Dashboard
- Membership card: plan, status, "Renews Dec 3" / "Ends Dec 3", **Manage subscription** button.
- Non-subscribers see an "Unlock Case Academy" CTA instead.
- `?checkout=success` → verify session server-side + show a welcome banner.

### 10. Testing (test mode)
- Stripe CLI (`stripe listen --forward-to localhost:3000/api/stripe/webhook`) — installed, needs `stripe login`.
- Test cards: success `4242…`, 3-D Secure `4000 0025 0000 3155`, decline `4000 0000 0000 0002`.
- Walk through: sign up → subscribe at $9.99 → access → portal update card → cancel → access ends at period end → failed renewal keeps access while retrying.

### 11. Go-live checklist (separate step, after test mode passes)
- Live Stripe products/prices + keys, live webhook endpoint `https://<domain>/api/stripe/webhook` + secret.
- Customer Portal configured in **live** mode (settings are per-mode).
- Clerk production instance + production webhook.
- Vercel env vars updated; `NEXT_PUBLIC_APP_URL` = production domain.

### 12. Full-launch switch (later, not this build)
- Create live $29/mo + $249/yr prices, point `STRIPE_PRICE_CURRENT` at them, add the monthly/annual toggle and portal plan switching (non-founding only). Existing $9.99 members are untouched.

## Out of scope (unless you want them)
Stripe Tax / VAT, team or school seat licenses, refunds automation, dunning emails beyond Stripe's built-in ones.

import 'server-only';
import Stripe from 'stripe';
import { stripe } from './stripe';
import { supabaseAdmin } from './supabase';
import { findUserRow } from './access';

export const PRICE_CURRENT = process.env.STRIPE_PRICE_CURRENT;
export const PRICE_FOUNDING = process.env.STRIPE_PRICE_FOUNDING;

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function toIsoOrNull(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds || typeof unixSeconds !== 'number' || isNaN(unixSeconds)) return null;
  const date = new Date(unixSeconds * 1000);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

// In API 2025+ current_period_end lives on the subscription item.
function getPeriodEnd(subscription: Stripe.Subscription): number | null {
  const itemEnd = subscription.items?.data?.[0]?.current_period_end;
  if (itemEnd) return itemEnd;
  // @ts-expect-error — older API versions have this on the subscription
  return subscription.current_period_end ?? null;
}

function planName(priceId: string | undefined, interval: string | undefined): string {
  if (priceId && priceId === PRICE_FOUNDING) return 'founding';
  return interval === 'year' ? 'annual' : 'monthly';
}

function idOf(x: string | { id: string } | null | undefined): string | null {
  if (!x) return null;
  return typeof x === 'string' ? x : x.id;
}

/**
 * Writes a Stripe subscription's current state to the users table.
 * Safe to call repeatedly (webhooks + checkout success page both call it).
 */
export async function syncSubscription(
  subscriptionOrId: Stripe.Subscription | string,
  hint: { clerkUserId?: string | null; email?: string | null } = {}
): Promise<void> {
  const subscription =
    typeof subscriptionOrId === 'string'
      ? await stripe.subscriptions.retrieve(subscriptionOrId)
      : subscriptionOrId;

  const customerId = idOf(subscription.customer)!;
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  const isFounding = !!priceId && priceId === PRICE_FOUNDING;

  let clerkUserId = hint.clerkUserId || subscription.metadata?.clerk_user_id || null;
  let email = hint.email?.toLowerCase().trim() || null;

  if (!clerkUserId || !email) {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted) {
      clerkUserId = clerkUserId || customer.metadata?.clerk_user_id || null;
      email = email || customer.email?.toLowerCase().trim() || null;
    }
  }

  const fields: Record<string, unknown> = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_plan: planName(priceId, item?.price?.recurring?.interval),
    current_period_end: toIsoOrNull(getPeriodEnd(subscription)),
    cancel_at_period_end: subscription.cancel_at_period_end || !!subscription.cancel_at,
  };
  // Founding flag only ever turns on — it records that they hold the locked rate.
  if (isFounding) fields.founding_member = true;

  // Prefer updating the existing row (by Clerk ID, then email, then customer ID).
  const existing = await findUserRow({ userId: clerkUserId, email });
  if (existing) {
    const q = supabaseAdmin.from('users').update({ ...fields, ...(clerkUserId ? { clerk_user_id: clerkUserId } : {}) });
    const { error } = existing.clerk_user_id
      ? await q.eq('clerk_user_id', existing.clerk_user_id)
      : await q.eq('email', existing.email);
    if (error) throw error;
    return;
  }

  const { data: byCustomer, error: custErr } = await supabaseAdmin
    .from('users')
    .update(fields)
    .eq('stripe_customer_id', customerId)
    .select('email');
  if (custErr) throw custErr;
  if (byCustomer && byCustomer.length > 0) return;

  if (!email) {
    console.error(`[billing] Can't sync subscription ${subscription.id}: no matching user and no email`);
    return;
  }

  // Upsert: several webhooks for a brand-new customer can arrive at once.
  const { error } = await supabaseAdmin
    .from('users')
    .upsert({ email, ...(clerkUserId ? { clerk_user_id: clerkUserId } : {}), ...fields }, { onConflict: 'email' });
  if (error) throw error;
}

/** Returns the user's Stripe customer ID, creating the customer if needed. */
export async function getOrCreateCustomer(clerkUserId: string, email: string, name?: string | null): Promise<string> {
  const row = await findUserRow({ userId: clerkUserId, email });
  if (row?.stripe_customer_id) {
    try {
      const c = await stripe.customers.retrieve(row.stripe_customer_id);
      if (!c.deleted) return c.id;
    } catch {
      // Customer missing (e.g. created in a different Stripe mode) — make a new one.
    }
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { clerk_user_id: clerkUserId },
  });

  // Upsert by email: only these columns are written; others keep their defaults/values.
  const { error } = await supabaseAdmin
    .from('users')
    .upsert(
      { email: row?.email ?? email.toLowerCase().trim(), clerk_user_id: clerkUserId, stripe_customer_id: customer.id },
      { onConflict: 'email' }
    );
  if (error) throw error;
  return customer.id;
}

export async function createPortalUrl(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl()}/dashboard`,
  });
  return session.url;
}

/**
 * Called from the checkout success redirect so access is granted immediately,
 * without waiting for the webhook. Only syncs sessions belonging to this user.
 */
export async function syncCheckoutSession(sessionId: string, clerkUserId: string): Promise<boolean> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== clerkUserId) return false;
    if (session.status !== 'complete' || !session.subscription) return false;
    await syncSubscription(idOf(session.subscription)!, {
      clerkUserId,
      email: session.customer_details?.email ?? session.customer_email,
    });
    return true;
  } catch (err) {
    console.error('[billing] syncCheckoutSession failed:', err);
    return false;
  }
}

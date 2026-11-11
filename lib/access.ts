import { supabaseAdmin } from './supabase';

// Statuses that grant access. `past_due` = Stripe is still retrying a failed
// renewal; members keep access until Stripe gives up and cancels.
const ACCESS_STATUSES = ['active', 'trialing', 'past_due'];

export type UserRow = {
  email: string;
  clerk_user_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  founding_member: boolean | null;
  is_tester: boolean | null;
};

export type Membership = {
  hasAccess: boolean;
  /** 'tester' = free access, 'subscriber' = paying, 'none' = no access */
  kind: 'tester' | 'subscriber' | 'none';
  status: string | null;
  plan: string | null;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  foundingMember: boolean;
  stripeCustomerId: string | null;
};

const USER_COLUMNS =
  'email, clerk_user_id, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_plan, current_period_end, cancel_at_period_end, founding_member, is_tester';

type Identity = { userId?: string | null; email?: string | null };

/**
 * Finds the user's row by Clerk user ID, falling back to email. When a row is
 * found by email with no Clerk ID yet (e.g. a pilot user), it gets linked.
 */
export async function findUserRow({ userId, email }: Identity): Promise<UserRow | null> {
  if (userId) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(USER_COLUMNS)
      .eq('clerk_user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as UserRow;
  }

  const normalizedEmail = email?.toLowerCase().trim();
  if (!normalizedEmail) return null;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select(USER_COLUMNS)
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as UserRow;
  if (userId && !row.clerk_user_id) {
    await supabaseAdmin.from('users').update({ clerk_user_id: userId }).eq('email', normalizedEmail);
    row.clerk_user_id = userId;
  }
  return row;
}

export function membershipFromRow(row: UserRow | null): Membership {
  const base = {
    status: row?.subscription_status ?? null,
    plan: row?.subscription_plan ?? null,
    periodEnd: row?.current_period_end ?? null,
    cancelAtPeriodEnd: !!row?.cancel_at_period_end,
    foundingMember: !!row?.founding_member,
    stripeCustomerId: row?.stripe_customer_id ?? null,
  };
  if (!row) return { ...base, hasAccess: false, kind: 'none' };
  if (row.is_tester) return { ...base, hasAccess: true, kind: 'tester' };

  const statusOk = ACCESS_STATUSES.includes(row.subscription_status ?? '');
  // Period end is a safety net in case a cancellation webhook is missed.
  // past_due is exempt: Stripe has already rolled the period forward or is retrying.
  const periodOk =
    row.subscription_status === 'past_due' ||
    (row.current_period_end ? new Date(row.current_period_end) > new Date() : false);

  const hasAccess = statusOk && periodOk;
  return { ...base, hasAccess, kind: hasAccess ? 'subscriber' : 'none' };
}

export async function getMembership(identity: Identity): Promise<Membership> {
  try {
    return membershipFromRow(await findUserRow(identity));
  } catch (error) {
    console.error('Error checking membership:', error);
    // Fail closed — deny access if Supabase errors
    return membershipFromRow(null);
  }
}

export async function hasAccess(identity: Identity): Promise<boolean> {
  return (await getMembership(identity)).hasAccess;
}

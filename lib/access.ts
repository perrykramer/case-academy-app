import { supabaseAdmin } from './supabase';

/**
 * Checks if a given email has access to premium content.
 * Returns true if the user has an active subscription status
 * (either grandfathered as a pilot user OR a paying subscriber).
 */
export async function hasAccess(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('email, subscription_status, current_period_end')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Error checking access:', error);
    // Fail closed — deny access if Supabase errors
    return false;
  }

  if (!data) return false;

  // Check if user has an active subscription status
  const activeStatuses = ['active', 'trialing'];
  const isActive = activeStatuses.includes(data.subscription_status);
  const periodValid = data.current_period_end
    ? new Date(data.current_period_end) > new Date()
    : false;

  return isActive && periodValid;
}
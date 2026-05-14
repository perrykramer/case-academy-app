import { supabaseAdmin } from './supabase';

/**
 * Checks if a given email is on the pilot allowlist.
 * Returns true if the user should have course access, false otherwise.
 */
export async function hasAccess(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Error checking access:', error);
    // Fail closed — deny access if Supabase errors
    return false;
  }

  return !!data;
}
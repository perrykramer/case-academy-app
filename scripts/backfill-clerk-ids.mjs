// Links existing users rows to their Clerk accounts by email.
//   node --env-file=.env.local scripts/backfill-clerk-ids.mjs
// Safe to re-run: only fills clerk_user_id where it's empty.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const clerkUsers = [];
for (let offset = 0; ; offset += 100) {
  const res = await fetch(`https://api.clerk.com/v1/users?limit=100&offset=${offset}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  if (!res.ok) throw new Error(`Clerk API ${res.status}: ${await res.text()}`);
  const page = await res.json();
  clerkUsers.push(...page);
  if (page.length < 100) break;
}

let linked = 0, created = 0;
for (const u of clerkUsers) {
  const primary = u.email_addresses.find((e) => e.id === u.primary_email_address_id) ?? u.email_addresses[0];
  const email = primary?.email_address?.toLowerCase().trim();
  if (!email) continue;

  const { data: row } = await supabase.from('users').select('email, clerk_user_id').eq('email', email).maybeSingle();
  if (row) {
    if (!row.clerk_user_id) {
      const { error } = await supabase.from('users').update({ clerk_user_id: u.id }).eq('email', email);
      if (error) console.error(email, error.message); else linked++;
    }
  } else {
    const { error } = await supabase.from('users').insert({
      email, clerk_user_id: u.id, subscription_status: 'none', founding_member: false, is_tester: false,
    });
    if (error) console.error(email, error.message); else created++;
  }
}

console.log(`Clerk users: ${clerkUsers.length} · linked existing rows: ${linked} · created missing rows: ${created}`);

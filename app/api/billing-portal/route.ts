import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getMembership } from '@/lib/access';
import { createPortalUrl } from '@/lib/billing';

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const email = (user.primaryEmailAddress ?? user.emailAddresses[0])?.emailAddress;
    const membership = await getMembership({ userId: user.id, email });

    if (!membership.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found for this account' }, { status: 404 });
    }

    return NextResponse.json({ url: await createPortalUrl(membership.stripeCustomerId) });
  } catch (err) {
    console.error('Billing portal error:', err);
    return NextResponse.json({ error: 'Could not open billing portal. Please try again.' }, { status: 500 });
  }
}

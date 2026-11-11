import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getMembership } from '@/lib/access';
import { appUrl, createPortalUrl, getCurrentPriceId, getOrCreateCustomer } from '@/lib/billing';

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const email = (user.primaryEmailAddress ?? user.emailAddresses[0])?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'No email on user account' }, { status: 400 });
    }

    const priceId = await getCurrentPriceId();
    if (!priceId) {
      const mode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test';
      console.error(
        `[checkout] No price: STRIPE_PRICE_CURRENT is unset and no active Stripe price has lookup key "founding_monthly_999" in ${mode} mode. Run scripts/stripe-setup.mjs with this environment's Stripe key.`
      );
      return NextResponse.json(
        { error: 'Checkout is temporarily unavailable. Please try again shortly.' },
        { status: 500 }
      );
    }

    // Already a member? Send them to manage their subscription instead of paying twice.
    const membership = await getMembership({ userId: user.id, email });
    if (membership.hasAccess) {
      if (membership.stripeCustomerId && membership.kind === 'subscriber') {
        return NextResponse.json({ url: await createPortalUrl(membership.stripeCustomerId) });
      }
      return NextResponse.json({ url: `${appUrl()}/dashboard` });
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
    const customerId = await getOrCreateCustomer(user.id, email, name);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { metadata: { clerk_user_id: user.id } },
      metadata: { clerk_user_id: user.id, user_email: email },
      allow_promotion_codes: true,
      success_url: `${appUrl()}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/subscribe?checkout=canceled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'No session URL returned' }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}

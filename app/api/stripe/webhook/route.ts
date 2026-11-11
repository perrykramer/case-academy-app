import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { syncSubscription } from '@/lib/billing';

function idOf(x: string | { id: string } | null | undefined): string | null {
  if (!x) return null;
  return typeof x === 'string' ? x : x.id;
}

// The subscription an invoice belongs to (moved under `parent` in API 2025+).
function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription;
  if (fromParent) return idOf(fromParent);
  // @ts-expect-error — older API versions have this on the invoice
  return idOf(invoice.subscription);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[stripe-webhook] ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = idOf(session.subscription);
        if (session.mode !== 'subscription' || !subscriptionId) break;
        await syncSubscription(subscriptionId, {
          clerkUserId: session.client_reference_id || session.metadata?.clerk_user_id,
          email: session.customer_details?.email ?? session.metadata?.user_email,
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        // Re-fetch so out-of-order events always write the latest state.
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription.id);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        // Stripe moves the subscription to past_due/active itself; just resync.
        const subscriptionId = invoiceSubscriptionId(event.data.object as Stripe.Invoice);
        if (subscriptionId) await syncSubscription(subscriptionId);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    // 500 makes Stripe retry the event later.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

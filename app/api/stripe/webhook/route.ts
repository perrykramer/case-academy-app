import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

// Safely convert a Stripe Unix timestamp (seconds) to an ISO string.
// Returns null if the timestamp is missing or invalid.
function toIsoOrNull(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds || typeof unixSeconds !== 'number' || isNaN(unixSeconds)) {
    return null;
  }
  const date = new Date(unixSeconds * 1000);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

// Get the period end from a subscription. In newer Stripe API versions
// (2025+), current_period_end lives on the SubscriptionItem, not the
// Subscription itself. Fall back to the subscription-level field for
// backward compatibility.
function getPeriodEnd(subscription: Stripe.Subscription): number | null {
  const itemEnd = subscription.items?.data?.[0]?.current_period_end;
  if (itemEnd) return itemEnd;
  // @ts-expect-error — older API versions have this on subscription
  const subEnd = subscription.current_period_end;
  return subEnd ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature in webhook request');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.metadata?.user_email?.toLowerCase().trim();
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!email || !subscriptionId) {
          console.error('Missing email or subscription ID in checkout session', session.id);
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const plan =
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL
            ? 'annual'
            : 'monthly';
        const periodEnd = getPeriodEnd(subscription);

        console.log(`[stripe-webhook] checkout: email=${email}, status=${subscription.status}, periodEnd=${periodEnd}`);

        const { error } = await supabaseAdmin
          .from('users')
          .upsert(
            {
              email,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: subscription.status,
              subscription_plan: plan,
              current_period_end: toIsoOrNull(periodEnd),
            },
            { onConflict: 'email' }
          );

        if (error) {
          console.error('Failed to update user after checkout:', error);
          throw error;
        }

        console.log(`[stripe-webhook] Granted access to ${email} (${plan})`);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const periodEnd = getPeriodEnd(subscription);

        console.log(`[stripe-webhook] ${event.type}: subId=${subscription.id}, status=${subscription.status}, periodEnd=${periodEnd}`);

        const { error } = await supabaseAdmin
          .from('users')
          .update({
            subscription_status: subscription.status,
            current_period_end: toIsoOrNull(periodEnd),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Failed to update subscription status:', error);
          throw error;
        }

        console.log(`[stripe-webhook] Updated subscription ${subscription.id} to status ${subscription.status}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { error } = await supabaseAdmin
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to mark user past_due:', error);
          throw error;
        }

        console.log(`[stripe-webhook] Marked customer ${customerId} as past_due`);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
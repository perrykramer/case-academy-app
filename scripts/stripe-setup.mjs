// One-time / idempotent Stripe setup. Run separately in test and live mode:
//   node --env-file=.env.local scripts/stripe-setup.mjs
// Creates (if missing) the Founding Member $9.99/mo price and the Customer Portal
// configuration, then prints the price ID to put in STRIPE_PRICE_CURRENT.
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error('STRIPE_SECRET_KEY not set');
const stripe = new Stripe(key);
const mode = key.startsWith('sk_live') ? 'LIVE' : 'TEST';

const FOUNDING_LOOKUP_KEY = 'founding_monthly_999';

async function getOrCreateFoundingPrice() {
  const existing = await stripe.prices.list({ lookup_keys: [FOUNDING_LOOKUP_KEY], limit: 1 });
  if (existing.data[0]) return existing.data[0];

  // Reuse the product behind the existing monthly price if there is one.
  let productId;
  if (process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY) {
    try {
      const p = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY);
      productId = typeof p.product === 'string' ? p.product : p.product.id;
    } catch {}
  }
  if (!productId) {
    productId = (await stripe.products.create({ name: 'Case Academy Membership' })).id;
  }

  return stripe.prices.create({
    product: productId,
    currency: 'usd',
    unit_amount: 999,
    recurring: { interval: 'month' },
    nickname: 'Founding Member — $9.99/mo (locked for life)',
    lookup_key: FOUNDING_LOOKUP_KEY,
    metadata: { founding: 'true' },
  });
}

async function ensurePortalConfig() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = {
    business_profile: { headline: 'Manage your Case Academy membership' },
    default_return_url: `${appUrl}/dashboard`,
    features: {
      customer_update: { enabled: true, allowed_updates: ['email', 'name', 'address'] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: ['too_expensive', 'missing_features', 'switched_service', 'unused', 'other'],
        },
      },
      subscription_update: { enabled: false },
    },
  };
  const list = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
  if (list.data[0]) {
    return stripe.billingPortal.configurations.update(list.data[0].id, params);
  }
  return stripe.billingPortal.configurations.create(params);
}

const price = await getOrCreateFoundingPrice();
const portal = await ensurePortalConfig();
console.log(`[${mode}] Founding price: ${price.id} ($${price.unit_amount / 100}/${price.recurring?.interval})`);
console.log(`[${mode}] Portal config: ${portal.id} (default: ${portal.is_default})`);
console.log(`\nSet in env:  STRIPE_PRICE_CURRENT=${price.id}  and  STRIPE_PRICE_FOUNDING=${price.id}`);

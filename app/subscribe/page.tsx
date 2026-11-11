import Link from 'next/link';
import type { CSSProperties } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Wordmark } from '@/components/Wordmark';
import { BillingButton } from '@/components/BillingButton';
import { getMembership } from '@/lib/access';
import { C } from '@/lib/tokens';

export const metadata = { title: 'Join Case Academy' };

const FEATURES = [
  'Full access to the Case Crash Course',
  'The case library, growing every week',
  'Video walkthroughs as they’re released',
  'Weekly group office hours during the build phase',
  'A direct say in what gets built next',
];

const btnPrimary: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  background: C.ink,
  color: C.canvas,
  borderRadius: 4,
  padding: '12px 20px',
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  border: 'none',
  fontFamily: 'var(--font-inter), Inter, sans-serif',
  lineHeight: 1.4,
};

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true">
      <path d="M 2 7 L 6 11 L 12 3" stroke={C.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const email = (user?.primaryEmailAddress ?? user?.emailAddresses[0])?.emailAddress;
  const membership = userId ? await getMembership({ userId, email }) : null;

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-inter), Inter, sans-serif', color: C.body }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: `1px solid ${C.hairline}`, background: '#ffffff',
      }}>
        <Link href={userId ? '/dashboard' : '/'} aria-label="Case Academy home"><Wordmark fontSize={17} /></Link>
        {userId ? (
          <Link href="/dashboard" style={{ color: C.muted, fontSize: 14, textDecoration: 'none' }}>Dashboard</Link>
        ) : (
          <Link href="/sign-in" style={{ color: C.muted, fontSize: 14, textDecoration: 'none' }}>Log in</Link>
        )}
      </nav>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '56px 16px 80px' }}>
        <h1 style={{ color: C.ink, fontSize: 32, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.1, marginBottom: 12 }}>
          Join Case Academy
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Everything you need to prep for consulting case interviews, in one place.
        </p>

        {checkout === 'canceled' && (
          <p style={{ fontSize: 13, color: C.body, background: '#ffffff', border: `1px solid ${C.hairline}`, borderRadius: 6, padding: '10px 14px', marginBottom: 20 }}>
            Checkout canceled — you haven’t been charged.
          </p>
        )}

        <div style={{ border: `1.5px solid ${C.ink}`, borderRadius: 8, padding: 32, position: 'relative', background: '#ffffff' }}>
          <span style={{
            position: 'absolute', top: -1, left: 24, background: C.red, color: '#fff',
            fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: '0 0 4px 4px',
          }}>
            FOUNDING MEMBER
          </span>

          <div style={{ marginBottom: 8, marginTop: 12 }}>
            <span style={{ color: C.ink, fontSize: 36, fontWeight: 500 }}>$9.99</span>
            <span style={{ fontSize: 15, marginLeft: 4 }}>/ month</span>
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 6 }}>
            <span style={{ textDecoration: 'line-through' }}>$29 at full launch</span>
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
            Founding rate locked for life. Lock it in now before we open at full price.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURES.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14 }}>
                <Check />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {!userId ? (
            <Link href="/sign-up" style={btnPrimary}>Create your account</Link>
          ) : membership?.hasAccess ? (
            <>
              <p style={{ fontSize: 14, color: C.ink, fontWeight: 500, marginBottom: 12 }}>You’re already a member.</p>
              <Link href="/dashboard" style={btnPrimary}>Go to dashboard</Link>
            </>
          ) : (
            <BillingButton endpoint="/api/checkout" style={btnPrimary}>
              Continue to payment — $9.99/mo
            </BillingButton>
          )}

          <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 14 }}>
            Cancel anytime · founding rate never increases · secure checkout by Stripe
          </p>
        </div>

        {!userId && (
          <p style={{ marginTop: 24, fontSize: 13, color: C.muted, textAlign: 'center' }}>
            Already have an account? <Link href="/sign-in" style={{ color: C.ink, fontWeight: 500 }}>Log in</Link>
          </p>
        )}
      </main>
    </div>
  );
}

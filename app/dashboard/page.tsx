import type { CSSProperties } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Wordmark } from '@/components/Wordmark';
import { C } from '@/lib/tokens';
import { DeadlinesTable } from '@/components/DeadlinesTable';
import { BillingButton } from '@/components/BillingButton';
import { getMembership, type Membership } from '@/lib/access';
import { syncCheckoutSession } from '@/lib/billing';

type Deadline = {
  id: string;
  firm: string;
  program: string;
  deadline: string;
  applyUrl: string;
};

async function fetchDeadlines(): Promise<Deadline[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_DEADLINES_TABLE;

  if (!apiKey || !baseId || !tableName) {
    console.log('[deadlines] MISSING ENV →', {
    });
    return [];
  }

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.log('[deadlines] AIRTABLE ERROR →', res.status, body);
      return [];
    }

    const json = await res.json();
    console.log('[deadlines] SUCCESS → got', json.records?.length ?? 0, 'records');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = (json.records ?? []).map((r: any) => ({
      id: r.id,
      firm: r.fields.Firm ?? '',
      program: r.fields.Program ?? '',
      deadline: r.fields.Deadline ?? '',
      applyUrl: r.fields['Application URL'] ?? '',
    }));

    return mapped
      .filter((d: Deadline) => {
        const days = daysUntil(d.deadline);
        return Number.isFinite(days) && days >= 0;
      })
      .sort((a: Deadline, b: Deadline) => daysUntil(a.deadline) - daysUntil(b.deadline));
  } catch (err) {
    console.log('[deadlines] THREW →', err);
    return [];
  }
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

const cardBase: CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${C.hairline}`,
  borderRadius: 10,
  padding: '20px 22px',
  flex: '1 1 200px',
};

const pillGreen: CSSProperties = {
  display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px',
  borderRadius: 20, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0',
};
const pillBlue: CSSProperties = {
  display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px',
  borderRadius: 20, background: '#EFF6FF', color: C.ink, border: `1px solid ${C.hairline}`,
};
const pillNeutral: CSSProperties = {
  display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px',
  borderRadius: 20, background: '#F3F4F6', color: C.muted, border: '1px solid rgba(0,0,0,0.08)',
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const btnPrimary: CSSProperties = {
  display: 'inline-block', background: C.ink, color: C.canvas, borderRadius: 4,
  padding: '10px 18px', fontSize: 13, fontWeight: 500, textDecoration: 'none', border: 'none',
  fontFamily: 'var(--font-inter), Inter, sans-serif', lineHeight: 1.4,
};
const btnSecondary: CSSProperties = {
  ...btnPrimary, background: '#ffffff', color: C.ink, border: `1px solid ${C.hairlineStrong}`,
};
const rowCard: CSSProperties = {
  ...cardBase, flex: 'none', display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
};

function MembershipCard({ m }: { m: Membership }) {
  if (m.kind === 'tester') {
    return (
      <div style={{ ...cardBase, flex: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>Membership</span>
          <span style={pillGreen}>Pilot access</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.55 }}>
          You have full access as a pilot member. Thank you for helping build Case Academy.
        </div>
      </div>
    );
  }

  if (!m.hasAccess) {
    return (
      <div style={rowCard}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Unlock Case Academy</div>
          <div style={{ fontSize: 13, lineHeight: 1.55 }}>
            {m.status === 'canceled' ? 'Your membership has ended. ' : ''}
            Get the full course and case library. Founding rate $9.99/mo, locked for life.
          </div>
        </div>
        <Link href="/subscribe" style={btnPrimary}>Become a member</Link>
      </div>
    );
  }

  const date = formatDate(m.periodEnd);
  const pastDue = m.status === 'past_due';
  const planLabel =
    m.foundingMember || m.plan === 'founding'
      ? 'Founding Member · $9.99/mo'
      : m.plan === 'annual' ? 'Annual membership' : 'Monthly membership';
  const statusPill = pastDue ? (
    <span style={{ ...pillNeutral, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>Payment issue</span>
  ) : m.cancelAtPeriodEnd ? (
    <span style={pillNeutral}>Canceling</span>
  ) : (
    <span style={pillGreen}>Active</span>
  );

  return (
    <div style={rowCard}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{planLabel}</span>
          {statusPill}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.55 }}>
          {pastDue
            ? 'Your last payment didn’t go through. Update your card to keep access.'
            : m.cancelAtPeriodEnd
              ? `Your membership ends on ${date}. Renew before then to keep your founding rate.`
              : date ? `Renews on ${date}.` : null}
        </div>
      </div>
      <div>
        <BillingButton endpoint="/api/billing-portal" style={pastDue ? btnPrimary : btnSecondary}>
          {pastDue ? 'Update payment method' : 'Manage subscription'}
        </BillingButton>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const { checkout, session_id } = await searchParams;
  const user = await currentUser();

  // Returning from Stripe Checkout: grant access now instead of waiting for the webhook.
  let justJoined = false;
  if (user && checkout === 'success' && session_id) {
    justJoined = await syncCheckoutSession(session_id, user.id);
  }

  const email = (user?.primaryEmailAddress ?? user?.emailAddresses[0])?.emailAddress;
  const [membership, deadlines] = await Promise.all([
    getMembership({ userId: user?.id, email }),
    fetchDeadlines(),
  ]);
  const firstName = user?.firstName || 'Member';

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-inter), Inter, sans-serif', color: C.body }}>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 40px', borderBottom: `1px solid ${C.hairline}`,
        background: '#ffffff', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Wordmark fontSize={17} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{firstName}</span>
          <UserButton />
        </div>
      </nav>

      {/* ── Main ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '44px 24px 80px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
            {justJoined ? `Welcome to Case Academy, ${firstName}` : `Welcome back, ${firstName}`}
          </h1>
        </div>

        {justJoined && (
          <div role="status" style={{
            background: '#DCFCE7', border: '1px solid #BBF7D0', color: '#166534', borderRadius: 8,
            padding: '12px 16px', fontSize: 14, marginBottom: 16,
          }}>
            You’re in. Your founding membership is active. Start with the Case Crash Course below.
          </div>
        )}

        {/* Membership */}
        <div style={{ marginBottom: 44 }}>
          <MembershipCard m={membership} />
        </div>

        {/* ── Tier 1: Upcoming deadlines ── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: C.ink, margin: 0 }}>
              Upcoming deadlines
            </h2>
          </div>

          <DeadlinesTable deadlines={deadlines} />
        </div>

        {/* ── Tier 2: Interview prep ── */}
        <div style={{ marginBottom: 52 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 24 }}>
            Interview prep
          </h2>

          {/* Case sub-row */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
              Case
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>

              <Link href="/case-course" style={{ textDecoration: 'none', flex: '1 1 200px' }}>
                <div style={{ ...cardBase, cursor: 'pointer' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                    Case Crash Course
                  </div>
                  <div style={{ fontSize: 13, color: C.body, lineHeight: 1.55, marginBottom: 14 }}>
                    The fundamentals, start here
                  </div>
                  <span style={pillGreen}>Available now</span>
                </div>
              </Link>

              <Link href="/library" style={{ textDecoration: 'none', flex: '1 1 200px' }}>
                <div style={{ ...cardBase, cursor: 'pointer' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                    Case Library
                  </div>
                  <div style={{ fontSize: 13, color: C.body, lineHeight: 1.55, marginBottom: 14 }}>
                    Practice cases, self-paced
                  </div>
                  <span style={pillBlue}>Growing weekly</span>
                </div>
              </Link>

              <a href="/resources/case-rubric.pdf" download style={{ textDecoration: 'none', flex: '1 1 200px' }}>
                <div style={{ ...cardBase, cursor: 'pointer' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                    Case Rubric
                  </div>
                  <div style={{ fontSize: 13, color: C.body, lineHeight: 1.55, marginBottom: 14 }}>
                    How interviewers score you
                  </div>
                  <span style={pillGreen}>Download PDF</span>
                </div>
              </a>

            </div>
          </div>

          {/* Behavioral sub-row */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
              Behavioral
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>

              <div style={{ ...cardBase, opacity: 0.7 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                  Fit &amp; Behavioral Guide
                </div>
                <div style={{ fontSize: 13, color: C.body, lineHeight: 1.55, marginBottom: 14 }}>
                  Story frameworks, common Qs
                </div>
                <span style={pillBlue}>Resources</span>
              </div>

              <div style={{ ...cardBase, opacity: 0.7 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                  Behavioral Walkthrough
                </div>
                <div style={{ fontSize: 13, color: C.body, lineHeight: 1.55, marginBottom: 14 }}>
                  Answering fit questions well
                </div>
                <span style={pillNeutral}>Coming soon</span>
              </div>

              {/* spacer so the two behavioral cards don't stretch to fill the full three-column width */}
              <div style={{ flex: '1 1 200px', visibility: 'hidden' }} aria-hidden="true" />

            </div>
          </div>
        </div>

        {/* ── Tier 3: Application prep ── */}
        <div style={{ marginBottom: 52 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 20 }}>
            Application prep
          </h2>

          {/* TODO: add files to /public/resources/resume-template.docx and /public/resources/cover-letter-template.docx */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            <a
              href="/resources/resume-template.docx"
              download
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: '#ffffff', border: `1px solid ${C.hairline}`,
                borderRadius: 8,
              }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>Resume Template</span>
                  <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>Editable .docx</span>
                </div>
                <span style={{ fontSize: 16, color: C.ink }}>↓</span>
              </div>
            </a>

            <a
              href="/resources/cover-letter-template.docx"
              download
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: '#ffffff', border: `1px solid ${C.hairline}`,
                borderRadius: 8,
              }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>Cover Letter Template</span>
                  <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>Editable .docx</span>
                </div>
                <span style={{ fontSize: 16, color: C.ink }}>↓</span>
              </div>
            </a>

          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: `1px solid ${C.hairline}`, paddingTop: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          fontSize: 12, color: C.muted,
        }}>
          <span>© 2026 Case Academy · Built by Perry Kramer</span>
          <span style={{ color: C.hairlineStrong }}>·</span>
          <a
            href="https://join.slack.com/t/case-academy-group/shared_invite/zt-3rdo65h1w-Y7ehVZCRws8NHu7Mw29~ZQ"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.muted, textDecoration: 'none' }}
          >
            Slack community
          </a>
        </div>

      </div>
    </div>
  );
}

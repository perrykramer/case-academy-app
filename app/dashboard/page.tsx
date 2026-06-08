import type { CSSProperties } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Wordmark } from '@/components/Wordmark';
import { C } from '@/lib/tokens';
import { DeadlinesTable } from '@/components/DeadlinesTable';

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

export default async function DashboardPage() {
  const [user, deadlines] = await Promise.all([currentUser(), fetchDeadlines()]);
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
        <div style={{ marginBottom: 44 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
            Welcome back, {firstName}
          </h1>
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

              <div style={{ ...cardBase, opacity: 0.7 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                  Video Walkthroughs
                </div>
                <div style={{ fontSize: 13, color: C.body, lineHeight: 1.55, marginBottom: 14 }}>
                  Full cases, end to end
                </div>
                <span style={pillNeutral}>Coming soon</span>
              </div>

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

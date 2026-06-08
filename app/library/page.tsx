import Link from 'next/link';
import { getAllCases } from '@/lib/cases';
import { C } from '@/lib/tokens';

export const metadata = {
  title: 'Case Library | Case Academy',
  description: 'Practice consulting case interviews with structured, curated cases from top sources.',
};

export default function LibraryPage() {
  const cases = getAllCases();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas }}>

      {/* ── Header with grid ── */}
      <div style={{
        backgroundImage:
          'linear-gradient(to right, rgba(27,61,143,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,61,143,0.06) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        padding: '40px 20px 48px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/dashboard" style={{ color: C.muted, fontSize: '14px', textDecoration: 'none' }}>
            ← Back to dashboard
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            color: C.ink,
            marginTop: '12px',
            marginBottom: '8px',
          }}>
            Case Library
          </h1>
          <p style={{ color: C.body, fontSize: '16px' }}>
            Practice consulting case interviews with structured, curated cases. Each case includes a
            prompt, framework guide, exhibits, math walkthrough, and recommendation.
          </p>
        </div>
      </div>

      {/* ── Cases grid ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px 60px' }}>
        {cases.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: `1px solid ${C.hairline}`,
            borderRadius: '12px',
            padding: '32px',
            color: C.muted,
            textAlign: 'center',
            fontSize: '14px',
          }}>
            No cases available yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {cases.map((c) => (
              <Link
                key={c.case_id}
                href={`/library/${c.case_id}`}
                style={{ textDecoration: 'none', flex: '1 1 260px', minWidth: 0 }}
              >
                <div style={{
                  background: '#ffffff',
                  border: `1px solid ${C.hairline}`,
                  borderRadius: '12px',
                  padding: '20px 22px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>

                  {/* Badge */}
                  <div>
                    {c.free_preview ? (
                      <span style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 20,
                        background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0',
                      }}>
                        Free Preview
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(27,61,143,0.07)', color: C.ink, border: `1px solid ${C.hairline}`,
                      }}>
                        Members
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div style={{ fontSize: '15px', fontWeight: 600, color: C.ink }}>
                    {c.title}
                  </div>

                  {/* Type · Industry */}
                  <div style={{ fontSize: '13px', color: C.body }}>
                    {c.case_type} · {c.industry}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '2px 8px',
                      borderRadius: 12, background: 'rgba(27,61,143,0.07)', color: C.muted,
                    }}>
                      {c.case_type}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '2px 8px',
                      borderRadius: 12, background: 'rgba(27,61,143,0.07)', color: C.muted,
                    }}>
                      Difficulty {c.difficulty}/5
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '2px 8px',
                      borderRadius: 12, background: 'rgba(27,61,143,0.07)', color: C.muted,
                    }}>
                      {c.estimated_time}
                    </span>
                  </div>

                  {/* Source */}
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: 'auto', paddingTop: '8px' }}>
                    {c.source}
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

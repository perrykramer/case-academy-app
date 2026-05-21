import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { lessons } from '@/data/lessons';
import { supabaseAdmin } from '@/lib/supabase';
import { C } from '@/lib/tokens';

export default async function CaseCoursePage() {
  const { userId } = await auth();

  // Fetch this user's completed lessons from Supabase
  const { data: completedRows } = await supabaseAdmin
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('clerk_user_id', userId!);

  const completedSlugs = new Set(
    (completedRows ?? []).map((r) => r.lesson_slug)
  );

  const completedCount = completedSlugs.size;
  const totalCount = lessons.length;
  const percentComplete = Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas }}>

      {/* ── Header block with grid ── */}
      <div style={{
        backgroundImage:
          'linear-gradient(to right, rgba(27,61,143,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,61,143,0.06) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        padding: '40px 20px 48px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link
            href="/dashboard"
            style={{ color: C.muted, fontSize: '14px', textDecoration: 'none' }}
          >
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
            The{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              Case Course
              <svg
                style={{ position: 'absolute', left: 0, bottom: -3, width: '100%', height: 8 }}
                viewBox="0 0 160 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M 2 5 Q 40 2, 80 5 T 158 4"
                  stroke={C.red}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p style={{ color: C.body, fontSize: '16px', marginBottom: '20px' }}>
            Master the case interview from first principles. Watch each lesson in order.
          </p>

          {/* Progress bar */}
          <div style={{
            backgroundColor: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            border: `1px solid ${C.hairline}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: C.ink }}>
                Your progress
              </span>
              <span style={{ fontSize: '14px', color: C.body }}>
                {completedCount} of {totalCount} lessons complete
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'rgba(27,61,143,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentComplete}%`,
                  backgroundColor: C.ink,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Lessons list ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lessons.map((lesson) => {
            const isComplete = completedSlugs.has(lesson.slug);
            return (
              <Link
                key={lesson.slug}
                href={`/case-course/${lesson.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: `1px solid ${C.hairline}`,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Lesson number / checkmark */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isComplete ? C.ink : 'rgba(27,61,143,0.08)',
                    color: isComplete ? '#ffffff' : C.muted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginRight: '16px',
                    flexShrink: 0,
                  }}
                >
                  {isComplete ? '✓' : lesson.order}
                </div>

                {/* Lesson title */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: C.ink }}>
                    {lesson.title}
                  </div>
                  {lesson.description && (
                    <div style={{ fontSize: '13px', color: C.muted, marginTop: '2px' }}>
                      {lesson.description}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div style={{ color: C.muted, fontSize: '18px', marginLeft: '12px' }}>
                  →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: C.muted, fontSize: '13px' }}>
          Case Academy · Pilot Program
        </div>
      </div>

    </div>
  );
}

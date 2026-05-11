import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { lessons } from '@/data/lessons';
import { supabaseAdmin } from '@/lib/supabase';

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Link
            href="/dashboard"
            style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none' }}
          >
            ← Back to dashboard
          </Link>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', marginTop: '12px', marginBottom: '8px' }}>
            The Case Course
          </h1>
          <p style={{ color: '#475569', fontSize: '16px', marginBottom: '20px' }}>
            Master the case interview from first principles. Watch each lesson in order.
          </p>

          {/* Progress bar */}
          <div style={{ backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                Your progress
              </span>
              <span style={{ fontSize: '14px', color: '#475569' }}>
                {completedCount} of {totalCount} lessons complete
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentComplete}%`,
                  backgroundColor: '#f59e0b',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Lessons list */}
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
                  border: '1px solid #e2e8f0',
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
                    backgroundColor: isComplete ? '#f59e0b' : '#e2e8f0',
                    color: isComplete ? 'white' : '#64748b',
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
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a' }}>
                    {lesson.title}
                  </div>
                  {lesson.description && (
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      {lesson.description}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div style={{ color: '#94a3b8', fontSize: '18px', marginLeft: '12px' }}>
                  →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8', fontSize: '13px' }}>
          Case Academy · Pilot Program
        </div>
      </div>
    </div>
  );
}
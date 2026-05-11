import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLessonBySlug, getNextLesson, getPreviousLesson } from '@/data/lessons';
import { supabaseAdmin } from '@/lib/supabase';
import LessonPlayer from '@/components/LessonPlayer';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const { userId } = await auth();

  // Check if already completed
  const { data: existing } = await supabaseAdmin
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('clerk_user_id', userId!)
    .eq('lesson_slug', slug)
    .maybeSingle();

  const alreadyCompleted = !!existing;

  const prevLesson = getPreviousLesson(slug);
  const nextLesson = getNextLesson(slug);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/case-course"
            style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none' }}
          >
            ← Back to course
          </Link>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, marginBottom: '6px' }}>
            LESSON {lesson.order} OF 13
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {lesson.title}
          </h1>
        </div>

        {/* Video player + Mark Complete */}
        <LessonPlayer
          lessonSlug={lesson.slug}
          youtubeId={lesson.youtubeId}
          alreadyCompleted={alreadyCompleted}
        />

        {/* Prev / Next navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {prevLesson ? (
            <Link
              href={`/case-course/${prevLesson.slug}`}
              style={{
                color: '#0f172a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              ← {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/case-course/${nextLesson.slug}`}
              style={{
                color: '#0f172a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {nextLesson.title} →
            </Link>
          ) : (
            <Link
              href="/case-course"
              style={{
                color: '#0f172a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Back to course →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
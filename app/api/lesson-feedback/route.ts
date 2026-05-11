import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET — fetch existing feedback for a given lesson
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonSlug = searchParams.get('lessonSlug');

  if (!lessonSlug) {
    return NextResponse.json({ error: 'Missing lessonSlug' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('lesson_feedback')
    .select('feedback_text, updated_at')
    .eq('clerk_user_id', userId)
    .eq('lesson_slug', lessonSlug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }

  return NextResponse.json({ feedback: data });
}

// POST — save/update feedback (upsert)
export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  const email = sessionClaims?.email as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { lessonSlug, feedbackText } = body;

  if (!lessonSlug || typeof lessonSlug !== 'string') {
    return NextResponse.json({ error: 'Missing lessonSlug' }, { status: 400 });
  }

  if (typeof feedbackText !== 'string') {
    return NextResponse.json({ error: 'Invalid feedbackText' }, { status: 400 });
  }

  // If text is empty after trimming, delete the row instead of saving empty
  const trimmed = feedbackText.trim();

  if (trimmed === '') {
    await supabaseAdmin
      .from('lesson_feedback')
      .delete()
      .eq('clerk_user_id', userId)
      .eq('lesson_slug', lessonSlug);
    return NextResponse.json({ success: true, cleared: true });
  }

  const { error } = await supabaseAdmin
    .from('lesson_feedback')
    .upsert(
      {
        clerk_user_id: userId,
        clerk_email: email,
        lesson_slug: lessonSlug,
        feedback_text: trimmed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id,lesson_slug' }
    );

  if (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  const email = sessionClaims?.email as string | undefined;    
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { lessonSlug } = body;

  if (!lessonSlug || typeof lessonSlug !== 'string') {
    return NextResponse.json({ error: 'Missing lessonSlug' }, { status: 400 });
  }

  // Upsert — if user already has this lesson marked complete, this is a no-op
  const { error } = await supabaseAdmin
    .from('lesson_progress')
    .upsert(
      {
        clerk_user_id: userId,
        clerk_email: email,
        lesson_slug: lessonSlug,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id,lesson_slug' }
    );

  if (error) {
    console.error('Error marking lesson complete:', error);
    return NextResponse.json({ error: 'Failed to mark complete' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
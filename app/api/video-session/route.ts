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
  const { lessonSlug, watchSeconds, maxPositionSeconds } = body;

  if (!lessonSlug || typeof lessonSlug !== 'string') {
    return NextResponse.json({ error: 'Missing lessonSlug' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('video_sessions').insert({
    clerk_user_id: userId,
    clerk_email: email,
    lesson_slug: lessonSlug,
    watch_seconds: Math.round(watchSeconds || 0),
    max_position_seconds: Math.round(maxPositionSeconds || 0),
    ended_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error logging video session:', error);
    return NextResponse.json({ error: 'Failed to log session' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
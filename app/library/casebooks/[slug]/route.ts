import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { CASEBOOK_BUCKET, getCasebook } from '@/lib/casebooks';
import { supabaseAdmin } from '@/lib/supabase';

// Signed URLs are short-lived: long enough for the browser to follow the
// redirect and load the PDF, short enough that a copied link soon stops working.
const SIGNED_URL_TTL_SECONDS = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const { slug } = await params;
  const casebook = getCasebook(slug);
  if (!casebook) return new NextResponse('Not found', { status: 404 });

  const { data, error } = await supabaseAdmin.storage
    .from(CASEBOOK_BUCKET)
    .createSignedUrl(`${casebook.slug}.pdf`, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error('Error signing casebook URL:', slug, error);
    return new NextResponse('Casebook unavailable', { status: 502 });
  }

  // Supabase serves the object as application/pdf without an attachment
  // disposition, so the browser opens it inline.
  const res = NextResponse.redirect(data.signedUrl, 302);
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

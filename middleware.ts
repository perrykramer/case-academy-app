import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { hasAccess } from './lib/access';

// Routes requiring sign-in
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/case-course(.*)',
]);

// Routes ALSO requiring premium access (not just any signed-in user)
const isPremiumRoute = createRouteMatcher(['/case-course(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth();

    // Not signed in → bounce to Clerk sign-in
    if (!userId) {
      await auth.protect();
      return;
    }

    // For premium routes, also check subscription status (by Clerk user ID;
    // the email claim is only a fallback if the session token includes it)
    if (isPremiumRoute(req)) {
      const email = sessionClaims?.email as string | undefined;
      const hasPremiumAccess = await hasAccess({ userId, email });

      if (!hasPremiumAccess) {
        const subscribeUrl = new URL('/subscribe', req.url);
        return NextResponse.redirect(subscribeUrl);
      }
    }
  }
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/case-course/:path*',
    '/api/:path*',
    '/library/:path*',
    '/subscribe',
  ],
};
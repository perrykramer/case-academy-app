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
  console.log(`[middleware] Path: ${req.nextUrl.pathname}, isProtected: ${isProtectedRoute(req)}, isPremium: ${isPremiumRoute(req)}`);

  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth();

    console.log(`[middleware] userId: ${userId}, email claim: ${sessionClaims?.email}`);

    // Not signed in → bounce to Clerk sign-in
    if (!userId) {
      await auth.protect();
      return;
    }

    // For premium routes, also check subscription status
    if (isPremiumRoute(req)) {
      const email = sessionClaims?.email as string | undefined;
      const hasPremiumAccess = await hasAccess(email);

      console.log(`[middleware] email: ${email}, hasPremiumAccess: ${hasPremiumAccess}`);

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
  ],
};
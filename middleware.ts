import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { hasAccess } from './lib/access';

// Routes requiring sign-in
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/case-course(.*)',
]);

// Routes ALSO requiring pilot allowlist (not just any signed-in user)
const isPilotOnlyRoute = createRouteMatcher(['/case-course(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth();

    // Not signed in → bounce to Clerk sign-in
    if (!userId) {
      await auth.protect();
      return;
    }

    // For pilot-only routes, also check allowlist
    if (isPilotOnlyRoute(req)) {
      const email = sessionClaims?.email as string | undefined;
      const hasPilotAccess = await hasAccess(email);

      if (!hasPilotAccess) {
        const pilotPendingUrl = new URL('/pilot-pending', req.url);
        return NextResponse.redirect(pilotPendingUrl);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
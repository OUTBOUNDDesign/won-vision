import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Gate everything under /admin EXCEPT the sign-in/sign-up routes themselves —
// otherwise auth.protect() redirects to /admin/sign-in which is also protected,
// creating an infinite redirect loop.
const isPublicAuthRoute = createRouteMatcher([
  '/admin/sign-in(.*)',
  '/admin/sign-up(.*)',
]);
const isProtectedAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedAdminRoute(req) && !isPublicAuthRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

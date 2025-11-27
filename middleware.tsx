import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Next.js 14 middleware runs in edge runtime by default
export const runtime = 'nodejs'; // This ensures access to process.env

// Protect /profile routes
const isProtectedRoute = createRouteMatcher(['/profile(.*)']);

export default clerkMiddleware({
  apiKey: process.env.CLERK_API_KEY, // <-- explicitly provide the server key
  secretKey: process.env.CLERK_API_KEY, // required by latest Clerk versions
  async afterAuth(auth, req) {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/profile(.*)'])

export default clerkMiddleware((auth, req) => {
  // Only protect routes that need authentication
  if (isProtectedRoute(req)) {
    auth.protect()
  }
})

export const config = {
  // Optimize matcher to exclude static files and only match necessary routes
  matcher: [
    '/api/pets(.*)',
    '/api/custom-meals(.*)',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (files in public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
}

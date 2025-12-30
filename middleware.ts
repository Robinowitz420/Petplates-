import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/profile(.*)'])

export default clerkMiddleware((auth, req) => {
  // Only protect routes that need authentication
  if (isProtectedRoute(req)) {
    auth.protect()
  }
})

export const config = {
  matcher: ['/profile(.*)', '/api/pets(.*)', '/api/custom-meals(.*)'],
}

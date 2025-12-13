// lib/utils/auth.ts
// Centralized authentication utilities

import { useAuth, useUser } from '@clerk/nextjs';

/**
 * Get the current user ID from Clerk
 * Falls back to simulated ID for development
 */
export function useCurrentUserId(): string | null {
  const { userId } = useAuth();
  
  // Use Clerk user ID if available
  if (userId) return userId;
  
  // Fallback for development (when not authenticated)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('last_user_id');
    if (stored) return stored;
  }
  
  return null;
}

/**
 * Server-side: Get user ID from localStorage fallback
 * This is a temporary bridge during migration
 */
export function getStoredUserId(): string {
  if (typeof window === 'undefined') return 'server-fallback-id';
  
  const stored = localStorage.getItem('last_user_id');
  return stored || 'clerk_simulated_user_id_123';
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isSignedIn, isLoaded } = useAuth();
  return isLoaded && (isSignedIn ?? false);
}


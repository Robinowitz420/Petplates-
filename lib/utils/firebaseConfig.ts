// lib/utils/firebaseConfig.ts
// Firebase configuration and initialization with proper error handling

export function initializeFirebase(): null {
  return null;
}

export function getFirebaseServices(): null {
  return null;
}

/**
 * Get app ID from environment
 */
export function getAppId(): string {
  if (typeof window !== 'undefined') {
    const injected = (globalThis as any).__app_id;
    if (typeof injected === 'string' && injected.trim()) return injected.trim();
  }
  return (
    process.env.NEXT_PUBLIC_APP_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'pet-plates-app'
  );
}

/**
 * Check if Firebase is available
 */
export function isFirebaseAvailable(): boolean {
  return false;
}

/**
 * Get initialization error if any
 */
export function getInitializationError(): Error | null {
  return null;
}

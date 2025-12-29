// lib/utils/firebaseConfig.ts
// Firebase configuration and initialization with proper error handling

import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import {
  getAuth,
  type Auth,
  connectAuthEmulator,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';

const getInjectedFirebaseConfig = (): any | null => {
  if (typeof window === 'undefined') return null;
  const raw = (globalThis as any).__firebase_config;
  if (!raw) return null;
  try {
    if (typeof raw === 'string') return JSON.parse(raw);
    if (typeof raw === 'object') return raw;
  } catch {
    return null;
  }
  return null;
};

// Firebase configuration from environment variables (or injected globals)
const firebaseConfig = (() => {
  const injected = getInjectedFirebaseConfig();
  if (injected) return injected;
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
})();

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let initializationError: Error | null = null;

/**
 * Check if Firebase is properly configured
 */
function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

const getInjectedInitialAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const raw = (globalThis as any).__initial_auth_token;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
};

/**
 * Initialize Firebase services
 * Returns null if Firebase is not configured
 */
export function initializeFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } | null {
  // Server-side check
  if (typeof window === 'undefined') return null;
  
  // Return existing instance
  if (app && db && auth) {
    return { app, db, auth };
  }
  
  try {
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured - using localStorage fallback');
      return null;
    }
    
    // Use existing app or initialize new one
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Initialize Firestore
    db = getFirestore(app);
    
    // Initialize Auth
    auth = getAuth(app);
    
    // Connect to emulators in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('Connected to Firebase emulators');
      } catch (e) {
        // Emulators already connected or not available
      }
    }
    
    return { app, db, auth };
  } catch (error) {
    initializationError = error as Error;
    console.error('Firebase initialization failed:', error);
    return null;
  }
}

/**
 * Get Firebase services (initializes if needed)
 */
export function getFirebaseServices(): { app: FirebaseApp; db: Firestore; auth: Auth } | null {
  if (app && db && auth) {
    return { app, db, auth };
  }
  return initializeFirebase();
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

let authReadyPromise: Promise<string> | null = null;

async function waitForInitialAuthState(auth: Auth): Promise<string | null> {
  if (auth.currentUser?.uid) return auth.currentUser.uid;

  return await new Promise<string | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u?.uid ?? null);
    });
  });
}

export async function ensureFirebaseAuth(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available client-side');
  }

  const services = getFirebaseServices();
  if (!services?.auth) {
    throw new Error('Firebase not initialized');
  }

  const { auth } = services;

  // Fast path
  if (auth.currentUser?.uid) return auth.currentUser.uid;

  // De-dupe concurrent callers
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = (async () => {
    const existingUid = await waitForInitialAuthState(auth);
    if (existingUid) return existingUid;

    const token = getInjectedInitialAuthToken();
    if (token) {
      try {
        const cred = await signInWithCustomToken(auth, token);
        return cred.user.uid;
      } catch (err) {
        const code = (err as any)?.code;
        if (code === 'auth/configuration-not-found') {
          const projectId = (firebaseConfig as any)?.projectId;
          const authDomain = (firebaseConfig as any)?.authDomain;
          throw new Error(
            `Firebase Auth is not configured for this Firebase project (auth/configuration-not-found). ` +
              `Check that Authentication is enabled in Firebase Console for projectId="${projectId}" and that your web config is correct (authDomain="${authDomain}").`
          );
        }
        throw err;
      }
    }

    try {
      const cred = await signInAnonymously(auth);
      return cred.user.uid;
    } catch (err) {
      const code = (err as any)?.code;
      if (code === 'auth/configuration-not-found') {
        const projectId = (firebaseConfig as any)?.projectId;
        const authDomain = (firebaseConfig as any)?.authDomain;
        throw new Error(
          `Firebase Auth is not configured for this Firebase project (auth/configuration-not-found). ` +
            `In Firebase Console, enable Authentication (and Anonymous provider if you rely on anonymous sign-in). ` +
            `Also confirm your web config matches the same projectId="${projectId}" (authDomain="${authDomain}").`
        );
      }
      throw err;
    }
  })();

  try {
    return await authReadyPromise;
  } catch (err) {
    authReadyPromise = null;
    throw err;
  }
}

/**
 * Check if Firebase is available
 */
export function isFirebaseAvailable(): boolean {
  return getFirebaseServices() !== null;
}

/**
 * Get initialization error if any
 */
export function getInitializationError(): Error | null {
  return initializationError;
}

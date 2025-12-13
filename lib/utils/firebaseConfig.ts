// lib/utils/firebaseConfig.ts
// Firebase configuration and initialization with proper error handling

import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'pet-plates-app';
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

// lib/utils/firebaseConfig.ts
// Firebase configuration and initialization
// Uses global variables injected at runtime (for security)

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Global variables (injected via script tags or environment)
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

/**
 * Initialize Firebase services
 * Returns null if Firebase is not configured
 */
export function initializeFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } | null {
  if (typeof window === 'undefined') return null; // Server-side
  
  try {
    // Check if Firebase config is available
    const firebaseConfig = typeof __firebase_config !== 'undefined' 
      ? JSON.parse(__firebase_config) 
      : null;
    
    if (!firebaseConfig) {
      // Firebase config not available - using localStorage fallback
      return null;
    }
    
    // Initialize if not already initialized
    if (!app) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    }
    
    // TypeScript guard: ensure all services are initialized
    if (!app || !db || !auth) {
      return null;
    }
    
    return { app, db, auth };
  } catch (error) {
    // Firebase initialization failed - using localStorage fallback
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
 * Get app ID from global variable
 */
export function getAppId(): string {
  return typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
}


import { cert, getApps, initializeApp, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

function normalizePrivateKey(value: string): string {
  return value
    .replace(/\\n/g, '\n')   // turns "\n" into real newlines
    .replace(/\\r/g, '')     // strips any "\r"
    .replace(/\r\n/g, '\n')  // normalizes Windows newlines
    .trim();
}

export function getFirebaseAdminApp(): App {
  if (cachedApp) return cachedApp;

  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0];
    return cachedApp;
  }

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID;

  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson);
    cachedApp = initializeApp({
      credential: cert({
        projectId: parsed.project_id || parsed.projectId,
        clientEmail: parsed.client_email || parsed.clientEmail,
        privateKey: normalizePrivateKey(parsed.private_key || parsed.privateKey || ''),
      }),
    });
    return cachedApp;
  }

  if (clientEmail && privateKey && projectId) {
    cachedApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: normalizePrivateKey(privateKey),
      }),
    });
    return cachedApp;
  }

  cachedApp = initializeApp({
    credential: applicationDefault(),
  });
  return cachedApp;
}

export function getFirebaseAdminDb(): Firestore {
  if (cachedDb) return cachedDb;
  const app = getFirebaseAdminApp();
  cachedDb = getFirestore(app);
  cachedDb.settings({ ignoreUndefinedProperties: true });
  return cachedDb;
}

export function getFirebaseAdminAppId(): string {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    'pet-plates-app'
  );
}

export function getGeneratedRecipesCollectionPath(): string {
  const appId = getFirebaseAdminAppId();
  return `artifacts/${appId}/generated_recipes`;
}

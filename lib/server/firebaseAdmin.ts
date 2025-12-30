// lib/server/firebaseAdmin.ts
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
}

function getOptionalEnv(name: string): string | null {
  const v = process.env[name];
  return v ? String(v) : null;
}

type ServiceAccountLike = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function tryLoadServiceAccountFromEnvOrFile(): ServiceAccountLike | null {
  const rawJson = getOptionalEnv('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON');
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as any;
      return {
        projectId: parsed?.project_id || parsed?.projectId,
        clientEmail: parsed?.client_email || parsed?.clientEmail,
        privateKey: parsed?.private_key || parsed?.privateKey,
      };
    } catch {
      // ignore invalid JSON
    }
  }

  const credPath = getOptionalEnv('GOOGLE_APPLICATION_CREDENTIALS');
  if (credPath) {
    try {
      const parsed = JSON.parse(readFileSync(credPath, 'utf8')) as any;
      return {
        projectId: parsed?.project_id || parsed?.projectId,
        clientEmail: parsed?.client_email || parsed?.clientEmail,
        privateKey: parsed?.private_key || parsed?.privateKey,
      };
    } catch {
      // ignore file read/parse errors
    }
  }

  return null;
}

function resolveFirebaseAdminCredentials(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  // Standalone env vars
  const standaloneProjectId =
    getOptionalEnv('FIREBASE_PROJECT_ID') || getOptionalEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  const standaloneClientEmail = getOptionalEnv('FIREBASE_CLIENT_EMAIL');
  const standalonePrivateKey = getOptionalEnv('FIREBASE_PRIVATE_KEY');

  const hasAnyStandalone = !!standaloneProjectId || !!standaloneClientEmail || !!standalonePrivateKey;
  const hasAllStandalone = !!standaloneProjectId && !!standaloneClientEmail && !!standalonePrivateKey;

  // Service account JSON/file
  const sa = tryLoadServiceAccountFromEnvOrFile();
  const hasServiceAccount = !!sa?.projectId && !!sa?.clientEmail && !!sa?.privateKey;

  // Prevent dangerous hybrid mixing:
  // If you set some standalone vars and also provide service account JSON/file,
  // your old code could combine credentials across two different service accounts.
  if (hasAnyStandalone && hasServiceAccount && !hasAllStandalone) {
    throw new Error(
      'Firebase Admin credentials are partially set via FIREBASE_* env vars while also providing a service account (FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON / GOOGLE_APPLICATION_CREDENTIALS). ' +
        'Use ONE method only: either set ALL of FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID), FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY; ' +
        'OR set none and provide FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON / GOOGLE_APPLICATION_CREDENTIALS.'
    );
  }

  // Choose credential mode (atomic)
  if (hasAllStandalone) {
    return {
      projectId: standaloneProjectId!,
      clientEmail: standaloneClientEmail!,
      privateKey: normalizePrivateKey(standalonePrivateKey!),
    };
  }

  if (hasServiceAccount) {
    return {
      projectId: String(sa!.projectId),
      clientEmail: String(sa!.clientEmail),
      privateKey: normalizePrivateKey(String(sa!.privateKey)),
    };
  }

  throw new Error(
    'Missing Firebase Admin credentials. Provide either FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON / GOOGLE_APPLICATION_CREDENTIALS, ' +
      'or set ALL of FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID), FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
  );
}

export function getFirebaseAdminApp(): App {
  if (cachedApp) return cachedApp;

  if (getApps().length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }

  const { projectId, clientEmail, privateKey } = resolveFirebaseAdminCredentials();

  cachedApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return cachedApp;
}

export function getAdminDb(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(getFirebaseAdminApp());
  // Safe for Firestore writes with optional fields
  cachedDb.settings({ ignoreUndefinedProperties: true });
  return cachedDb;
}

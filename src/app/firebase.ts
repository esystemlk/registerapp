import { initializeApp, getApps } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasConfig = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

export const FIREBASE_ENABLED = hasConfig;

let app: ReturnType<typeof initializeApp> | undefined = undefined;
if (hasConfig) {
  app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
}

export const auth = app ? getAuth(app) : undefined as any;
export const db = app ? getFirestore(app) : undefined as any;
export const googleProvider = app ? new GoogleAuthProvider() : undefined as any;
export let analytics: any = undefined;
export const storage = app ? getStorage(app) : undefined as any;
export const functions = app ? getFunctions(app as any) : undefined as any;

if (app) {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // ignore persistence errors; fallback to default
  });
  try {
    if (typeof window !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID) {
      analytics = getAnalytics(app);
    }
  } catch {
    // analytics optional
  }
  try {
    enableIndexedDbPersistence(db).catch(() => {});
  } catch {}
}

export default app;

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth as _getAuth, type Auth } from "firebase/auth";
import { getFirestore as _getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

// Web app Firebase configuration (public; safe to expose in client)
const firebaseConfig = {
  apiKey: "AIzaSyBvdU1Uyp0cO2ttZOxJ9WPXvxCA228AR8c",
  authDomain: "edtech-e6c1e.firebaseapp.com",
  projectId: "edtech-e6c1e",
  storageBucket: "edtech-e6c1e.firebasestorage.app",
  messagingSenderId: "586441733494",
  appId: "1:586441733494:web:0843d8dee5be3de9807657",
  measurementId: "G-FZKKZXLC8R",
} as const;

let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAnalytics(): Analytics | undefined {
  // Analytics is browser-only; guard for SSR or server contexts
  if (typeof window === "undefined") return undefined;
  if (!analytics) {
    try {
      analytics = getAnalytics(getFirebaseApp());
    } catch (_err) {
      // Analytics may fail in unsupported environments (e.g., localhost without HTTPS)
      analytics = undefined;
    }
  }
  return analytics;
}

export function getAuth(): Auth {
  if (!auth) auth = _getAuth(getFirebaseApp());
  return auth;
}

export function getFirestore(): Firestore {
  if (!firestore) {
    const app = getFirebaseApp();
    try {
      firestore = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        useFetchStreams: false,
      });
    } catch (_e) {
      // Fallback to default if initializeFirestore already called elsewhere
      firestore = _getFirestore(app);
    }
  }
  return firestore;
}

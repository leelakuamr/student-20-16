import admin from "firebase-admin";

let initialized = false;

export function initFirebase() {
  if (initialized) return;

  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const base64Env = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  let raw: string | undefined = undefined;
  if (jsonEnv) raw = jsonEnv;
  else if (base64Env) raw = Buffer.from(base64Env, "base64").toString("utf8");

  if (!raw) {
    console.log("No Firebase service account provided in env; skipping Firebase Admin initialization.");
    return;
  }

  try {
    const svc = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(svc as any),
      projectId: svc.project_id,
    });
    initialized = true;
    console.log("Firebase Admin initialized");
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err);
  }
}

function ensureInitialized() {
  if (!initialized) {
    throw new Error("Firebase Admin not initialized. Call initFirebase() and ensure service account provided.");
  }
}

export function getAuth() {
  ensureInitialized();
  return admin.auth();
}

export async function verifyIdToken(idToken: string) {
  ensureInitialized();
  return admin.auth().verifyIdToken(idToken);
}

export async function createUser(options: { email: string; password?: string; displayName?: string; uid?: string; disabled?: boolean; }) {
  ensureInitialized();
  const userRecord = await admin.auth().createUser(options as any);
  return userRecord;
}

export async function getUserByEmail(email: string) {
  ensureInitialized();
  return admin.auth().getUserByEmail(email);
}

export async function listUsers(maxResults = 1000) {
  ensureInitialized();
  const list = await admin.auth().listUsers(maxResults);
  return list;
}

export async function setCustomClaims(uid: string, claims: Record<string, any>) {
  ensureInitialized();
  await admin.auth().setCustomUserClaims(uid, claims);
}

export async function createCustomToken(uid: string, claims?: Record<string, any>) {
  ensureInitialized();
  return admin.auth().createCustomToken(uid, claims);
}

export function getFirestore() {
  ensureInitialized();
  return admin.firestore();
}

export function getStorage() {
  ensureInitialized();
  return admin.storage();
}

export { admin };

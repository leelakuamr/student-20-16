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

export { admin };

import { RequestHandler } from "express";
import { initFirebase, isFirebaseAdminReady, verifyIdToken, getFirestore, setCustomClaims } from "../firebase";

const validRoles = new Set(["admin", "instructor", "student", "parent"]);

export const setUserRole: RequestHandler = async (req, res) => {
  try {
    initFirebase();
    if (!isFirebaseAdminReady()) {
      return res
        .status(501)
        .json({ error: "Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_BASE64 env." });
    }

    const authHeader = (req.headers.authorization || "").replace("Bearer ", "");
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    let decoded;
    try {
      decoded = await verifyIdToken(authHeader);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    const db = getFirestore();
    const adminSnap = await db.doc(`users/${decoded.uid}`).get();
    const adminRole = (adminSnap.exists ? (adminSnap.data() as any).role : undefined) || (decoded as any).role;
    if (adminRole !== "admin") return res.status(403).json({ error: "Forbidden" });

    const { uid, role } = req.body as { uid?: string; role?: string };
    if (!uid || !role || !validRoles.has(role)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    await db.doc(`users/${uid}`).set(
      { role, updatedAt: new Date() },
      { merge: true },
    );

    await setCustomClaims(uid, { role });

    return res.json({ ok: true, uid, role });
  } catch (e) {
    console.error("setUserRole error", e);
    return res.status(500).json({ error: "Internal error" });
  }
};

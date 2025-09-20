import type { RequestHandler } from "express";
import { getFirestore, verifyIdToken, admin } from "../firebase";

async function getDecoded(req: any) {
  const authHeader = (req.headers.authorization || "").replace("Bearer ", "");
  if (!authHeader) return null;
  try {
    return (await verifyIdToken(authHeader)) as any;
  } catch {
    return null;
  }
}

export const startProctoring: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const { examId } = (req.body || {}) as { examId?: string };
  const db = getFirestore();
  const sessionRef = await db.collection("proctor_sessions").add({
    userId: decoded.uid,
    examId: examId || null,
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: "active",
    metrics: { suspicious: 0, heartbeats: 0 },
  });
  return res.json({ sessionId: sessionRef.id });
};

export const heartbeat: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const {
    sessionId,
    faces = 0,
    facePresent = false,
    tabHidden = false,
    multipleFaces = false,
    awaySeconds = 0,
  } = (req.body || {}) as {
    sessionId: string;
    faces?: number;
    facePresent?: boolean;
    tabHidden?: boolean;
    multipleFaces?: boolean;
    awaySeconds?: number;
  };
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  const db = getFirestore();
  const ref = db.doc(`proctor_sessions/${sessionId}`);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: "session not found" });
  if ((snap.data() as any).userId !== decoded.uid)
    return res.status(403).json({ error: "Forbidden" });

  let suspicious = 0;
  if (!facePresent) suspicious += 1;
  if (multipleFaces) suspicious += 2;
  if (tabHidden) suspicious += 1;
  if (awaySeconds > 5) suspicious += 1;

  await ref.set(
    {
      lastHeartbeatAt: admin.firestore.FieldValue.serverTimestamp(),
      metrics: admin.firestore.FieldValue.increment ? undefined : undefined,
    },
    { merge: true },
  );
  // keep metrics as separate doc for append-only events
  await db.collection(`proctor_sessions/${sessionId}/events`).add({
    faces,
    facePresent,
    multipleFaces,
    tabHidden,
    awaySeconds,
    suspicious,
    at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // update summary counters atomically
  await ref.update({
    "metrics.heartbeats": admin.firestore.FieldValue.increment(1),
    "metrics.suspicious": admin.firestore.FieldValue.increment(suspicious),
  });

  return res.json({ ok: true, suspicious });
};

export const endProctoring: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const { sessionId } = (req.body || {}) as { sessionId?: string };
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  const db = getFirestore();
  const ref = db.doc(`proctor_sessions/${sessionId}`);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: "session not found" });
  if ((snap.data() as any).userId !== decoded.uid)
    return res.status(403).json({ error: "Forbidden" });
  await ref.set(
    {
      status: "ended",
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return res.json({ ok: true });
};

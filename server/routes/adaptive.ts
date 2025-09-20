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

export const logEngagement: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const { eventType, course, topicId, moduleId, durationSec, score, difficulty } = req.body as {
    eventType: string;
    course?: string;
    topicId?: string;
    moduleId?: string;
    durationSec?: number;
    score?: number; // 0..1
    difficulty?: number; // 800..1400 (ELO-like)
  };
  if (!eventType) return res.status(400).json({ error: "eventType required" });
  const db = getFirestore();
  const doc = {
    userId: decoded.uid,
    eventType,
    course: course || null,
    topicId: topicId || null,
    moduleId: moduleId || null,
    durationSec: durationSec ?? null,
    score: score ?? null,
    difficulty: difficulty ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const ref = await db.collection("engagement").add(doc as any);
  res.status(201).json({ id: ref.id });
};

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

export const predictPerformance: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const db = getFirestore();
  const [progressSnap, engageSnap, subsSnap] = await Promise.all([
    db.collection("progress").where("userId", "==", decoded.uid).get(),
    db.collection("engagement").where("userId", "==", decoded.uid).orderBy("createdAt", "desc").limit(200).get(),
    db.collection("submissions").where("userId", "==", decoded.uid).orderBy("submittedAt", "desc").limit(50).get(),
  ]);

  const progress = progressSnap.docs.map((d) => d.data() as any);
  const submissions = subsSnap.docs.map((d) => d.data() as any);
  const engagement = engageSnap.docs.map((d) => d.data() as any);

  const completion = progress.length
    ? progress.reduce((s, p) => s + (Number(p.value) || 0), 0) / (progress.length * 100)
    : 0.5;

  const watchTime = engagement
    .filter((e) => e.eventType === "video_watch")
    .reduce((s, e) => s + (Number(e.durationSec) || 0), 0);
  const practiceCount = engagement.filter((e) => e.eventType === "practice").length;
  const engagementScore = Math.min(1, watchTime / 3600) * 0.6 + Math.min(1, practiceCount / 20) * 0.4; // 1h video + 20 practices => 1.0

  const recentGrades = submissions
    .map((s) => Number(s.grade))
    .filter((g) => !Number.isNaN(g));
  const grade = recentGrades.length
    ? recentGrades.slice(0, 5).reduce((a, b) => a + b, 0) / (recentGrades.slice(0, 5).length * 100)
    : 0.5;

  const z = -0.5 + 1.6 * completion + 0.9 * engagementScore + 0.7 * grade;
  const probability = Math.max(0, Math.min(1, sigmoid(z)));

  res.json({ probability, factors: { completion, engagement: engagementScore, grade } });
};

export const getNextDifficulty: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const { topicId } = req.body as { topicId?: string };
  if (!topicId) return res.status(400).json({ error: "topicId required" });

  const db = getFirestore();
  const snap = await db
    .collection("mastery")
    .where("userId", "==", decoded.uid)
    .where("topicId", "==", topicId)
    .limit(1)
    .get();
  const current = snap.empty ? { rating: 1000 } : (snap.docs[0].data() as any);

  let level: "easy" | "medium" | "hard" = "medium";
  if (current.rating >= 1150) level = "hard";
  else if (current.rating <= 950) level = "easy";

  res.json({ topicId, difficulty: level, rating: current.rating });
};

export const submitLearningStyle: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const { scores } = req.body as { scores: { V: number; A: number; R: number; K: number } };
  if (!scores) return res.status(400).json({ error: "scores required" });
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as "V" | "A" | "R" | "K";
  const labelMap: Record<string, string> = { V: "visual", A: "auditory", R: "read_write", K: "kinesthetic" };
  const db = getFirestore();
  await db.doc(`users/${decoded.uid}`).set({ learningStyle: { dominant: labelMap[best], scores } }, { merge: true });
  res.json({ ok: true, learningStyle: { dominant: labelMap[best], scores } });
};

export const getLearningStyle: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const db = getFirestore();
  const snap = await db.doc(`users/${decoded.uid}`).get();
  const data = (snap.exists ? (snap.data() as any).learningStyle : null) || null;
  res.json({ learningStyle: data });
};

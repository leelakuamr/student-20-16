import type { RequestHandler } from "express";
import { getFirestore, verifyIdToken, getStorage, admin } from "../firebase";

function genId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

async function getAuthedUser(req: any) {
  const authHeader = (req.headers.authorization || "").replace(
    "Bearer ",
    "",
  );
  if (!authHeader) return null;
  try {
    const decoded = await verifyIdToken(authHeader);
    return decoded as any;
  } catch {
    return null;
  }
}

export const handleGetUser: RequestHandler = async (req, res) => {
  const decoded = await getAuthedUser(req);
  const db = getFirestore();
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const ref = db.doc(`users/${decoded.uid}`);
  const snap = await ref.get();
  if (!snap.exists) return res.json({ id: decoded.uid, name: decoded.email });
  const data = snap.data() as any;
  return res.json({
    id: decoded.uid,
    name: data.name || decoded.email || "",
    email: data.email || decoded.email,
    role: data.role,
  });
};

export const handleGetProgress: RequestHandler = async (req, res) => {
  const decoded = await getAuthedUser(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const db = getFirestore();
  const q = await db
    .collection("progress")
    .where("userId", "==", decoded.uid)
    .get();
  const progress = q.docs.map((d) => ({
    course: (d.data() as any).course,
    value: (d.data() as any).value,
  }));
  if (progress.length === 0) {
    return res.json({
      progress: [
        { course: "Algebra I", value: 72 },
        { course: "Chemistry", value: 64 },
      ],
    });
  }
  return res.json({ progress });
};

export const handleGetRecommendations: RequestHandler = async (_req, res) => {
  const items = [
    {
      id: "r1",
      title: "Practice Linear Equations",
      reason: "Struggling with recent quiz",
    },
    {
      id: "r2",
      title: "Watch Atoms & Bonds",
      reason: "Low engagement in science module",
    },
  ];
  res.json({ items });
};

const sseClients: import("http").ServerResponse[] = [];
const courseSseClients = new Map<string, import("http").ServerResponse[]>();

export const handleDiscussions: RequestHandler = async (req, res) => {
  const db = getFirestore();
  if (req.method === "GET") {
    const snap = await db
      .collection("discussions")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    const posts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return res.json({ posts });
  }
  if (req.method === "POST") {
    const decoded = await getAuthedUser(req);
    if (!decoded) return res.status(401).json({ error: "Unauthorized" });
    const { content } = req.body as { content: string };
    const post = {
      author: decoded.name || decoded.email || "User",
      authorId: decoded.uid,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    } as any;
    const ref = await db.collection("discussions").add(post);
    const saved = { id: ref.id, ...post, createdAt: new Date().toISOString() };

    const payload = `data: ${JSON.stringify({ post: saved })}\n\n`;
    for (const client of sseClients.slice()) {
      try {
        client.write(payload);
      } catch (e) {
        try {
          client.end();
        } catch {}
      }
    }
    return res.status(201).json({ post: saved });
  }
  res.status(405).end();
};

export const handleDiscussionStream: RequestHandler = async (_req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  (res as any).flushHeaders?.();
  try {
    res.write(`retry: 5000\n`);
    res.write(`: connected\n\n`);
  } catch {}
  const ping = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch (e) {
      clearInterval(ping);
    }
  }, 30_000);
  sseClients.push(res as any);
  (res as any).on("close", () => {
    clearInterval(ping);
    const idx = sseClients.indexOf(res as any);
    if (idx >= 0) sseClients.splice(idx, 1);
  });
};

export const handleDeleteDiscussion: RequestHandler = async (req, res) => {
  const decoded = await getAuthedUser(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params as { id?: string };
  if (!id) return res.status(400).json({ error: "id is required" });
  const db = getFirestore();
  const docRef = db.collection("discussions").doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return res.status(404).json({ error: "Not found" });
  const data = snap.data() as any;
  const isOwner = data.authorId === decoded.uid;
  const isAdmin = (await db.doc(`users/${decoded.uid}`).get()).data()?.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });
  await docRef.delete();
  return res.json({ ok: true });
};

export const handleCourseDiscussions: RequestHandler = async (req, res) => {
  const { courseId } = req.params as { courseId?: string };
  if (!courseId) return res.status(400).json({ error: "courseId required" });
  const db = getFirestore();
  if (req.method === "GET") {
    const snap = await db
      .collection(`courses/${courseId}/discussions`)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    const posts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return res.json({ posts });
  }
  if (req.method === "POST") {
    const decoded = await getAuthedUser(req);
    if (!decoded) return res.status(401).json({ error: "Unauthorized" });
    const { content } = req.body as { content?: string };
    if (!content || !content.trim())
      return res.status(400).json({ error: "content required" });
    const post = {
      author: decoded.name || decoded.email || "User",
      authorId: decoded.uid,
      content: content.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    } as any;
    const ref = await db.collection(`courses/${courseId}/discussions`).add(post);
    const saved = { id: ref.id, ...post, createdAt: new Date().toISOString() };

    const payload = `data: ${JSON.stringify({ post: saved })}\n\n`;
    const clients = courseSseClients.get(courseId) ?? [];
    for (const client of clients.slice()) {
      try {
        client.write(payload);
      } catch {
        try {
          client.end();
        } catch {}
      }
    }
    return res.status(201).json({ post: saved });
  }
  return res.status(405).end();
};

export const handleCourseDiscussionStream: RequestHandler = async (
  req,
  res,
) => {
  const { courseId } = req.params as { courseId?: string };
  if (!courseId) return res.status(400).end();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  (res as any).flushHeaders?.();
  try {
    res.write(`retry: 5000\n`);
    res.write(`: connected\n\n`);
  } catch {}
  const arr = courseSseClients.get(courseId) ?? [];
  arr.push(res as any);
  courseSseClients.set(courseId, arr);
  const ping = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(ping);
    }
  }, 30_000);
  req.on("close", () => {
    clearInterval(ping);
    const list = courseSseClients.get(courseId) ?? [];
    const idx = list.indexOf(res as any);
    if (idx >= 0) list.splice(idx, 1);
    courseSseClients.set(courseId, list);
  });
};

export const handleDeleteCourseDiscussion: RequestHandler = async (
  req,
  res,
) => {
  const decoded = await getAuthedUser(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const { courseId, id } = req.params as { courseId?: string; id?: string };
  if (!courseId || !id)
    return res.status(400).json({ error: "courseId and id required" });
  const db = getFirestore();
  const ref = db.doc(`courses/${courseId}/discussions/${id}`);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: "Not found" });
  const data = snap.data() as any;
  const isOwner = data.authorId === decoded.uid;
  const isAdmin = (await db.doc(`users/${decoded.uid}`).get()).data()?.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });
  await ref.delete();
  return res.json({ ok: true });
};

export const handleAssignments: RequestHandler = async (req, res) => {
  const decoded = await getAuthedUser(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const db = getFirestore();
  if (req.method === "GET") {
    const snap = await db
      .collection("submissions")
      .where("userId", "==", decoded.uid)
      .orderBy("submittedAt", "desc")
      .limit(50)
      .get();
    const submissions = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return res.json({ submissions });
  }
  if (req.method === "POST") {
    const { filename, contentBase64, note } = req.body as {
      filename: string;
      contentBase64?: string;
      note?: string;
    };
    const id = genId("sub");
    let storedPath: string | undefined;
    let downloadUrl: string | undefined;

    const bucket = getStorage().bucket();

    if (contentBase64) {
      const buffer = Buffer.from(contentBase64, "base64");
      const safeName = (filename || `upload-${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, "_");
      const objectPath = `assignments/${decoded.uid}/${id}_${safeName}`;
      const file = bucket.file(objectPath);
      await file.save(buffer, {
        resumable: false,
        metadata: { contentType: "application/octet-stream" },
      });
      storedPath = objectPath;
      const [url] = await file.getSignedUrl({ action: "read", expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
      downloadUrl = url;
    } else if (note) {
      const objectPath = `assignments/${decoded.uid}/${id}_note.txt`;
      const file = bucket.file(objectPath);
      await file.save(Buffer.from(note, "utf-8"), {
        resumable: false,
        metadata: { contentType: "text/plain; charset=utf-8" },
      });
      storedPath = objectPath;
      const [url] = await file.getSignedUrl({ action: "read", expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
      downloadUrl = url;
    }

    const submission = {
      userId: decoded.uid,
      filename: filename ?? `notes-${Date.now()}.txt`,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "submitted",
      note: note ?? undefined,
      path: storedPath,
      url: downloadUrl,
    } as any;

    const ref = await db.collection("submissions").add(submission);
    const saved = { id: ref.id, ...submission, submittedAt: new Date().toISOString() };
    return res.status(201).json({ submission: saved });
  }
  res.status(405).end();
};

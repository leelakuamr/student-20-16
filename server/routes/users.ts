import { RequestHandler } from "express";
import { getFirestore, verifyIdToken, getAuth } from "../firebase";

async function getDecoded(req: any) {
  const authHeader = (req.headers.authorization || "").replace(
    "Bearer ",
    "",
  );
  if (!authHeader) return null;
  try {
    return (await verifyIdToken(authHeader)) as any;
  } catch {
    return null;
  }
}

async function requireAdmin(uid: string) {
  const db = getFirestore();
  const snap = await db.doc(`users/${uid}`).get();
  return snap.exists && (snap.data() as any).role === "admin";
}

// Delete own account
export const deleteMe: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });

  const uid = decoded.uid as string;
  const db = getFirestore();

  // Best-effort delete related data
  const batches: FirebaseFirestore.WriteBatch[] = [];
  const b1 = db.batch();
  const subs = await db.collection("submissions").where("userId", "==", uid).get();
  subs.docs.forEach((d) => b1.delete(d.ref));
  batches.push(b1);

  const b2 = db.batch();
  const progress = await db.collection("progress").where("userId", "==", uid).get();
  progress.docs.forEach((d) => b2.delete(d.ref));
  batches.push(b2);

  const b3 = db.batch();
  const discussions = await db.collection("discussions").where("authorId", "==", uid).get();
  discussions.docs.forEach((d) => b3.delete(d.ref));
  batches.push(b3);

  // Execute batches
  for (const b of batches) await b.commit();

  // Delete user profile
  await db.doc(`users/${uid}`).delete().catch(() => {});

  // Optionally disable Firebase Auth user
  try {
    await getAuth().deleteUser(uid as any);
  } catch {}

  res.json({ ok: true });
};

// Admin delete user by id
export const deleteUserById: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const isAdmin = await requireAdmin(decoded.uid);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const { id } = req.params as { id: string };
  const db = getFirestore();

  // Best-effort deletions
  const batches: FirebaseFirestore.WriteBatch[] = [];
  const b1 = db.batch();
  (await db.collection("submissions").where("userId", "==", id).get()).docs.forEach((d) => b1.delete(d.ref));
  batches.push(b1);

  const b2 = db.batch();
  (await db.collection("progress").where("userId", "==", id).get()).docs.forEach((d) => b2.delete(d.ref));
  batches.push(b2);

  const b3 = db.batch();
  (await db.collection("discussions").where("authorId", "==", id).get()).docs.forEach((d) => b3.delete(d.ref));
  batches.push(b3);

  for (const b of batches) await b.commit();

  await db.doc(`users/${id}`).delete().catch(() => {});
  try {
    await getAuth().deleteUser(id as any);
  } catch {}

  res.json({ ok: true });
};

export const listUsers: RequestHandler = async (_req, res) => {
  const db = getFirestore();
  const snap = await db.collection("users").limit(1000).get();
  const users = snap.docs.map((d) => {
    const v = d.data() as any;
    return { id: d.id, name: v.name, email: v.email, role: v.role };
  });
  res.json({ users });
};

export const updateMe: RequestHandler = async (req, res) => {
  const decoded = await getDecoded(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (password) {
    return res.status(501).json({ error: "Password update not supported here" });
  }

  const db = getFirestore();
  const updates: any = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  updates.updatedAt = new Date();

  await db.doc(`users/${decoded.uid}`).set(updates, { merge: true });

  // Reflect in Firebase Auth profile where safe
  try {
    await getAuth().updateUser(decoded.uid, {
      displayName: name,
      email: email,
    } as any);
  } catch {}

  res.json({
    ok: true,
    user: {
      id: decoded.uid,
      name: name ?? undefined,
      email: email ?? undefined,
    },
  });
};

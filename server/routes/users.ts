import { RequestHandler } from "express";
import { readJSON, writeJSON } from "../utils/db";
import prisma from "../db/prisma";

// Delete own account
export const deleteMe: RequestHandler = async (req, res) => {
  const auth = (req.headers.authorization || "").replace("Bearer ", "");
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const users = await readJSON("users.json", [] as any[]);
  const idx = users.findIndex((u) => u.token === auth);
  if (idx === -1) return res.status(401).json({ error: "Unauthorized" });
  const user = users[idx];

  try {
    // remove from JSON store
    users.splice(idx, 1);
    await writeJSON("users.json", users);

    // remove related prisma data if exists
    // badges, submissions, group memberships, chat messages, progress, discussions
    await prisma.$transaction([
      prisma.badge.deleteMany({ where: { userId: user.id } }).catch(() => {}),
      prisma.submission.deleteMany({ where: { userId: user.id } }).catch(() => {}),
      prisma.groupMember.deleteMany({ where: { userId: user.id } }).catch(() => {}),
      prisma.chatMessage.deleteMany({ where: { userId: user.id } }).catch(() => {}),
      prisma.progressEntry.deleteMany({ where: { userId: user.id } }).catch(() => {}),
      prisma.discussion.deleteMany({ where: { authorId: user.id } }).catch(() => {}),
      prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {}),
    ]);
  } catch (e) {
    console.error("user delete error", e);
  }

  res.json({ ok: true });
};

// Admin delete user by id
export const deleteUserById: RequestHandler = async (req, res) => {
  const auth = (req.headers.authorization || "").replace("Bearer ", "");
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  const users = await readJSON("users.json", [] as any[]);
  const admin = users.find((u) => u.token === auth);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  const { id } = req.params as { id: string };

  // remove from JSON store if present
  const remaining = users.filter((u) => u.id !== id);
  await writeJSON("users.json", remaining);

  try {
    await prisma.$transaction([
      prisma.badge.deleteMany({ where: { userId: id } }).catch(() => {}),
      prisma.submission.deleteMany({ where: { userId: id } }).catch(() => {}),
      prisma.groupMember.deleteMany({ where: { userId: id } }).catch(() => {}),
      prisma.chatMessage.deleteMany({ where: { userId: id } }).catch(() => {}),
      prisma.progressEntry.deleteMany({ where: { userId: id } }).catch(() => {}),
      prisma.discussion.deleteMany({ where: { authorId: id } }).catch(() => {}),
      prisma.user.deleteMany({ where: { id } }).catch(() => {}),
    ]);
  } catch (e) {
    console.error("admin delete user error", e);
  }

  res.json({ ok: true });
};

export const listUsers: RequestHandler = async (_req, res) => {
  const users = await readJSON("users.json", [] as any[]);
  res.json({ users });
};

export const updateMe: RequestHandler = async (req, res) => {
  const auth = (req.headers.authorization || "").replace("Bearer ", "");
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  const users = await readJSON("users.json", [] as any[]);
  const idx = users.findIndex((u) => u.token === auth);
  if (idx === -1) return res.status(401).json({ error: "Unauthorized" });

  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (email && users.find((u) => u.email === email && u.id !== users[idx].id)) {
    return res.status(409).json({ error: "Email exists" });
  }

  if (name) users[idx].name = name;
  if (email) users[idx].email = email;
  if (password) {
    const crypto = await import("crypto");
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
    users[idx].salt = salt;
    users[idx].passwordHash = passwordHash;
  }

  await writeJSON("users.json", users);
  res.json({ ok: true, user: { id: users[idx].id, name: users[idx].name, email: users[idx].email, role: users[idx].role } });
};

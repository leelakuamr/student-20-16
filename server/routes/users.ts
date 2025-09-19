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

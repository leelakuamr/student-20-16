import { RequestHandler } from "express";
import { readJSON, writeJSON } from "../utils/db";

function genId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const listTeachers: RequestHandler = async (_req, res) => {
  // In prototype, teachers are users with role instructor
  const users = await readJSON("users.json", [] as any[]);
  const teachers = users.filter((u) => u.role === "instructor" || u.role === "admin").map((u) => ({ id: u.id, name: u.name, email: u.email }));
  // fallback sample teachers
  if (teachers.length === 0) {
    return res.json({ teachers: [
      { id: "t1", name: "Ms. Sharma", email: "sharma@school.edu" },
      { id: "t2", name: "Mr. Gupta", email: "gupta@school.edu" },
    ]});
  }
  res.json({ teachers });
};

export const sendMessageToTeacher: RequestHandler = async (req, res) => {
  const { teacherId, subject, message, fromName, fromEmail } = req.body as { teacherId?: string; subject?: string; message?: string; fromName?: string; fromEmail?: string };
  if (!message || (!teacherId && !fromEmail)) return res.status(400).json({ error: "Missing fields" });

  const messages = await readJSON("messages.json", [] as any[]);
  const m = {
    id: genId("msg"),
    teacherId: teacherId ?? null,
    subject: subject ?? "Message from student",
    message,
    fromName: fromName ?? "Anonymous",
    fromEmail: fromEmail ?? null,
    createdAt: new Date().toISOString(),
    read: false,
  } as any;
  messages.unshift(m);
  await writeJSON("messages.json", messages);

  // In production: send email or notification to teacher
  res.status(201).json({ ok: true, message: m });
};

export const listMessages: RequestHandler = async (_req, res) => {
  const messages = await readJSON("messages.json", [] as any[]);
  res.json({ messages });
};

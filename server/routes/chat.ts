import { RequestHandler } from "express";
import { readJSON, writeJSON } from "../utils/db";

const clients: import("http").ServerResponse[] = [];

function genId(prefix = "c") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const postMessage: RequestHandler = async (req, res) => {
  const { from, text } = req.body as { from?: string; text?: string };
  if (!text) return res.status(400).json({ error: "Missing text" });

  const messages = await readJSON("chat.json", [] as any[]);
  const msg = { id: genId("m"), from: from ?? "Anonymous", text, createdAt: new Date().toISOString() };
  messages.unshift(msg);
  await writeJSON("chat.json", messages);

  // broadcast to SSE clients
  const payload = `data: ${JSON.stringify({ message: msg })}\n\n`;
  for (const c of clients.slice()) {
    try {
      c.write(payload);
    } catch (e) {
      try { c.end(); } catch {}
    }
  }

  res.status(201).json({ message: msg });
};

export const getMessages: RequestHandler = async (_req, res) => {
  const messages = await readJSON("chat.json", [] as any[]);
  res.json({ messages });
};

export const streamMessages: RequestHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // send initial comment
  res.write(`: connected\n\n`);

  const ping = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch (e) {
      clearInterval(ping);
    }
  }, 30_000);

  clients.push(res as any);

  req.on("close", () => {
    clearInterval(ping);
    const idx = clients.indexOf(res as any);
    if (idx >= 0) clients.splice(idx, 1);
  });
};

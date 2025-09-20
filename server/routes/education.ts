import { RequestHandler } from "express";

function genId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Persistent JSON storage via utils
import { readJSON, writeJSON } from "../utils/db";

export const handleGetUser: RequestHandler = async (req, res) => {
  const users = await readJSON("users.json", [{ id: "u1", name: "Student" }]);
  res.json(users[0]);
};

export const handleGetProgress: RequestHandler = async (req, res) => {
  const progress = await readJSON("progress.json", [
    { course: "Algebra I", value: 72 },
    { course: "Chemistry", value: 64 },
  ]);
  res.json({ progress });
};

export const handleGetRecommendations: RequestHandler = async (req, res) => {
  // Very simple rule-based recommendations for MVP
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

export const handleDiscussions: RequestHandler = async (req, res) => {
  if (req.method === "GET") {
    const discussions = await readJSON("discussions.json", [
      {
        id: "d1",
        author: "Rohan",
        content: "How do I solve eqn #3?",
        createdAt: new Date().toISOString(),
      },
    ]);
    return res.json({ posts: discussions });
  }
  if (req.method === "POST") {
    const { content } = req.body as { content: string };
    const discussions = await readJSON("discussions.json", [] as any[]);
    const post = {
      id: genId("post"),
      author: "You",
      content,
      createdAt: new Date().toISOString(),
    };
    discussions.unshift(post);
    await writeJSON("discussions.json", discussions);

    // broadcast to SSE clients
    const payload = `data: ${JSON.stringify({ post })}\n\n`;
    for (const client of sseClients.slice()) {
      try {
        client.write(payload);
      } catch (e) {
        // ignore broken client
        try {
          client.end();
        } catch {}
      }
    }

    return res.status(201).json({ post });
  }
  res.status(405).end();
};

export const handleDiscussionStream: RequestHandler = async (req, res) => {
  // SSE endpoint
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable proxy buffering if any
  res.flushHeaders?.();

  // immediately notify client and configure retry
  try {
    res.write(`retry: 5000\n`);
    res.write(`: connected\n\n`);
  } catch {}

  // send a ping comment every 30s to keep connection alive
  const ping = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch (e) {
      clearInterval(ping);
    }
  }, 30_000);

  // add to clients
  sseClients.push(res as any);

  // on close, remove
  req.on("close", () => {
    clearInterval(ping);
    const idx = sseClients.indexOf(res as any);
    if (idx >= 0) sseClients.splice(idx, 1);
  });
};

export const handleDeleteDiscussion: RequestHandler = async (req, res) => {
  const { id } = req.params as { id?: string };
  if (!id) return res.status(400).json({ error: "id is required" });

  const discussions = await readJSON("discussions.json", [] as any[]);
  const idx = discussions.findIndex((d: any) => d.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  discussions.splice(idx, 1);
  await writeJSON("discussions.json", discussions);

  return res.json({ ok: true });
};

export const handleAssignments: RequestHandler = async (req, res) => {
  if (req.method === "GET") {
    const submissions = await readJSON("submissions.json", [] as any[]);
    return res.json({ submissions });
  }
  if (req.method === "POST") {
    const { filename, contentBase64, note, status } = req.body as {
      filename?: string;
      contentBase64?: string;
      note?: string;
      status?: string;
    };
    const submissions = await readJSON("submissions.json", [] as any[]);
    const s: any = {
      id: genId("sub"),
      filename: filename ?? `notes-${Date.now()}.txt`,
      submittedAt: new Date().toISOString(),
      status: status || "submitted",
      note: note ?? undefined,
    };
    // save file if provided
    if (contentBase64) {
      try {
        const buffer = Buffer.from(contentBase64, "base64");
        const fs = await import("fs/promises");
        const path = await import("path");
        const uploadsDir = path.resolve(__dirname, "../uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, `${s.id}_${s.filename}`);
        await fs.writeFile(filePath, buffer);
        s.path = `/uploads/${s.id}_${s.filename}`;
      } catch (e) {
        console.error("file save error", e);
      }
    } else if (note) {
      // save note as a text file for convenience
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const uploadsDir = path.resolve(__dirname, "../uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        const fileName = `${s.id}_note.txt`;
        const filePath = path.join(uploadsDir, fileName);
        await fs.writeFile(filePath, note, "utf-8");
        s.path = `/uploads/${fileName}`;
      } catch (e) {
        console.error("note save error", e);
      }
    }
    submissions.unshift(s);
    await writeJSON("submissions.json", submissions);
    return res.status(201).json({ submission: s });
  }
  if (req.method === "PATCH" || req.method === "PUT") {
    const { id, filename, contentBase64, note, status, grade } = req.body as {
      id?: string;
      filename?: string;
      contentBase64?: string;
      note?: string;
      status?: string;
      grade?: string | number | null;
    };
    if (!id) return res.status(400).json({ error: "id is required" });
    const submissions = await readJSON("submissions.json", [] as any[]);
    const idx = submissions.findIndex((x: any) => x.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    const current = submissions[idx];
    if (filename) current.filename = filename;
    if (typeof status === "string") current.status = status;
    if (typeof note === "string") current.note = note;
    if (grade !== undefined) current.grade = grade;
    if (contentBase64 || note) {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const uploadsDir = path.resolve(__dirname, "../uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        let fileName: string;
        if (contentBase64) {
          const buffer = Buffer.from(contentBase64, "base64");
          fileName = `${id}_${current.filename}`;
          await fs.writeFile(path.join(uploadsDir, fileName), buffer);
        } else {
          fileName = `${id}_note.txt`;
          await fs.writeFile(
            path.join(uploadsDir, fileName),
            note ?? "",
            "utf-8",
          );
        }
        current.path = `/uploads/${fileName}`;
      } catch (e) {
        console.error("update save error", e);
      }
    }
    submissions[idx] = current;
    await writeJSON("submissions.json", submissions);
    return res.json({ submission: current });
  }
  if (req.method === "DELETE") {
    const { id } = req.body as { id?: string };
    if (!id) return res.status(400).json({ error: "id is required" });
    const submissions = await readJSON("submissions.json", [] as any[]);
    const idx = submissions.findIndex((x: any) => x.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    const removed = submissions.splice(idx, 1)[0];
    try {
      if (removed?.path) {
        const fs = await import("fs/promises");
        const path = await import("path");
        const uploadsDir = path.resolve(__dirname, "../uploads");
        const full = path.join(uploadsDir, path.basename(removed.path));
        await fs.unlink(full).catch(() => {});
      }
    } catch (e) {
      console.error("delete file error", e);
    }
    await writeJSON("submissions.json", submissions);
    return res.json({ ok: true });
  }
  res.status(405).end();
};

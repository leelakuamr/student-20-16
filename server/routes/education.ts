import { RequestHandler } from "express";

function genId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Persistent JSON storage via utils
import { readJSON, writeJSON } from "@/utils/db";

export const handleGetUser: RequestHandler = (req, res) => {
  res.json(users[0]);
};

export const handleGetProgress: RequestHandler = (req, res) => {
  res.json({ progress });
};

export const handleGetRecommendations: RequestHandler = (req, res) => {
  const items = [
    { id: "r1", title: "Practice Linear Equations", reason: "Struggling with recent quiz" },
    { id: "r2", title: "Watch Atoms & Bonds", reason: "Low engagement in science module" },
  ];
  res.json({ items });
};

export const handleDiscussions: RequestHandler = (req, res) => {
  if (req.method === "GET") return res.json({ posts: discussions });
  if (req.method === "POST") {
    const { content } = req.body as { content: string };
    const post = { id: genId('post'), author: "You", content, createdAt: new Date().toISOString() };
    discussions.unshift(post);
    return res.status(201).json({ post });
  }
  res.status(405).end();
};

export const handleAssignments: RequestHandler = (req, res) => {
  if (req.method === "GET") return res.json({ submissions });
  if (req.method === "POST") {
    const { filename } = req.body as { filename: string };
    const s = { id: genId('sub'), filename, submittedAt: new Date().toISOString(), status: "submitted" };
    submissions.unshift(s);
    return res.status(201).json({ submission: s });
  }
  res.status(405).end();
};

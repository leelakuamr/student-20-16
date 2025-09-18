import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Education APIs
  const edu = await import("./routes/education");
  app.get("/api/users/me", edu.handleGetUser);
  app.get("/api/progress", edu.handleGetProgress);
  app.get("/api/recommendations", edu.handleGetRecommendations);
  app.all("/api/discussions", edu.handleDiscussions);
  app.all("/api/assignments", edu.handleAssignments);

  return app;
}

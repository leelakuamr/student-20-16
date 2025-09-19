AdeptLearn — Education Platform (README)

Project overview

AdeptLearn is a lightweight education platform that provides student dashboards, assignments, real-time discussions, calendar and events, gamification, and instructor workflows. The goal is to let teachers publish assignments and students interact (submit, discuss, collaborate) with a smooth, mobile-first UI and a small, maintainable backend.

Problem statement (how to explain)

- Users: students, instructors, admins, parents.
- Pain: students and instructors lack a single integrated space for assignments, synchronous and asynchronous discussion, and progress tracking.
- Goal: build an accessible, responsive web app that supports:
  - Registration & authentication
  - Assignment delivery and submission (file + notes)
  - Real-time discussion feed (live posts)
  - Calendar export and events
  - Simple gamification (badges, leaderboards)
- Constraints: keep developer experience simple (Vite + TypeScript), store minimal local data for rapid prototyping, support production-ready swaps to managed services (Neon/Postgres, Firebase Auth/Storage).

Architecture overview (high level)

- Frontend: React + TypeScript + Vite, TailwindCSS for fast UI styling, Radix/Headless components and Sonner for notifications.
- Backend: Node + Express (TypeScript), server-side bundling with Vite for SSR-friendly build. Simple JSON-backed storage for prototype data in server/data. Routes live under server/routes/*.ts.
- Storage: local uploads directory for prototype; replace with cloud storage (Firebase Storage, S3, or GCP) in production.
- Auth: current app uses a minimal token system in server/data for local prototyping. Firebase Admin SDK has been added to enable migration to Firebase Auth.
- Realtime: Server-Sent Events (SSE) implemented for live discussion updates; can be swapped to WebSockets for two-way messaging or scaled via managed pub/sub (Pusher, Ably).

Why these technologies (A to Z explanation)

- TypeScript (frontend + backend): safer code, clearer APIs, better DX. Outcome: fewer runtime bugs, self-documenting types.
- React + Vite: rapid UI iteration and fast dev server. Outcome: quick feature development and instant feedback.
- Tailwind CSS: utility-first responsive styling and consistent design tokens. Outcome: mobile-first UI delivered quickly.
- Radix UI / Sonner / Lucide: accessible UI primitives (menus, toasts, icons). Outcome: accessible components with minimal effort.
- Express (Node): minimal, familiar server framework for routes and middleware. Outcome: simple routing and easy to extend.
- Prisma (optional): already present in repo; in dev this repo uses sqlite (prisma/dev.db), production should use Postgres via Neon and Prisma for strong schemas and migrations.
- Firebase Admin SDK: provides admin-level auth/user management, Firestore, and Storage access if you choose Firebase. Outcome: quick auth migration and managed storage.
- SSE (Server-Sent Events): used for real-time discussion broadcasting. Outcome: very simple live updates with browser-native EventSource support.
- Webpack/Vite builds: Vite is used to build both client and server bundles. Outcome: streamlined build process.

Frontend vs Backend languages and responsibilities

- Frontend (what to use):
  - Primary language: TypeScript (React). Rationale: type safety + ecosystem.
  - Markup/CSS: HTML, Tailwind CSS utility classes.
  - Responsibilities: UI, forms, client-side validation, connecting to REST/SSE endpoints, local caching/state (React Query is included).
- Backend (what to use):
  - Primary language: TypeScript (Node + Express). Rationale: consistent language across stack.
  - Responsibilities: REST endpoints (/api/*), file storage (uploads/), simple persistence (server/data/*.json for prototype), authentication, SSE streaming endpoint, integrations with external services (Firebase, Neon).

How to explain the solution (presentation-friendly)

- Problem → Approach → Outcome pattern:
  1. Problem: scattered classroom tools; no single source of truth for assignments & conversations.
  2. Approach: create a web app with assignment flow, live discussions, calendar and progress tracking. Prototype quickly with local JSON storage, then migrate to managed services.
  3. Outcome: students can submit work, collaborate in real-time, and instructors can grade and award badges. Mobile-first responsive UI ensures adoption on phones.
- Key flows to demo:
  - Register/Login → Dashboard → Open Assignment → Submit (file or notes) → See submission listed.
  - Discussions: post question → watch it appear for all users in real time (SSE).
  - Calendar: export .ics file and see upcoming events.

Detailed outcomes for each component

- Frontend
  - Outcome: responsive, accessible UI supporting desktop and mobile with a BottomNav. Implements assignment submission, discussion board, calendar view, leaderboards.
  - How to explain: "Single-page app using React + TypeScript. Mobile-first layout and accessible components; uses EventSource for live updates."

- Backend
  - Outcome: Express server providing API routes: /api/auth, /api/discussions, /api/assignments, /api/events, /api/users. Handles file saving, simple persistence and SSE broadcast.
  - How to explain: "Small, testable route handlers with pluggable persistence — JSON files for prototype, swap-in Postgres/Neon for production."

- Authentication
  - Outcome: Prototype token-based auth exists; we added firebase-admin helpers to migrate to Firebase Auth quickly.
  - How to explain: "Start with dev tokens for speed; production should use a managed identity provider (Firebase Auth or Supabase) for security and features (password resets, OAuth)."

- Storage & persistence
  - Outcome: files saved to uploads/ and metadata stored in server/data/*.json. In production, use cloud storage (Firebase Storage, S3) and a relational DB (Postgres) or Firestore depending on needs.
  - How to explain: "Local disk for prototype; durable cloud storage for production with signed URLs and access rules."

- Realtime
  - Outcome: SSE stream for discussions; immediate updates to connected clients.
  - How to explain: "SSE provides an easy one-way channel from server → client for posts; use WebSockets for bidirectional or richer chat."

Security & Operational notes

- Never commit service account JSON files or secrets — rotate keys if they are exposed. This repo already has a Firebase service account that was provided during setup; rotate that key in Firebase Console.
- Environment variables used by the server:
  - FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_BASE64 (recommended)
  - PING_MESSAGE (optional test endpoint)
- Production considerations:
  - Use Postgres (Neon) + Prisma for relational data and migration tooling.
  - Use Firebase Auth for managed identity or Supabase if you prefer an integrated DB+Auth solution.
  - For large scale realtime features, use managed pub/sub or a WebSocket service.

Setup & local development

1. Install dependencies:
   - pnpm install (or npm install)
2. Provide secrets (if using Firebase features):
   - Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_BASE64 via your environment manager.
3. Start dev server:
   - npm run dev
4. Useful endpoints during development:
   - GET /api/discussions — list recent posts
   - GET /api/discussions/stream — SSE stream for live posts
   - POST /api/discussions { content }
   - GET /api/assignments — list submissions
   - POST /api/assignments { filename, contentBase64?, note? }

MCP integrations (recommended & available)

The platform can integrate with Builder.io MCP servers to speed up production deployment and backend features. The following MCPs are useful for this project:

• Neon — serverless Postgres for production DB (use with Prisma).
• Netlify — host and deploy the site (static assets + serverless functions).
• Zapier — automation between your app and thousands of services.
• Figma — use Builder.io Figma plugin to convert designs; helpful for UI-to-code workflow.
• Supabase — alternative DB + Auth + Storage with integrated realtime features.
• Builder CMS — for content management and pages.
• Linear — issue tracking and project management integration.
• Notion — documentation sync and notes.
• Sentry — error monitoring and performance tracking.
• Context7 — up-to-date docs for libraries/frameworks.
• Semgrep — security SAST scanning.
• Prisma Postgres — for schema migrations through Prisma and Postgres.

To connect any of the above in the Builder environment, open the MCP popover and Connect to the desired service.

Next steps & recommended roadmap

1. Migrate auth to Firebase Auth (or Supabase Auth) and require authentication for posting and submissions.
2. Replace JSON storage with Postgres (Neon) + Prisma for reliability and querying.
3. Move file uploads to managed storage (Firebase Storage or S3) and serve signed URLs.
4. Implement teacher grading UI, submission comments, and notifications.
5. Add tests for API routes and UI flows; set up CI to run tests and linters.
6. Deploy to Netlify or Vercel and connect monitoring (Sentry).

How to present this project to stakeholders

- Problem: teachers and students use fragmented tools. Demonstrate the pain points (lost submissions, scattered chats).
- Demo: show registration, assignment submission, live discussion with two browser windows, and calendar export.
- Success metrics: reduced submission errors, improved student engagement (posts/comments), and faster grading turnaround.

Contributing & contact

- Development is done in TypeScript. Create branches, add tests for new routes, and follow existing code style.
- To contribute: fork, create a branch, open a PR with a clear description and screenshots.

License

- This repository does not include a license file by default. Add a license (MIT/Apache) if you plan to open source.



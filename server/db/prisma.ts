import type { RequestHandler } from "express";
import { readJSON } from "../utils/db";

async function loadPrismaReal() {
  try {
    const mod: any = await import("@prisma/client");
    const PrismaClient =
      mod.PrismaClient || (mod.default && mod.default.PrismaClient);
    if (PrismaClient) {
      return new PrismaClient();
    }
  } catch (_) {
    // ignore - will fall back to shim
  }
  return null;
}

function id() {
  return Math.random().toString(36).slice(2, 10);
}

// Very small in-memory shim to keep dev server running when Prisma client isn't generated
function createPrismaShim() {
  const makeDeleteMany = () => async (_args?: any) => ({ count: 0 });
  const makeCreate =
    (key: string) =>
    async ({ data }: any) => ({ id: id(), ...data });
  const makeFindMany = (_key: string) => async (_args?: any) => [] as any[];

  const shim: any = {
    $transaction: async (_ops: Promise<any>[]) => {
      // execute in parallel but ignore results
      try {
        await Promise.all(_ops.map((p) => p.catch(() => undefined)));
      } catch (_) {}
      return [];
    },
    // Models used in routes
    group: { findMany: makeFindMany("group"), create: makeCreate("group") },
    user: {
      findUnique: async ({ where }: any) => {
        if (where?.token) {
          const users = await readJSON("users.json", [] as any[]);
          return users.find((u: any) => u.token === where.token) || null;
        }
        return null;
      },
      deleteMany: makeDeleteMany(),
    },
    groupMember: {
      create: makeCreate("groupMember"),
      deleteMany: makeDeleteMany(),
    },
    badge: {
      findMany: makeFindMany("badge"),
      create: makeCreate("badge"),
      deleteMany: makeDeleteMany(),
    },
    submission: { deleteMany: makeDeleteMany() },
    chatMessage: { deleteMany: makeDeleteMany() },
    progressEntry: { deleteMany: makeDeleteMany() },
    discussion: { deleteMany: makeDeleteMany() },
    event: { findMany: makeFindMany("event"), create: makeCreate("event") },
  };
  return shim;
}

let clientPromise: Promise<any> | null = null;

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const real = await loadPrismaReal();
      return real ?? createPrismaShim();
    })();
  }
  return clientPromise;
}

const proxy = new Proxy(
  {},
  {
    get(_target, prop) {
      return async (...args: any[]) => {
        const c: any = await getClient();
        const fn = (c as any)[prop];
        if (typeof fn === "function") return fn.apply(c, args);
        return fn;
      };
    },
  },
);

export default proxy as any;

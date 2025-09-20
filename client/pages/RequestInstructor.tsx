import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getFirestore } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";

export default function RequestInstructor() {
  const { user } = useAuth();
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"none" | "pending" | "instructor">(
    "none",
  );

  async function refresh() {
    if (!user) return;
    setLoading(true);
    try {
      const d = await getDoc(doc(db, "users", user.id));
      const data = d.exists() ? (d.data() as any) : {};
      if ((data.role as string) === "instructor") setStatus("instructor");
      else if (
        (data.requestStatus as string) === "pending" &&
        (data.requestedRole as string) === "instructor"
      )
        setStatus("pending");
      else setStatus("none");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function request() {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.id), {
        requestedRole: "instructor",
        requestStatus: "pending",
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      try {
        await fetch("/api/notify/instructor-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.id,
            name: user.name,
            email: user.email,
          }),
        });
      } catch {}
    } finally {
      await refresh();
    }
  }

  async function cancel() {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.id), {
        requestedRole: deleteField(),
        requestStatus: deleteField(),
        requestedAt: deleteField(),
        updatedAt: serverTimestamp(),
      });
    } finally {
      await refresh();
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Become an Instructor</h1>
      <p className="text-sm text-muted-foreground">
        Request instructor access. An admin will review and approve.
      </p>

      <div className="rounded-xl border p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : status === "instructor" ? (
          <div>
            <p className="text-sm">You are already an instructor.</p>
          </div>
        ) : status === "pending" ? (
          <div className="space-y-3">
            <p className="text-sm">Your request is pending approval.</p>
            <button
              onClick={cancel}
              className="rounded-md border px-3 py-1 text-sm"
            >
              Cancel request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">Not an instructor yet.</p>
            <button
              onClick={request}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Request Instructor Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

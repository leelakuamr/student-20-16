import { useEffect, useState } from "react";
import { getFirestore } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc, serverTimestamp, deleteField } from "firebase/firestore";

export function AdminInstructorRequests() {
  const db = getFirestore();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<{ uid: string; name: string; email?: string }>>([]);

  async function load() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("requestedRole", "==", "instructor"),
        where("requestStatus", "==", "pending"),
      );
      const snap = await getDocs(q);
      const rows: Array<{ uid: string; name: string; email?: string }> = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        rows.push({ uid: d.id, name: data.name || data.email || d.id, email: data.email });
      });
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(uid: string) {
    await updateDoc(doc(db, "users", uid), {
      role: "instructor",
      requestedRole: deleteField(),
      requestStatus: deleteField(),
      requestedAt: deleteField(),
      updatedAt: serverTimestamp(),
    });
    await load();
  }

  async function deny(uid: string) {
    await updateDoc(doc(db, "users", uid), {
      requestedRole: deleteField(),
      requestStatus: deleteField(),
      requestedAt: deleteField(),
      updatedAt: serverTimestamp(),
    });
    await load();
  }

  return (
    <section className="rounded-xl border">
      <div className="flex items-center justify-between border-b p-4">
        <div className="text-sm font-semibold">Instructor Requests</div>
        <button onClick={load} className="rounded-md border px-2 py-1 text-sm disabled:opacity-50" disabled={loading}>Refresh</button>
      </div>
      <div className="divide-y">
        {loading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No pending requests</div>
        )}
        {items.map((u) => (
          <div key={u.uid} className="flex items-center justify-between p-4 text-sm">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-muted-foreground">{u.email}</div>
            </div>
            <div className="space-x-2">
              <button onClick={() => approve(u.uid)} className="rounded-md bg-primary px-3 py-1 text-primary-foreground">Approve</button>
              <button onClick={() => deny(u.uid)} className="rounded-md border px-3 py-1">Deny</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

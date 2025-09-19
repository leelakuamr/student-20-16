import { useEffect, useMemo, useState } from "react";
import { getFirestore } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type AppRole = "admin" | "instructor" | "student" | "parent";

type AppUser = {
  uid: string;
  name: string;
  email?: string;
  role?: AppRole;
};

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Platform Admin",
  instructor: "Instructor / Teacher",
  student: "Student",
  parent: "Parent / Guardian",
};

export function AdminRoleManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filter, setFilter] = useState<"all" | AppRole>("all");

  const db = getFirestore();

  async function load() {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("name"));
      const snap = await getDocs(q);
      const items: AppUser[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        items.push({
          uid: d.id,
          name: data.name || data.email || d.id,
          email: data.email,
          role: data.role as AppRole | undefined,
        });
      });
      setUsers(items);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u) => (u.role || "student") === filter);
  }, [users, filter]);

  async function changeRole(uid: string, newRole: AppRole) {
    try {
      await updateDoc(doc(db, "users", uid), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      setUsers((list) =>
        list.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)),
      );
      const isSelf = uid === user?.id;
      toast({
        title: isSelf ? "Your role was updated" : "Role updated",
        description: ROLE_LABEL[newRole],
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to update role" });
    }
  }

  return (
    <section className="mt-8 rounded-xl border">
      <div className="flex items-center justify-between gap-2 border-b p-4">
        <div>
          <div className="text-sm font-semibold">User Roles</div>
          <p className="text-xs text-muted-foreground">
            Promote or demote users. Changes apply immediately.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="role-filter" className="text-muted-foreground">
            Filter
          </label>
          <select
            id="role-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-md border px-2 py-1"
          >
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
          <button
            onClick={load}
            disabled={loading}
            className="rounded-md border px-2 py-1 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="divide-y">
        {loading && (
          <div className="p-4 text-sm text-muted-foreground">Loading…</div>
        )}
        {!loading && visible.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No users</div>
        )}

        {visible.map((u) => (
          <div key={u.uid} className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium">{u.name}</div>
              <div className="text-xs text-muted-foreground">{u.email}</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <select
                value={u.role || "student"}
                onChange={(e) => changeRole(u.uid, e.target.value as AppRole)}
                className="rounded-md border px-2 py-1"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => changeRole(u.uid, "admin")}
                className="rounded-md border px-2 py-1"
              >
                Make Admin
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

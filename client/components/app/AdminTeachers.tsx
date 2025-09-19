import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string; role?: string };

export function AdminTeachers() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teachers");
        if (res.ok) {
          const data = await res.json();
          setTeachers(data.teachers || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const add = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeachers((prev) => [data, ...prev]);
        setName("");
        setEmail("");
        setPassword("");
        setStatus("Teacher added.");
      } else {
        const d = await res.json();
        setStatus(d?.error || "Failed to add teacher.");
      }
    } catch (e) {
      console.error(e);
      setStatus("Failed to add teacher.");
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Manage Teachers</h3>
        <p className="text-sm text-muted-foreground">
          Add instructors who can access teacher features.
        </p>

        <div className="mt-3 grid gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="rounded-md border p-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-md border p-2"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="rounded-md border p-2"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={add}
              className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
            >
              Add teacher
            </button>
            {status && (
              <span className="text-sm text-muted-foreground">{status}</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="font-semibold">Teachers</h4>
        <ul className="mt-2 space-y-2 text-sm">
          {teachers.length === 0 && (
            <li className="text-muted-foreground">No teachers found.</li>
          )}
          {teachers.map((t) => (
            <li
              key={t.id}
              className="border rounded-md p-2 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.email}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

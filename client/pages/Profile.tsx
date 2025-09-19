import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return nav('/login');
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return nav('/login');
      const j = await res.json();
      setUser(j);
      setName(j.name);
      setEmail(j.email);
    })();
  }, []);

  const save = async () => {
    const token = localStorage.getItem('token');
    if (!token) return nav('/login');
    setStatus('Saving...');
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, password: password || undefined }),
      });
      if (res.ok) {
        const j = await res.json();
        setStatus('Saved');
        setUser(j.user);
        setPassword('');
      } else {
        const err = await res.json().catch(() => ({}));
        setStatus(err?.error || 'Failed to save');
      }
    } catch (e) {
      console.error(e);
      setStatus('Failed to save');
    }
    setTimeout(() => setStatus(null), 3000);
  };

  if (!user) return null;

  return (
    <section className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-muted-foreground">Manage your account details.</p>

      <div className="mt-6 card">
        <label className="block text-sm">Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border p-2" />

        <label className="block text-sm mt-3">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border p-2" />

        <label className="block text-sm mt-3">Change password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border p-2" />

        <div className="mt-4 flex items-center gap-3">
          <button onClick={save} className="btn-primary">Save</button>
          {status && <span className="text-sm text-muted-foreground">{status}</span>}
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "register";

export default function Auth({ initialMode = "login" as Mode }: { initialMode?: Mode }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const nav = useNavigate();

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  // register-only
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      nav("/dashboard");
    } catch (e) {
      setErr(mode === "login" ? "Login failed" : "Registration failed");
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-md rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <div className="inline-flex overflow-hidden rounded-md border">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`px-3 py-1.5 text-sm ${mode === "login" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              aria-pressed={mode === "login"}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`px-3 py-1.5 text-sm ${mode === "register" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              aria-pressed={mode === "register"}
            >
              Sign up
            </button>
          </div>
        </div>

        {err && <div className="mt-2 text-sm text-destructive">{err}</div>}

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-md border px-3 py-2"
              required
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-md border px-3 py-2"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded-md border px-3 py-2"
            required
          />
          {mode === "register" && (
            <div>
              <label className="text-sm">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="ml-2 rounded-md border px-2 py-1"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="parent">Parent</option>
              </select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-muted-foreground hover:underline"
            >
              {mode === "login" ? "Need an account?" : "Already have an account?"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

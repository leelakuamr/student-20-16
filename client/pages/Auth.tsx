import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuth, getFirestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast as notify } from "sonner";

type Mode = "login" | "register";

export default function Auth({
  initialMode = "login" as Mode,
}: {
  initialMode?: Mode;
}) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const nav = useNavigate();

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // register-only
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const ADMIN_ALLOWED_EMAILS = new Set<string>(["eedupugantil@gmail.com"]);
  const adminAllowed = ADMIN_ALLOWED_EMAILS.has(email.trim().toLowerCase());

  const emailValid = /.+@.+\..+/.test(email);
  const passValid = password.length >= 6;
  const canSubmit =
    emailValid && passValid && (mode === "login" || name.trim().length > 0);

  useEffect(() => {
    if (!adminAllowed && role === "admin") setRole("student");
  }, [adminAllowed]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "login") {
        await login(email, password, remember);
        notify("Signed in successfully");
      } else {
        await register(name, email, password, role, remember);
        notify("Account created");
      }
      // Redirect to role-based home page
      nav("/home");
    } catch (e) {
      setErr(mode === "login" ? "Login failed" : "Registration failed");
      notify.error(mode === "login" ? "Login failed" : "Registration failed");
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

        {err && (
          <div
            className="mt-2 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-4 space-y-3" noValidate>
          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-md border px-3 py-2"
              required
            />
          )}
          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-md border px-3 py-2"
              required
              aria-invalid={!emailValid}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use your school or personal email.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPass ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-md border px-3 py-2"
                required
                aria-invalid={!passValid}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>At least 6 characters.</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { sendPasswordResetEmail } = await import(
                        "firebase/auth"
                      );
                      await sendPasswordResetEmail(getAuth(), email);
                      setResetSent(true);
                      notify("Password reset email sent");
                    } catch {
                      notify.error("Could not send reset email");
                    }
                  }}
                  className="hover:underline"
                  disabled={!emailValid}
                >
                  Forgot password?
                </button>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={showPass}
                    onChange={(e) => setShowPass(e.target.checked)}
                  />
                  Show password
                </label>
              </div>
            </div>
          </div>
          {mode === "register" && (
            <div>
              <label className="text-sm">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="ml-2 rounded-md border px-2 py-1"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor / Teacher</option>
                <option value="parent">Parent / Guardian</option>
                {adminAllowed && (
                  <option value="admin">Platform Admin</option>
                )}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose how you’ll use the app (you can change later).
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            </div>
            <button
              disabled={!canSubmit}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-muted-foreground hover:underline"
            >
              {mode === "login"
                ? "Need an account?"
                : "Already have an account?"}
            </button>
          </div>
        </form>
      </div>

      <section className="mx-auto mt-6 max-w-3xl rounded-lg border p-4">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
          <span aria-hidden>👥</span> Role-Based Access Control
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border p-3">
            <div className="font-medium">Platform Admin</div>
            <p className="text-sm text-muted-foreground">
              System management, user oversight, content moderation, analytics
            </p>
          </div>
          <div className="rounded-md border p-3">
            <div className="font-medium">Instructor / Teacher</div>
            <p className="text-sm text-muted-foreground">
              Course creation, student management, grading
            </p>
          </div>
          <div className="rounded-md border p-3">
            <div className="font-medium">Student</div>
            <p className="text-sm text-muted-foreground">
              Course access, assignments, progress viewing, peer interaction
            </p>
          </div>
          <div className="rounded-md border p-3">
            <div className="font-medium">Parent / Guardian</div>
            <p className="text-sm text-muted-foreground">
              Child progress monitoring, teacher communication
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

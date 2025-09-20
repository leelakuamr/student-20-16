import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/home", label: "Dashboard" },
  { to: "/instructor", label: "Instructor" },
  { to: "/admin", label: "Admin" },
  { to: "/parent", label: "Parent" },
  { to: "/contact-teachers", label: "Contact" },
] as const;

export function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to={user ? "/home" : "/"} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-secondary" />
          <span className="text-lg font-extrabold tracking-tight">
            AdeptLearn
          </span>
        </Link>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems
            .filter((item) => {
              const role = user?.role;
              if (item.to === "/admin") return role === "admin";
              if (item.to === "/instructor")
                return role === "instructor" || role === "admin";
              if (item.to === "/parent")
                return role === "parent" || role === "admin";
              if (item.to === "/home") return !!user; // any authenticated user
              if (item.to === "/contact-teachers")
                return user?.role === "student";
              return true; // public
            })
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                    isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          {user?.role === "student" && (
            <NavLink
              to="/discussions"
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                  isActive &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )
              }
            >
              Discussions
            </NavLink>
          )}
          {user?.role === "student" && (
            <NavLink
              to="/study-groups"
              onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Coming soon",
                  description: "Collaborative study groups",
                  variant: "destructive",
                  duration: 5000,
                });
              }}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                  isActive &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )
              }
            >
              Study Groups
            </NavLink>
          )}
          {user?.role === "student" && (
            <NavLink
              to="/gamification"
              onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Coming soon",
                  description: "Gamification (badges, leaderboards)",
                  variant: "destructive",
                  duration: 5000,
                });
              }}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                  isActive &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )
              }
            >
              Gamification
            </NavLink>
          )}
          {user?.role === "student" && (
            <NavLink
              to="/calendar"
              onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Coming soon",
                  description: "Calendar integration",
                  variant: "destructive",
                  duration: 5000,
                });
              }}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                  isActive &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )
              }
            >
              Calendar
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            {user?.role && (
              <span className="rounded-full border px-2 py-0.5 text-xs">
                {user.role === "admin"
                  ? "Admin"
                  : user.role === "instructor"
                    ? "Instructor / Teacher"
                    : user.role === "parent"
                      ? "Parent / Guardian"
                      : "Student"}
              </span>
            )}
          </div>
          <AuthControls />
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3">
            <ul className="flex flex-col gap-1">
              {navItems
                .filter((item) => {
                  const role = user?.role;
                  if (item.to === "/admin") return role === "admin";
                  if (item.to === "/instructor")
                    return role === "instructor" || role === "admin";
                  if (item.to === "/parent")
                    return role === "parent" || role === "admin";
                  if (item.to === "/home") return !!user;
                  if (item.to === "/contact-teachers")
                    return user?.role === "student";
                  return true;
                })
                .map((it) => (
                  <li key={it.to}>
                    <NavLink
                      to={it.to}
                      className="block rounded-md px-3 py-2 text-base"
                    >
                      {it.label}
                    </NavLink>
                  </li>
                ))}
              {user?.role === "student" && (
                <li>
                  <NavLink
                    to="/discussions"
                    className="block rounded-md px-3 py-2 text-base"
                  >
                    Discussions
                  </NavLink>
                </li>
              )}
              {user?.role === "student" && (
                <li>
                  <NavLink
                    to="/study-groups"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Coming soon",
                        description: "Collaborative study groups",
                        variant: "destructive",
                        duration: 5000,
                      });
                    }}
                    className="block rounded-md px-3 py-2 text-base"
                  >
                    Study Groups
                  </NavLink>
                </li>
              )}
              {user?.role === "student" && (
                <li>
                  <NavLink
                    to="/gamification"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Coming soon",
                        description: "Gamification (badges, leaderboards)",
                        variant: "destructive",
                        duration: 5000,
                      });
                    }}
                    className="block rounded-md px-3 py-2 text-base"
                  >
                    Gamification
                  </NavLink>
                </li>
              )}
              {user?.role === "student" && (
                <li>
                  <NavLink
                    to="/calendar"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Coming soon",
                        description: "Calendar integration",
                        variant: "destructive",
                        duration: 5000,
                      });
                    }}
                    className="block rounded-md px-3 py-2 text-base"
                  >
                    Calendar
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

function AccessibilityControls() {
  const [large, setLarge] = useState(
    () => localStorage.getItem("a11y-large") === "1",
  );
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem("a11y-contrast") === "1",
  );

  useEffect(() => {
    const el = document.documentElement;
    if (large) el.classList.add("a11y-large");
    else el.classList.remove("a11y-large");
    if (highContrast) el.classList.add("a11y-contrast");
    else el.classList.remove("a11y-contrast");
    localStorage.setItem("a11y-large", large ? "1" : "0");
    localStorage.setItem("a11y-contrast", highContrast ? "1" : "0");
  }, [large, highContrast]);

  return (
    <div className="flex items-center gap-2">
      <button
        aria-pressed={large}
        onClick={() => setLarge((s) => !s)}
        className="rounded-md border px-2 py-1 text-sm"
        title="Toggle larger text"
      >
        A+
      </button>
      <button
        aria-pressed={highContrast}
        onClick={() => setHighContrast((s) => !s)}
        className="rounded-md border px-2 py-1 text-sm"
        title="Toggle high contrast"
      >
        HC
      </button>
    </div>
  );
}

function AuthControls() {
  const { user, logout, token } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/40"
      >
        <div className="h-8 w-8 rounded-full bg-accent-2 flex items-center justify-center text-sm font-medium">
          {user.name?.charAt(0) ?? "U"}
        </div>
        <span className="text-sm font-medium hidden sm:inline">
          {user.name}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground"
        >
          <path
            d="M6 9l6 6 6-6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-card p-2 shadow-lg z-50">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block w-full text-left rounded px-2 py-1 text-sm hover:bg-accent/40"
          >
            Profile
          </Link>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="block w-full text-left rounded px-2 py-1 text-sm hover:bg-accent/40"
          >
            Settings
          </Link>
          <div className="mt-1 border-t pt-1">
            <button
              onClick={async () => {
                if (
                  !confirm("Delete your account? This will remove your data.")
                )
                  return;
                try {
                  await fetch("/api/users/me", {
                    method: "DELETE",
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                  });
                } catch (e) {
                  console.error(e);
                }
                logout();
              }}
              className="w-full text-left rounded px-2 py-1 text-sm text-destructive hover:bg-destructive/10"
            >
              Delete account
            </button>
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full text-left rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted/30"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const home = user?.role === "admin"
    ? "/admin"
    : user?.role === "instructor"
    ? "/instructor"
    : user?.role === "parent"
    ? "/parent"
    : "/dashboard";
  const items = [
    { to: home, label: "Home", icon: Home },
    ...(user?.role === "student" ? [{ to: "/discussions", label: "Discussions", icon: MessageCircle } as const] : []),
    ...(user?.role === "student" ? [{ to: "/calendar", label: "Calendar", icon: Calendar } as const] : []),
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[min(640px,92%)] -translate-x-1/2 rounded-lg bg-white/90 px-3 py-2 shadow-lg backdrop-blur md:hidden">
      <ul className="flex justify-between">
        {items.map((it) => {
          const Icon = it.icon;
          const active = location.pathname === it.to;
          return (
            <li key={it.to} className="flex-1 text-center">
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-1 text-xs text-foreground/70",
                  active && "text-primary"
                )}
              >
                <Icon size={18} />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

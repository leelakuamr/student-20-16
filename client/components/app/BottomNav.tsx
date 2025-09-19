import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();
  const items = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/discussions", label: "Discussions", icon: MessageCircle },
    { to: "/calendar", label: "Calendar", icon: Calendar },
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

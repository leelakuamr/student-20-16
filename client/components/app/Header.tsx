import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Student" },
  { to: "/instructor", label: "Instructor" },
  { to: "/admin", label: "Admin" },
  { to: "/parent", label: "Parent" },
];

export function Header() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-secondary" />
          <span className="text-lg font-extrabold tracking-tight">AdeptLearn</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/discussions"
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
              )
            }
          >
            Discussions
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link to={location.pathname === "/dashboard" ? "/dashboard" : "/dashboard"}>Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

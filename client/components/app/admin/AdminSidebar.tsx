import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin-panel", label: "Overview" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin", label: "Role Manager" },
];

export function AdminSidebar() {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
            )
          }
          end
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}

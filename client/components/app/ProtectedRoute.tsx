import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

function homeFor(role?: string) {
  switch (role) {
    case "admin":
      return "/admin";
    case "instructor":
      return "/instructor";
    case "parent":
      return "/parent";
    default:
      return "/dashboard";
  }
}

export function ProtectedRoute({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: string[];
}) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  const effectiveRole = user.role ?? "student";
  if (roles && effectiveRole !== "admin" && !roles.includes(effectiveRole)) {
    const dest = homeFor(effectiveRole);
    if (dest === location.pathname) return <Navigate to="/" replace />;
    return <Navigate to={dest} replace />;
  }

  return children;
}

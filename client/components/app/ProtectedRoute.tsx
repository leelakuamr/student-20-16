import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: string[];
}) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (
    roles &&
    user.role &&
    !roles.includes(user.role) &&
    user.role !== "admin"
  ) {
    // Redirect to role-specific dashboard
    const roleDashboard = 
      user.role === "instructor" ? "/instructor" :
      user.role === "parent" ? "/parent" :
      user.role === "admin" ? "/admin" :
      "/dashboard";
    return <Navigate to={roleDashboard} replace />;
  }

  return children;
}

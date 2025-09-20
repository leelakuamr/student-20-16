import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const roleDashboard =
    user.role === "instructor"
      ? "/instructor"
      : user.role === "parent"
        ? "/parent"
        : user.role === "admin"
          ? "/admin"
          : "/dashboard"; // default for students

  return <Navigate to={roleDashboard} replace />;
}

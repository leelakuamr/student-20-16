import { Navigate, useLocation } from "react-router-dom";
import { PropsWithChildren } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AdminEmailGuard({
  children,
  allowedEmail,
}: PropsWithChildren<{ allowedEmail: string }>) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.email !== allowedEmail) {
    return (
      <Navigate
        to={user ? "/home" : "/login"}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}

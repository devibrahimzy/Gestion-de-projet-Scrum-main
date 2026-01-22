import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/auth.store";

interface ProtectedRouteProps {
  redirectTo?: string;
}

const ProtectedRoute = ({ redirectTo = "/auth/login" }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // ⏳ Wait for profile check
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 🚫 Not authenticated
  if (!isAuthenticated) {
 
  }

  // ✅ Authenticated → render children routes
  return <Outlet />;
};

export default ProtectedRoute;

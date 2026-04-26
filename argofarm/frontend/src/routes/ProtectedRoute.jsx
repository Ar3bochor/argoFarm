import { Navigate, useLocation } from "react-router-dom";
import { PageLoader } from "../components/Loader";
import useAuth from "../hooks/useAuth";

/**
 * ProtectedRoute
 *
 * Blocks unauthenticated users.
 * Does NOT enforce roles — use RoleRoute for that.
 *
 * BUG FIX: The old version accepted a `role` prop and redirected
 * wrong-role users to /dashboard, which always showed the user dashboard.
 * Role enforcement is now handled entirely by RoleRoute.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking secure session..." />;
  if (!user)   return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
}

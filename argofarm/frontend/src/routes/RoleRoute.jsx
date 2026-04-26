import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { PageLoader } from "../components/Loader";

/**
 * RoleRoute
 *
 * Extends ProtectedRoute with role enforcement.
 * Wraps a dashboard so only users with matching role can enter.
 *
 * Usage:
 *   <RoleRoute roles={["admin"]}>
 *     <AdminDashboard />
 *   </RoleRoute>
 *
 * If the user is authenticated but has the wrong role, they are
 * redirected back to their own dashboard instead of getting a blank page.
 */
export default function RoleRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking permissions..." />;

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // Wrong role → redirect to their correct dashboard
  if (roles.length && !roles.includes(user.role)) {
    if (user.role === "admin")  return <Navigate to="/admin"            replace />;
    if (user.role === "farmer") return <Navigate to="/dashboard/farmer" replace />;
    return                             <Navigate to="/dashboard/user"   replace />;
  }

  return children;
}

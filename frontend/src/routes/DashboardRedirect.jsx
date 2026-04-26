import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * DashboardRedirect
 *
 * ROOT CAUSE FIX for: "Admin/Farmer always goes to user dashboard"
 *
 * Previously, /dashboard rendered <UserDashboard /> directly.
 * This component reads user.role and sends each role to its own URL.
 *
 * Flow:
 *   admin   →  /admin
 *   farmer  →  /dashboard/farmer
 *   user    →  /dashboard/user  (default)
 */
export default function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin")  return <Navigate to="/admin"            replace />;
  if (user.role === "farmer") return <Navigate to="/dashboard/farmer" replace />;
  return                             <Navigate to="/dashboard/user"   replace />;
}

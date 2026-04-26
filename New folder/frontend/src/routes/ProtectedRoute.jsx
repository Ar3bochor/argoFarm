import { Navigate, useLocation } from "react-router-dom";
import { PageLoader } from "../components/Loader";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking secure session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
}

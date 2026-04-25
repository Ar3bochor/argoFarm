// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // loading must start as `true` inside useAuth to avoid
  // a flash-redirect to /login before auth state resolves.
  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
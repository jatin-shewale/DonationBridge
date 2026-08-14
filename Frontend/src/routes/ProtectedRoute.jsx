import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner label="Loading..." />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // A donor must not access NGO pages, an NGO must not access donor/admin pages, etc.
    const home = { donor: "/donor/dashboard", ngo: "/ngo/dashboard", admin: "/admin/dashboard" }[user.role] || "/login";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}

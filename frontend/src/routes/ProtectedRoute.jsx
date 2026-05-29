import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({
  roles = [],
  redirectTo = "/login",
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  const location = useLocation();

  /* LOADER */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="h-10 w-10 rounded-full border-4 border-[#6c63ff] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  /* NOT LOGGED IN */
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  /* ROLE BASED AUTH */
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
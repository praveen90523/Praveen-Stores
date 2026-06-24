import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "./Loader";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) {
    return <Loader />;
  }

  return isAuthenticated && user && user.role === "admin" ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};

export default AdminRoute;

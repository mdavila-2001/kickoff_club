import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../services/authStore';

export const PrivateRouteGuard = () => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

PrivateRouteGuard.displayName = 'PrivateRouteGuard';

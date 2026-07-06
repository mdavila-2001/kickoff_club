import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../services/authStore';

/**
 * Guard de inversión para páginas públicas (login/registro):
 * un usuario ya autenticado no debe volver a verlas.
 */
export const PublicRouteGuard = () => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

PublicRouteGuard.displayName = 'PublicRouteGuard';

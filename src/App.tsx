import { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Layout } from './components/organisms/Layout/Layout';
import { getNavigationForRole } from './components/organisms/Sidebar/navigation';
import { Badge } from './components/atoms/Badge/Badge';
import { PrivateRouteGuard } from './components/guards/PrivateRouteGuard';
import { PublicRouteGuard } from './components/guards/PublicRouteGuard';
import { useAuthStore } from './services/authStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MatchesPage } from './pages/MatchesPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { GroupsPage } from './pages/GroupsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminMatchesPage } from './pages/AdminMatchesPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { ToastContainer } from './components/atoms/Toast/ToastContainer';

const PrivateShell = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <Layout
      navigationTree={getNavigationForRole(user?.role)}
      userActionSlot={
        <>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            {user?.username ?? ''}
          </span>
          <Badge variant="winner">{user?.role ?? 'USER'}</Badge>
        </>
      }
    >
      <Outlet />
    </Layout>
  );
};

PrivateShell.displayName = 'PrivateShell';

const FallbackRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

FallbackRedirect.displayName = 'FallbackRedirect';

const FullscreenLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0B0D16',
    color: '#FFFFFF',
    fontFamily: "'Inter', sans-serif"
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '4px solid #1F2937',
      borderTop: '4px solid #f59e0b',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{
      fontSize: '1rem',
      fontWeight: 500,
      color: '#9CA3AF',
      letterSpacing: '0.05em'
    }}>
      Cargando sesión...
    </p>
  </div>
);

FullscreenLoader.displayName = 'FullscreenLoader';

function App() {
  const [isHydrating, setIsHydrating] = useState(true);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    let active = true;
    const initSession = async (): Promise<void> => {
      try {
        await hydrate();
      } catch (error) {
        console.error('Error al inicializar la sesión:', error);
      } finally {
        if (active) {
          setIsHydrating(false);
        }
      }
    };
    void initSession();

    return () => {
      active = false;
    };
  }, [hydrate]);

  if (isHydrating) {
    return <FullscreenLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRouteGuard />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<PrivateRouteGuard />}>
          <Route element={<PrivateShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:id" element={<MatchDetailPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/matches" element={<AdminMatchesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;


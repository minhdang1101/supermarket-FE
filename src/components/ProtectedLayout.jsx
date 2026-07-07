import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

export function ProtectedLayout() {
  const location = useLocation();
  const { loading } = useAuth();
  const isAuthenticated = authService.isAuthenticated();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <LayoutWrapper>
      <Outlet />
    </LayoutWrapper>
  );
}

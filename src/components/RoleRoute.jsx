import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Bảo vệ route theo role. Nếu user không có quyền -> redirect về /dashboard
 * @param {{ children, allowedRoles: string[] }}
 */
export function RoleRoute({ children, allowedRoles }) {
  const { role, loading } = useAuth();

  // Route không giới hạn role -> cho qua
  if (!allowedRoles || allowedRoles.length === 0) return children;

  // Đang load thông tin auth -> không render children để tránh lộ UI nhạy cảm
  if (loading) return null;

  // Đã load xong nhưng không có role -> redirect
  if (!role) return <Navigate to="/dashboard" replace />;

  // User có role hợp lệ -> cho phép truy cập
  if (allowedRoles.includes(role)) return children;

  // Role không được phép -> redirect về dashboard
  return <Navigate to="/dashboard" replace />;
}

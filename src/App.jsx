import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { RoleRoute } from '@/components/RoleRoute';
import { ROLES } from '@/config/menuRoles';

import Login from '@/page/Login/Login';
import Register from '@/page/Login/Register';
import ResetPassword from '@/page/Login/ResetPassword';
import StaffPage from '@/page/Staff/StaffPage';
import ShiftsPage from '@/page/Shifts/Shifts';
import ShiftManagement from '@/page/ShiftManagement/ShiftManagement';
import ProfilePage from '@/page/Profile/Profile';
import SettingsPage from '@/page/Settings/SettingsPage';

import './index.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="kiotviet-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<Navigate to="/staff" replace />} />
              <Route path="/dashboard" element={<Navigate to="/staff" replace />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/staff"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                    <StaffPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/shifts"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                    <ShiftsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/shift-management"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                    <ShiftManagement />
                  </RoleRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                    <SettingsPage />
                  </RoleRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

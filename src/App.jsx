import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { RoleRoute } from '@/components/RoleRoute';
import { ROLES } from '@/config/menuRoles';

// Public pages
import Login from '@/page/Login/Login';
import Register from '@/page/Login/Register';
import ResetPassword from '@/page/Login/ResetPassword';

// Protected pages
import StaffPage from '@/page/Staff/StaffPage';
import ShiftsPage from '@/page/Shifts/Shifts';
import MembersPage from '@/page/Members/MembersPage';
import CategoriesPage from '@/page/Categories/Categories';
import ProductsPage from '@/page/Products/Products';
import ProductDetailPage from '@/page/Products/ProductDetail';
import CreateProductPage from '@/page/Products/CreateProduct';
import SettingsPage from '@/page/Settings/SettingsPage';
import ProfilePage from '@/page/Profile/Profile';

// Inventory management
import SuppliersPage from '@/page/Suppliers/SuppliersPage';
import SupplierDetailPage from '@/page/Suppliers/SupplierDetail';
import PurchaseOrdersPage from '@/page/PurchaseOrders/PurchaseOrdersPage';
import CreatePurchaseOrderPage from '@/page/PurchaseOrders/CreatePurchaseOrder';
import PurchaseOrderDetailPage from '@/page/PurchaseOrders/PurchaseOrderDetail';
import GoodsReceivingPage from '@/page/GoodsReceiving/GoodsReceivingPage';
import GoodsReceivingFormPage from '@/page/GoodsReceiving/GoodsReceivingForm';

import './index.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="kiotviet-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Navigate to="/staff" replace />} />
              <Route path="/home" element={<Navigate to="/staff" replace />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/staff" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><StaffPage /></RoleRoute>} />
              <Route path="/shifts" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><ShiftsPage /></RoleRoute>} />
              <Route path="/members" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><MembersPage /></RoleRoute>} />
              <Route path="/categories" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><CategoriesPage /></RoleRoute>} />
              <Route path="/products/new" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><CreateProductPage /></RoleRoute>} />
              <Route path="/products/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><ProductDetailPage /></RoleRoute>} />
              <Route path="/products" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><ProductsPage /></RoleRoute>} />
              <Route path="/settings" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><SettingsPage /></RoleRoute>} />
              {/* Inventory Management */}
              <Route path="/suppliers" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><SuppliersPage /></RoleRoute>} />
              <Route path="/suppliers/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><SupplierDetailPage /></RoleRoute>} />
              <Route path="/purchase-orders" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><PurchaseOrdersPage /></RoleRoute>} />
              <Route path="/purchase-orders/new" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><CreatePurchaseOrderPage /></RoleRoute>} />
              <Route path="/purchase-orders/:id" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><PurchaseOrderDetailPage /></RoleRoute>} />
              <Route path="/goods-receiving" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><GoodsReceivingPage /></RoleRoute>} />
              <Route path="/goods-receiving/:poId" element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><GoodsReceivingFormPage /></RoleRoute>} />
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

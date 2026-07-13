/**
 * Phân quyền menu theo spec use case
 * 01 Login: All
 * 02 Process Sale Order: Cashier → Checkout
 * 04 Manage Products & Categories: Manager → Products, Categories
 * 06 Revenue & Profit Reports: Manager → Revenue Report
 * Administration: ADMIN → toàn quyền (xem hết)
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
};

/** Menu item: roles = array các role được phép, null = tất cả */
export const getMenuItemsForRole = (role) => {
  const menuItems = [
    { label: 'Trang Chủ', href: '/dashboard', iconKey: 'Home', roles: null },
    { label: 'Danh Mục', href: '/categories', iconKey: 'FolderOpen', roles: [ROLES.ADMIN, ROLES.MANAGER] },
    { label: 'Sản Phẩm', href: '/products', iconKey: 'Package', roles: [ROLES.ADMIN, ROLES.MANAGER] },
    { label: 'In Mã Vạch', href: '/barcode-print', iconKey: 'Barcode', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] },
    {
      label: 'Quản Lý Nhân Sự',
      iconKey: 'Users',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      submenu: [
        { label: 'Nhân Viên', href: '/staff', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { label: 'Ca Làm Việc', href: '/shifts', roles: [ROLES.ADMIN, ROLES.MANAGER] },
      ],
    },
    {
      label: 'CRM',
      iconKey: 'Heart',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      submenu: [{ label: 'Thành Viên', href: '/members', roles: [ROLES.ADMIN, ROLES.MANAGER] }],
    },
    {
      label: 'Marketing',
      iconKey: 'Tag',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      submenu: [{ label: 'Khuyến Mãi', href: '/promotions', roles: [ROLES.ADMIN, ROLES.MANAGER] }],
    },
    {
      label: 'Kho Hàng',
      iconKey: 'Truck',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      submenu: [
        { label: 'Nhà Cung Cấp', href: '/suppliers', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { label: 'Đơn Đặt Hàng', href: '/purchase-orders', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { label: 'Nhập Hàng', href: '/goods-receiving', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { label: 'Điều Chỉnh Kho', href: '/inventory-adjustment', roles: [ROLES.ADMIN, ROLES.MANAGER] },
      ],
    },
    {
      label: 'Báo Cáo',
      iconKey: 'BarChart3',
      roles: null,
      submenu: [
        { label: 'Lịch Sử Bán Hàng', href: '/sales-history', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] },
        { label: 'Kiểm Kê Kho', href: '/reports/inventory', roles: [ROLES.ADMIN, ROLES.MANAGER] },
      ],
    },
    {
      label: 'Hệ Thống',
      iconKey: 'Settings',
      roles: [ROLES.ADMIN],
      submenu: [{ label: 'Cài Đặt', href: '/settings', roles: [ROLES.ADMIN] }],
    },
    { label: 'Thu Ngân POS', href: '/checkout', iconKey: 'ShoppingCart', highlight: true, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] },
  ];

  const hasAccess = (item) => {
    if (role === ROLES.ADMIN) return true;
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  };

  return menuItems
    .filter((item) => hasAccess(item))
    .map((item) => {
      if (item.submenu) {
        const filteredSub = item.submenu.filter((s) => hasAccess(s));
        if (filteredSub.length === 0) return null;
        return { ...item, submenu: filteredSub };
      }
      return item;
    })
    .filter(Boolean);
};

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
};

export const getMenuItemsForRole = (role) => {
  const menuItems = [
    { label: 'Trang chu', href: '/dashboard', iconKey: 'Home', roles: null },
    { label: 'Danh muc', href: '/categories', iconKey: 'FolderOpen', roles: [ROLES.ADMIN, ROLES.MANAGER] },
    { label: 'San pham', href: '/products', iconKey: 'Package', roles: [ROLES.ADMIN, ROLES.MANAGER] },
    {
      label: 'Quan ly nhan su',
      iconKey: 'Users',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      submenu: [
        { label: 'Nhan vien', href: '/staff', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { label: 'Ca lam viec', href: '/shifts', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { label: 'Lich ca', href: '/shift-management', roles: [ROLES.ADMIN, ROLES.MANAGER] },
      ],
    },
    {
      label: 'CRM',
      iconKey: 'Heart',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      submenu: [{ label: 'Thanh vien', href: '/members', roles: [ROLES.ADMIN, ROLES.MANAGER] }],
    },
    {
      label: 'Kho hang',
      iconKey: 'Truck',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      submenu: [
        { label: 'Nha cung cap', href: '/suppliers', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { label: 'Don dat hang', href: '/purchase-orders', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { label: 'Nhap hang', href: '/goods-receiving', roles: [ROLES.ADMIN, ROLES.MANAGER] },
      ],
    },
    {
      label: 'He thong',
      iconKey: 'Settings',
      roles: [ROLES.ADMIN],
      submenu: [{ label: 'Cai dat', href: '/settings', roles: [ROLES.ADMIN] }],
    },
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
        const filteredSub = item.submenu.filter((subitem) => hasAccess(subitem));
        if (filteredSub.length === 0) return null;
        return { ...item, submenu: filteredSub };
      }
      return item;
    })
    .filter(Boolean);
};

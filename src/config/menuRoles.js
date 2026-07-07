export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
};

export const getMenuItemsForRole = (role) => {
  const menuItems = [
    { label: 'Trang chu', href: '/dashboard', iconKey: 'Home', roles: null },
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

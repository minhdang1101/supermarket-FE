import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Heart,
  Tag,
  BarChart3,
  Settings,
  ShoppingCart,
  Home,
  ChevronDown,
  Menu,
  Building2,
  Package,
  Truck,
  ClipboardList,
  FolderOpen,
  Barcode,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getMenuItemsForRole } from '@/config/menuRoles';
import { useAuth } from '@/contexts/AuthContext';

const ICON_MAP = {
  Home,
  FolderOpen,
  Package,
  Barcode,
  Users,
  Heart,
  Tag,
  BarChart3,
  Settings,
  ShoppingCart,
  Truck,
  ClipboardList,
  Building2,
};

export function Sidebar({ open = true, onClose }) {
  const { role } = useAuth();
  const menuItems = getMenuItemsForRole(role).map((item) => ({
    ...item,
    icon: ICON_MAP[item.iconKey] || Home,
  }));
  const location = useLocation();
  const pathname = location.pathname;
  const [expandedMenus, setExpandedMenus] = useState(['Reporting']);

  const toggleMenu = (label) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href) => pathname === href;
  const isSubmenuActive = (submenu) =>
    submenu?.some((item) => pathname === item.href);

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-b border-sidebar-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold">
                K
              </div>
              <span className="font-semibold text-lg">Kirin</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-sidebar-foreground hover:text-sidebar-accent"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon || Home;
            const isExpanded = expandedMenus.includes(item.label);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const activeSubmenu = hasSubmenu && isSubmenuActive(item.submenu);

            if (!hasSubmenu) {
              return (
                <Link
                  key={item.label}
                  to={item.href || '/'}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.href || '/')
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : item.highlight
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:opacity-90'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    activeSubmenu
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={cn(
                      'transition-transform',
                      isExpanded ? 'rotate-180' : ''
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="ml-4 space-y-1 border-l border-sidebar-border py-1">
                    {item.submenu?.map((subitem) => (
                      <Link
                        key={subitem.href}
                        to={subitem.href}
                        onClick={onClose}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                          isActive(subitem.href)
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="text-xs text-sidebar-foreground/60">
            <p className="font-semibold">Store: Café Vietnam</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}

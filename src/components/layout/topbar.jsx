import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8080';

export function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name || user?.username || 'User';
  const initials = displayName.split(/\s+/).map((s) => s[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avatarSrc = user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE}${user.avatar}`) : null;

  const handleSignOut = async () => {
    await authService.logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        {/* Left: Menu Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu size={20} />
          </Button>

          <div className="hidden sm:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm giao dịch..."
                className="pl-8 h-9"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold overflow-hidden">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="font-semibold text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.role || 'Khách'}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User size={16} className="mr-2" />
                Hồ Sơ
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell size={16} className="mr-2" />
                Thông Báo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut size={16} className="mr-2" />
                Đăng Xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

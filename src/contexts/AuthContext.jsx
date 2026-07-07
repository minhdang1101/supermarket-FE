import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { getRoleFromToken } from '@/utils/jwtUtils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(authService.getAccessToken());
  const [loading, setLoading] = useState(true);

  const roleFromToken = getRoleFromToken(accessToken);
  const role = roleFromToken ?? user?.role ?? null;

  useEffect(() => {
    const unsub = authService.tokenStore.subscribe(() => {
      setAccessToken(authService.getAccessToken());
    });
    return unsub;
  }, []);

  const tryRefreshAndInit = async () => {
    try {
      const token = await authService.refresh();
      if (token) {
        authService.setAccessToken(token);
        const u = await authService.fetchProfile();
        setUser(u);
        return true;
      }
    } catch {
      authService.tokenStore.clearToken();
    }
    return false;
  };

  const fetchProfile = async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      return null;
    }
    try {
      const u = await authService.fetchProfile();
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (authService.isAuthenticated()) {
        const u = await authService.fetchProfile();
        if (!cancelled) setUser(u);
      } else {
        await tryRefreshAndInit();
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const value = {
    user,
    role,
    loading,
    fetchProfile,
    isAuthenticated: authService.isAuthenticated(),
    setAccessToken: authService.setAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

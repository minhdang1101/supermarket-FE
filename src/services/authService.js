import apiClient from './api';
import { authHttp } from './authHttp';
import { tokenStore } from './tokenStore';

export const authService = {
  login: (username, password) => authHttp.post('/auth/login', { username, password }),

  register: (data) => apiClient.post('/auth/register', data),

  forgotPassword: (email) => authHttp.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    authHttp.post('/auth/reset-password', { token, newPassword }),

  refresh: async () => {
    const res = await authHttp.post('/auth/refresh');
    const token = res.data?.token;
    if (token) tokenStore.setToken(token);
    return token;
  },

  logout: async () => {
    try {
      await authHttp.post('/auth/logout');
    } finally {
      tokenStore.clearToken();
    }
  },

  setAccessToken: (token) => tokenStore.setToken(token),
  getAccessToken: () => tokenStore.getToken(),
  tokenStore,

  fetchProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data || null;
  },

  isAuthenticated: () => !!tokenStore.getToken(),
};

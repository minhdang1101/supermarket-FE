import axios from 'axios';
import { MESSAGES } from '@/constants';
import { tokenStore } from './tokenStore';
import { authHttp } from './authHttp';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'http://localhost:8080/api/v1');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // FormData needs multipart/form-data - let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (token ? prom.resolve(token) : prom.reject(error)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (!response) {
      error.message = MESSAGES.ERROR.NETWORK;
      return Promise.reject(error);
    }

    if (response.status === 401) {
      const isLoginRequest = originalRequest?.url?.includes('/auth/login');
      const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
      const isOnLoginPage =
        window.location.pathname === '/' || window.location.pathname === '/login';

      if (isLoginRequest || isRefreshRequest) {
        error.message = response.data?.message || 'Sai tên đăng nhập hoặc mật khẩu.';
        return Promise.reject(error);
      }

      // Thử refresh token
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await authHttp.post('/auth/refresh');
          const newToken = res.data?.token;
          if (newToken) {
            tokenStore.setToken(newToken);
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
          // Refresh succeeded but no token returned – treat as failure
          const noTokenErr = new Error('Refresh succeeded but no token returned');
          processQueue(noTokenErr, null);
          if (!isOnLoginPage) {
            tokenStore.clearToken();
            window.location.href = '/';
          }
          return Promise.reject(noTokenErr);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          if (!isOnLoginPage) {
            tokenStore.clearToken();
            window.location.href = '/';
          }
        } finally {
          isRefreshing = false;
        }
      }

      error.message = response.data?.message || 'Phiên đăng nhập đã hết hạn.';
      return Promise.reject(error);
    }

    switch (response.status) {
      case 403:
        error.message = response.data?.message || 'Bạn không có quyền thực hiện thao tác này.';
        break;
      case 404:
        error.message = response.data?.message || 'Không tìm thấy dữ liệu.';
        break;
      case 422:
        error.message = response.data?.message || MESSAGES.ERROR.VALIDATION;
        break;
      case 500:
      default:
        error.message = response.data?.message || MESSAGES.ERROR.GENERIC;
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return MESSAGES.ERROR.GENERIC;
};

export const apiRequest = async (request) => {
  const response = await request;
  return response.data;
};

export default apiClient;

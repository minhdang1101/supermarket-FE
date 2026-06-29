/**
 * In-memory access token store. Token không lưu localStorage để giảm rủi ro XSS.
 * Refresh token nằm trong httpOnly cookie - JS không đọc được.
 */
let _token = null;
const _listeners = new Set();

export const tokenStore = {
  getToken: () => _token,
  setToken: (token) => {
    _token = token;
    _listeners.forEach((cb) => cb());
  },
  clearToken: () => {
    _token = null;
    _listeners.forEach((cb) => cb());
  },
  subscribe: (callback) => {
    _listeners.add(callback);
    return () => _listeners.delete(callback);
  },
};

/**
 * Lấy thông báo lỗi từ response API backend
 * Backend trả về: { status, message, errors?, messageCode? }
 */
export function getErrorMessage(error, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  if (!error) return fallback;
  const msg = error.response?.data?.message;
  if (msg && typeof msg === 'string') return msg;
  if (error.response?.status === 401) return 'Sai tên đăng nhập hoặc mật khẩu.';
  if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (error.response?.status === 404) return 'Không tìm thấy dữ liệu.';
  if (error.message?.includes('Network') || error.code === 'ERR_NETWORK') {
    return 'Không kết nối được server. Kiểm tra backend có chạy không.';
  }
  return error.message || fallback;
}

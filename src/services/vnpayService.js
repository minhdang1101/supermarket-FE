import apiClient from './api';

const vnpayService = {
  /**
   * Create VNPay payment URL
   * @param {Object} paymentData - Payment request data
   * @param {number} paymentData.orderId - Order ID
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.orderInfo - Order description
   * @param {string} paymentData.bankCode - Bank code (optional)
   * @param {string} paymentData.language - Language (vn/en)
   * @returns {Promise} Payment URL response
   */
  createPayment: async (paymentData) => {
    const response = await apiClient.post('/payment/vnpay/create-payment', paymentData);
    return response.data;
  },

  /**
   * Process payment return from VNPay
   * @param {Object} params - Query parameters from VNPay redirect
   * @returns {Promise} Payment result
   */
  processReturn: async (params) => {
    const response = await apiClient.get('/payment/vnpay/payment-return', { params });
    return response.data;
  },

  /**
   * Get VNPay response message
   * @param {string} responseCode - VNPay response code
   * @returns {string} Human readable message
   */
  getResponseMessage: (responseCode) => {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định',
      '97': 'Chữ ký không hợp lệ',
      '99': 'Lỗi không xác định',
    };
    return messages[responseCode] || 'Lỗi không xác định';
  },
};

export default vnpayService;

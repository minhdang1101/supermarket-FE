import apiClient from './api';

/**
 * Checkout Service - POS Operations
 * 
 * @author SMS Development Team
 * @version 1.0
 */
export const checkoutService = {
  /**
   * Search products for POS display
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query (barcode or name)
   * @param {number} params.categoryId - Optional category filter
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @returns {Promise} Page of products
   */
  searchProducts: (params) => {
    return apiClient.get('/pos/products', { params });
  },

  /**
   * Get product by barcode (for scanner)
   * @param {string} barcode - Product barcode
   * @returns {Promise} Product details
   */
  getProductByBarcode: (barcode) => {
    return apiClient.get(`/pos/products/barcode/${barcode}`);
  },

  /**
   * Calculate cart totals (preview before checkout)
   * @param {Object} request - Checkout request
   * @returns {Promise} Calculated totals
   */
  calculateTotal: (request) => {
    return apiClient.post('/pos/calculate', request);
  },

  /**
   * Complete checkout - create order and update stock
   * @param {Object} request - Checkout request
   * @returns {Promise} Completed order details
   */
  completeCheckout: (request) => {
    return apiClient.post('/pos/checkout', request);
  },
};

export default checkoutService;

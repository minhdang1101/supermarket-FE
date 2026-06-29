import apiClient from './api';
import { API_ENDPOINTS, ADJUSTMENT_REASON_OPTIONS } from '@/constants';

const ENDPOINT = API_ENDPOINTS.STOCK_ADJUSTMENTS;

/**
 * Stock Adjustment service for API operations
 */
export const stockAdjustmentService = {
  /**
   * Create stock adjustment
   * @param {import('@/types').CreateStockAdjustmentData} data - Adjustment data
   * @returns {Promise} - Axios response
   */
  adjustStock: (data) => {
    return apiClient.post(ENDPOINT, data);
  },

  /**
   * Get adjustment history
   * @param {number} productId - Filter by product ID
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} - Axios response
   */
  getHistory: (productId, page = 0, size = 10) => {
    const params = { page, size };
    if (productId) params.productId = productId;
    return apiClient.get(ENDPOINT, { params });
  },

  /**
   * Create stock adjustment with individual parameters
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to adjust
   * @param {import('@/types').AdjustmentReason} reason - Adjustment reason
   * @param {string} note - Adjustment notes
   * @returns {Promise} - Axios response
   */
  create: (productId, quantity, reason, note = '') => {
    return apiClient.post(ENDPOINT, {
      productId,
      quantity,
      reason,
      note,
    });
  },
};

// Re-export for backward compatibility
export const ADJUSTMENT_REASONS = ADJUSTMENT_REASON_OPTIONS;

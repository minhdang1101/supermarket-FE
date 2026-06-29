import apiClient from './api';
import { API_ENDPOINTS } from '@/constants';

const ENDPOINT = API_ENDPOINTS.INVENTORY;

/**
 * Inventory service for API operations
 */
export const inventoryService = {
  /**
   * Get all stock levels
   * @returns {Promise} - Axios response
   */
  getAllStock: () => {
    return apiClient.get(`${ENDPOINT}/stock`);
  },

  /**
   * Get stock level for specific product
   * @param {number|string} productId - Product ID
   * @returns {Promise} - Axios response
   */
  getStockByProduct: (productId) => {
    return apiClient.get(`${ENDPOINT}/stock/${productId}`);
  },

  /**
   * Get low stock items
   * @returns {Promise} - Axios response
   */
  getLowStock: () => {
    return apiClient.get(`${ENDPOINT}/low-stock`);
  },

  /**
   * Get low stock report
   * @returns {Promise} - Axios response
   */
  getLowStockReport: () => {
    return apiClient.get('/reports/inventory/low-stock');
  },

  /**
   * Get stock movement report
   * @param {string} dateFrom - Start date (ISO format)
   * @param {string} dateTo - End date (ISO format)
   * @param {number} categoryId - Category filter
   * @returns {Promise} - Axios response
   */
  getStockMovement: (dateFrom, dateTo, categoryId) => {
    const params = {};
    if (dateFrom) {
      params.dateFrom = typeof dateFrom === 'string' ? dateFrom : dateFrom?.toISOString?.() || dateFrom;
    }
    if (dateTo) {
      params.dateTo = typeof dateTo === 'string' ? dateTo : dateTo?.toISOString?.() || dateTo;
    }
    if (categoryId) params.categoryId = categoryId;
    return apiClient.get('/reports/inventory/stock-movement', { params });
  },

  /**
   * Get expired goods report
   * @returns {Promise} - Axios response
   */
  getExpiredGoods: () => {
    return apiClient.get('/reports/inventory/expired-goods');
  },
};

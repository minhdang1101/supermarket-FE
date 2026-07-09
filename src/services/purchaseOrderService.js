import apiClient from './api';
import { API_ENDPOINTS } from '@/constants';

const ENDPOINT = API_ENDPOINTS.PURCHASE_ORDERS;

/**
 * Purchase Order service for API operations
 */
export const purchaseOrderService = {
  /**
   * Get all purchase orders with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} - Axios response
   */
  getAll: (params) => {
    return apiClient.get(ENDPOINT, { params });
  },

  /**
   * Get purchase order by ID
   * @param {number|string} id - Purchase order ID
   * @returns {Promise} - Axios response
   */
  getById: (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`);
  },

  /**
   * Create new purchase order
   * @param {import('@/types').CreatePurchaseOrderData} data - Order data
   * @returns {Promise} - Axios response
   */
  create: (data) => {
    return apiClient.post(ENDPOINT, data);
  },

  /**
   * Update purchase order status
   * @param {number|string} id - Purchase order ID
   * @param {import('@/types').OrderStatus} status - New status
   * @returns {Promise} - Axios response
   */
  updateStatus: (id, status) => {
    return apiClient.patch(`${ENDPOINT}/${id}/status`, { status });
  },

  /**
   * Search purchase orders with filters
   * @param {number} supplierId - Supplier filter
   * @param {string} status - Status filter
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @param {string} sortBy - Sort field
   * @param {string} sortDir - Sort direction
   * @returns {Promise} - Axios response
   */
  search: (supplierId, status, page = 0, size = 10, sortBy = 'orderDate', sortDir = 'desc') => {
    const params = {
      page,
      size,
      sortBy,
      sortDir,
    };
    if (supplierId) params.supplierId = supplierId;
    if (status) params.status = status;
    return apiClient.get(ENDPOINT, { params });
  },

  /**
   * Get purchase orders by supplier
   * @param {number|string} supplierId - Supplier ID
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} - Axios response
   */
  getBySupplier: (supplierId, page = 0, size = 10) => {
    return apiClient.get(ENDPOINT, {
      params: {
        supplierId,
        page,
        size,
        sortBy: 'orderDate',
        sortDir: 'desc',
      },
    });
  },
};

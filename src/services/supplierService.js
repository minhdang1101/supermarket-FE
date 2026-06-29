import apiClient from './api';
import { API_ENDPOINTS } from '@/constants';

const ENDPOINT = API_ENDPOINTS.SUPPLIERS;

/**
 * Supplier service for API operations
 */
export const supplierService = {
  /**
   * Get all suppliers with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} - Axios response
   */
  getAll: (params) => {
    return apiClient.get(ENDPOINT, { params });
  },

  /**
   * Get supplier by ID
   * @param {number|string} id - Supplier ID
   * @returns {Promise} - Axios response
   */
  getById: (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`);
  },

  /**
   * Get supplier details with purchase orders
   * @param {number|string} id - Supplier ID
   * @returns {Promise} - Axios response
   */
  getDetails: (id) => {
    return apiClient.get(`${ENDPOINT}/${id}/details`);
  },

  /**
   * Create new supplier
   * @param {import('@/types').SupplierFormData} data - Supplier data
   * @returns {Promise} - Axios response
   */
  create: (data) => {
    return apiClient.post(ENDPOINT, data);
  },

  /**
   * Update existing supplier
   * @param {number|string} id - Supplier ID
   * @param {import('@/types').SupplierFormData} data - Supplier data
   * @returns {Promise} - Axios response
   */
  update: (id, data) => {
    return apiClient.put(`${ENDPOINT}/${id}`, data);
  },

  /**
   * Toggle supplier status (active/inactive)
   * @param {number|string} id - Supplier ID
   * @returns {Promise} - Axios response
   */
  toggleStatus: (id) => {
    return apiClient.patch(`${ENDPOINT}/${id}/toggle-status`);
  },

  /**
   * Search suppliers with filters
   * @param {string} keyword - Search keyword
   * @param {string} status - Status filter
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @param {string} sortBy - Sort field
   * @param {string} sortDir - Sort direction
   * @returns {Promise} - Axios response
   */
  search: (keyword, status, page = 0, size = 10, sortBy = 'supplierId', sortDir = 'desc') => {
    const params = {
      page,
      size,
      sortBy,
      sortDir,
    };
    if (keyword) params.keyword = keyword;
    if (status === 'ACTIVE' || status === true || status === 'true') params.status = true;
    else if (status === 'INACTIVE' || status === false || status === 'false') params.status = false;
    return apiClient.get(ENDPOINT, { params });
  },
};

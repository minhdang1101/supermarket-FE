import apiClient from './api';
import { API_ENDPOINTS, PRODUCT_STATUS } from '@/constants';

const ENDPOINT = API_ENDPOINTS.PRODUCTS;

/**
 * Product service for API operations
 */
export const productService = {
  /**
   * Get all products with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} - Axios response
   */
  getAll: (params) => {
    return apiClient.get(ENDPOINT, { params });
  },

  /**
   * Get product by ID
   * @param {number|string} id - Product ID
   * @returns {Promise} - Axios response
   */
  getById: (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`);
  },

  /**
   * Get product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Promise} - Axios response
   */
  getByBarcode: (barcode) => {
    return apiClient.get(`${ENDPOINT}/barcode/${encodeURIComponent(barcode)}`);
  },

  /**
   * Create new product
   * @param {Object} data - Product data
   * @returns {Promise} - Axios response
   */
  create: (data) => {
    // Ensure new products start with stockLevel=0 unless explicitly provided
    const payload = { ...data, stockLevel: data?.stockLevel ?? 0 };
    return apiClient.post(ENDPOINT, payload);
  },

  /**
   * Update existing product
   * @param {number|string} id - Product ID
   * @param {Object} data - Product data
   * @returns {Promise} - Axios response
   */
  update: (id, data) => {
    return apiClient.put(`${ENDPOINT}/${id}`, data);
  },

  /**
   * Delete product
   * @param {number|string} id - Product ID
   * @returns {Promise} - Axios response
   */
  delete: (id) => {
    return apiClient.delete(`${ENDPOINT}/${id}`);
  },

  /**
   * Upload images for a product
   * @param {number|string} id - Product ID
   * @param {File|File[]} files - Image files
   * @returns {Promise} - Axios response
   */
  uploadImages: (id, files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((f) => formData.append('files', f));
    } else {
      formData.append('files', files);
    }
    return apiClient.post(`${ENDPOINT}/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Delete product image
   * @param {number|string} id - Product ID
   * @param {number} imageIndex - Image index
   * @returns {Promise} - Axios response
   */
  deleteImage: (id, imageIndex) => {
    return apiClient.delete(`${ENDPOINT}/${id}/images/${imageIndex}`);
  },

  /**
   * Search products with filters
   * @param {string} keyword - Search keyword
   * @param {number} categoryId - Category filter
   * @param {number} supplierId - Supplier filter
   * @param {string} status - Status filter
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @param {string} sortBy - Sort field
   * @param {string} sortDir - Sort direction
   * @returns {Promise} - Axios response
   */
  search: (paramsOrKeyword, categoryId, supplierId, status, page = 0, size = 10, sortBy = 'productId', sortDir = 'desc') => {
    let params;
    if (typeof paramsOrKeyword === 'object' && paramsOrKeyword !== null) {
      params = { ...paramsOrKeyword };
    } else {
      params = { page, size, sortBy, sortDir };
      if (paramsOrKeyword) params.keyword = paramsOrKeyword;
      if (categoryId) params.categoryId = categoryId;
      if (supplierId) params.supplierId = supplierId;
      if (status !== undefined && status !== null) params.status = status;
    }
    return apiClient.get(ENDPOINT, { params });
  },

  /**
   * Get active products for selection
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} - Axios response
   */
  getActiveProducts: (page = 0, size = 100) => {
    return apiClient.get(ENDPOINT, {
      params: {
        status: PRODUCT_STATUS.ACTIVE,
        page,
        size,
        sortBy: 'name',
        sortDir: 'asc',
      },
    });
  },
};

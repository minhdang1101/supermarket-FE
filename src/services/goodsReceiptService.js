import apiClient from './api';
import { API_ENDPOINTS } from '@/constants';

const ENDPOINT = API_ENDPOINTS.GOODS_RECEIPTS;

/**
 * Goods Receipt service for API operations
 */
export const goodsReceiptService = {
  /**
   * Get goods receipt by ID
   * @param {number|string} id - Receipt ID
   * @returns {Promise} - Axios response
   */
  getById: (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`);
  },

  /**
   * Create new goods receipt
   * @param {import('@/types').CreateGoodsReceiptData} data - Receipt data
   * @returns {Promise} - Axios response
   */
  create: (data) => {
    return apiClient.post(ENDPOINT, data);
  },

  /**
   * Receive goods from purchase order
   * @param {number|string} poId - Purchase order ID
   * @param {import('@/types').GoodsReceiptItem[]} items - Receipt items
   * @param {string} note - Receipt notes
   * @returns {Promise} - Axios response
   */
  receiveGoods: (poId, items, note = '') => {
    return apiClient.post(ENDPOINT, {
      poId,
      note,
      items,
    });
  },
};

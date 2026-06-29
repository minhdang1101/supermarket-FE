import apiClient from './api';

/**
 * Dashboard Service - Provides dashboard statistics and analytics
 * 
 * @author SMS Development Team
 * @version 1.0
 */
export const dashboardService = {
  /**
   * Get dashboard summary statistics
   * @param {string} period - Filter period: "today", "week", or "month"
   * @returns {Promise} Dashboard summary data
   */
  getSummary: (period = 'today') => {
    return apiClient.get('/dashboard/summary', { params: { period } });
  },
};

export default dashboardService;

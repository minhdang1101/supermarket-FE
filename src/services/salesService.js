import apiClient from './api';

export const salesService = {
  getSalesHistory: (params) => {
    return apiClient.get('/sales', { params });
  },
  
  getSalesOrderById: (id) => {
    return apiClient.get(`/sales/${id}`);
  },
};

import apiClient from './api';

export const promotionService = {
  getAll: (params) => {
    return apiClient.get('/promotions', { params });
  },
  
  getById: (id) => {
    return apiClient.get(`/promotions/${id}`);
  },
  
  create: (data) => {
    return apiClient.post('/promotions', data);
  },
  
  update: (id, data) => {
    return apiClient.put(`/promotions/${id}`, data);
  },
  
  delete: (id) => {
    return apiClient.delete(`/promotions/${id}`);
  },
  
  search: (keyword, discountType, applyTarget, active, page = 0, size = 10, sortBy = 'promotionId', sortDir = 'desc') => {
    const params = {
      page,
      size,
      sortBy,
      sortDir,
    };
    if (keyword) params.keyword = keyword;
    if (discountType) params.discountType = discountType;
    if (applyTarget) params.applyTarget = applyTarget;
    if (active !== undefined && active !== null) params.active = active;
    return apiClient.get('/promotions', { params });
  },
};

import apiClient from './api';

const staffApi = {
  getAllStaff: (params) => apiClient.get('/staff', { params }),
  searchStaff: (query) => apiClient.get('/staff/search', { params: { query } }),
  createStaff: (data) => apiClient.post('/staff', data),
  updateStaff: (id, data) => apiClient.put(`/staff/${id}`, data),
  deleteStaff: (id) => apiClient.delete(`/staff/${id}`),
};

export default staffApi;

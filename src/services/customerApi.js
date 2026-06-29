import apiClient from './api';

const customerApi = {
  getAllCustomers: (params) => apiClient.get('/customers', { params }),
  searchCustomers: (query) => apiClient.get('/customers/search', { params: { query } }),
  createCustomer: (data) => apiClient.post('/customers', data),
  updateCustomer: (id, data) => apiClient.put(`/customers/${id}`, data),
  deleteCustomer: (id) => apiClient.delete(`/customers/${id}`),
};

export default customerApi;

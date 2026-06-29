import apiClient from './api';

const shiftApi = {
  getShiftsBetweenDates: (start, end) =>
    apiClient.get('/shifts', { params: { start, end } }),
  getMyUpcomingShifts: () => apiClient.get('/shifts/me'),
  searchShifts: (query) => apiClient.get('/shifts/search', { params: { query } }),
  createShift: (data) => apiClient.post('/shifts', data),
  deleteShift: (id) => apiClient.delete(`/shifts/${id}`),
  getShiftsByStaff: (staffId) => apiClient.get(`/shifts/staff/${staffId}`),
};

export default shiftApi;

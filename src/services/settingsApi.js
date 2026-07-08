import apiClient from './api';

const settingsApi = {
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.put('/settings', data),
};

export default settingsApi;

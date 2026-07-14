import apiClient from './api';

export const barcodeService = {
  generateLabelsPdf: (items) => {
    return apiClient.post('/barcodes/labels/pdf', { items }, {
      responseType: 'blob',
    });
  },
};

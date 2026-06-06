import api from './api';

export const reportService = {
  getSpendingSummary: async (params = {}) => {
    const response = await api.get('/reports/spending-summary', { params });
    return response.data;
  },

  getProcurementTrends: async (lastMonths = 6) => {
    const response = await api.get('/reports/procurement-trends', { params: { lastMonths } });
    return response.data;
  },

  getVendorPerformance: async (params = {}) => {
    const response = await api.get('/reports/vendor-performance', { params });
    return response.data;
  },

  exportVendorPerformance: async (params = {}) => {
    const response = await api.get('/reports/vendor-performance/export', {
      params,
      responseType: 'blob'
    });
    return response;
  }
};

import api from './api';

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  getSpendingTrends: async (lastMonths = 6) => {
    const response = await api.get('/reports/procurement-trends', { params: { lastMonths } });
    return response.data;
  }
};

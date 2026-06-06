import api from './api';

export const quotationService = {
  getAllQuotations: async (params = {}) => {
    const response = await api.get('/quotations', { params });
    return response.data;
  },

  getQuotationById: async (id) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  },

  createQuotation: async (quotationData) => {
    const response = await api.post('/quotations', quotationData);
    return response.data;
  },

  updateQuotation: async (id, quotationData) => {
    const response = await api.put(`/quotations/${id}`, quotationData);
    return response.data;
  },

  submitQuotation: async (id) => {
    const response = await api.post(`/quotations/${id}/submit`);
    return response.data;
  },

  deleteQuotation: async (id) => {
    const response = await api.delete(`/quotations/${id}`);
    return response.data;
  },

  updateQuotationStatus: async (id, status) => {
    const response = await api.patch(`/quotations/${id}/status`, { status });
    return response.data;
  }
};

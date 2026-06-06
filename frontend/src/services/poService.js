import api from './api';

export const poService = {
  getAllPOs: async (params = {}) => {
    const response = await api.get('/purchase-orders', { params });
    return response.data;
  },

  getPOById: async (id) => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  createPO: async (poData) => {
    const response = await api.post('/purchase-orders', poData);
    return response.data;
  },

  sendPO: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/send`);
    return response.data;
  },

  updatePOStatus: async (id, status) => {
    const response = await api.patch(`/purchase-orders/${id}/status`, { status });
    return response.data;
  },

  downloadPOPdf: async (id) => {
    return api.get(`/purchase-orders/${id}/pdf`, { responseType: 'blob' });
  }
};

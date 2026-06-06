import api from './api';

export const rfqService = {
  getAllRfqs: async (params = {}) => {
    const response = await api.get('/rfqs', { params });
    return response.data;
  },

  getRfqById: async (id) => {
    const response = await api.get(`/rfqs/${id}`);
    return response.data;
  },

  createRfq: async (rfqData) => {
    const response = await api.post('/rfqs', rfqData);
    return response.data;
  },

  updateRfq: async (id, rfqData) => {
    const response = await api.put(`/rfqs/${id}`, rfqData);
    return response.data;
  },

  deleteRfq: async (id) => {
    const response = await api.delete(`/rfqs/${id}`);
    return response.data;
  },

  updateRfqStatus: async (id, status) => {
    const response = await api.patch(`/rfqs/${id}/status`, { status });
    return response.data;
  }
};

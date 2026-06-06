import api from './api';

export const invoiceService = {
  getAllInvoices: async (params = {}) => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  getInvoiceById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  sendInvoice: async (id) => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  },

  updateInvoiceStatus: async (id, status) => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },

  downloadInvoicePdf: async (id) => {
    return api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  }
};

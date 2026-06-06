import api from './api';

export const approvalService = {
  getPendingApprovals: async (params = {}) => {
    const response = await api.get('/approvals/for-me', { params });
    return response.data;
  },

  processApproval: async (id, status, comments) => {
    const response = await api.post(`/approvals/${id}/process`, { status, comments });
    return response.data;
  },

  approveAction: async (id, comments) => {
    return approvalService.processApproval(id, 'APPROVED', comments);
  },

  rejectAction: async (id, comments) => {
    return approvalService.processApproval(id, 'REJECTED', comments);
  }
};

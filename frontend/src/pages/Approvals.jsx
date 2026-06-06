import React, { useState, useEffect, useContext } from 'react';
import { Check, X, Clock, Eye } from 'lucide-react';
import { getApiErrorMessage, getList } from '../services/api';
import { approvalService } from '../services/approvalService';
import { AuthContext } from '../context/AuthContext';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasRole } = useContext(AuthContext);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      setError('');
      const data = await approvalService.getPendingApprovals();
      setApprovals(getList(data));
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
      setError(getApiErrorMessage(error, 'Failed to fetch approvals'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approvals-page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="mb-0">Pending Approvals</p>
        </div>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4 text-primary border-b pb-2">Your Approval Queue</h3>
        {error && <div className="alert alert-danger mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center my-12"><span className="spinner"></span></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reference ID</th>
                  <th>Status</th>
                  <th>Requested By</th>
                  <th>Requested At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map(approval => (
                  <tr key={approval.id}>
                    <td><strong>{approval.type || 'DOCUMENT'}</strong></td>
                    <td>{approval.referenceId ? approval.referenceId.substring(0,8) : '-'}</td>
                    <td>
                      <span className={`badge badge-${approval.status === 'APPROVED' ? 'success' : approval.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                        {approval.status || 'PENDING'}
                      </span>
                    </td>
                    <td>{approval.requestedBy || '-'}</td>
                    <td>{approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm">
                        <Eye size={16} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
                {approvals.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8">No pending approvals. You're all caught up!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .border-b { border-bottom: 1px solid var(--border-color); }
        .pb-2 { padding-bottom: 0.5rem; }
        .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.75rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
      `}</style>
    </div>
  );
};

export default Approvals;

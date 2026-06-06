import React, { useState, useEffect } from 'react';
import { Upload, Plus, Send, Eye } from 'lucide-react';
import { getApiErrorMessage, getList, getPayload } from '../services/api';
import { rfqService } from '../services/rfqService';
import { formatDate, formatEnum, shortId } from '../utils/formatters';

const Rfqs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'create'
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'Furniture',
    deadline: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    setLoading(true);
    try {
      setError('');
      const data = await rfqService.getAllRfqs();
      setRfqs(getList(data));
    } catch (error) {
      console.error('Failed to fetch RFQs:', error);
      setError(getApiErrorMessage(error, 'Failed to fetch RFQs'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      setError('');
      const data = await rfqService.createRfq({
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline ? `${formData.deadline}T23:59:00` : null,
      });

      if (data?.success === false) {
        throw new Error(data?.message || 'Failed to create RFQ');
      }

      const createdRfq = getPayload(data);
      setFormData({ title: '', category: 'Furniture', deadline: '', description: '' });
      setViewMode('list');
      setRfqs((prev) => [createdRfq, ...prev]);
    } catch (error) {
      console.error('Failed to create RFQ:', error);
      setError(getApiErrorMessage(error, 'Failed to create RFQ'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="rfqs-page animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="mb-0">Manage Requests for Quotation</p>
          </div>
          <button className="btn btn-primary" onClick={() => setViewMode('create')}>
            <Plus size={18} /> New RFQ
          </button>
        </div>

        <div className="glass-panel">
          {loading ? (
            <div className="flex justify-center my-12"><div className="spinner"></div></div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>RFQ ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map(rfq => (
                    <tr key={rfq.id}>
                      <td><span className="text-muted">{rfq.rfqNumber || shortId(rfq.id)}</span></td>
                      <td><strong>{rfq.title}</strong></td>
                      <td>
                        <span className={`badge badge-${rfq.status === 'PUBLISHED' ? 'success' : rfq.status === 'CLOSED' ? 'danger' : 'primary'}`}>
                          {formatEnum(rfq.status, 'DRAFT')}
                        </span>
                      </td>
                      <td>{formatDate(rfq.deadline)}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm">
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rfqs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8">No RFQs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rfqs-page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button className="btn btn-outline btn-sm mb-2" onClick={() => setViewMode('list')}>Back to List</button>
          <p className="mb-0">Create new request for quotation</p>
          {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
        <div className="flex gap-4">
          <button className="btn btn-primary" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner"></span> : <><Send size={18} /> Save & Create</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-panel">
          <h3 className="mb-4 text-primary border-b pb-2">1. RFQ Details</h3>
          
          <div className="form-group">
            <label className="form-label">RFQ's title*</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Furniture</option>
                <option>IT</option>
                <option>Construction</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline*</label>
              <input type="date" className="form-control" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div className="glass-panel">
            <h3 className="mb-4 text-success border-b pb-2">2. Attachments</h3>
            
            <div className="upload-area">
              <Upload size={32} className="text-muted mb-2" />
              <p>Drag & drop files or click to upload</p>
              <span className="text-muted text-sm">Supported: PDF, DOCX, JPG (Max 10MB)</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .border-b { border-bottom: 1px solid var(--border-color); }
        .pb-2 { padding-bottom: 0.5rem; }
        .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.75rem; }
        .w-full { width: 100%; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .upload-area {
          border: 2px dashed var(--border-color);
          border-radius: 0.5rem;
          padding: 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(15, 23, 42, 0.3);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .upload-area:hover {
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.05);
        }
        .text-sm { font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default Rfqs;

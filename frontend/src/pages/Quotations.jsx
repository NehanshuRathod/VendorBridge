import React, { useState, useEffect, useContext } from 'react';
import { Eye, Plus, Send, ChevronLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getApiErrorMessage, getList, getPayload } from '../services/api';
import { quotationService } from '../services/quotationService';
import { rfqService } from '../services/rfqService';
import { formatEnum, formatMoney, shortId } from '../utils/formatters';
import { ROLES } from '../constants/roles';

const getQuotationBadge = (status) => {
  if (status === 'SELECTED') return 'success';
  if (status === 'REJECTED') return 'danger';
  if (status === 'UNDER_REVIEW' || status === 'SUBMITTED') return 'warning';
  return 'primary';
};

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    rfqId: '',
    validUntil: '',
    deliveryDays: '',
    notes: '',
    items: [
      { unitPrice: '', quantity: '', notes: '' },
    ],
  });
  const { hasRole } = useContext(AuthContext);

  useEffect(() => {
    fetchQuotations();
    fetchRfqs();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      setError('');
      setSuccessMessage('');
      const data = await quotationService.getAllQuotations();
      setQuotations(getList(data));
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      setError(getApiErrorMessage(error, 'Failed to fetch quotations'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRfqs = async () => {
    try {
      const data = await rfqService.getAllRfqs();
      setRfqs(getList(data));
    } catch (error) {
      console.warn('Failed to fetch RFQs for quotation creation:', error);
    }
  };

  const handleAddQuotationItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { unitPrice: '', quantity: '', notes: '' }],
    }));
  };

  const handleRemoveQuotationItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleQuotationItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) => (
        idx === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const handleCreateQuotation = async () => {
    if (!formData.rfqId || !formData.validUntil) {
      setError('Please select an RFQ and choose a valid until date.');
      return;
    }

    const validItems = formData.items
      .map((item) => ({
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
        notes: item.notes,
      }))
      .filter((item) => item.unitPrice > 0 && item.quantity > 0);

    if (validItems.length === 0) {
      setError('Please add at least one quotation item with a positive price and quantity.');
      return;
    }

    setSubmitting(true);
    try {
      setError('');
      const createResponse = await quotationService.createQuotation({
        rfqId: formData.rfqId,
        validUntil: formData.validUntil,
        deliveryDays: formData.deliveryDays ? Number(formData.deliveryDays) : undefined,
        notes: formData.notes,
        items: validItems,
      });

      if (createResponse?.success === false) {
        throw new Error(createResponse?.message || 'Failed to create quotation');
      }

      const createdQuotation = getPayload(createResponse);
      const submitResponse = await quotationService.submitQuotation(createdQuotation.id);
      const submittedQuotation = getPayload(submitResponse) || createdQuotation;

      setQuotations((prev) => [submittedQuotation, ...prev]);
      setSuccessMessage('Quotation created and submitted successfully.');
      setFormData({
        rfqId: '',
        validUntil: '',
        deliveryDays: '',
        notes: '',
        items: [{ unitPrice: '', quantity: '', notes: '' }],
      });
      setViewMode('list');
    } catch (error) {
      console.error('Failed to create quotation:', error);
      setError(getApiErrorMessage(error, 'Failed to create quotation'));
    } finally {
      setSubmitting(false);
    }
  };

  if (viewMode === 'create') {
    return (
      <div className="quotations-page animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button className="btn btn-outline btn-sm mb-2" onClick={() => setViewMode('list')}>
              <ChevronLeft size={16} /> Back to Quotations
            </button>
            <p className="mb-0">Submit a new quotation</p>
            {error && <div className="alert alert-danger mt-4">{error}</div>}
            {successMessage && <div className="alert alert-success mt-4">{successMessage}</div>}
          </div>
          <button className="btn btn-primary" onClick={handleCreateQuotation} disabled={submitting}>
            {submitting ? 'Submitting...' : <><Send size={18} /> Submit Quotation</>}
          </button>
        </div>

        <div className="glass-panel max-w-3xl mx-auto p-6">
          <div className="form-group">
            <label className="form-label">RFQ Reference*</label>
            <select
              className="form-control"
              value={formData.rfqId}
              onChange={(e) => setFormData({ ...formData, rfqId: e.target.value })}
            >
              <option value="">Select RFQ</option>
              {rfqs.map((rfq) => (
                <option key={rfq.id} value={rfq.id}>
                  {rfq.rfqNumber || shortId(rfq.id)} - {rfq.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Valid Until*</label>
              <input
                type="date"
                className="form-control"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Days</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.deliveryDays}
                onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quotation Items*</label>
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end mb-4">
                <div className="form-group">
                  <label className="form-label">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={item.unitPrice}
                    onChange={(e) => handleQuotationItemChange(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) => handleQuotationItemChange(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Item Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.notes}
                    onChange={(e) => handleQuotationItemChange(index, 'notes', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm h-10 mt-6"
                  onClick={() => handleRemoveQuotationItem(index)}
                  disabled={formData.items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddQuotationItem}>
              Add Item
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea
              className="form-control"
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <style>{`
          .max-w-3xl { max-width: 48rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .p-6 { padding: 1.5rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-4 { gap: 1rem; }
          .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.75rem; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="quotations-page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="mb-0">Manage and compare vendor quotations</p>
        </div>
        {hasRole(ROLES.VENDOR_USER) && (
          <button className="btn btn-primary" onClick={() => setViewMode('create')}>
            <Plus size={18} /> New Quotation
          </button>
        )}
      </div>

      <div className="glass-panel">
        <h3 className="mb-4 text-primary border-b pb-2">All Quotations</h3>
        {loading ? (
          <div className="flex justify-center my-12"><span className="spinner"></span></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Quotation No</th>
                  <th>RFQ No</th>
                  <th>Vendor</th>
                  <th>Amount (INR)</th>
                  <th>Delivery (Days)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quote) => (
                  <tr key={quote.id}>
                    <td><span className="text-muted">{quote.quotationNumber || shortId(quote.id)}</span></td>
                    <td>{quote.rfqNumber || '-'}</td>
                    <td><strong>{quote.vendorName || '-'}</strong></td>
                    <td>{formatMoney(quote.totalAmount)}</td>
                    <td>{quote.deliveryDays || '-'}</td>
                    <td>
                      <span className={`badge badge-${getQuotationBadge(quote.status)}`}>
                        {formatEnum(quote.status, 'DRAFT')}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm">
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {quotations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8">No quotations found.</td>
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

export default Quotations;

import React, { useContext, useState, useEffect } from 'react';
import { Download, Printer, Mail, Eye } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getApiErrorMessage, getList, getPayload } from '../services/api';
import { poService } from '../services/poService';
import { formatDate, formatEnum, formatMoney, shortId } from '../utils/formatters';
import { BUYER_ROLES } from '../constants/roles';

const getPoBadge = (status) => {
  if (status === 'DELIVERED' || status === 'ACKNOWLEDGED') return 'success';
  if (status === 'CANCELLED') return 'danger';
  if (status === 'SENT_TO_VENDOR' || status === 'IN_PROGRESS' || status === 'PARTIALLY_DELIVERED') return 'warning';
  return 'primary';
};

const PurchaseOrders = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPo, setSelectedPo] = useState(null);
  const [error, setError] = useState('');
  const { hasRole } = useContext(AuthContext);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      setError('');
      const data = await poService.getAllPOs();
      setPos(getList(data));
    } catch (error) {
      console.error('Failed to fetch POs:', error);
      setError(getApiErrorMessage(error, 'Failed to fetch purchase orders'));
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    setLoading(true);
    try {
      setError('');
      const data = await poService.getPOById(id);
      setSelectedPo(getPayload(data) || data?.data || data);
    } catch (error) {
      console.error('Failed to fetch PO details:', error);
      setError(getApiErrorMessage(error, 'Failed to fetch purchase order details'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      setError('');
      const response = await poService.downloadPOPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `po-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PO PDF:', error);
      setError(getApiErrorMessage(error, 'Failed to download purchase order PDF'));
    }
  };

  const handleSendPo = async (id) => {
    try {
      setError('');
      const data = await poService.sendPO(id);
      if (data?.success === false) {
        throw new Error(data?.message || 'Failed to send purchase order');
      }
      setSelectedPo((current) => current ? { ...current, status: 'SENT_TO_VENDOR' } : current);
      fetchPOs();
    } catch (error) {
      console.error('Failed to send PO:', error);
      setError(getApiErrorMessage(error, 'Failed to send purchase order'));
    }
  };

  if (selectedPo) {
    return (
      <div className="pos-page animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button className="btn btn-outline btn-sm mb-2" onClick={() => setSelectedPo(null)}>Back to List</button>
            <p className="mb-0">{selectedPo.poNumber || `PO-${shortId(selectedPo.id)}`} - {formatEnum(selectedPo.status, 'Generated')}</p>
            {error && <div className="alert alert-danger mt-4">{error}</div>}
          </div>
          <div className="flex gap-4">
            <button className="btn btn-secondary" onClick={() => handleDownloadPdf(selectedPo.id)}>
              <Download size={18} /> PDF
            </button>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={18} /> Print
            </button>
            {hasRole(BUYER_ROLES) && (
              <button className="btn btn-primary" onClick={() => handleSendPo(selectedPo.id)}>
                <Mail size={18} /> Email
              </button>
            )}
          </div>
        </div>

        <div className="glass-panel max-w-4xl mx-auto p-8">
          <div className="flex justify-between border-b pb-6 mb-6">
            <div>
              <h2 className="text-primary mb-2">PURCHASE ORDER</h2>
              <p className="text-muted mb-0">PO Number: <strong>{selectedPo.poNumber || `PO-${shortId(selectedPo.id)}`}</strong></p>
              <p className="text-muted mb-0">Date: <strong>{formatDate(selectedPo.createdAt)}</strong></p>
            </div>
            <div className="text-right">
              <h2>VendorBridge</h2>
              <p className="text-muted text-sm mb-0">123 Business Park, Ahmedabad</p>
              <p className="text-muted text-sm mb-0">GSTIN: 25383438AFB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 mb-8 gap-8">
            <div>
              <p className="text-sm text-muted mb-1 text-uppercase">Vendor</p>
              <h4 className="mb-1">{selectedPo.vendorName || 'Unknown Vendor'}</h4>
              <p className="text-sm text-muted mb-0">{selectedPo.deliveryAddress || 'Address unavailable'}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1 text-uppercase">Ship To</p>
              <h4 className="mb-1">VendorBridge HQ</h4>
              <p className="text-sm text-muted mb-0">123 Business Park, Ahmedabad, Gujarat</p>
              <p className="text-sm text-muted mb-0">Attn: Receiving Dept</p>
            </div>
          </div>

          <div className="table-container mb-8">
            <table className="po-table w-full">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Unit Price (INR)</th>
                  <th className="text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                {selectedPo.items && selectedPo.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.itemName || item.productName || item.description || '-'}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatMoney(item.unitPrice)}</td>
                    <td className="text-right">{formatMoney(item.totalPrice || item.totalAmount)}</td>
                  </tr>
                ))}
                {(!selectedPo.items || selectedPo.items.length === 0) && (
                  <tr><td colSpan="4" className="text-center">No items listed.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="totals-box">
              <div className="flex justify-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>{formatMoney(selectedPo.totalAmount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Tax</span>
                <span>{formatMoney(selectedPo.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg mt-4 pt-4 border-t">
                <span className="font-bold text-primary">Grand Total</span>
                <span className="font-bold text-primary">{formatMoney(selectedPo.grandTotal || selectedPo.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .max-w-4xl { max-width: 56rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .p-8 { padding: 2rem; }
          .pb-6 { padding-bottom: 1.5rem; }
          .border-b { border-bottom: 1px solid var(--border-color); }
          .border-t { border-top: 1px solid var(--border-color); }
          .text-sm { font-size: 0.875rem; }
          .text-lg { font-size: 1.125rem; }
          .text-uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
          .font-bold { font-weight: 700; }
          .gap-8 { gap: 2rem; }
          .w-full { width: 100%; }
          .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.75rem; }

          .po-table th {
            background-color: rgba(15, 23, 42, 0.5);
            color: var(--text-main);
            font-weight: 600;
          }

          .po-table td {
            padding: 1.25rem 1rem;
            border-bottom: 1px solid var(--border-color);
          }

          .totals-box {
            width: 300px;
            background: rgba(15, 23, 42, 0.3);
            padding: 1.5rem;
            border-radius: 0.5rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pos-page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="mb-0">Manage Purchase Orders</p>
        </div>
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
                  <th>PO Number</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Amount (INR)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pos.map(po => (
                  <tr key={po.id}>
                    <td><span className="text-muted">{po.poNumber || `PO-${shortId(po.id)}`}</span></td>
                    <td><strong>{po.vendorName || 'Unknown Vendor'}</strong></td>
                    <td>{formatDate(po.createdAt)}</td>
                    <td>{formatMoney(po.grandTotal || po.totalAmount)}</td>
                    <td>
                      <span className={`badge badge-${getPoBadge(po.status)}`}>
                        {formatEnum(po.status, 'Draft')}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleView(po.id)}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {pos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8">No Purchase Orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`
        .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.75rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
      `}</style>
    </div>
  );
};

export default PurchaseOrders;

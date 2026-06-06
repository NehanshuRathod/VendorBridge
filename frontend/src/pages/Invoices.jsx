import React, { useState, useEffect } from 'react';
import { Download, CreditCard, Eye } from 'lucide-react';
import { getApiErrorMessage, getList, getPayload } from '../services/api';
import { invoiceService } from '../services/invoiceService';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      setError('');
      const data = await invoiceService.getAllInvoices();
      setInvoices(getList(data));
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setError(getApiErrorMessage(error, 'Failed to fetch invoices'));
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    setLoading(true);
    try {
      setError('');
      const data = await invoiceService.getInvoiceById(id);
      setSelectedInvoice(getPayload(data) || data?.data || data);
    } catch (error) {
      console.error('Failed to fetch invoice details:', error);
      setError(getApiErrorMessage(error, 'Failed to fetch invoice details'));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await invoiceService.updateInvoiceStatus(id, 'PAID');
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice({ ...selectedInvoice, status: 'PAID' });
      }
      fetchInvoices();
    } catch (error) {
      console.error('Failed to pay invoice:', error);
    }
  };

  if (selectedInvoice) {
    return (
      <div className="invoices-page animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button className="btn btn-outline btn-sm mb-2" onClick={() => setSelectedInvoice(null)}>← Back to List</button>
            <p className="mb-0">Invoice Details</p>
          </div>
          <div className="flex gap-4">
            {selectedInvoice.status !== 'PAID' && (
              <button className="btn btn-primary" onClick={() => handlePay(selectedInvoice.id)}>
                <CreditCard size={18} /> Mark as Paid
              </button>
            )}
          </div>
        </div>

        <div className="glass-panel max-w-4xl mx-auto p-8 relative overflow-hidden">
          {error && <div className="alert alert-danger mb-4">{error}</div>}
          {selectedInvoice.status !== 'PAID' ? (
            <div className="absolute top-6 right-[-40px] bg-warning text-white font-bold py-1 px-12 rotate-45 shadow-md">
              PENDING PAYMENT
            </div>
          ) : (
            <div className="absolute top-6 right-[-40px] bg-success text-white font-bold py-1 px-12 rotate-45 shadow-md">
              PAID
            </div>
          )}

          <div className="flex justify-between border-b pb-6 mb-6">
            <div>
              <h2 className="text-secondary mb-2">INVOICE</h2>
              <p className="text-muted mb-0">Invoice #: <strong>{selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id.substring(0,8)}`}</strong></p>
              <p className="text-muted mb-0">PO Number: <strong>{selectedInvoice.poNumber || '-'}</strong></p>
              <p className="text-muted mb-0">Date: <strong>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</strong></p>
              <p className="text-muted mb-0">Due Date: <strong className={selectedInvoice.status !== 'PAID' ? "text-warning" : ""}>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : '-'}</strong></p>
            </div>
            <div className="text-right mt-12 pr-12">
              <h2>{selectedInvoice.vendorName || selectedInvoice.vendor?.name || 'Unknown Vendor'}</h2>
              <p className="text-muted text-sm mb-0">Vendor Address</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm text-muted mb-1 text-uppercase">Bill To</p>
            <h4 className="mb-1">VendorBridge</h4>
            <p className="text-sm text-muted mb-0">123 Business Park, Ahmedabad, Gujarat</p>
            <p className="text-sm text-muted mb-0">GSTIN: 25383438AFB</p>
          </div>

          <div className="table-container mb-8">
            <table className="invoice-table w-full">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Unit Price (₹)</th>
                  <th className="text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items && selectedInvoice.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.itemName}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.unitPrice ? item.unitPrice.toLocaleString() : '0'}</td>
                    <td className="text-right">{item.totalPrice ? item.totalPrice.toLocaleString() : '0'}</td>
                  </tr>
                ))}
                {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                  <tr><td colSpan="4" className="text-center">No items found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-end">
            <div className="payment-info">
              <h4 className="mb-2">Payment Details</h4>
              <p className="text-sm text-muted mb-1">Bank: HDFC Bank</p>
              <p className="text-sm text-muted mb-1">A/C No: 50200012345678</p>
              <p className="text-sm text-muted mb-0">IFSC: HDFC0001234</p>
            </div>
            <div className="totals-box">
              <div className="flex justify-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>₹ {selectedInvoice.subTotal ? selectedInvoice.subTotal.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Tax</span>
                <span>₹ {selectedInvoice.taxAmount ? selectedInvoice.taxAmount.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between text-lg mt-4 pt-4 border-t">
                <span className="font-bold text-secondary">Grand Total</span>
                <span className="font-bold text-secondary">₹ {selectedInvoice.totalAmount ? selectedInvoice.totalAmount.toLocaleString() : '0'}</span>
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
          .relative { position: relative; }
          .absolute { position: absolute; }
          .overflow-hidden { overflow: hidden; }
          .top-6 { top: 1.5rem; }
          .right-\[-40px\] { right: -40px; }
          .bg-warning { background-color: var(--warning); }
          .bg-success { background-color: var(--success); }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .px-12 { padding-left: 3rem; padding-right: 3rem; }
          .rotate-45 { transform: rotate(45deg); }
          .mt-12 { margin-top: 3rem; }
          .pr-12 { padding-right: 3rem; }
          .items-end { align-items: flex-end; }
          .w-full { width: 100%; }
          .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.75rem; }

          .invoice-table th {
            background-color: rgba(15, 23, 42, 0.5);
            color: var(--text-main);
            font-weight: 600;
          }

          .invoice-table td {
            padding: 1.25rem 1rem;
            border-bottom: 1px solid var(--border-color);
          }

          .totals-box {
            width: 300px;
            background: rgba(15, 23, 42, 0.3);
            padding: 1.5rem;
            border-radius: 0.5rem;
          }

          .payment-info {
            padding: 1.5rem;
            border: 1px dashed var(--border-color);
            border-radius: 0.5rem;
            background: rgba(255, 255, 255, 0.02);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="invoices-page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="mb-0">Manage Vendor Invoices</p>
        </div>
      </div>

      <div className="glass-panel">
        {loading ? (
          <div className="flex justify-center my-12"><span className="spinner"></span></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>PO No</th>
                  <th>Vendor</th>
                  <th>Due Date</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td><span className="text-muted">{inv.invoiceNumber || `INV-${inv.id.substring(0,8)}`}</span></td>
                    <td>{inv.poNumber || '-'}</td>
                    <td><strong>{inv.vendorName || inv.vendor?.name || 'Unknown Vendor'}</strong></td>
                    <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                    <td>{inv.totalAmount ? inv.totalAmount.toLocaleString() : '0'}</td>
                    <td>
                      <span className={`badge badge-${inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'danger' : 'warning'}`}>
                        {inv.status || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleView(inv.id)}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8">No invoices found.</td>
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

export default Invoices;

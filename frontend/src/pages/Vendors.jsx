import React, { useState, useEffect } from 'react';
import { getApiErrorMessage, getList } from '../services/api';
import { vendorService } from '../services/vendorService';
import { Search, Plus, Eye } from 'lucide-react';
import { formatEnum, safeText } from '../utils/formatters';

const getVendorName = (vendor) => safeText(vendor.companyName || vendor.name, 'Unknown Vendor');
const getVendorGst = (vendor) => safeText(vendor.gstNumber || vendor.gst);
const getVendorPhone = (vendor) => safeText(vendor.contactPhone || vendor.phone);

const getVendorBadge = (status) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'BLACKLISTED') return 'danger';
  if (status === 'PENDING_APPROVAL') return 'warning';
  return 'primary';
};

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setError('');
        const data = await vendorService.getAllVendors();
        setVendors(getList(data));
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
        setError(getApiErrorMessage(error, 'Failed to fetch vendors'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => 
    [
      getVendorName(v),
      v.category,
      getVendorGst(v),
      v.contactName,
      v.contactEmail,
      getVendorPhone(v)
    ].some((value) => String(value || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="vendors-page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="mb-0">Manage supplier profiles and registrations</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Vendor
        </button>
      </div>

      <div className="glass-panel">
        <div className="flex justify-between items-center mb-6">
          <div className="tabs">
            <button className="tab active">All ({vendors.length})</button>
            <button className="tab">Active ({vendors.filter(v => v.status === 'ACTIVE').length})</button>
            <button className="tab">Pending ({vendors.filter(v => v.status === 'PENDING_APPROVAL').length})</button>
            <button className="tab">Blocked ({vendors.filter(v => v.status === 'BLACKLISTED').length})</button>
          </div>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, GST, category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12"><div className="spinner"></div></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Category</th>
                  <th>GST No.</th>
                  <th>Contact No.</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td><strong>{getVendorName(vendor)}</strong></td>
                    <td>{formatEnum(vendor.category)}</td>
                    <td>{getVendorGst(vendor)}</td>
                    <td>{getVendorPhone(vendor)}</td>
                    <td>
                      <span className={`badge badge-${getVendorBadge(vendor.status)}`}>
                        {formatEnum(vendor.status)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm">
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8">No vendors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .tabs {
          display: flex;
          gap: 1rem;
        }

        .tab {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .tab:hover {
          color: var(--text-main);
        }

        .tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .search-box {
          position: relative;
          width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-box input {
          padding-left: 2.75rem;
        }

        .btn-sm {
          padding: 0.4rem 0.75rem;
          font-size: 0.75rem;
        }

        .py-8 {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Vendors;

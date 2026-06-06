'use client';

import React, { useState } from 'react';
import { Vendor } from '../lib/types';
import { Users, Search, Filter, Plus, ShieldCheck, AlertCircle, Check, X, ShieldAlert, Phone, Mail } from 'lucide-react';

interface VendorViewProps {
  vendors: Vendor[];
  currentRole: string;
  onAddVendor: (v: Vendor) => void;
  onUpdateVendorStatus: (id: string, status: "Active" | "Pending" | "Blocked") => void;
}

export function VendorView({ vendors, currentRole, onAddVendor, onUpdateVendorStatus }: VendorViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('IT Hardware & Networks');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNo, setGstNo] = useState('');

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactName || !email || !gstNo) return;

    const newVendor: Vendor = {
      id: `VND-${Math.floor(100 + Math.random() * 900)}`,
      name,
      category,
      contactName,
      email,
      phone: phone || '+91 99999 88888',
      gstNo,
      rating: 5.0, // Start with high rating
      status: currentRole === 'Admin' ? 'Active' : 'Pending', // Admin activates immediately, others submit as pending
      joinedDate: new Date().toISOString()
    };

    onAddVendor(newVendor);
    setShowAddModal(false);
    
    // Reset states
    setName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setGstNo('');
  };

  // Filtering
  const categories = ['All', 'IT Hardware & Networks', 'Office Furniture', 'Logistics & Moving', 'Breakroom & Maintenance'];
  
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.gstNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div id="vendor-view" className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center flex-wrap gap-4 select-none">
        <div>
          <h2 className="font-sans font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500 scale-110" />
            Supplier Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Registered corporate vendors, regulatory tax compliance, and performance ratings
          </p>
        </div>

        {/* Register Button - available to Admin or Procurement Officers */}
        {(currentRole === 'Admin' || currentRole === 'Procurement') && (
          <button
            id="open-register-vendor-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 shadow-md shadow-indigo-500/10 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Onboard New Supplier
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div id="search-filter-hud" className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800 p-4 rounded-2xl">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            id="vendor-search-input"
            type="text"
            placeholder="Search by legal name, representative or GST Tax ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-white placeholder-slate-400 shadow-inner"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            id="vendor-category-dropdown"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 dark:text-white cursor-pointer"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat === 'All' ? 'All Divisions' : cat}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            id="vendor-status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 dark:text-white cursor-pointer"
          >
            <option value="All">All Compliance States</option>
            <option value="Active">Active / Approved</option>
            <option value="Pending">Awaiting Audit</option>
            <option value="Blocked">Blocked / Non-Compliant</option>
          </select>
        </div>
      </div>

      {/* Directory Table Grid (with 3D-feeling hover items) */}
      <div id="vendor-directory-table" className="rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-900/20 border-b border-slate-100 dark:border-zinc-900 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
                <th className="p-4">Legal Supplier Entity</th>
                <th className="p-4">Division Code</th>
                <th className="p-4">Tax / GST Number</th>
                <th className="p-4">Compliance Rating</th>
                <th className="p-4">Sourcing Trust Status</th>
                {(currentRole === 'Admin' || currentRole === 'Procurement') && <th className="p-4 text-right">Moderations</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400 font-sans">
                    No compliant suppliers found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/30 transition-all duration-200 group">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {vendor.name}
                        </div>
                        <div className="text-slate-400 text-[10.5px] mt-0.5 flex items-center gap-2">
                          <span>Rep: {vendor.contactName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" /> {vendor.email}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" /> {vendor.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-zinc-300">
                      {vendor.category}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-600 dark:text-zinc-400">
                      {vendor.gstNo}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400 font-bold font-sans">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx} className={idx < Math.floor(vendor.rating) ? 'opacity-100' : 'opacity-20'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="font-mono font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">
                          {vendor.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 select-none">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                        vendor.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
                          : vendor.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/60'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/60'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          vendor.status === 'Active' ? 'bg-emerald-500' : vendor.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {vendor.status === 'Active' ? 'ERP Approved' : vendor.status === 'Pending' ? 'Awaiting Audit' : 'Blocked Entity'}
                      </span>
                    </td>
                    
                    {/* Actions Panel - Admin can block, active, unblock. Procurement can suggest block */}
                    {(currentRole === 'Admin' || currentRole === 'Procurement') && (
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          {vendor.status !== 'Active' && currentRole === 'Admin' && (
                            <button
                              id={`approve-vendor-${vendor.id}`}
                              onClick={() => onUpdateVendorStatus(vendor.id, 'Active')}
                              className="p-1 px-2 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg cursor-pointer flex items-center gap-0.5 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                              title="Approve Status"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                          )}
                          {vendor.status !== 'Blocked' && (
                            <button
                              id={`block-vendor-${vendor.id}`}
                              onClick={() => {
                                if (currentRole === 'Admin') {
                                  onUpdateVendorStatus(vendor.id, 'Blocked');
                                } else {
                                  alert("Procurement Officer action requested: flagging this supplier to super administrators for non-compliance block.");
                                }
                              }}
                              className="p-1 px-2 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg cursor-pointer flex items-center gap-0.5 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900"
                              title="Block status"
                            >
                              <X className="h-3.5 w-3.5" /> {currentRole === 'Admin' ? 'Block' : 'Flag Block'}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Onboard Supplier Form */}
      {showAddModal && (
        <div id="add-vendor-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl shadow-black/80 max-w-lg w-full overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="bg-indigo-600 dark:bg-indigo-950/40 p-6 text-white border-b border-indigo-700 dark:border-zinc-800 flex justify-between items-center select-none">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5.5 w-5.5 text-indigo-200" />
                <div>
                  <h3 className="font-sans font-bold text-lg leading-tight">Supplier Intake Process</h3>
                  <p className="text-[11px] text-indigo-200">Onboard verified corporate vendor entities</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateVendor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">Legal Supplier Entity Name *</label>
                <input
                  id="new-vendor-name"
                  type="text"
                  required
                  placeholder="e.g. Acme Industrial Sourcing Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">Supply Division Code *</label>
                  <select
                    id="new-vendor-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 dark:text-white cursor-pointer"
                  >
                    {categories.slice(1).map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">National Tax ID / GSTIN *</label>
                  <input
                    id="new-vendor-gst"
                    type="text"
                    required
                    placeholder="e.g. 27AAPCA1234A1Z0"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">Supplier Representative *</label>
                <input
                  id="new-vendor-contact"
                  type="text"
                  required
                  placeholder="e.g. Marcus Aurelius"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">Secure Bidding Email *</label>
                  <input
                    id="new-vendor-email"
                    type="email"
                    required
                    placeholder="e.g. sales@vendor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">Corporate Phone Number</label>
                  <input
                    id="new-vendor-phone"
                    type="tel"
                    placeholder="e.g. +91 99999 77777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-xl border border-indigo-100/50 dark:border-indigo-900 text-[11px] flex gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {currentRole === 'Admin' 
                    ? 'Superuser session active. Onboarded supplier is immediately activated in matching procurement chains.'
                    : 'Intake will create a "Pending Audit" state. System administrators must approve to participate in bidding.'}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-register-vendor-btn"
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/10 cursor-pointer"
                >
                  Confirm Supplier Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

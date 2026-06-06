'use client';

import React, { useState } from 'react';
import { Rfq, Vendor, Quotation } from '../lib/types';
import { FileText, Plus, Search, Calendar, Inbox, Users, Send, Paperclip, ChevronRight, Check } from 'lucide-react';
import { formatDate } from '../lib/utils';


interface RfqViewProps {
  rfqs: Rfq[];
  vendors: Vendor[];
  currentRole: string;
  actingVendorId?: string; // If role is Vendor, which vendor are they representing
  quotations: Quotation[];
  onCreateRfq: (r: Rfq) => void;
  onOpenBidForm?: (rfq: Rfq) => void;
  onNavigateToComparison?: (rfqId: string) => void;
}

export function RfqView({
  rfqs,
  vendors,
  currentRole,
  actingVendorId,
  quotations,
  onCreateRfq,
  onOpenBidForm,
  onNavigateToComparison
}: RfqViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('IT Hardware & Networks');
  const [deadline, setDeadline] = useState('2026-06-30');
  const [description, setDescription] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');

  const activeVendors = vendors.filter(v => v.status === 'Active');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !item || quantity <= 0 || selectedVendors.length === 0) {
      alert("Please configure the title, item, quantity, and invite at least one vendor.");
      return;
    }

    const newRfq: Rfq = {
      id: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      item,
      quantity: Number(quantity),
      category,
      deadline,
      description,
      assignedVendors: selectedVendors,
      status: "Bidding Open",
      createdAt: new Date().toISOString(),
      selectedQuotationId: null,
      creator: "Sanjay Kumar"
    };

    onCreateRfq(newRfq);
    setShowCreateModal(false);

    // Reset
    setTitle('');
    setItem('');
    setQuantity(1);
    setCategory('IT Hardware & Networks');
    setDescription('');
    setSelectedVendors([]);
    setFileName('');
  };

  const toggleVendorSelection = (vId: string) => {
    if (selectedVendors.includes(vId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vId));
    } else {
      setSelectedVendors([...selectedVendors, vId]);
    }
  };

  // Filter based on role
  // Vendors should only see RFQs that they are assigned to
  const filteredRfqs = rfqs.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.item.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (currentRole === 'Vendor' && actingVendorId) {
      return matchesSearch && r.assignedVendors.includes(actingVendorId);
    }
    return matchesSearch;
  });

  return (
    <div id="rfq-view" className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center flex-wrap gap-4 select-none">
        <div>
          <h2 className="font-sans font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500 scale-110" />
            Request For Quotations (RFQ)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Issue material requirements, specify service delivery guidelines, and invite vetted supplier bidding
          </p>
        </div>

        {currentRole === 'Procurement' && (
          <button
            id="open-create-rfq-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 shadow-md shadow-indigo-500/10 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Issue New RFQ Tender
          </button>
        )}
      </div>

      {/* Search HUD */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
        <input
          id="rfq-search-input"
          type="text"
          placeholder="Filter RFQ tenders by serial reference, workspace item, title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl py-2.5 pl-11 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white placeholder-slate-400 shadow-inner"
        />
      </div>

      {/* Tender RFQs List Grid (Styled as floating 3D Cards) */}
      <div id="rfq-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRfqs.length === 0 ? (
          <div className="md:col-span-12 text-center p-12 bg-slate-50/50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
            <Inbox className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No active RFQ tenders found matching your query.</p>
          </div>
        ) : (
          filteredRfqs.map((rfq) => {
            const dateStr = formatDate(rfq.createdAt);
            const deadlineStr = formatDate(rfq.deadline);
            
            // Check quotation counts
            const quoteCount = quotations.filter(q => q.rfqId === rfq.id).length;
            const alreadyBid = quotations.some(q => q.rfqId === rfq.id && q.vendorId === actingVendorId);

            return (
              <div
                id={`rfq-card-${rfq.id}`}
                key={rfq.id}
                className="group relative rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                      {rfq.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold select-none ${
                      rfq.status === 'Completed'
                        ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                        : rfq.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : rfq.status === 'Pending Approval'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        : rfq.status === 'Bids Received'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 animate-pulse'
                    }`}>
                      {rfq.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                      {rfq.title}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {rfq.description || rfq.item}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500 dark:text-zinc-400 select-none py-2 border-y border-slate-50 dark:border-zinc-900">
                    <div>
                      <span className="block text-slate-400 text-[9px] uppercase tracking-wider">Demand</span>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {rfq.quantity} Unit / {rfq.category}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px] uppercase tracking-wider">Bids In</span>
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {quoteCount} Quotations
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 flex justify-between items-center flex-wrap gap-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-300" />
                    <span>Closes: {deadlineStr}</span>
                  </div>

                  {/* Context-aware CTA button */}
                  {currentRole === 'Vendor' && onOpenBidForm && (
                    <button
                      id={`bid-rfq-${rfq.id}`}
                      onClick={() => onOpenBidForm(rfq)}
                      disabled={alreadyBid || rfq.status === 'Completed' || rfq.status === 'Approved'}
                      className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg border transition-all duration-300 cursor-pointer ${
                        alreadyBid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed dark:bg-emerald-950/20'
                          : rfq.status === 'Completed' || rfq.status === 'Approved'
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 hover:shadow-md'
                      }`}
                    >
                      {alreadyBid ? (
                        <span className="flex items-center gap-0.5"><Check className="h-3 w-3" /> Bid Submitted</span>
                      ) : (
                        'Submit Price Quote'
                      )}
                    </button>
                  )}

                  {currentRole === 'Procurement' && onNavigateToComparison && (
                    <button
                      id={`compare-rfq-${rfq.id}`}
                      onClick={() => onNavigateToComparison(rfq.id)}
                      className="px-3 py-1.5 text-[10.5px] font-bold rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-slate-800 dark:text-white dark:border-zinc-800 hover:text-indigo-600 flex items-center gap-0.5 cursor-pointer dark:hover:bg-zinc-900"
                    >
                      Bid Matrices <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal - Draft Tender RFQ */}
      {showCreateModal && (
        <div id="create-rfq-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl shadow-black/80 max-w-lg w-full overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="bg-indigo-600 dark:bg-indigo-950/40 p-6 text-white border-b border-indigo-700 dark:border-zinc-800 flex justify-between items-center select-none">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5.5 w-5.5 text-indigo-200" />
                <div>
                  <h3 className="font-sans font-bold text-lg leading-tight">Create Sourcing Tender (RFQ)</h3>
                  <p className="text-[11px] text-indigo-200">Issue corporate bidding parameters for registered vendors</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none font-sans">RFQ Tender Title *</label>
                <input
                  id="new-rfq-title"
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Office Chairs Replacement Series"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none font-sans">Item / Model *</label>
                  <input
                    id="new-rfq-item"
                    type="text"
                    required
                    placeholder="e.g. Mesh-back Chairs with armrest"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none font-sans">Target Qty *</label>
                    <input
                      id="new-rfq-qty"
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none font-sans">Timeline SLA</label>
                    <input
                      id="new-rfq-dl"
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-1.5 px-2 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-705 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">Procurement division</label>
                  <select
                    id="new-rfq-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white cursor-pointer"
                  >
                    <option value="IT Hardware & Networks">IT Hardware & Networks</option>
                    <option value="Office Furniture">Office Furniture</option>
                    <option value="Logistics & Moving">Logistics & Moving</option>
                    <option value="Breakroom & Maintenance">Breakroom & Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">Line Specifications Sheet</label>
                  <div className="relative">
                    <Paperclip className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                    <input
                      id="new-rfq-attachment"
                      type="text"
                      placeholder="Add Sheet Attachment Name (e.g. specs-v2.pdf)"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 pl-9 px-3 text-[11px] focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 select-none">Technical Criteria Description</label>
                <textarea
                  id="new-rfq-desc"
                  rows={2}
                  placeholder="Detail dimensional tolerances, certifications required, custom color ranges or compatibility requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-705 dark:text-zinc-300 mb-2 select-none flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-indigo-500" />
                  Select Registered Vendors to Invite *
                </label>
                
                {activeVendors.length === 0 ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                    Please onboard suppliers in division first to invite bidders.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1.5 bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl border border-slate-100 dark:border-zinc-900">
                    {activeVendors.map((v) => {
                      const isSelected = selectedVendors.includes(v.id);
                      return (
                        <button
                          id={`select-vendor-${v.id}`}
                          type="button"
                          key={v.id}
                          onClick={() => toggleVendorSelection(v.id)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-[11px] text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400'
                              : 'bg-white border-slate-200 text-slate-700 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-bold block truncate">{v.name}</span>
                            <span className="text-[9px] text-slate-400 truncate">{v.category}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-indigo-500 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-rfq-btn"
                  type="submit"
                  disabled={selectedVendors.length === 0}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/10 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Issue Tender & Invite Bids
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// X icon helper since we use it in modals
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

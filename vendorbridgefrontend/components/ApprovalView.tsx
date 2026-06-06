'use client';

import React, { useState } from 'react';
import { Rfq, Quotation, PurchaseOrder } from '../lib/types';
import { ShoppingCart, Check, X, ShieldCheck, AlertCircle, FileText, FileSpreadsheet, Clock } from 'lucide-react';

interface ApprovalViewProps {
  rfqs: Rfq[];
  quotations: Quotation[];
  currentRole: string;
  onApproveSelection: (rfqId: string, quoteId: string, remarks: string) => void;
  onRejectSelection: (rfqId: string, quoteId: string, remarks: string) => void;
}

export function ApprovalView({
  rfqs,
  quotations,
  currentRole,
  onApproveSelection,
  onRejectSelection
}: ApprovalViewProps) {
  const [remarks, setRemarks] = useState('');

  // Find RFQs waiting for manager approval (under "Pending Approval" status)
  const pendingRfqs = rfqs.filter(r => r.status === 'Pending Approval' && r.selectedQuotationId);
  const [selectedRfqId, setSelectedRfqId] = useState<string>(pendingRfqs[0]?.id || '');

  // fallback logic
  const activeRfq = rfqs.find(r => r.id === selectedRfqId) || pendingRfqs[0];
  const activeQuote = activeRfq ? quotations.find(q => q.id === activeRfq.selectedQuotationId) : null;

  const handleApprove = () => {
    if (!activeRfq || !activeQuote) return;
    onApproveSelection(activeRfq.id, activeQuote.id, remarks || 'Approved after structural auditing. Budget line IT-9014 is cleared.');
    setRemarks('');
    alert(`Tender approved! Officially generated Purchase Order (PO-XXXX) and dispatched confirmation alert to ${activeQuote.vendorName}.`);
  };

  const handleReject = () => {
    if (!activeRfq || !activeQuote) return;
    onRejectSelection(activeRfq.id, activeQuote.id, remarks || 'Rejected. Unit rate is non-compliant with standard market guidelines.');
    setRemarks('');
    alert(`Tender selection rejected. Alert dispatched to Procurement Sourcing Lead.`);
  };

  return (
    <div id="approval-view" className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4 select-none">
        <div>
          <h2 className="font-sans font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-500 scale-110" />
            Executive Authorization Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Finance directors and executive managers verify budget compliance and log formal signing authorizations
          </p>
        </div>
      </div>

      {pendingRfqs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/10">
          <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-slate-800 dark:text-white">Clean Executive Desk</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            All shortlisted quotations are signed off. No bids are currently awaiting authorization.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 max-w-md mx-auto text-left text-xs border border-indigo-100 dark:border-indigo-900/60 font-sans leading-relaxed text-indigo-800 dark:text-indigo-400">
            💡 <strong>Hackathon Demo Tip:</strong> Switch your role at the top menu to <strong>Procurement Officer</strong>, open the <strong>Bid Comparison</strong> matrix tab, and click <em>Shortlist & Push for Approval</em> on any pricing quote to routing it here dynamically.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Pending Approvals list & details (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Authorization Selector bar */}
            <div className="bg-slate-50/50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800 flex justify-between items-center flex-wrap gap-4 select-none">
              <span className="text-xs font-semibold text-slate-500">Pick Authorization Packet:</span>
              <div className="flex gap-2">
                {pendingRfqs.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedRfqId(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      activeRfq?.id === r.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-705 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 hover:bg-slate-100'
                    }`}
                  >
                    Ticket {r.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Main packet sheet */}
            {activeRfq && activeQuote && (
              <div id="approval-ticket-sheet" className="p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
                
                {/* Visual state timeline (Screen 7 Timeline) */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 select-none">Audit Timeline & Stages</h4>
                  <div className="grid grid-cols-4 items-center relative text-center">
                    
                    {/* Line connector */}
                    <div className="absolute top-[21px] left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 dark:bg-zinc-800 -z-10" />

                    {[
                      { l: 'Initiation', act: true, desc: 'RFQ Draft Created' },
                      { l: 'Quotes In', act: true, desc: 'Bids Lodged' },
                      { l: 'Board Selection', act: true, desc: 'Selection short-listed' },
                      { l: 'Authorized', act: false, desc: 'Awaiting Manager Signoff' }
                    ].map((step, sIdx) => (
                      <div key={sIdx} className="space-y-2 select-none">
                        <div className={`h-11 w-11 rounded-full mx-auto flex items-center justify-center border font-mono font-bold text-xs ${
                          step.act 
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800' 
                            : 'bg-slate-50 border-slate-200 text-slate-450 dark:bg-zinc-900 shadow-inner'
                        }`}>
                          {step.act ? <Check className="h-4.5 w-4.5" /> : sIdx + 1}
                        </div>
                        <div>
                          <div className={`text-[10px] font-bold leading-none ${step.act ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                            {step.l}
                          </div>
                          <span className="text-[8.5px] text-slate-400 dark:text-zinc-500 mt-0.5 line-clamp-1">{step.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packet specifications */}
                <div className="border-t border-slate-100 dark:border-zinc-900 pt-6 space-y-4">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-mono font-bold select-none">Procurement Ticket</span>
                      <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white mt-0.5 leading-tight">
                        [{activeRfq.id}] {activeRfq.title}
                      </h3>
                      <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                        Purchaser description statement: &quot;{activeRfq.description}&quot;
                      </p>
                    </div>
                    
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-900 text-right font-mono select-none">
                      <span className="block text-[9px] text-indigo-500 uppercase font-sans">Board Target volume</span>
                      <span className="text-sm font-bold text-indigo-950 dark:text-indigo-300">{activeRfq.quantity} x {activeRfq.item}</span>
                    </div>
                  </div>

                  {/* Winning quotation financial specs */}
                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="block text-slate-450 text-[10px] uppercase font-semibold">Shortlisted Supplier</span>
                      <span className="font-sans font-bold text-slate-900 dark:text-white mt-1 block">{activeQuote.vendorName}</span>
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">Contact: Sarah Jenkins Corp</span>
                    </div>

                    <div>
                      <span className="block text-slate-450 text-[10px] uppercase font-semibold">Calculated Total Sourced</span>
                      <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400 mt-1 block">
                        ${(activeQuote.unitPrice * activeRfq.quantity * (1 + activeQuote.taxRate / 100)).toFixed(2)}
                      </span>
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">Base Rate: ${activeQuote.unitPrice} • GST: {activeQuote.taxRate}%</span>
                    </div>

                    <div>
                      <span className="block text-slate-450 text-[10px] uppercase font-semibold">Operations SLA</span>
                      <span className="font-sans font-bold text-slate-900 dark:text-white mt-1 block">{activeQuote.deliveryDays} Business Days</span>
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">Warranty: 5 years structural</span>
                    </div>
                  </div>

                  {/* Textarea for Approval remarks */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">Auditor Signing Remarks *</label>
                    <textarea
                      id="approval-remarks-input"
                      rows={2}
                      placeholder="e.g. Budget authorization verified. Verified against department Q2 balance. Expedite standard logistics dispatch."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium shadow-inner placeholder-slate-400"
                    />
                  </div>

                  {/* Confirm CTAs */}
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-end gap-3 select-none">
                    {currentRole === 'Approver' ? (
                      <>
                        <button
                          id="reject-selection-btn"
                          onClick={handleReject}
                          className="px-5 py-2.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 dark:bg-rose-950/40 dark:text-rose-450"
                        >
                          <X className="h-4.5 w-4.5" /> Reject Bid Packet
                        </button>
                        <button
                          id="approve-selection-btn"
                          onClick={handleApprove}
                          className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 dark:bg-indigo-500"
                        >
                          <Check className="h-4.5 w-4.5" /> Authorize & Sign Purchase Order
                        </button>
                      </>
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-zinc-900 text-center text-xs text-slate-400 rounded-xl w-full">
                        🔒 Approval features are locked. To sign these items off, switch your <strong>User Perspective</strong> at the header menu to <strong>Approver (Manager)</strong>.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Right: Sourcing Guidelines (4 columns) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div>
              <h4 className="font-sans font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                Budget Compliance Rules
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Internal constraints regulating company spend
              </p>
            </div>

            <div className="space-y-3.5 text-xs font-sans leading-relaxed text-slate-600 dark:text-zinc-300 select-none">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900/40 rounded-xl space-y-1">
                <div className="font-bold text-slate-800 dark:text-zinc-200">Rule L1: &lt; $5,000</div>
                <p className="text-[10.5px] text-slate-450 dark:text-zinc-400">Can be signed-off instantly by Sourcing Director Sanjay Verma.</p>
              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/55 dark:border-indigo-900/60 rounded-xl space-y-1">
                <div className="font-bold text-indigo-750 dark:text-indigo-400 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  Rule L2: &gt; $5,000 Volume
                </div>
                <p className="text-[10.5px] text-indigo-600 dark:text-indigo-400">Requires executive manager signature authorization (Finance Director Meera Patel).</p>
              </div>

              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/25 border border-amber-250/55 dark:border-amber-900/60 rounded-xl space-y-1">
                <div className="font-bold text-amber-750 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Tax Code Split Verification
                </div>
                <p className="text-[10.5px] text-amber-600 dark:text-zinc-400">All purchase valuations must clearly separate CGST (9%) and SGST (9%) on invoices to maintain corporate tax compliance.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

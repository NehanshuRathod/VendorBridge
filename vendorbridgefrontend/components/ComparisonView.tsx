'use client';

import React, { useState } from 'react';
import { Rfq, Quotation, Vendor } from '../lib/types';
import { AiAnalyst } from './AiAnalyst';
import { Check, Columns, ArrowRight, Star, AlertTriangle, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { formatDate } from '../lib/utils';


interface ComparisonViewProps {
  rfqs: Rfq[];
  quotations: Quotation[];
  vendors: Vendor[];
  currentRole: string;
  selectedRfqId?: string;
  onSelectedRfqIdChange?: (id: string) => void;
  onShortlistQuote: (rfqId: string, quoteId: string) => void;
}

export function ComparisonView({
  rfqs,
  quotations,
  vendors,
  currentRole,
  selectedRfqId,
  onSelectedRfqIdChange,
  onShortlistQuote
}: ComparisonViewProps) {
  // Select first reviewable RFQ by default
  const [internalRfqId, setInternalRfqId] = useState<string>('');
  const reviewableRfqs = rfqs.filter(r => r.status === 'Bids Received' || r.status === 'Under Review' || r.status === 'Pending Approval');
  
  const effectiveSelectedRfqId = selectedRfqId || internalRfqId || reviewableRfqs[0]?.id || rfqs[0]?.id || '';

  const setSelectedRfqId = (id: string) => {
    if (onSelectedRfqIdChange) {
      onSelectedRfqIdChange(id);
    } else {
      setInternalRfqId(id);
    }
  };

  const activeRfq = rfqs.find(r => r.id === effectiveSelectedRfqId);
  const activeQuotes = quotations.filter(q => q.rfqId === effectiveSelectedRfqId);

  // Find lowest price
  const lowestPrice = activeQuotes.length > 0 
    ? Math.min(...activeQuotes.map(q => q.unitPrice)) 
    : 0;

  // Find fastest delivery
  const fastestDelivery = activeQuotes.length > 0
    ? Math.min(...activeQuotes.map(q => q.deliveryDays))
    : 0;

  const handleRouteToApproval = (quoteId: string) => {
    if (!activeRfq) return;
    onShortlistQuote(activeRfq.id, quoteId);
    alert(`Quotation successfully shortlisted. Selected Quote ${quoteId} has been submitted for executive manager signoff.`);
  };

  return (
    <div id="comparison-view" className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center select-none flex-wrap gap-4">
        <div>
          <h2 className="font-sans font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Columns className="h-5 w-5 text-indigo-500 scale-110" />
            Strategic Bidding Comparator
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Evaluate parallel multi-supplier proposals side-by-side using systemic tax calculations and SLA ratios
          </p>
        </div>

        {/* Selected RFQ Selector dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Tender:</span>
          <select
            id="compare-rfq-selector"
            value={selectedRfqId}
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            {rfqs.map((r, idx) => (
              <option key={idx} value={r.id}>
                [{r.id}] {r.title} ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeRfq ? (
        <div className="space-y-6">
          {/* Active RFQ brief overview card */}
          <div id="compare-rfq-brief" className="p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/10 text-xs flex justify-between gap-4 flex-wrap items-center select-none">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Demand Scope: {activeRfq.item}</span>
                <span className="bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-[10px] font-mono">{activeRfq.category}</span>
              </div>
              <p className="text-slate-400 mt-1">Sourcing target criteria: {activeRfq.quantity} units • Closes on {formatDate(activeRfq.deadline)}</p>
            </div>
            
            <div className="flex gap-4 font-mono font-bold text-right">
              <div>
                <span className="block text-[9px] text-slate-400 font-sans">Bidding Pool</span>
                <span className="text-indigo-600 dark:text-indigo-400">{activeQuotes.length} Quotes submitted</span>
              </div>
            </div>
          </div>

          {/* Core side-by-side comparison matrix (Screen 6 Grid) */}
          {activeQuotes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-slate-800 dark:text-white">Awaiting Vendor Bids</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No pricing sheets have been registered. To simulate a bid, switch your **User Perspective** at the top header to a Vendor, submit a bidding sheet, and return here.
              </p>
            </div>
          ) : (
            <div id="comparison-matrix-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {activeQuotes.map((q) => {
                const totalBase = q.unitPrice * activeRfq.quantity;
                const totalTax = totalBase * (q.taxRate / 100);
                const grandTotal = totalBase + totalTax;

                const isCheapest = q.unitPrice === lowestPrice;
                const isFastest = q.deliveryDays === fastestDelivery;

                // Lookup vendor rating
                const vendorObj = vendors.find(v => v.id === q.vendorId);
                const rating = vendorObj?.rating || 4.0;

                return (
                  <div
                    id={`compare-card-${q.id}`}
                    key={q.id}
                    className={`relative rounded-3xl border p-6 bg-white dark:bg-zinc-950 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] ${
                      isCheapest 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    {/* Visual Highlights badges */}
                    <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap">
                      {isCheapest && (
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full select-none flex items-center gap-0.5">
                          ★ Best Pricing
                        </span>
                      )}
                      {isFastest && (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
                          ⚡ Express SLA
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Vendor identity banner */}
                      <div>
                        <span className="font-mono text-[9px] font-bold text-slate-400 block uppercase">Supplier Proposal</span>
                        <h4 className="font-sans font-bold text-base text-slate-900 dark:text-white mt-0.5 leading-tight">
                          {q.vendorName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="flex text-amber-400 text-[14px]">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <span key={idx} className={idx < Math.floor(rating) ? 'opacity-100' : 'opacity-20'}>★</span>
                            ))}
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-500 mt-0.5">{rating.toFixed(1)} Compliance Code</span>
                        </div>
                      </div>

                      {/* Financial structure specs */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-900 space-y-2 select-none">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Negotiated Unit Rate</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">${q.unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Total Base Volume ({activeRfq.quantity}x)</span>
                          <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">${totalBase.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">National Tax (GST {q.taxRate}%)</span>
                          <span className="font-mono text-slate-600 dark:text-zinc-400">${totalTax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-100 dark:border-zinc-900 pt-2 flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-955">Total Cost Sourced</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* SLA metrics info */}
                      <div className="space-y-2 text-[11px] leading-relaxed">
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-slate-400 w-24">Lead Dispatch:</span>
                          <span className="text-slate-800 dark:text-zinc-200 font-medium">{q.deliveryDays} Business Days</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-slate-400 w-24">Contract SLA:</span>
                          <span className="text-slate-800 dark:text-zinc-200">{q.terms}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-slate-400 w-24">Bid Notes:</span>
                          <span className="text-slate-500 italic">&quot;{q.notes || 'No specialized terms added'}&quot;</span>
                        </div>
                      </div>
                    </div>

                    {/* Routing submission action - available to Procurement Officers */}
                    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-zinc-900">
                      {currentRole === 'Procurement' ? (
                        <button
                          id={`select-quote-${q.id}`}
                          onClick={() => handleRouteToApproval(q.id)}
                          disabled={activeRfq.status === 'Completed' || activeRfq.status === 'Approved' || activeRfq.status === 'Pending Approval'}
                          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer ${
                            activeRfq.status === 'Pending Approval' || activeRfq.status === 'Approved' || activeRfq.status === 'Completed'
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-md hover:shadow-lg active:scale-95'
                          }`}
                        >
                          <Check className="h-4 w-4" />
                          Shortlist & Push for Approval
                        </button>
                      ) : (
                        <div className="p-2 bg-slate-50 dark:bg-zinc-900 text-center text-[11px] text-slate-400 rounded-lg">
                          Log in as **Procurement Officer** to nominate.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Embedded Advanced Sourcing AI Core (Connected to Gemini Endpoint) */}
          <div className="mt-8">
            <div className="flex items-center gap-1.5 mb-3 select-none text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-wider text-[10px] uppercase">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Sourcing Optimization Engine
            </div>
            <AiAnalyst rfq={activeRfq} quotations={activeQuotes} />
          </div>
        </div>
      ) : (
        <div className="text-center p-12 rounded-2xl border border-dashed border-slate-200">
          <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-400 mt-2">No RFQ templates are active in ERP. Issue a request first.</p>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Rfq, Quotation } from '../lib/types';
import { Sparkles, Send, CheckCircle2, DollarSign, Calendar, FileText, X } from 'lucide-react';

interface BiddingFormProps {
  rfq: Rfq;
  vendorId: string;
  vendorName: string;
  onSubmitBid: (quote: Quotation) => void;
  onClose: () => void;
}

export function BiddingForm({
  rfq,
  vendorId,
  vendorName,
  onSubmitBid,
  onClose
}: BiddingFormProps) {
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [taxRate, setTaxRate] = useState<number>(18); // Default 18% GST standard
  const [deliveryDays, setDeliveryDays] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitPrice || unitPrice <= 0 || !deliveryDays || deliveryDays <= 0) {
      alert("Please specify a valid unit price and delivery estimate timeline in business days.");
      return;
    }

    const newQuote: Quotation = {
      id: `QT-${Math.floor(100 + Math.random() * 900)}`,
      rfqId: rfq.id,
      vendorId,
      vendorName,
      unitPrice: Number(unitPrice),
      taxRate: Number(taxRate),
      deliveryDays: Number(deliveryDays),
      notes,
      terms: terms || "Standard corporate maintenance support contract applies.",
      status: "Submitted",
      submittedAt: new Date().toISOString()
    };

    onSubmitBid(newQuote);
    alert(`Quotation sheet QT-${newQuote.id.slice(3)} officially registered for RFP tender ${rfq.id}. Sourcing leads notified.`);
    onClose();
  };

  const quantity = rfq.quantity || 1;
  const computedBase = (Number(unitPrice) || 0) * quantity;
  const computedTax = computedBase * (taxRate / 100);
  const computedGrandTotal = computedBase + computedTax;

  return (
    <div id="vendor-bid-sheet-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl shadow-black/80 max-w-lg w-full overflow-hidden transform scale-100 transition-all duration-300">
        
        {/* Header */}
        <div className="bg-indigo-650 p-6 text-white border-b border-indigo-750 flex justify-between items-center select-none">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5.5 w-5.5 text-indigo-200" />
            <div>
              <h3 className="font-sans font-bold text-lg leading-tight">Supplier Proposal Bid Sheet</h3>
              <p className="text-[11px] text-indigo-200">Submit competitive pricing proposals for public/private company RFP tenders</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* RFQ Context info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-850 space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-indigo-500">Authorized RFP Tender Ticket</span>
            <div className="font-bold text-xs text-slate-850 dark:text-zinc-200">[{rfq.id}] {rfq.title}</div>
            <div className="text-[10.5px] text-slate-450">Seeking: {rfq.quantity} x {rfq.item}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Negotiated Unit Price (USD) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="bid-unit-price-input"
                  type="number"
                  required
                  min={0.01}
                  step={0.01}
                  placeholder="e.g. 150.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 pl-9 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-850 dark:text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-705 dark:text-zinc-300 mb-1">GST Tax Code</label>
                <select
                  id="bid-tax-rate-dropdown"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-505 text-slate-700 dark:text-white cursor-pointer font-semibold"
                >
                  <option value={18}>18% Standard</option>
                  <option value={12}>12% Reduced</option>
                  <option value={5}>5% Essential</option>
                  <option value={0}>0% Tax Free</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Lead Time *</label>
                <input
                  id="bid-delivery-days-input"
                  type="number"
                  required
                  min={1}
                  placeholder="Days"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-850 dark:text-white font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Contract warranty terms</label>
              <input
                id="bid-terms-input"
                type="text"
                placeholder="e.g. 5 Year structural warranty cover."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Additional Bid Remarks</label>
              <input
                id="bid-notes-input"
                type="text"
                placeholder="Specify assembly service details or discount packages..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Calculations Breakout block */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/60 leading-normal text-xs grid grid-cols-3 gap-2">
            <div>
              <span className="text-slate-450 font-medium block text-[9.5px] uppercase">Base cost ({quantity}x)</span>
              <strong className="font-mono text-slate-900 dark:text-white text-sm font-bold">${computedBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>

            <div>
              <span className="text-slate-450 font-medium block text-[9.5px] uppercase">GST tax Added</span>
              <strong className="font-mono text-slate-900 dark:text-white text-sm font-bold">${computedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>

            <div>
              <span className="text-indigo-400 font-medium block text-[9.5px] uppercase">Grand Total Proposal</span>
              <strong className="font-mono text-indigo-600 dark:text-indigo-400 text-sm font-extrabold">${computedGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-bid-quote-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Submit Pricing Quotation
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { PurchaseOrder, Invoice } from '../lib/types';
import { FileText, Printer, Mail, Download, Check, ShieldCheck, AlertCircle, ShoppingCart } from 'lucide-react';
import { formatDate } from '../lib/utils';


interface DocumentsViewProps {
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  currentRole: string;
  onPayInvoice: (invId: string) => void;
}

export function DocumentsView({
  purchaseOrders,
  invoices,
  currentRole,
  onPayInvoice
}: DocumentsViewProps) {
  const [activeTab, setActiveTab] = useState<'PO' | 'Invoice'>('PO');
  
  // States of currently viewing documents
  const [selectedPoId, setSelectedPoId] = useState<string>(purchaseOrders[0]?.id || '');
  const [selectedInvId, setSelectedInvId] = useState<string>(invoices[0]?.id || '');

  const activePo = purchaseOrders.find(p => p.id === selectedPoId) || purchaseOrders[0];
  const activeInv = invoices.find(i => i.id === selectedInvId) || invoices[0];

  const handlePrint = (docType: string, id: string) => {
    alert(`System signal sent: Preparing Print Spooler configuration layout for local printing: ${docType} Serial ID ${id}.`);
    window.print();
  };

  const handleDownloadPdf = (docType: string, id: string) => {
    alert(`Compiling high-resolution PDF document for local storage: ${docType}_${id}.pdf downloaded successfully.`);
  };

  const handleSendEmail = (docType: string, id: string, vendorName: string) => {
    alert(`Secured corporate communication log parsed: Emailed automated PDF attachment coordinates of ${docType} #${id} successfully to procurement accounts of ${vendorName}.`);
  };

  return (
    <div id="documents-view" className="space-y-6 animate-fade-in print:bg-white print:p-8">
      
      {/* Header and selection tabs */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-900 pb-4 flex-wrap gap-4 select-none print:hidden">
        <div>
          <h2 className="font-sans font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500 scale-110" />
            Sourcing Document Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Auto-generated commercial contracts, audited purchase authorizations, and legal tax compliance sheets
          </p>
        </div>

        <div className="flex gap-1 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-200/55 dark:border-zinc-800">
          <button
            id="switch-po-docs-tab"
            onClick={() => setActiveTab('PO')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PO'
                ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Purchase Orders (POs)
          </button>
          <button
            id="switch-invoice-docs-tab"
            onClick={() => setActiveTab('Invoice')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Invoice'
                ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tax Invoices
          </button>
        </div>
      </div>

      {activeTab === 'PO' ? (
        // PO workspace
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: PO selector table (4 columns) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4 print:hidden">
            <h3 className="font-sans font-semibold text-xs text-slate-500 uppercase tracking-widest leading-none select-none">Issued PO Registry</h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {purchaseOrders.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No Issued Purchase orders located.</p>
              ) : (
                purchaseOrders.map((po) => (
                  <button
                    id={`select-po-id-${po.id}`}
                    key={po.id}
                    onClick={() => setSelectedPoId(po.id)}
                    className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      activePo?.id === po.id
                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/25 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{po.id}</span>
                      <span className="text-slate-400">{formatDate(po.createdAt)}</span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white mt-1 leading-tight">{po.vendorName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 flex justify-between items-center">
                      <span>Total: ${po.totalAmount.toLocaleString()}</span>
                      <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-[8.5px] px-1.5 py-0.2 rounded-full uppercase">{po.status}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Active PO document viewer (8 columns) */}
          <div className="lg:col-span-8">
            {activePo ? (
              <div id={`po-document-sheet-${activePo.id}`} className="space-y-4">
                {/* Print/Download header buttons */}
                <div className="flex justify-end gap-2.5 print:hidden select-none">
                  <button
                    onClick={() => handlePrint('Purchase_Order', activePo.id)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer text-slate-705 dark:text-zinc-300"
                    title="Print Document"
                  >
                    <Printer className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleDownloadPdf('Purchase_Order', activePo.id)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer text-slate-705 dark:text-zinc-300"
                    title="Download PDF Archive"
                  >
                    <Download className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleSendEmail('Purchase_Order', activePo.id, activePo.vendorName)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer text-slate-750 dark:text-zinc-300"
                    title="Email to vendor"
                  >
                    <Mail className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Stylized Document Layout (Odoo / Stripe Elegant Invoicing style) */}
                <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 relative shadow-md">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-650" />
                  
                  {/* Ledger Header */}
                  <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-100 dark:border-zinc-900 pb-6">
                    <div className="space-y-1">
                      <div className="font-sans font-bold text-lg text-slate-900 dark:text-white tracking-tight">VendorBridge SCM</div>
                      <div className="text-[10px] text-slate-400 font-sans leading-relaxed">
                        HQ Corporate Procurement & Facilities<br />
                        Tower C, Phase-4 Technology Park<br />
                        Maharashtra, IN 400013<br />
                        GSTIN Registration: 27AAVCB0123M1ZX
                      </div>
                    </div>

                    <div className="text-right space-y-1 select-none">
                      <span className="text-[10px] uppercase font-mono font-bold text-indigo-500 tracking-wider">Purchase Order Contract</span>
                      <h3 className="font-mono font-extrabold text-xl text-slate-900 dark:text-white">{activePo.id}</h3>
                      <div className="text-[10px] text-slate-450 mt-1 text-right">
                        <span>Issued On: {formatDate(activePo.createdAt)}</span><br />
                        <span>Status: <strong className="text-emerald-600 font-bold">{activePo.status}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Ship-To / Bill-To Address details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-[10.5px] leading-relaxed">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Delivery Consignee Entity (Ship To)</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold text-xs block">Sourcing Logistics Center</strong>
                      <p className="text-slate-500 dark:text-zinc-400 py-1">
                        Hub-1 Warehouse Receiving, Ground Floor<br />
                        25 Technology Blvd, West Phase 1<br />
                        Pune, Maharashtra, 411057
                      </p>
                    </div>

                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Supplier Recipient (Bill To)</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold text-xs block">{activePo.vendorName}</strong>
                      <p className="text-slate-500 dark:text-zinc-400 py-1">
                        Corporate Accounts Division & logistics<br />
                        Registered supplier code: {activePo.vendorId}<br />
                        Dispatch center reference: QT-A902
                      </p>
                    </div>
                  </div>

                  {/* Invoice Line Items */}
                  <div className="pt-8 space-y-4">
                    <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">Authorized Ledger Line Items</span>
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-zinc-900 pb-2 text-slate-400 select-none">
                          <th className="py-2">Item Workspec / Description</th>
                          <th className="py-2 text-right">Unit Rate</th>
                          <th className="py-2 text-center">Batch Qty</th>
                          <th className="py-2 text-right">Aggregate Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-zinc-900 font-medium">
                        <tr>
                          <td className="py-4 text-slate-900 dark:text-white">
                            <div>
                              <div className="font-bold">{activePo.item}</div>
                              <span className="block text-[10px] text-slate-400 mt-1">Shortlisted Tender Quote ID: {activePo.quotationId}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right font-mono text-slate-800 dark:text-zinc-300">
                            ${activePo.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-4 text-center font-mono text-slate-850 dark:text-zinc-300">
                            {activePo.quantity}
                          </td>
                          <td className="py-4 text-right font-mono text-indigo-650 dark:text-indigo-400">
                            ${(activePo.unitPrice * activePo.quantity).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations and remarks breakout */}
                  <div className="pt-6 border-t border-slate-150 dark:border-zinc-900 flex justify-between gap-6 flex-wrap leading-relaxed">
                    <div className="max-w-xs text-[10.5px] text-slate-450">
                      <strong className="block text-slate-600 dark:text-zinc-300 mb-1 font-bold">Managerial Authorization Remarks:</strong>
                      <p className="italic">&quot;{activePo.approverRemarks || 'Shortlist approved under executive budget review and facilities expansion guidelines.'}&quot;</p>
                    </div>

                    {/* Tax specifications calculations */}
                    <div className="w-56 space-y-2 select-none text-xs font-sans">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Base Volume Cost</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">${(activePo.unitPrice * activePo.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Tax Added ({activePo.taxRate}%)</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">${((activePo.unitPrice * activePo.quantity) * (activePo.taxRate / 100)).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-100 dark:border-zinc-900 pt-2 flex justify-between font-bold text-sm">
                        <span className="text-slate-900 dark:text-white">Authorized Spend</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">${activePo.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contract footnote sign-off */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-900 flex justify-between items-center text-[9px] text-slate-400 select-none">
                    <div className="flex items-center gap-1.5 font-sans">
                      <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
                      <span>Regulatory digital signing authorized successfully. Verified by SCM Controller Audit.</span>
                    </div>
                    <span>Serial: SHA256- {activePo.id.charCodeAt(0)}F{activePo.quantity}AF</span>
                  </div>

                </div>
              </div>
            ) : (
              <p className="text-center p-8 text-xs text-slate-400">No active PO selected or draft issued.</p>
            )}
          </div>

        </div>
      ) : (
        // Invoice workspace
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Invoice selectors (4 columns) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4 print:hidden select-none">
            <h3 className="font-sans font-semibold text-xs text-slate-500 uppercase tracking-widest leading-none">Tax Invoices</h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {invoices.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No bill details lodged.</p>
              ) : (
                invoices.map((inv) => (
                  <button
                    id={`select-inv-id-${inv.id}`}
                    key={inv.id}
                    onClick={() => setSelectedInvId(inv.id)}
                    className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      activeInv?.id === inv.id
                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/25 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-mono font-bold text-indigo-650 dark:text-indigo-400">{inv.id}</span>
                      <span className="text-slate-400">{inv.invoiceDate}</span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white mt-1 block truncate leading-tight">{inv.vendorName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 flex justify-between items-center">
                      <span>Total: ${inv.grandTotal.toLocaleString()}</span>
                      <span className={`font-bold text-[8.5px] px-2 py-0.2 rounded-full uppercase ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450 animate-pulse'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Active Invoice viewer (8 columns) */}
          <div className="lg:col-span-8">
            {activeInv ? (
              <div id={`invoice-document-sheet-${activeInv.id}`} className="space-y-4">
                {/* Print/Download and Settling payments */}
                <div className="flex justify-between items-center print:hidden flex-wrap gap-2 select-none">
                  <div>
                    {activeInv.status === 'Unpaid' && currentRole === 'Procurement' ? (
                      <button
                        id={`pay-invoice-${activeInv.id}`}
                        onClick={() => onPayInvoice(activeInv.id)}
                        className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        Settle & Settle Invoice Ledger
                      </button>
                    ) : activeInv.status === 'Paid' ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 px-3 py-1.5 rounded-xl">
                        <Check className="h-4 w-4" /> Settlement Finalized
                      </div>
                    ) : (
                      <div className="text-xs text-slate-450 text-left">
                        🔒 Log in as **Procurement Officer** to clear invoice dues.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrint('Tax_Invoice', activeInv.id)}
                      className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer text-slate-705 dark:text-zinc-300 pointer-events-auto"
                      title="Print Invoice"
                    >
                      <Printer className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf('Tax_Invoice', activeInv.id)}
                      className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer text-slate-705 dark:text-zinc-300"
                      title="Download PDF"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleSendEmail('Tax_Invoice', activeInv.id, activeInv.vendorName)}
                      className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer text-slate-705 dark:text-zinc-300"
                      title="Email Copy"
                    >
                      <Mail className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* Stylized Invoice Document sheet */}
                <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 relative shadow-md">
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${activeInv.status === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                  
                  {/* Ledger Header */}
                  <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-100 dark:border-zinc-900 pb-6 select-none">
                    <div className="space-y-1">
                      <div className="font-sans font-extrabold text-sm text-indigo-650 dark:text-indigo-400 tracking-wider">SUPPLIER BILLING INVOICE</div>
                      <div className="font-sans font-bold text-lg text-slate-900 dark:text-white tracking-tight">{activeInv.vendorName}</div>
                      <div className="text-[10px] text-slate-400 font-sans leading-relaxed">
                        Authorized logistics center dispatch dept<br />
                        Tax Registration GSTIN: 27AABCM4592L2ZB<br />
                        Recipient tracking serial: QT-301
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Legal Bill ID</span>
                      <h3 className="font-mono font-extrabold text-xl text-slate-900 dark:text-white">{activeInv.id}</h3>
                      <div className="text-[10px] text-slate-450 mt-1 text-right">
                        <span>Invoice Date: {activeInv.invoiceDate}</span><br />
                        <span>Contract PO Linked: {activeInv.poId}</span><br />
                        <span>Settlement: <strong className={activeInv.status === 'Paid' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold animate-pulse'}>{activeInv.status}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery addresses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-[10.5px] leading-relaxed select-none">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Corporate Scribe (Bill To)</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold text-xs block">VendorBridge Procurement PLC</strong>
                      <p className="text-slate-500 dark:text-zinc-400 py-1">
                        Accounts payable Sourcing operations division<br />
                        Corporate registration identifier reference: APP-9014<br />
                        Tax ID GSTIN: 27AAVCB0123M1ZX
                      </p>
                    </div>

                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Discharge Consignee Warehouse</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold text-xs block">Central logistics Center hub-1</strong>
                      <p className="text-slate-500 dark:text-zinc-400 py-1">
                        Pune facilities storage docks Phase 1<br />
                        Regional warehouse code hub-1
                      </p>
                    </div>
                  </div>

                  {/* Table specifications */}
                  <div className="pt-8 space-y-4">
                    <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2 select-none">Tender Line items billed</span>
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-zinc-900 pb-2 text-slate-400 select-none">
                          <th className="py-2">Item Specifications Code</th>
                          <th className="py-2 text-right">Settled Unit Rate</th>
                          <th className="py-2 text-center">Batch Volume</th>
                          <th className="py-2 text-right">Base subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-zinc-900 font-medium">
                        <tr>
                          <td className="py-4 text-slate-900 dark:text-white font-bold">
                            {activeInv.item}
                          </td>
                          <td className="py-4 text-right font-mono text-slate-800 dark:text-zinc-300">
                            ${activeInv.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-4 text-center font-mono text-slate-850 dark:text-zinc-300">
                            {activeInv.quantity}
                          </td>
                          <td className="py-4 text-right font-mono text-indigo-700 dark:text-indigo-400">
                            ${activeInv.baseAmount.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Programmatic automatic tax splits (CGST 9% and SGST 9%) as requested */}
                  <div className="pt-6 border-t border-slate-150 dark:border-zinc-900 flex justify-between gap-6 flex-wrap leading-relaxed">
                    <div className="max-w-xs text-[10.5px] text-slate-400 select-none">
                      <strong className="block text-slate-600 dark:text-zinc-300 mb-1 font-bold">Tax Compliance Code Audit Summary:</strong>
                      <p>Automatic programmatic GST billing allocation. Base rate tax classification is split at half rate into Central Goods & Services Tax (CGST) and State Goods & Services Tax (SGST) respectively according to national ERP standards.</p>
                    </div>

                    <div className="w-64 space-y-2 select-none text-xs font-sans">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Taxable Base Amount</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">${activeInv.baseAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-400">Central GST (CGST {activeInv.taxRate / 2}%)</span>
                        <span className="font-mono font-medium text-indigo-700 dark:text-indigo-400">${activeInv.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-400">State GST (SGST {activeInv.taxRate / 2}%)</span>
                        <span className="font-mono font-medium text-indigo-700 dark:text-indigo-400">${activeInv.sgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-500 pt-1">
                        <span>Aggregate tax dues</span>
                        <span className="font-mono">${activeInv.totalTax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-100 dark:border-zinc-900 pt-2 flex justify-between font-extrabold text-sm">
                        <span className="text-slate-950 dark:text-white">Amount Settled Due</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">${activeInv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer marker */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-900 text-center text-[10px] text-slate-400 select-none">
                    Thank you for partnering with us. Programmatic ERP documentation verified under digital compliance guidelines.
                  </div>

                </div>
              </div>
            ) : (
              <p className="text-center p-8 text-xs text-slate-400">No active tax invoices logged.</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

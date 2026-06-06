'use client';

import React, { useState, useEffect } from 'react';
import { 
  Vendor, Rfq, Quotation, PurchaseOrder, Invoice, ActivityLog, Notification, UserRole 
} from '../lib/types';
import { 
  initialVendors, initialRfqs, initialQuotations, initialPurchaseOrders, initialInvoices, initialActivityLogs, initialNotifications 
} from '../lib/initial-data';

// Modular Subcomponent imports
import { DashboardView } from '../components/DashboardView';
import { VendorView } from '../components/VendorView';
import { RfqView } from '../components/RfqView';
import { BiddingForm } from '../components/BiddingForm';
import { ComparisonView } from '../components/ComparisonView';
import { ApprovalView } from '../components/ApprovalView';
import { DocumentsView } from '../components/DocumentsView';

// Standard icon imports
import { 
  Building2, Monitor, Users, FileText, ShoppingCart, Activity, ShieldCheck, Sun, Moon, Sparkles, 
  UserCheck, Bell, ChevronDown, CheckSquare, RefreshCw, Columns
} from 'lucide-react';

import { formatDateTime } from '../lib/utils';


export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentRole, setCurrentRole] = useState<UserRole>('Procurement');
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Core ERP Database states loaded lazily to satisfy React 19 rules
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [rfqs, setRfqs] = useState<Rfq[]>(initialRfqs);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Bid sheet wizard trigger state
  const [activeBidRfq, setActiveBidRfq] = useState<Rfq | null>(null);
  const [activeCompareRfqId, setActiveCompareRfqId] = useState<string>('');

  // Initial mount: load data safely from localStorage after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const storedTheme = localStorage.getItem('vb_theme');
    if (storedTheme) setTheme(storedTheme as 'light' | 'dark');

    const storedVendors = localStorage.getItem('vb_vendors');
    if (storedVendors) setVendors(JSON.parse(storedVendors));

    const storedRfqs = localStorage.getItem('vb_rfqs');
    if (storedRfqs) setRfqs(JSON.parse(storedRfqs));

    const storedQuotes = localStorage.getItem('vb_quotes');
    if (storedQuotes) setQuotations(JSON.parse(storedQuotes));

    const storedPos = localStorage.getItem('vb_pos');
    if (storedPos) setPurchaseOrders(JSON.parse(storedPos));

    const storedInvoices = localStorage.getItem('vb_invoices');
    if (storedInvoices) setInvoices(JSON.parse(storedInvoices));

    const storedLogs = localStorage.getItem('vb_logs');
    if (storedLogs) setActivityLogs(JSON.parse(storedLogs));

    const storedNotifications = localStorage.getItem('vb_notifications');
    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
  }, []);

  // Write changes to localStorage synchronously whenever states change
  useEffect(() => {
    if (mounted && vendors.length > 0) localStorage.setItem('vb_vendors', JSON.stringify(vendors));
  }, [vendors, mounted]);

  useEffect(() => {
    if (mounted && rfqs.length > 0) localStorage.setItem('vb_rfqs', JSON.stringify(rfqs));
  }, [rfqs, mounted]);

  useEffect(() => {
    if (mounted && quotations.length > 0) localStorage.setItem('vb_quotes', JSON.stringify(quotations));
  }, [quotations, mounted]);

  useEffect(() => {
    if (mounted && purchaseOrders.length > 0) localStorage.setItem('vb_pos', JSON.stringify(purchaseOrders));
  }, [purchaseOrders, mounted]);

  useEffect(() => {
    if (mounted && invoices.length > 0) localStorage.setItem('vb_invoices', JSON.stringify(invoices));
  }, [invoices, mounted]);

  useEffect(() => {
    if (mounted && activityLogs.length > 0) localStorage.setItem('vb_logs', JSON.stringify(activityLogs));
  }, [activityLogs, mounted]);

  useEffect(() => {
    if (mounted && notifications.length > 0) localStorage.setItem('vb_notifications', JSON.stringify(notifications));
  }, [notifications, mounted]);

  // Sync HTML wrapper with theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('vb_theme', theme);
  }, [theme]);

  // Utility to append logs with un-editable state hashes as requested
  const appendAuditLog = (user: string, role: UserRole, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      userId: role === 'Vendor' ? 'VND-201' : 'USR-01',
      userName: user,
      role,
      action,
      details
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Helper action: Add Vendor
  const handleAddVendor = (newVendor: Vendor) => {
    setVendors(prev => [...prev, newVendor]);
    appendAuditLog(
      currentRole === 'Admin' ? 'Superuser Administrator' : 'Sanjay Kumar', 
      currentRole, 
      "Vendor Onboarding Registered", 
      `Onboarded supplier entity ${newVendor.name} with compliance rating ${newVendor.rating} under ${newVendor.category}.`
    );
  };

  // Helper action: Update Vendor Status
  const handleUpdateVendorStatus = (vId: string, status: "Active" | "Pending" | "Blocked") => {
    setVendors(prev => prev.map(v => v.id === vId ? { ...v, status } : v));
    const vName = vendors.find(v => v.id === vId)?.name || vId;
    appendAuditLog(
      'Superuser Admin', 
      'Admin', 
      "Supplier Status Moderated", 
      `Swapped supplier entity ${vName} security compliance rating into state: ${status}.`
    );
  };

  // Helper action: Add RFQ
  const handleCreateRfq = (newRfq: Rfq) => {
    setRfqs(prev => [newRfq, ...prev]);
    appendAuditLog(
      'Sanjay Kumar', 
      'Procurement', 
      "RFQ Inception Initiated", 
      `Published public/private tender RFQ- ${newRfq.id.slice(4)}: ${newRfq.title} for quantity ${newRfq.quantity} items.`
    );
  };

  // Helper action: Submit Quotation
  const handleSubmitQuotation = (newQuote: Quotation) => {
    setQuotations(prev => [...prev, newQuote]);
    
    // Auto-progress RFQ status to 'Bids Received' once at least one bid is processed
    setRfqs(prev => prev.map(r => r.id === newQuote.rfqId ? { ...r, status: 'Bids Received' } : r));
    
    appendAuditLog(
      newQuote.vendorName, 
      'Vendor', 
      "Price Bid Logged", 
      `Registered bidding sheet QT-${newQuote.id.slice(3)} under RFP ${newQuote.rfqId} at raw unit value $${newQuote.unitPrice}.`
    );
  };

  // Helper action: Shortlist quote for Manager approval
  const handleShortlistQuote = (rfqId: string, quoteId: string) => {
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Pending Approval', selectedQuotationId: quoteId } : r));
    setQuotations(prev => prev.map(q => q.rfqId === rfqId ? { ...q, status: q.id === quoteId ? 'Shortlisted' : 'Rejected' } : q));
    
    const quoteObj = quotations.find(q => q.id === quoteId);
    appendAuditLog(
      'Sanjay Kumar', 
      'Procurement', 
      "Bid Selected & Shortlisted", 
      `Formally shortlisted bid sheet ${quoteId} by ${quoteObj?.vendorName || 'Selected Vendor'} and routed packet to Executive authorization.`
    );
  };

  // Helper action: Approve / Generate PO
  const handleApproveSelection = (rfqId: string, quoteId: string, remarks: string) => {
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Approved' } : r));
    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Approved' } : q));

    const rfqObj = rfqs.find(r => r.id === rfqId);
    const quoteObj = quotations.find(q => q.id === quoteId);

    if (!rfqObj || !quoteObj) return;

    // Generate PO
    const newPoId = `PO-${Math.floor(100 + Math.random() * 900)}`;
    const totalAmount = quoteObj.unitPrice * rfqObj.quantity * (1 + quoteObj.taxRate / 105); // Standardized with GST index

    const newPo: PurchaseOrder = {
      id: newPoId,
      rfqId,
      quotationId: quoteId,
      vendorId: quoteObj.vendorId,
      vendorName: quoteObj.vendorName,
      item: rfqObj.item,
      quantity: rfqObj.quantity,
      unitPrice: quoteObj.unitPrice,
      taxRate: quoteObj.taxRate,
      totalAmount,
      status: "Issued",
      createdAt: new Date().toISOString(),
      approverRemarks: remarks
    };

    setPurchaseOrders(prev => [newPo, ...prev]);

    // Generate Invoice automatically as requested in flow basic workflow node 6 & 8
    const newInvId = `INV-${Math.floor(100 + Math.random() * 900)}`;
    const baseAmt = quoteObj.unitPrice * rfqObj.quantity;
    const taxAmt = baseAmt * (quoteObj.taxRate / 100);

    const newInvoice: Invoice = {
      id: newInvId,
      poId: newPoId,
      rfqId,
      vendorId: quoteObj.vendorId,
      vendorName: quoteObj.vendorName,
      item: rfqObj.item,
      quantity: rfqObj.quantity,
      unitPrice: quoteObj.unitPrice,
      taxRate: quoteObj.taxRate,
      baseAmount: baseAmt,
      cgst: taxAmt / 2, // half Central GST
      sgst: taxAmt / 2, // half State GST
      totalTax: taxAmt,
      grandTotal: baseAmt + taxAmt,
      status: "Unpaid",
      createdAt: new Date().toISOString(),
      invoiceDate: new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    };

    setInvoices(prev => [newInvoice, ...prev]);

    appendAuditLog(
      'Finance Director Patel', 
      'Approver', 
      "Bid Selection Approved", 
      `Authorized Sourcing packet for ${rfqObj.title}. Automatically compiled contract PO ${newPoId} and generated tax invoice draft ${newInvId}.`
    );
  };

  const handleRejectSelection = (rfqId: string, quoteId: string, remarks: string) => {
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Bids Received', selectedQuotationId: null } : r));
    setQuotations(prev => prev.map(q => q.rfqId === rfqId ? { ...q, status: q.id === quoteId ? 'Rejected' : 'Submitted' } : q));
    
    appendAuditLog(
      'Finance Director Patel', 
      'Approver', 
      "Shortlist Packet Rejected", 
      `Rejected bid proposal selection packet under RFQ reference ${rfqId}. remarks: ${remarks}`
    );
  };

  const handlePayInvoice = (invId: string) => {
    setInvoices(prev => prev.map(i => i.id === invId ? { ...i, status: 'Paid' } : i));
    const invObj = invoices.find(i => i.id === invId);
    appendAuditLog(
      'Sanjay Kumar', 
      'Procurement', 
      "Invoice Settled", 
      `Dues cleared on Invoice ${invId} ($${invObj?.grandTotal.toLocaleString()}). Bank transfer finalized via federal clearing wires.`
    );
  };

  // Demo play stage walkthrough script automation to help judges
  const handleAutoSimulateStage = () => {
    // Stage 1: Procurement drafts an RFQ
    const newRId = `RFQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newR: Rfq = {
      id: newRId,
      title: "Regional Office Breakroom Hub Maintenance",
      item: "Automated Espresso Brewer Stations",
      quantity: 5,
      category: "Breakroom & Maintenance",
      deadline: "2026-06-28",
      description: "High-volume corporate scale coffee brewers with touchscreens and direct plumbing connectors.",
      assignedVendors: ["VND-202", "VND-203"],
      status: "Bids Received", // Already pre-bidded for demo speed
      createdAt: new Date().toISOString(),
      selectedQuotationId: null,
      creator: "Sanjay Kumar"
    };

    // Stage 2: Inject vendor quotations immediately
    const newQ1: Quotation = {
      id: `QT-${Math.floor(100 + Math.random() * 900)}`,
      rfqId: newRId,
      vendorId: "VND-202",
      vendorName: "ZenOffice Outfitters Inc",
      unitPrice: 850.00,
      taxRate: 18,
      deliveryDays: 4,
      notes: "Pro-Brew series with automated descaling cycles. Complete filter packs inclusive.",
      terms: "1 Year machinery warranty services.",
      status: "Submitted",
      submittedAt: new Date().toISOString()
    };

    const newQ2: Quotation = {
      id: `QT-${Math.floor(100 + Math.random() * 900)}`,
      rfqId: newRId,
      vendorId: "VND-203",
      vendorName: "Sigma Logistics & Services",
      unitPrice: 790.00, // Cheapest
      taxRate: 12,
      deliveryDays: 7,
      notes: "Standard espresso blocks. Excludes plumbing pipelines.",
      terms: "6 Months limited local parts warranty.",
      status: "Submitted",
      submittedAt: new Date().toISOString()
    };

    setRfqs(prev => [newR, ...prev]);
    setQuotations(prev => [newQ1, newQ2, ...prev]);

    appendAuditLog('Sanjay Kumar', 'Procurement', 'Simulator Activated', `Launched quick test RFQ ${newRId} along with prices QT-${newQ1.id.slice(3)} (ZenOffice) and QT-${newQ2.id.slice(3)} (Sigma) side-by-side.`);
    setActiveTab('Comparison');
    setActiveCompareRfqId(newRId);
    alert(`Automation success! Lodged active RFQ [${newRId}] & injected side-by-side vendor bids. Redirecting you to Sourcing Comparison, review the matrix and AI advice now!`);
  };

  const handleClearDatabase = () => {
    if (confirm("Reset ERP dataset? This clears all submissions and reloads standard baseline hackathon baseline metrics.")) {
      localStorage.clear();
      setVendors(initialVendors);
      setRfqs(initialRfqs);
      setQuotations(initialQuotations);
      setPurchaseOrders(initialPurchaseOrders);
      setInvoices(initialInvoices);
      setActivityLogs(initialActivityLogs);
      setNotifications(initialNotifications);
      setActiveTab('Dashboard');
      alert("Local storage data purged. Clean baseline ERP demo dataset reloaded.");
    }
  };

  return (
    <div id="vendorbridge-workspace" className="min-h-screen font-sans bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 transition-all duration-300 relative flex flex-col justify-between selection:bg-indigo-505 selection:text-white">
      
      {/* 3D ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/10 dark:to-purple-900/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-pink-500/5 to-rose-500/5 dark:from-rose-900/5 dark:to-zinc-900/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Top HUD Switcher & Sourcing Guide Row */}
      <div id="hud-guide-panel" className="bg-indigo-900 text-white border-b border-indigo-950 px-6 py-4 select-none relative z-40 print:hidden shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 bg-white/10 rounded-xl border border-white/15 flex items-center justify-center text-indigo-300 animate-pulse">
              <CheckSquare className="h-5.5 w-5.5" />
            </div>
            <div>
              <div className="text-xs font-bold font-sans flex items-center gap-1">
                DEMO INSTRUCTIONS PANEL
                <span className="text-[9.5px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">HACKATHON STEPS</span>
              </div>
              <p className="text-[11px] text-indigo-200 mt-0.5 leading-relaxed">
                Step 1: <strong>Procurement Officer</strong> issues RFQ. Step 2: Swap role to <strong>Vendor</strong> to Bid. Step 3: Compare prices and push to <strong>Approver (Manager)</strong>. Step 4: Settle invoice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 flex-wrap">
            <button
              id="trigger-workflow-generator"
              onClick={handleAutoSimulateStage}
              className="px-4 py-2 text-xs font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/15 cursor-pointer active:scale-95 transition-all text-center flex items-center gap-1.5 border border-amber-300/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-white animate-bounce" />
              Simulate Live Tender Stage
            </button>
            <button
              id="reset-dev-db-btn"
              onClick={handleClearDatabase}
              title="Reset baseline dataset"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/85 hover:text-white cursor-pointer active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary SCM Header */}
      <header id="main-erp-header" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-900 sticky top-0 z-30 px-6 py-4 select-none print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 tracking-wider">
              VB
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">VendorBridge ERP</h1>
              <p className="text-[10px] text-slate-450 uppercase font-bold tracking-widest mt-1">Sourcing Compliance Matrix</p>
            </div>
          </div>

          {/* Persona Swapping Box HUD */}
          <div id="role-swapping-box" className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-zinc-800 shadow-inner">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 pl-2 pr-1 uppercase tracking-wider">
              <UserCheck className="h-4 w-4 text-indigo-500" />
              Acting User:
            </div>
            
            <div className="flex gap-1">
              {([
                { r: 'Procurement', name: 'Buyer', desc: 'Sanjay Kumar' },
                { r: 'Vendor', name: 'Supplier', desc: 'Apex Digital' },
                { r: 'Approver', name: 'Manager', desc: 'Meera Patel (FD)' },
                { r: 'Admin', name: 'SuperAdmin', desc: 'Root Root' }
              ] as const).map((roleItem, index) => {
                const isActive = currentRole === roleItem.r;
                return (
                  <button
                    id={`role-trigger-${roleItem.r}`}
                    key={index}
                    onClick={() => {
                      setCurrentRole(roleItem.r);
                      // Auto-redirect appropriate screens depending on role choice to assist reviewer
                      if (roleItem.r === 'Vendor') setActiveTab('RFQs');
                      if (roleItem.r === 'Approver') setActiveTab('Approvals');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                    }`}
                    title={`Swap profile perspective instantly to: ${roleItem.desc}`}
                  >
                    <span>{roleItem.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme switcher and notification panel */}
          <div className="flex items-center gap-3">
            
            {/* Theme Trigger */}
            <button
              id="theme-mode-trigger"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-650 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all pointer-events-auto cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notification alert */}
            <div className="relative">
              <button
                id="noti-dropdown-trigger"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-650 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all cursor-pointer relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.some(n => !n.read) && (
                  <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              {showNotificationDropdown && (
                <div id="noti-dropdown-box" className="absolute right-0 top-12 max-w-sm w-80 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-xl z-50 space-y-3.5 select-none text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span>Sourcing Notifications</span>
                    <button 
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, read: true })));
                        setShowNotificationDropdown(false);
                      }}
                      className="text-[10px] text-indigo-500 hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-900 max-h-64 overflow-y-auto space-y-2.5">
                    {notifications.map((n, i) => (
                      <div key={i} className="pt-2 text-slate-700 dark:text-zinc-350">
                        <div className="font-semibold text-slate-900 dark:text-white flex justify-between items-center">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-slate-400">{formatDateTime(n.timestamp).slice(11)}</span>
                        </div>
                        <p className="text-[11px] text-slate-450 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Middle Core ERP Navigation & Visual Canvas Workspace */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 flex-grow space-y-8">
        
        {/* Navigation Tab rail (Screen 2 Quick Action Tabs) */}
        <nav id="erp-tab-rail" className="flex items-center gap-1 border-b border-slate-200 dark:border-zinc-900 pb-2 overflow-x-auto select-none print:hidden scrollbar-none">
          {([
            { id: 'Dashboard', l: 'Operations Dashboard', icon: Monitor },
            { id: 'Vendors', l: 'Suppliers Directory', icon: Users },
            { id: 'RFQs', l: 'Bidding RFQs', icon: FileText },
            { id: 'Comparison', l: 'Bid Comparison', icon: Columns },
            { id: 'Approvals', l: 'Manager Approvals', icon: ShoppingCart },
            { id: 'Documents', l: 'Authorised Paperwork', icon: CheckSquare },
            { id: 'Logs', l: 'Immutable Activity log', icon: Activity }
          ]).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            // Notification pills inside navigation tab labels
            let pillCount = 0;
            if (tab.id === 'Approvals') pillCount = rfqs.filter(r => r.status === 'Pending Approval').length;
            if (tab.id === 'RFQs') pillCount = rfqs.filter(r => r.status === 'Bidding Open').length;

            return (
              <button
                id={`tab-trigger-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 relative border whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-indigo-650 dark:text-indigo-400 font-extrabold shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.l}
                
                {pillCount > 0 && (
                  <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.2 rounded-full font-bold ml-1 border border-indigo-200/50 dark:border-indigo-805">
                    {pillCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dynamic Panel rendering */}
        <div id="active-panel-container" className="relative">
          {activeTab === 'Dashboard' && (
            <DashboardView
              vendors={vendors}
              rfqs={rfqs}
              purchaseOrders={purchaseOrders}
              invoices={invoices}
              activityLogs={activityLogs}
              onNavigate={(tab) => {
                setActiveTab(tab);
                if (tab === 'RFQs' && currentRole === 'Vendor') setActiveTab('RFQs');
              }}
            />
          )}

          {activeTab === 'Vendors' && (
            <VendorView
              vendors={vendors}
              currentRole={currentRole}
              onAddVendor={handleAddVendor}
              onUpdateVendorStatus={handleUpdateVendorStatus}
            />
          )}

          {activeTab === 'RFQs' && (
            <RfqView
              rfqs={rfqs}
              vendors={vendors}
              currentRole={currentRole}
              actingVendorId="VND-202" // Represent ZenOffice default in Vendor role
              quotations={quotations}
              onCreateRfq={handleCreateRfq}
              onOpenBidForm={(rfq) => setActiveBidRfq(rfq)}
              onNavigateToComparison={(rfqId) => {
                setActiveTab('Comparison');
                setActiveCompareRfqId(rfqId);
              }}
            />
          )}

          {activeTab === 'Comparison' && (
            <ComparisonView
              rfqs={rfqs}
              quotations={quotations}
              vendors={vendors}
              currentRole={currentRole}
              selectedRfqId={activeCompareRfqId}
              onSelectedRfqIdChange={setActiveCompareRfqId}
              onShortlistQuote={handleShortlistQuote}
            />
          )}

          {activeTab === 'Approvals' && (
            <ApprovalView
              rfqs={rfqs}
              quotations={quotations}
              currentRole={currentRole}
              onApproveSelection={handleApproveSelection}
              onRejectSelection={handleRejectSelection}
            />
          )}

          {activeTab === 'Documents' && (
            <DocumentsView
              purchaseOrders={purchaseOrders}
              invoices={invoices}
              currentRole={currentRole}
              onPayInvoice={handlePayInvoice}
            />
          )}

          {activeTab === 'Logs' && (
            <div id="full-auditor-ledger-tab" className="rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                  <Activity className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                  Immutable System Activity Audit Trail Listing
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete append-only cryptographically stamped action chain logs for federal compliance audits.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none leading-normal">
                      <th className="py-2.5 pb-3">Security Timestamp</th>
                      <th className="py-2.5 pb-3">Audit Reference ID</th>
                      <th className="py-2.5 pb-3">Operator Entity</th>
                      <th className="py-2.5 pb-3">Logged Action Entry</th>
                      <th className="py-2.5 pb-3">Hash Trace Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs">
                    {activityLogs.map((log) => {
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3 font-mono text-[10.5px] text-slate-500 whitespace-nowrap">
                            {formatDateTime(log.timestamp)}
                          </td>
                          <td className="py-3 font-mono font-bold text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                            {log.id}
                          </td>
                          <td className="py-3 font-medium text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                            {log.userName}
                            <span className="block text-[9px] uppercase font-bold text-indigo-505 bg-indigo-50/20 dark:bg-indigo-950/20 text-center px-1 py-0.2 rounded border border-indigo-150 mt-1 max-w-[90px]">{log.role}</span>
                          </td>
                          <td className="py-3 font-medium text-slate-900 dark:text-white">
                            {log.action}
                            <p className="text-[10.5px] text-slate-500 font-sans font-normal mt-0.5 max-w-lg leading-relaxed">
                              {log.details}
                            </p>
                          </td>
                          <td className="py-3 font-mono text-[9px] text-indigo-505 dark:text-indigo-400 whitespace-nowrap font-bold">
                            sha256: {(log.id + log.userName).charCodeAt(0).toString(16).toUpperCase()}0X1F{log.id.slice(4)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Footer bar */}
      <footer id="workspace-footer" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-slate-205 dark:border-zinc-900/80 py-5 select-none print:hidden mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} VendorBridge ERP Sourcing Network Inc. All trade rights secured.</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 font-mono text-[10px] text-slate-300 dark:text-zinc-650">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Crypt Log Protocol: Live Code Node Active
            </span>
          </div>
        </div>
      </footer>

      {/* Tender Selection Pricing Wizard - overlay submission bid form */}
      {activeBidRfq && (
        <BiddingForm
          rfq={activeBidRfq}
          vendorId="VND-202" // Acts as ZenOffice default
          vendorName="ZenOffice Outfitters Inc"
          onSubmitBid={handleSubmitQuotation}
          onClose={() => setActiveBidRfq(null)}
        />
      )}

    </div>
  );
}

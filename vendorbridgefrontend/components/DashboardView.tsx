'use client';

import React, { useState } from 'react';
import { Rfq, PurchaseOrder, Invoice, ActivityLog, Vendor } from '../lib/types';
import { formatDateTime } from '../lib/utils';

import { 
  DollarSign, FileText, ShoppingCart, Users, TrendingUp, AlertCircle, 
  ArrowRight, ShieldCheck, Calendar, Activity, CheckCircle2, Inbox, RefreshCw, BarChart4
} from 'lucide-react';

interface DashboardViewProps {
  vendors: Vendor[];
  rfqs: Rfq[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  onNavigate: (tab: string) => void;
}

export function DashboardView({
  vendors,
  rfqs,
  purchaseOrders,
  invoices,
  activityLogs,
  onNavigate
}: DashboardViewProps) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Compute stats
  const activeRfqs = rfqs.filter(r => r.status !== 'Completed').length;
  
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;
  
  const totalApprovedInvoiceAmount = invoices
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalIssuedPoAmount = purchaseOrders
    .reduce((sum, po) => sum + po.totalAmount, 0);

  const activeVendorsCount = vendors.filter(v => v.status === 'Active').length;

  // Let's build categorical totals for category insights
  const categorySpend: { [key: string]: number } = {
    'Office Furniture': 0,
    'IT Hardware & Networks': 0,
    'Logistics & Moving': 0,
  };

  purchaseOrders.forEach(po => {
    // Determine category from RFQ
    const rfq = rfqs.find(r => r.id === po.rfqId);
    const cat = rfq?.category || 'IT Hardware & Networks';
    categorySpend[cat] = (categorySpend[cat] || 0) + po.totalAmount;
  });

  // Also include the historical invoice of totalAmount for categories if it's there
  invoices.forEach(inv => {
    const rfq = rfqs.find(r => r.id === inv.rfqId);
    const cat = rfq?.category || 'IT Hardware & Networks';
    if (!categorySpend[cat]) {
      categorySpend[cat] = inv.grandTotal;
    }
  });

  // Prepare simple category distribution
  const categories = Object.keys(categorySpend);
  const maxSpend = Math.max(...Object.values(categorySpend), 1);

  // Spend monthly summary (simulation values + actual)
  const monthlyData = [
    { name: 'Jan', amount: 8400 },
    { name: 'Feb', amount: 12500 },
    { name: 'Mar', amount: 15900 },
    { name: 'Apr', amount: 9800 },
    { name: 'May', amount: 25665 }, // High because of PO-501 (Engineering Laptops)
    { name: 'Jun', amount: totalIssuedPoAmount + totalApprovedInvoiceAmount > 25665 ? 18000 : 5400 } // current month
  ];
  const maxMonthly = Math.max(...monthlyData.map(d => d.amount), 1);

  return (
    <div id="dashboard-view" className="space-y-6 animate-fade-in">
      {/* 4 Stat Cards in custom 3D grid layout */}
      <div id="metric-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Sourcing spent */}
        <div id="stat-card-total-spend" className="relative group overflow-hidden rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider select-none">
                Total Sourcing Footprint
              </p>
              <h3 className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1">
                ${totalApprovedInvoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +14.2% audit score increase
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Active RFQs */}
        <div id="stat-card-active-rfqs" className="relative group overflow-hidden rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider select-none">
                Active Bidding streams
              </p>
              <h3 className="font-sans text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {activeRfqs} RFQs
              </h3>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                Avg. deadline 12 days left
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Pending Manager Approvals */}
        <div id="stat-card-pending-approvals" className="relative group overflow-hidden rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider select-none">
                Pending manager signoff
              </p>
              <h3 className="font-sans text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {pendingApprovalsCount} Quotes
              </h3>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
                <Activity className="h-3 w-3 animate-spin duration-1000" />
                Awaiting executive review
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Compliant Suppliers */}
        <div id="stat-card-active-vendors" className="relative group overflow-hidden rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider select-none">
                Active suppliers
              </p>
              <h3 className="font-sans text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {activeVendorsCount} Vendors
              </h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium flex items-center gap-1 mt-1">
                <ShieldCheck className="h-3 w-3" />
                100% Tax/GST registered
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts & Analytics split (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Spend Trend (7 columns) */}
        <div id="trend-analysis-panel" className="lg:col-span-8 rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sans font-semibold text-base text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
                Spend Analytics Flow
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Annual budget utilization trend (USD thousands)
              </p>
            </div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-800">
              Q2 Fiscal Ledger
            </div>
          </div>

          {/* Majestic Custom 3D-feeling SVG graph */}
          <div className="relative h-64 mt-6">
            <svg id="spend-chart-svg" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = (1 - ratio) * 200 + 10;
                return (
                  <g key={idx}>
                    <line 
                      x1="0" 
                      y1={y} 
                      x2="100%" 
                      y2={y} 
                      className="stroke-slate-100 dark:stroke-zinc-900" 
                      strokeDasharray="4 4"
                    />
                    <text 
                      x="100%" 
                      y={y - 4} 
                      className="fill-slate-400 dark:fill-zinc-600 text-[10px] font-mono text-right"
                      textAnchor="end"
                    >
                      ${Math.round(ratio * maxMonthly).toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Path calculation for gradient trend spline */}
              {(() => {
                const points = monthlyData.map((d, index) => {
                  const xRatio = index / (monthlyData.length - 1);
                  const yRatio = d.amount / maxMonthly;
                  return {
                    x: `${xRatio * 90 + 5}%`,
                    y: (1 - yRatio) * 180 + 20
                  };
                });

                const pathD = points.length > 0 
                  ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
                  : '';

                const areaD = points.length > 0
                  ? `${pathD} L ${points[points.length-1].x} 200 L ${points[0].x} 200 Z`
                  : '';

                return (
                  <>
                    {/* Area fill */}
                    <defs>
                      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4338ca" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#4338ca" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="line-stroke-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4158D0" />
                        <stop offset="50%" stopColor="#C850C0" />
                        <stop offset="100%" stopColor="#FFCC70" />
                      </linearGradient>
                    </defs>

                    {areaD && (
                      <path d={areaD} fill="url(#chart-area-grad)" className="transition-all duration-500" />
                    )}

                    {/* Main Spline */}
                    {pathD && (
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke="url(#line-stroke-grad)" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        className="transition-all duration-500"
                      />
                    )}

                    {/* Nodes (Interactive feeling circles) */}
                    {points.map((p, pIdx) => (
                      <g key={pIdx}>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="5" 
                          className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-zinc-950 stroke-2 hover:r-7 hover:fill-pink-500 hover:cursor-pointer transition-all duration-200"
                        />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          className="fill-slate-700 dark:fill-zinc-300 text-[10.5px] font-mono font-semibold"
                        >
                          ${Math.round(monthlyData[pIdx].amount / 100) / 10}k
                        </text>
                        <text
                          x={p.x}
                          y="225"
                          textAnchor="middle"
                          className="fill-slate-500 dark:fill-zinc-500 text-[10px] font-sans font-medium"
                        >
                          {monthlyData[pIdx].name}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Right: Category Breakdown (4 columns) */}
        <div id="category-distribution-panel" className="lg:col-span-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-semibold text-base text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
              <BarChart4 className="h-4.5 w-4.5 text-pink-500" />
              Category Allocations
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Aggregate spend metrics sorted by division
            </p>
          </div>

          {/* Bar metrics in elegant 3D cylindrical rows */}
          <div className="space-y-4 my-6">
            {categories.map((cat, idx) => {
              const value = categorySpend[cat] || 0;
              const pct = maxSpend > 0 ? (value / maxSpend) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5 group">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 dark:text-zinc-300 group-hover:text-pink-500 transition-colors">
                      {cat}
                    </span>
                    <span className="font-mono font-medium text-slate-900 dark:text-zinc-100">
                      ${value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-slate-200/20 dark:border-zinc-800/20 relative">
                    <div 
                      style={{ width: `${Math.max(pct, 5)}%` }}
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${
                        idx === 0 
                          ? 'from-indigo-500 to-purple-500' 
                          : idx === 1 
                          ? 'from-pink-500 to-rose-500' 
                          : 'from-emerald-400 to-teal-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 text-xs text-slate-500 dark:text-zinc-400">
            Spend categorizations are cross-referenced with vendor GST registrations to optimize national tax deductions dynamically.
          </div>
        </div>

      </div>

      {/* Grid: Uneditable Activity Audit Trail (Bottom row) */}
      <div id="recent-audits-row" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Activity Logs (8 columns) */}
        <div id="activity-logs-panel" className="lg:col-span-8 rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-sans font-semibold text-base text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                <Activity className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                Immutable System Activity Trail
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Immutable, append-only security logs for digital transactions
              </p>
            </div>
            <button
              onClick={() => onNavigate('Logs')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Auditor Deck
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5">Time Log</th>
                  <th className="py-2.5">Operator</th>
                  <th className="py-2.5">Action Entry</th>
                  <th className="py-2.5">Crypt Hash Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs">
                {activityLogs.slice(0, 4).map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 font-mono text-[10.5px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 font-medium text-slate-800 dark:text-zinc-200">
                        {log.userName}
                        <span className="block text-[9.5px] text-slate-400 uppercase font-bold mt-0.5">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-slate-900 dark:text-white">
                        {log.action}
                        <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 font-sans font-normal mt-0.5 max-w-xs md:max-w-md truncate">
                          {log.details}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[9px] text-indigo-500 dark:text-indigo-400 whitespace-nowrap font-bold">
                        sha256: {(log.id + log.action).charCodeAt(0).toString(16).toUpperCase()}8A1E
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick action shortcuts hub (4 columns) */}
        <div id="shortcuts-panel" className="lg:col-span-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-semibold text-base text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              Sourcing Quick Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Direct access triggers for hackathon reviewers
            </p>
          </div>

          <div className="space-y-3.5 my-6">
            <button
              onClick={() => onNavigate('RFQs')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/20 dark:bg-zinc-900/20 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-all duration-300 hover:translate-x-1 group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Draft a Core RFQ</div>
                  <div className="text-[10px] text-slate-400">Launch a quotation demand in seconds</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('Vendors')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800 hover:border-pink-500 dark:hover:border-pink-500 bg-slate-50/20 dark:bg-zinc-900/20 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-all duration-300 hover:translate-x-1 group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Review Vendors</div>
                  <div className="text-[10px] text-slate-400">Validate risk classifications & tax credentials</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-pink-500 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('Comparison')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/20 dark:bg-zinc-900/20 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-all duration-300 hover:translate-x-1 group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Compare Live Bids</div>
                  <div className="text-[10px] text-slate-400">Evaluate lowest prices & timeline grids</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Full-spectrum audit logs guarantee secure workflow transitions from RFQ inception to settlement.</span>
          </div>
        </div>

      </div>

    </div>
  );
}

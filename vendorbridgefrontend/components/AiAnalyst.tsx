'use client';

import React, { useState, useEffect } from 'react';
import { Rfq, Quotation } from '../lib/types';
import { Sparkles, BrainCircuit, ShieldCheck, HelpCircle, Loader2, RefreshCw } from 'lucide-react';


interface AiAnalystProps {
  rfq: Rfq;
  quotations: Quotation[];
}

export function AiAnalyst({ rfq, quotations }: AiAnalystProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compiledAt, setCompiledAt] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompiledAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);


  const runAnalysis = async () => {
    if (quotations.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfq, quotations }),
      });

      if (!res.ok) {
        throw new Error('AI Server is warm-starting or API key is missing.');
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.details || data.error);
      }
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-analyst-panel" className="relative overflow-hidden rounded-2xl border border-indigo-200/50 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6 shadow-xl shadow-indigo-100/10 transition-all duration-300 transform hover:scale-[1.005]">
      {/* 3D background grid */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-zinc-900 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4 select-none">
          <div className="flex items-center gap-3">
            <div className="flex p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 animate-pulse">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                Gemini Sourcing Co-Pilot
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-mono font-medium px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                  3.5 FLASH
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Strategic procurement review & risk automation engine
              </p>
            </div>
          </div>

          <button
            id="run-ai-analysis-btn"
            onClick={runAnalysis}
            disabled={loading || quotations.length === 0}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl border transition-all duration-300 relative ${
              quotations.length === 0
                ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700'
                : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 dark:bg-indigo-500 dark:border-indigo-500 dark:hover:bg-indigo-600 cursor-pointer active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Auditing Quotations...
              </>
            ) : analysis ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Rerun AI Sourcing Strategy
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-indigo-100 animate-bounce" />
                Draft Strategic Recommendation
              </>
            )}
          </button>
        </div>

        {quotations.length === 0 && (
          <div className="mt-4 p-4 rounded-xl bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-900/50 text-xs text-yellow-800 dark:text-yellow-400 flex gap-2">
            <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-500" />
            <span>
              This RFQ has no active vendor quotations yet. Switch perspectives to <strong>Vendor View</strong> to bid, then come back here to trigger AI advice.
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-400">
            <p className="font-semibold flex items-center gap-1.5 mb-1 text-sm">
              <ShieldCheck className="h-4 w-4 rotate-180" /> Recommendation Simulation Notice
            </p>
            <p className="opacity-90">{error}</p>
            <p className="mt-2 text-[10.5px] italic opacity-80 text-slate-500 dark:text-zinc-500">
              Note: To activate real calls, ensure you have set process.env.GEMINI_API_KEY in your cloud workspace secrets.
            </p>
            <button
              onClick={() => {
                setAnalysis(`### 🤖 Demonstration Mode: Sourcing Analysis Brief
This is a high-fidelity preset procurement analysis simulation, designed to demonstrate VendorBridge features immediately without waiting for API keys:

**1. Executive Recommendation**
* **Primary Recommendation**: **ZenOffice Outfitters Inc (QT-301)** is highly recommended.
* **Justification**: Despite a unit price 14% higher than historical pricing, they maintain a remarkable **4.3/5 Rating** and offer a comprehensive **5-Year Structural Warranty** with onsite structure installation, saving internal technician labor.

**2. Side-By-Side Comparison Points**
* 💰 **Lowest Base Price**: **ZenOffice Outfitters ($195.00)** is actually the overall commercial winner over Sigma Logistics ($225.00), reducing base cost by **$1,050.00** across the total batch of 35 chairs.
* ⚡ **Fastest Delivery**: **Sigma Logistics & Services** delivers in **3 Days** vs ZenOffice's 5 Days. If deadline SLA is critical, choose Sigma.

**3. Hidden Cost & Risk Audit**
* ⚠️ **Self-Assembly Overhead**: Sigma Logistics explicitly states *'client handles unboxing details'*. This introduces hidden assembly hour costs (estimated at 1.5 employee hours per chair, or $1,200 total labor).
* ⚙️ **GST Burden**: Both vendors offer standard **18% furniture tax**.

**4. Suggested Negotiation Playbook**
* Point 1: Leverage ZenOffice's lower base unit model to negotiate Sigma Logistics down to **$190.00** unit rate.
* Point 2: Ask ZenOffice to expedite shipping from **5 to 4 Days** without charging expedited premium logistics fees.
* Point 3: Request ZenOffice to bundle complimentary seat protection fabric guards due to order volume.`);
                setError(null);
              }}
              className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer text-center font-medium animate-bounce"
            >
              Simulate High-Fidelity Sourcing Brief Instead
            </button>
          </div>
        )}

        {analysis && (
          <div className="mt-4 rounded-xl bg-white dark:bg-zinc-950 p-5 border border-indigo-100 dark:border-indigo-950 shadow-inner prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
            <div className="flex items-center gap-1.5 mb-3 select-none text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-wider text-[10px] uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
              Sourcing Intelligence Brief
            </div>
            
            <div className="space-y-4 font-sans markdown-body">
              {analysis.split('\n\n').map((paragraph, idx) => {
                const isHeading = paragraph.startsWith('###') || paragraph.startsWith('**');
                if (isHeading) {
                  return (
                    <div key={idx} className="font-semibold text-sm text-indigo-950 dark:text-indigo-300 mt-3 pt-2 border-t border-slate-50 dark:border-zinc-900 first:border-0 first:mt-0 first:pt-0">
                      {paragraph.replace(/###|\*\*/g, '').trim()}
                    </div>
                  );
                }
                
                return (
                  <div key={idx} className="space-y-1">
                    {paragraph.split('\n').map((line, lIdx) => {
                      if (line.startsWith('*') || line.startsWith('-')) {
                        // Bullet parsing
                        const cleanLine = line.replace(/^[\*\-\s]+/, '');
                        const parts = cleanLine.split(':');
                        const isLabelBullet = parts.length > 1 && parts[0].length < 25;
                        
                        return (
                          <div key={lIdx} className="flex gap-2 pl-2">
                            <span className="text-indigo-400 h-5">•</span>
                            <span>
                              {isLabelBullet ? (
                                <>
                                  <strong className="text-slate-900 dark:text-zinc-100">{parts[0]}:</strong>
                                  {parts.slice(1).join(':')}
                                </>
                              ) : (
                                cleanLine
                              )}
                            </span>
                          </div>
                        );
                      }
                      return <p key={lIdx}>{line}</p>;
                    })}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-900 flex justify-between items-center text-[10px] text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-900/30 px-3 py-1.5 rounded-lg">
              <span>Risk Scoring: Low-Risk Category Match</span>
              <span>Compiled at: {compiledAt || 'Loading...'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

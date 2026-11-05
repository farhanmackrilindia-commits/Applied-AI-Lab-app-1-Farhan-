import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import {
  VarianceCalculationResult,
  RegionVarianceAnalysis,
} from '../types/sales';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface AISummaryCardProps {
  varianceResult: VarianceCalculationResult;
  onRefreshTrigger?: () => void;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  varianceResult,
}) => {
  const [metricMode, setMetricMode] = useState<'dollar' | 'pct'>('dollar');
  const [selectedRegionName, setSelectedRegionName] = useState<string>('');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState<boolean>(false);
  const [sourceModel, setSourceModel] = useState<string>('gemini-3.8-flash');

  // Determine active region based on metric mode or manual selection
  const topDollarRegion = varianceResult.mostChangedByDollar;
  const topPctRegion = varianceResult.mostChangedByPct;

  const defaultRegion = metricMode === 'dollar' ? topDollarRegion : topPctRegion;
  const activeRegion: RegionVarianceAnalysis | null =
    varianceResult.regions.find((r) => r.region === selectedRegionName) ||
    defaultRegion ||
    varianceResult.regions[0] ||
    null;

  // Sync selectedRegionName when varianceResult changes
  useEffect(() => {
    if (defaultRegion && !selectedRegionName) {
      setSelectedRegionName(defaultRegion.region);
    }
  }, [varianceResult, defaultRegion, selectedRegionName]);

  // Fetch AI summary from server
  const fetchAiSummary = async (regionToAnalyze?: RegionVarianceAnalysis) => {
    const target = regionToAnalyze || activeRegion;
    if (!target || !varianceResult.hasQ2AndQ3) return;

    setIsLoading(true);
    setErrorMsg(null);

    const payload = {
      selectedRegion: {
        region: target.region,
        q2Revenue: target.q2Revenue,
        q3Revenue: target.q3Revenue,
        dollarChange: target.dollarChange,
        pctChange: target.pctChange,
        absDollarChange: target.absDollarChange,
        absPctChange: target.absPctChange,
        q2Units: target.q2Units,
        q3Units: target.q3Units,
        unitChange: target.unitChange,
        unitPctChange: target.unitPctChange,
        q2AvgDiscount: target.q2AvgDiscount,
        q3AvgDiscount: target.q3AvgDiscount,
        topGrownProduct: target.topGrownProduct,
        topDeclinedProduct: target.topDeclinedProduct,
        topChannel: target.topChannel,
      },
      allRegions: varianceResult.regions.map((r) => ({
        region: r.region,
        q2Revenue: r.q2Revenue,
        q3Revenue: r.q3Revenue,
        dollarChange: r.dollarChange,
        pctChange: r.pctChange,
        absDollarChange: r.absDollarChange,
        absPctChange: r.absPctChange,
      })),
      overallTotals: {
        q2Revenue: varianceResult.overallQ2Revenue,
        q3Revenue: varianceResult.overallQ3Revenue,
        dollarChange: varianceResult.overallDollarChange,
        pctChange: varianceResult.overallPctChange,
      },
    };

    try {
      const res = await fetch('/api/analyze-variance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
        setSourceModel(data.model || 'gemini-3.8-flash');
      } else {
        throw new Error('No summary returned in server response');
      }
    } catch (err: any) {
      console.error('AI summary fetch failed:', err);
      setErrorMsg('Failed to generate summary from AI endpoint. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load or when active target or filtered metrics change
  useEffect(() => {
    if (activeRegion && varianceResult.hasQ2AndQ3) {
      fetchAiSummary(activeRegion);
    }
  }, [activeRegion?.region, activeRegion?.q2Revenue, activeRegion?.q3Revenue, varianceResult.hasQ2AndQ3]);

  const handleCopy = () => {
    if (!aiSummary) return;
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Split summary into sentences for structured display
  const splitSentences = (text: string): string[] => {
    if (!text) return [];
    // Match sentences ending in punctuation
    const matched = text.match(/[^.!?]+[.!?]+(\s|$)/g);
    if (matched && matched.length > 0) {
      return matched.map((s) => s.trim()).filter(Boolean);
    }
    return [text.trim()];
  };

  const sentences = splitSentences(aiSummary);

  if (!varianceResult.hasQ2AndQ3) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-amber-200">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2">
          <Info className="w-5 h-5" />
          <span>Quarterly Variance Analysis Waiting for Q2 and Q3</span>
        </div>
        <p className="text-sm text-slate-300">
          The uploaded dataset does not contain both Quarter 2 (Q2) and Quarter 3 (Q3) orders. Please upload a dataset containing both quarters to unlock AI variance summaries and calculations.
        </p>
      </div>
    );
  }

  if (!activeRegion) return null;

  const isPositiveShift = activeRegion.dollarChange >= 0;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-925 border border-slate-700/80 shadow-xl overflow-hidden relative">
      {/* Accent glow line */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Card Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  AI Quarterly Variance Summary: Q2 to Q3
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                  3-Sentence Grounded Analysis
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated strictly from order totals, volume shifts, product drivers, and discount metrics
              </p>
            </div>
          </div>

          {/* Region Selector & Mode Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dollar vs Pct change filter buttons */}
            <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => {
                  setMetricMode('dollar');
                  if (topDollarRegion) setSelectedRegionName(topDollarRegion.region);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  metricMode === 'dollar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Region with largest dollar difference |Q3 - Q2|"
              >
                Largest $ Shift
              </button>
              <button
                onClick={() => {
                  setMetricMode('pct');
                  if (topPctRegion) setSelectedRegionName(topPctRegion.region);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  metricMode === 'pct'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Region with largest percentage difference |Q3 - Q2| / Q2"
              >
                Largest % Shift
              </button>
            </div>

            {/* Region dropdown */}
            <select
              value={activeRegion.region}
              onChange={(e) => setSelectedRegionName(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {varianceResult.regions.map((r) => (
                <option key={r.region} value={r.region}>
                  {r.region}{' '}
                  {r.region === topDollarRegion?.region
                    ? '★ (Most $ Changed)'
                    : r.region === topPctRegion?.region
                    ? '★ (Most % Changed)'
                    : ''}
                </option>
              ))}
            </select>

            {/* Refresh / Regenerate */}
            <button
              onClick={() => fetchAiSummary()}
              disabled={isLoading}
              title="Regenerate 3-sentence summary"
              className="p-1.5 rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Calculated Metrics Highlight Ribbon for Active Region */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Top Changing Region</div>
            <div className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">{activeRegion.region}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {activeRegion.region === topDollarRegion?.region ? '#1 absolute $ shift' : '#1 % change'}
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Q2 Revenue</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200 mt-0.5">
              {formatCurrency(activeRegion.q2Revenue)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{activeRegion.q2Units.toLocaleString()} units sold</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Q3 Revenue</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200 mt-0.5">
              {formatCurrency(activeRegion.q3Revenue)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{activeRegion.q3Units.toLocaleString()} units sold</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Dollar Variance</div>
            <div
              className={`text-xs sm:text-sm font-bold font-mono flex items-center space-x-1 mt-0.5 ${
                isPositiveShift ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositiveShift ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>
                {isPositiveShift ? '+' : ''}
                {formatCurrency(activeRegion.dollarChange)}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {formatPercentage(activeRegion.pctChange, true)} change
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Unit Sales Shift</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-cyan-300 mt-0.5">
              {activeRegion.unitChange >= 0 ? '+' : ''}
              {activeRegion.unitChange.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {formatPercentage(activeRegion.unitPctChange, true)} volume
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Avg Discount Rate</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-amber-300 mt-0.5">
              {activeRegion.q2AvgDiscount.toFixed(1)}% → {activeRegion.q3AvgDiscount.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {(activeRegion.q3AvgDiscount - activeRegion.q2AvgDiscount >= 0 ? '+' : '') +
                (activeRegion.q3AvgDiscount - activeRegion.q2AvgDiscount).toFixed(1)}
              % rate delta
            </div>
          </div>
        </div>

        {/* AI Three-Sentence Output Container */}
        <div className="rounded-xl bg-slate-950/90 border border-indigo-500/30 p-5 relative shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Grounded Three-Sentence Synthesis</span>
              <span className="text-[10px] text-slate-500 font-mono">({sourceModel})</span>
            </div>
            <button
              onClick={handleCopy}
              disabled={isLoading || !aiSummary}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center space-y-3">
              <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating strictly grounded three-sentence variance summary...</span>
              </div>
              <div className="space-y-2 max-w-xl mx-auto px-4">
                <div className="h-3 bg-slate-800 rounded animate-pulse w-full" />
                <div className="h-3 bg-slate-800 rounded animate-pulse w-5/6 mx-auto" />
                <div className="h-3 bg-slate-800 rounded animate-pulse w-4/6 mx-auto" />
              </div>
            </div>
          ) : errorMsg ? (
            <div className="py-4 text-center text-rose-400 text-xs">
              <p>{errorMsg}</p>
              <button
                onClick={() => fetchAiSummary()}
                className="mt-2 text-indigo-400 hover:underline font-semibold"
              >
                Click here to retry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Structured sentence display */}
              <div className="space-y-2.5">
                {sentences.map((sent, idx) => {
                  const tagColors = [
                    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                  ];
                  const labels = ['Sentence 1 • Revenue Shift', 'Sentence 2 • Volume Driver', 'Sentence 3 • Dynamics'];

                  return (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 transition-all hover:border-slate-700"
                    >
                      <div className="shrink-0 pt-0.5">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
                            tagColors[idx % 3]
                          }`}
                        >
                          {labels[idx] || `Sentence ${idx + 1}`}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal flex-1">
                        {sent}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Ground Truth Audit Drawer */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
          <button
            onClick={() => setShowAuditDrawer(!showAuditDrawer)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">
                Ground Truth Verification Audit: Numbers Grounding the AI
              </span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500">
              <span>{showAuditDrawer ? 'Hide Details' : 'View Audit Breakdown'}</span>
              {showAuditDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showAuditDrawer && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3 text-xs">
              <p className="text-slate-400 text-[11px]">
                The AI summary is strictly constrained to cite ONLY the exact computed figures listed below. Every dollar amount, percentage, unit quantity, product shift, and discount rate is directly verifiable against the app's calculation engine:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                {/* Left: Region Core Numbers */}
                <div className="space-y-1.5 p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono">
                  <div className="font-semibold text-slate-200 uppercase tracking-wider mb-1 font-sans text-xs">
                    {activeRegion.region} Calculations:
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Q2 Total Revenue:</span>
                    <span className="text-slate-100">{formatCurrency(activeRegion.q2Revenue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Q3 Total Revenue:</span>
                    <span className="text-slate-100">{formatCurrency(activeRegion.q3Revenue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Absolute Revenue Delta:</span>
                    <span className={activeRegion.dollarChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {activeRegion.dollarChange >= 0 ? '+' : ''}
                      {formatCurrency(activeRegion.dollarChange)} ({formatPercentage(activeRegion.pctChange, true)})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Units Sold (Q2 vs Q3):</span>
                    <span className="text-cyan-300">
                      {activeRegion.q2Units.toLocaleString()} → {activeRegion.q3Units.toLocaleString()} (
                      {activeRegion.unitChange >= 0 ? '+' : ''}
                      {activeRegion.unitChange.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Average Discount Rate:</span>
                    <span className="text-amber-300">
                      {activeRegion.q2AvgDiscount.toFixed(2)}% in Q2 vs {activeRegion.q3AvgDiscount.toFixed(2)}% in Q3
                    </span>
                  </div>
                </div>

                {/* Right: Driver Decomposition */}
                <div className="space-y-1.5 p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono">
                  <div className="font-semibold text-slate-200 uppercase tracking-wider mb-1 font-sans text-xs">
                    Driver Decomposition:
                  </div>
                  {activeRegion.topGrownProduct && (
                    <div className="flex justify-between text-slate-300">
                      <span>Top Growing Product:</span>
                      <span className="text-emerald-400">
                        {activeRegion.topGrownProduct.product} (+{formatCurrency(activeRegion.topGrownProduct.deltaRevenue)})
                      </span>
                    </div>
                  )}
                  {activeRegion.topDeclinedProduct && (
                    <div className="flex justify-between text-slate-300">
                      <span>Top Declining Product:</span>
                      <span className="text-rose-400">
                        {activeRegion.topDeclinedProduct.product} ({formatCurrency(activeRegion.topDeclinedProduct.deltaRevenue)})
                      </span>
                    </div>
                  )}
                  {activeRegion.topChannel && (
                    <div className="flex justify-between text-slate-300">
                      <span>Top Moving Channel:</span>
                      <span className="text-indigo-300">
                        {activeRegion.topChannel.channel} ({formatCurrency(activeRegion.topChannel.q3Revenue)} in Q3)
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Order Transactions:</span>
                    <span className="text-slate-200">
                      {activeRegion.q2OrderCount} orders in Q2 → {activeRegion.q3OrderCount} orders in Q3
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Portfolio Q2 → Q3:</span>
                    <span className="text-slate-200">
                      {formatCurrency(varianceResult.overallQ2Revenue)} → {formatCurrency(varianceResult.overallQ3Revenue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

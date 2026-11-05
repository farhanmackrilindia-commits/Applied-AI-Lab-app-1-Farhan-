import React, { useState } from 'react';
import {
  BarChart3,
  Upload,
  FileSpreadsheet,
  Download,
  Sparkles,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { getSampleCsvString, getTemplateCsvString } from '../data/sampleDatasets';

interface HeaderProps {
  orderCount: number;
  regionCount: number;
  quarterCount: number;
  totalRevenue: number;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  isLoadingAi: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  orderCount,
  regionCount,
  quarterCount,
  totalRevenue,
  onOpenUpload,
  onLoadSample,
  isLoadingAi,
}) => {
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                Sales Order Variance Intelligence
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Quarterly regional revenue matrix, variance decomposition &amp; grounded 3-sentence AI summaries
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="hidden lg:flex items-center space-x-2.5 text-xs text-slate-300">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center space-x-1.5">
            <span className="text-slate-400">Orders:</span>
            <span className="font-semibold text-slate-100">{orderCount.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center space-x-1.5">
            <span className="text-slate-400">Regions:</span>
            <span className="font-semibold text-slate-100">{regionCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center space-x-1.5">
            <span className="text-slate-400">Quarters:</span>
            <span className="font-semibold text-slate-100">{quarterCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center space-x-1.5">
            <span className="text-slate-400">Portfolio Total:</span>
            <span className="font-semibold font-mono text-emerald-400">
              ${Math.round(totalRevenue).toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onLoadSample}
            title="Load realistic sample sales orders dataset"
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-750 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5 shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Load Sample CSV</span>
            <span className="sm:hidden">Sample</span>
          </button>

          {/* Download CSV Templates Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-750 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">CSVs</span>
            </button>

            {downloadMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setDownloadMenuOpen(false)}
              >
                <button
                  onClick={() => downloadFile(getSampleCsvString(), 'sample_sales_orders.csv')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-medium">Download Sample Dataset</div>
                    <div className="text-[10px] text-slate-400">71 orders with Q1-Q4 metrics</div>
                  </div>
                </button>
                <button
                  onClick={() => downloadFile(getTemplateCsvString(), 'sales_orders_template.csv')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors border-t border-slate-800"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium">Download Blank Template</div>
                    <div className="text-[10px] text-slate-400">Pre-formatted headers for custom data</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg shadow-md shadow-indigo-600/25 border border-indigo-400/30 transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};

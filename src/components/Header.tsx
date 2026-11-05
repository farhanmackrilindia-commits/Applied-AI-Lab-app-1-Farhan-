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
    <header className="border-b border-orange-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">
                Sales Order Variance Intelligence
              </h1>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Quarterly regional revenue matrix, variance decomposition &amp; grounded 3-sentence summaries
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="hidden lg:flex items-center space-x-2.5 text-xs text-stone-700 tabular-nums">
          <div className="px-3 py-1.5 rounded-lg bg-orange-50/60 border border-orange-200/80 flex items-center space-x-1.5">
            <span className="text-stone-500">Orders:</span>
            <span className="font-semibold text-stone-900">{orderCount.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-50/60 border border-orange-200/80 flex items-center space-x-1.5">
            <span className="text-stone-500">Regions:</span>
            <span className="font-semibold text-stone-900">{regionCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-50/60 border border-orange-200/80 flex items-center space-x-1.5">
            <span className="text-stone-500">Quarters:</span>
            <span className="font-semibold text-stone-900">{quarterCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-50/60 border border-orange-200/80 flex items-center space-x-1.5">
            <span className="text-stone-500">Portfolio Total:</span>
            <span className="font-semibold font-mono text-orange-700">
              ${Math.round(totalRevenue).toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onLoadSample}
            title="Load realistic sample sales orders dataset"
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-orange-50 hover:text-orange-700 rounded-lg border border-orange-200 transition-colors flex items-center space-x-1.5 whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Load Sample CSV</span>
            <span className="sm:hidden">Sample</span>
          </button>

          {/* Download CSV Templates Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-orange-50 hover:text-orange-700 rounded-lg border border-orange-200 transition-colors flex items-center space-x-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">CSVs</span>
            </button>

            {downloadMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white border border-orange-200 shadow-lg py-1.5 z-50"
                onMouseLeave={() => setDownloadMenuOpen(false)}
              >
                <button
                  onClick={() => downloadFile(getSampleCsvString(), 'sample_sales_orders.csv')}
                  className="w-full text-left px-3.5 py-2 text-xs text-stone-800 hover:bg-orange-50 flex items-center space-x-2 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Download Sample Dataset</div>
                    <div className="text-[10px] text-stone-500">71 orders with Q1-Q4 metrics</div>
                  </div>
                </button>
                <button
                  onClick={() => downloadFile(getTemplateCsvString(), 'sales_orders_template.csv')}
                  className="w-full text-left px-3.5 py-2 text-xs text-stone-800 hover:bg-orange-50 flex items-center space-x-2 transition-colors border-t border-orange-100"
                >
                  <FileSpreadsheet className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="font-medium">Download Blank Template</div>
                    <div className="text-[10px] text-stone-500">Pre-formatted headers for custom data</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg border border-orange-600 transition-colors flex items-center space-x-1.5 whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};

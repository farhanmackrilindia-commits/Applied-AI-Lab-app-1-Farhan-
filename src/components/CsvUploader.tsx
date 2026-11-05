import React, { useState, useRef, DragEvent } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { parseSalesCsv, ParseResult } from '../utils/csvParser';
import { SalesOrder } from '../types/sales';
import { getSampleCsvString } from '../data/sampleDatasets';

interface CsvUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onOrdersLoaded: (orders: SalesOrder[], filename: string) => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  isOpen,
  onClose,
  onOrdersLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<ParseResult | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessCsv = (csvContent: string, name: string) => {
    setErrorMsg(null);
    try {
      const result = parseSalesCsv(csvContent);
      if (result.errors.length > 0) {
        setErrorMsg(result.errors.join(' '));
        setPreviewResult(result);
        return;
      }
      setPreviewResult(result);
      setFileName(name);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse CSV file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessCsv(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessCsv(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleConfirmLoad = () => {
    if (previewResult && previewResult.orders.length > 0) {
      onOrdersLoaded(previewResult.orders, fileName || 'Uploaded_Sales_Data.csv');
      onClose();
    }
  };

  const handleLoadSampleInModal = () => {
    const sampleCsv = getSampleCsvString();
    handleProcessCsv(sampleCsv, 'Sample_Global_Sales_Orders.csv');
  };

  const requiredCols = [
    { key: 'quarter', label: 'quarter' },
    { key: 'region', label: 'region' },
    { key: 'channel', label: 'channel' },
    { key: 'product', label: 'product' },
    { key: 'units', label: 'units' },
    { key: 'discount_pct', label: 'discount_pct' },
    { key: 'revenue', label: 'revenue' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Upload Sales Orders CSV</h2>
              <p className="text-xs text-slate-400">
                Required columns: <span className="font-mono text-slate-300">quarter, region, channel, product, units, discount_pct, revenue</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tab Selector */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'upload'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Choose / Drop File</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'paste'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Raw CSV Text</span>
            </button>
            <div className="flex-1" />
            <button
              onClick={handleLoadSampleInModal}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              <span>Use standard sample data</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mb-1">
                Drop your sales orders CSV here, or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-500">
                Supports standard CSV files with headers. Number formats like $1,000 and 15% are auto-converted.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Paste CSV Contents directly:</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="quarter,region,channel,product,units,discount_pct,revenue&#10;Q2,North America,Enterprise Direct,Apex Cloud,120,10,43200&#10;Q3,North America,Enterprise Direct,Apex Cloud,190,8.5,69530"
                className="w-full h-36 p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleProcessCsv(pastedText, 'Pasted_Data.csv')}
                disabled={!pastedText.trim()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-40 transition-colors"
              >
                Parse Pasted CSV
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Parsing Error: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Column Detection Status */}
          {previewResult && (
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Column Mapping Detection:</span>
                <span className="text-xs text-slate-400">
                  {previewResult.orders.length} valid rows detected ({previewResult.totalRawRows} raw lines)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {requiredCols.map(({ key, label }) => {
                  const mapped = (previewResult.mappedColumns as any)[key];
                  return (
                    <div
                      key={key}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        mapped
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <span className="font-mono">{label}</span>
                      {mapped ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Data Preview snippet */}
              {previewResult.orders.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Preview (First 3 Rows):
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-[11px] text-left text-slate-300">
                      <thead className="bg-slate-800/60 text-slate-400">
                        <tr>
                          <th className="px-2.5 py-1">Quarter</th>
                          <th className="px-2.5 py-1">Region</th>
                          <th className="px-2.5 py-1">Channel</th>
                          <th className="px-2.5 py-1">Product</th>
                          <th className="px-2.5 py-1 text-right">Units</th>
                          <th className="px-2.5 py-1 text-right">Discount</th>
                          <th className="px-2.5 py-1 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {previewResult.orders.slice(0, 3).map((r) => (
                          <tr key={r.id}>
                            <td className="px-2.5 py-1 font-mono text-indigo-300">{r.quarter}</td>
                            <td className="px-2.5 py-1 font-medium text-slate-200">{r.region}</td>
                            <td className="px-2.5 py-1 text-slate-400">{r.channel}</td>
                            <td className="px-2.5 py-1 text-slate-300">{r.product}</td>
                            <td className="px-2.5 py-1 text-right font-mono">{r.units}</td>
                            <td className="px-2.5 py-1 text-right font-mono">{r.discount_pct.toFixed(1)}%</td>
                            <td className="px-2.5 py-1 text-right font-mono text-emerald-400">
                              ${r.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {fileName && <span className="font-mono text-slate-300">{fileName}</span>}
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLoad}
              disabled={!previewResult || previewResult.orders.length === 0}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-all"
            >
              <span>Load Dataset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

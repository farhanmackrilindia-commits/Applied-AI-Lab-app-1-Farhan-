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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-orange-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-orange-50/45">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-orange-100 border border-orange-200 text-orange-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Upload Sales Orders CSV</h2>
              <p className="text-xs text-stone-600">
                Required columns: <span className="font-mono text-orange-800 font-semibold">quarter, region, channel, product, units, discount_pct, revenue</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-orange-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tab Selector */}
          <div className="flex items-center space-x-2 border-b border-orange-100 pb-2.5">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'upload'
                  ? 'bg-orange-600 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-orange-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Choose / Drop File</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'paste'
                  ? 'bg-orange-600 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-orange-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Raw CSV Text</span>
            </button>
            <div className="flex-1" />
            <button
              onClick={handleLoadSampleInModal}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-1 hover:underline whitespace-nowrap shrink-0"
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-orange-300 hover:border-orange-400 bg-orange-50/30 hover:bg-orange-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-900 mb-1">
                Drop your sales orders CSV here, or <span className="text-orange-600 underline">browse</span>
              </p>
              <p className="text-xs text-stone-500">
                Supports standard CSV files with headers. Number formats like $1,000 and 15% are auto-converted.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-700">Paste CSV Contents directly:</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="quarter,region,channel,product,units,discount_pct,revenue&#10;Q2,North America,Enterprise Direct,Apex Cloud,120,10,43200&#10;Q3,North America,Enterprise Direct,Apex Cloud,190,8.5,69530"
                className="w-full h-36 p-3 rounded-xl bg-white border border-orange-200 text-xs font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => handleProcessCsv(pastedText, 'Pasted_Data.csv')}
                disabled={!pastedText.trim()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-40 transition-colors"
              >
                Parse Pasted CSV
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <span className="font-semibold">Parsing Error: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Column Detection Status */}
          {previewResult && (
            <div className="rounded-xl bg-orange-50/35 border border-orange-200 p-4 space-y-3 tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800">Column Mapping Detection:</span>
                <span className="text-xs text-stone-600">
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
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <span className="font-mono">{label}</span>
                      {mapped ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Data Preview snippet */}
              {previewResult.orders.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-stone-700 mb-1.5">
                    Preview (First 3 Rows)
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-orange-200 bg-white">
                    <table className="w-full text-[11px] text-left text-stone-800">
                      <thead className="bg-orange-50 text-stone-700">
                        <tr>
                          <th className="px-2.5 py-1.5">Quarter</th>
                          <th className="px-2.5 py-1.5">Region</th>
                          <th className="px-2.5 py-1.5">Channel</th>
                          <th className="px-2.5 py-1.5">Product</th>
                          <th className="px-2.5 py-1.5 text-right">Units</th>
                          <th className="px-2.5 py-1.5 text-right">Discount</th>
                          <th className="px-2.5 py-1.5 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100">
                        {previewResult.orders.slice(0, 3).map((r) => (
                          <tr key={r.id}>
                            <td className="px-2.5 py-1.5 font-mono text-orange-700 font-semibold">{r.quarter}</td>
                            <td className="px-2.5 py-1.5 font-medium text-stone-900">{r.region}</td>
                            <td className="px-2.5 py-1.5 text-stone-600">{r.channel}</td>
                            <td className="px-2.5 py-1.5 text-stone-800">{r.product}</td>
                            <td className="px-2.5 py-1.5 text-right font-mono">{r.units}</td>
                            <td className="px-2.5 py-1.5 text-right font-mono">{r.discount_pct.toFixed(1)}%</td>
                            <td className="px-2.5 py-1.5 text-right font-mono text-orange-700 font-semibold">
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
        <div className="px-6 py-3.5 border-t border-orange-100 bg-orange-50/45 flex items-center justify-between">
          <div className="text-xs text-stone-600">
            {fileName && <span className="font-mono text-stone-800">{fileName}</span>}
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-orange-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLoad}
              disabled={!previewResult || previewResult.orders.length === 0}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-colors"
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

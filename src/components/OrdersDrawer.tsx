import React, { useState, useMemo } from 'react';
import {
  ListFilter,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { SalesOrder } from '../types/sales';
import { formatCurrency } from '../utils/calculations';

interface OrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SalesOrder[];
}

export const OrdersDrawer: React.FC<OrdersDrawerProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const [search, setSearch] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const quarters = useMemo(() => Array.from(new Set(orders.map((o) => o.quarter))).sort(), [orders]);
  const regions = useMemo(() => Array.from(new Set(orders.map((o) => o.region))).sort(), [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchQuarter = selectedQuarter === 'ALL' || o.quarter === selectedQuarter;
      const matchRegion = selectedRegion === 'ALL' || o.region === selectedRegion;
      const matchSearch =
        !search ||
        o.product.toLowerCase().includes(search.toLowerCase()) ||
        o.channel.toLowerCase().includes(search.toLowerCase()) ||
        o.region.toLowerCase().includes(search.toLowerCase()) ||
        o.quarter.toLowerCase().includes(search.toLowerCase());
      return matchQuarter && matchRegion && matchSearch;
    });
  }, [orders, selectedQuarter, selectedRegion, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Raw Sales Orders Record Explorer</h3>
              <p className="text-xs text-slate-400">
                Viewing {filtered.length} of {orders.length} order line items
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

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search product, channel, region..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Quarter:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Quarters</option>
              {quarters.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="px-4 py-2.5 font-medium">#</th>
                <th className="px-4 py-2.5 font-medium">Quarter</th>
                <th className="px-4 py-2.5 font-medium">Region</th>
                <th className="px-4 py-2.5 font-medium">Channel</th>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium text-right">Units</th>
                <th className="px-4 py-2.5 font-medium text-right">Discount</th>
                <th className="px-4 py-2.5 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {pagedOrders.map((ord, idx) => (
                <tr key={ord.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2 text-slate-500 font-mono">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-2 font-mono text-indigo-300 font-semibold">{ord.quarter}</td>
                  <td className="px-4 py-2 text-slate-100">{ord.region}</td>
                  <td className="px-4 py-2 text-slate-400">{ord.channel}</td>
                  <td className="px-4 py-2 text-slate-300 font-medium">{ord.product}</td>
                  <td className="px-4 py-2 text-right font-mono">{ord.units.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-mono text-amber-300">{ord.discount_pct.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-400 font-semibold">
                    {formatCurrency(ord.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

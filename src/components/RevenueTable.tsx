import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';
import {
  RegionQuarterMatrix,
  VarianceCalculationResult,
  SalesOrder,
} from '../types/sales';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface RevenueTableProps {
  matrix: RegionQuarterMatrix;
  varianceResult: VarianceCalculationResult;
  allOrders: SalesOrder[];
  selectedChannel: string;
  selectedProduct: string;
  onFilterChange: (channel: string, product: string) => void;
}

type SortField = 'region' | 'total' | 'variance' | string;

export const RevenueTable: React.FC<RevenueTableProps> = ({
  matrix,
  varianceResult,
  allOrders,
  selectedChannel,
  selectedProduct,
  onFilterChange,
}) => {
  const [metricDisplay, setMetricDisplay] = useState<'revenue' | 'units' | 'both'>('revenue');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const { regions, quarters, data, unitsData, regionTotals, quarterTotals, grandTotal } = matrix;

  // Unique options for filters
  const channelsList = useMemo(() => {
    return Array.from(new Set(allOrders.map((o) => o.channel))).sort();
  }, [allOrders]);

  const productsList = useMemo(() => {
    return Array.from(new Set(allOrders.map((o) => o.product))).sort();
  }, [allOrders]);

  // Variance map for quick lookup
  const varianceByRegion = useMemo(() => {
    const map: Record<string, { dollarChange: number; pctChange: number }> = {};
    for (const r of varianceResult.regions) {
      map[r.region] = {
        dollarChange: r.dollarChange,
        pctChange: r.pctChange,
      };
    }
    return map;
  }, [varianceResult]);

  // Filter & sort rows
  const sortedRegions = useMemo(() => {
    return [...regions]
      .filter((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortField === 'region') {
          return sortAsc ? a.localeCompare(b) : b.localeCompare(a);
        } else if (sortField === 'total') {
          valA = regionTotals[a] || 0;
          valB = regionTotals[b] || 0;
        } else if (sortField === 'variance') {
          valA = varianceByRegion[a]?.dollarChange || 0;
          valB = varianceByRegion[b]?.dollarChange || 0;
        } else {
          // A specific quarter column
          valA = data[a]?.[sortField] || 0;
          valB = data[b]?.[sortField] || 0;
        }

        return sortAsc ? valA - valB : valB - valA;
      });
  }, [regions, searchQuery, sortField, sortAsc, regionTotals, varianceByRegion, data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending
    }
  };

  const exportTableCsv = () => {
    const headers = ['Region', ...quarters, 'Q2->Q3 Delta ($)', 'Q2->Q3 Delta (%)', 'Total Revenue', '% Share'];
    const rows = sortedRegions.map((reg) => {
      const qCols = quarters.map((q) => (data[reg]?.[q] || 0).toFixed(2));
      const v = varianceByRegion[reg] || { dollarChange: 0, pctChange: 0 };
      const tot = regionTotals[reg] || 0;
      const share = grandTotal > 0 ? ((tot / grandTotal) * 100).toFixed(2) + '%' : '0%';
      return [reg, ...qCols, v.dollarChange.toFixed(2), v.pctChange.toFixed(2) + '%', tot.toFixed(2), share];
    });

    // Total row
    const totalQCols = quarters.map((q) => (quarterTotals[q] || 0).toFixed(2));
    const totalRow = [
      'Total',
      ...totalQCols,
      varianceResult.overallDollarChange.toFixed(2),
      varianceResult.overallPctChange.toFixed(2) + '%',
      grandTotal.toFixed(2),
      '100.00%',
    ];

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(',')), totalRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Quarterly_Region_Revenue_Matrix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Quarterly Regional Revenue Table</h3>
              <p className="text-xs text-slate-400">
                Matrix breakdown of total revenue, units, and Q2-to-Q3 variance by geography
              </p>
            </div>
          </div>

          {/* Metric toggle & Export */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setMetricDisplay('revenue')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  metricDisplay === 'revenue'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Revenue ($)
              </button>
              <button
                onClick={() => setMetricDisplay('units')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  metricDisplay === 'units'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Units Sold
              </button>
              <button
                onClick={() => setMetricDisplay('both')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  metricDisplay === 'both'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Both
              </button>
            </div>

            <button
              onClick={exportTableCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/60 text-xs">
          {/* Search Region */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by region name..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Channel */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Channel:</span>
            <select
              value={selectedChannel}
              onChange={(e) => onFilterChange(e.target.value, selectedProduct)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Channels ({channelsList.length})</option>
              {channelsList.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Product */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Product:</span>
            <select
              value={selectedProduct}
              onChange={(e) => onFilterChange(selectedChannel, e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Products ({productsList.length})</option>
              {productsList.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedChannel !== 'ALL' || selectedProduct !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                onFilterChange('ALL', 'ALL');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 font-semibold select-none">
            <tr>
              {/* Region Header */}
              <th
                onClick={() => handleSort('region')}
                className="px-4 sm:px-6 py-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Region</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </th>

              {/* Quarters Headers */}
              {quarters.map((q) => {
                const isQ2 = q === 'Q2';
                const isQ3 = q === 'Q3';
                return (
                  <th
                    key={q}
                    onClick={() => handleSort(q)}
                    className={`px-4 py-3 text-right cursor-pointer hover:text-white transition-colors ${
                      isQ2 ? 'bg-sky-500/10 border-x border-sky-500/20 text-sky-300' : ''
                    } ${isQ3 ? 'bg-emerald-500/10 border-x border-emerald-500/20 text-emerald-300' : ''}`}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>{q}</span>
                      {isQ2 && <span className="text-[10px] text-sky-400 font-mono">(Base)</span>}
                      {isQ3 && <span className="text-[10px] text-emerald-400 font-mono">(Target)</span>}
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                );
              })}

              {/* Q2 -> Q3 Variance Header */}
              {varianceResult.hasQ2AndQ3 && (
                <th
                  onClick={() => handleSort('variance')}
                  className="px-4 py-3 text-right cursor-pointer bg-indigo-500/10 border-x border-indigo-500/20 text-indigo-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Q2 → Q3 Variance</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </th>
              )}

              {/* Total Revenue Header */}
              <th
                onClick={() => handleSort('total')}
                className="px-4 sm:px-6 py-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>Total Revenue</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </th>

              {/* Portfolio Share */}
              <th className="px-4 py-3 text-right text-slate-400 font-normal">
                <span>Share</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {sortedRegions.map((region) => {
              const regTotal = regionTotals[region] || 0;
              const variance = varianceByRegion[region];
              const sharePct = grandTotal > 0 ? (regTotal / grandTotal) * 100 : 0;
              const isPositive = variance && variance.dollarChange >= 0;

              return (
                <tr key={region} className="hover:bg-slate-800/40 transition-colors">
                  {/* Region Name */}
                  <td className="px-4 sm:px-6 py-3 font-semibold text-slate-100">
                    <div className="flex items-center space-x-2">
                      <span>{region}</span>
                      {varianceResult.mostChangedByDollar?.region === region && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          #1 Shift
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quarters Values */}
                  {quarters.map((q) => {
                    const rev = data[region]?.[q] || 0;
                    const u = unitsData[region]?.[q] || 0;
                    const isQ2 = q === 'Q2';
                    const isQ3 = q === 'Q3';

                    return (
                      <td
                        key={q}
                        className={`px-4 py-3 text-right font-mono ${
                          isQ2 ? 'bg-sky-500/5 border-x border-sky-500/10' : ''
                        } ${isQ3 ? 'bg-emerald-500/5 border-x border-emerald-500/10' : ''}`}
                      >
                        {metricDisplay === 'revenue' && (
                          <span className={rev > 0 ? 'text-slate-100' : 'text-slate-500'}>
                            {formatCurrency(rev)}
                          </span>
                        )}
                        {metricDisplay === 'units' && (
                          <span className={u > 0 ? 'text-cyan-300' : 'text-slate-500'}>
                            {u.toLocaleString()}
                          </span>
                        )}
                        {metricDisplay === 'both' && (
                          <div className="flex flex-col">
                            <span className="text-slate-100">{formatCurrency(rev)}</span>
                            <span className="text-[10px] text-cyan-400 font-sans">{u.toLocaleString()} units</span>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Q2 -> Q3 Variance Column */}
                  {varianceResult.hasQ2AndQ3 && (
                    <td className="px-4 py-3 text-right bg-indigo-500/5 border-x border-indigo-500/10 font-mono">
                      {variance ? (
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-semibold flex items-center space-x-0.5 ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                            <span>
                              {isPositive ? '+' : ''}
                              {formatCurrency(variance.dollarChange)}
                            </span>
                          </span>
                          <span
                            className={`text-[10px] font-sans font-medium px-1.5 py-0.2 rounded ${
                              isPositive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                            }`}
                          >
                            {formatPercentage(variance.pctChange, true)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  )}

                  {/* Total Revenue */}
                  <td className="px-4 sm:px-6 py-3 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(regTotal)}
                  </td>

                  {/* Share % */}
                  <td className="px-4 py-3 text-right font-mono text-slate-400">
                    {sharePct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Grand Totals Summary Row */}
          <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-slate-100">
            <tr>
              <td className="px-4 sm:px-6 py-3.5 uppercase tracking-wider text-xs">Total Portfolio</td>
              {quarters.map((q) => {
                const qRev = quarterTotals[q] || 0;
                let qUnits = 0;
                regions.forEach((r) => {
                  qUnits += unitsData[r]?.[q] || 0;
                });

                return (
                  <td key={q} className="px-4 py-3.5 text-right font-mono text-slate-100">
                    {metricDisplay === 'revenue' && formatCurrency(qRev)}
                    {metricDisplay === 'units' && (
                      <span className="text-cyan-300">{qUnits.toLocaleString()}</span>
                    )}
                    {metricDisplay === 'both' && (
                      <div className="flex flex-col">
                        <span>{formatCurrency(qRev)}</span>
                        <span className="text-[10px] text-cyan-400 font-sans font-normal">
                          {qUnits.toLocaleString()} units
                        </span>
                      </div>
                    )}
                  </td>
                );
              })}

              {/* Total Q2->Q3 variance */}
              {varianceResult.hasQ2AndQ3 && (
                <td className="px-4 py-3.5 text-right font-mono bg-indigo-500/10 border-x border-indigo-500/20">
                  <div className="flex flex-col items-end">
                    <span
                      className={`font-bold ${
                        varianceResult.overallDollarChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {varianceResult.overallDollarChange >= 0 ? '+' : ''}
                      {formatCurrency(varianceResult.overallDollarChange)}
                    </span>
                    <span className="text-[10px] font-sans text-indigo-300 font-normal">
                      {formatPercentage(varianceResult.overallPctChange, true)} overall
                    </span>
                  </div>
                </td>
              )}

              <td className="px-4 sm:px-6 py-3.5 text-right font-mono text-emerald-400 text-sm">
                {formatCurrency(grandTotal)}
              </td>
              <td className="px-4 py-3.5 text-right font-mono text-slate-400">100.0%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

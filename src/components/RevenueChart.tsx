import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Layers,
  Maximize2,
  HelpCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { RegionQuarterMatrix, VarianceCalculationResult } from '../types/sales';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface RevenueChartProps {
  matrix: RegionQuarterMatrix;
  varianceResult: VarianceCalculationResult;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  matrix,
  varianceResult,
}) => {
  const [viewMode, setViewMode] = useState<'byRegion' | 'byQuarter' | 'variance'>('byRegion');
  const [hoveredItem, setHoveredItem] = useState<{
    title: string;
    subtitle: string;
    value: number;
    units?: number;
    pctShare?: number;
    x: number;
    y: number;
  } | null>(null);

  const { regions, quarters, data, unitsData, grandTotal } = matrix;

  // Color palettes
  const quarterColors: Record<string, { fill: string; border: string; glow: string }> = {
    Q1: { fill: '#FDBA74', border: '#FB923C', glow: 'rgba(251, 146, 60, 0.25)' },
    Q2: { fill: '#FB923C', border: '#F97316', glow: 'rgba(249, 115, 22, 0.35)' },
    Q3: { fill: '#EA580C', border: '#C2410C', glow: 'rgba(234, 88, 12, 0.45)' },
    Q4: { fill: '#78716C', border: '#57534E', glow: 'rgba(120, 113, 108, 0.25)' },
  };

  const regionPalette = [
    { fill: '#EA580C', border: '#C2410C' },
    { fill: '#F97316', border: '#EA580C' },
    { fill: '#FDBA74', border: '#F97316' },
    { fill: '#D97706', border: '#B45309' },
    { fill: '#78716C', border: '#57534E' },
    { fill: '#A8A29E', border: '#78716C' },
  ];

  // Maximum value for scaling
  let maxRevenue = 0;
  regions.forEach((r) => {
    quarters.forEach((q) => {
      const val = data[r]?.[q] || 0;
      if (val > maxRevenue) maxRevenue = val;
    });
  });

  // Add 15% headroom
  const yAxisMax = Math.max(10000, maxRevenue * 1.15);

  const chartHeight = 320;
  const padding = { top: 30, right: 24, bottom: 50, left: 75 };
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Generate 5 grid ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: yAxisMax * pct,
    y: padding.top + innerHeight - pct * innerHeight,
  }));

  return (
    <div className="rounded-2xl bg-white border border-orange-200/90 p-5 sm:p-6 space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Total Revenue by Region &amp; Quarter</h3>
            <p className="text-xs text-stone-500">
              Interactive visualization comparing sales volume across quarters with Q2 and Q3 emphasis
            </p>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center space-x-1.5 bg-orange-50/80 p-1 rounded-xl border border-orange-200 self-start sm:self-auto text-xs font-medium">
          <button
            onClick={() => setViewMode('byRegion')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'byRegion'
                ? 'bg-orange-600 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            Quarters by Region
          </button>
          <button
            onClick={() => setViewMode('byQuarter')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'byQuarter'
                ? 'bg-orange-600 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            Regions by Quarter
          </button>
          {varianceResult.hasQ2AndQ3 && (
            <button
              onClick={() => setViewMode('variance')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 whitespace-nowrap shrink-0 ${
                viewMode === 'variance'
                  ? 'bg-orange-600 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Q2 → Q3 Variance Delta</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend & Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-orange-200/70 text-xs">
        {viewMode === 'byRegion' && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-stone-500 font-medium text-xs">Quarters:</span>
            {quarters.map((q) => {
              const c = quarterColors[q] || { fill: '#A8A29E', border: '#78716C', glow: '' };
              const isQ2Q3 = q === 'Q2' || q === 'Q3';
              return (
                <div key={q} className="flex items-center space-x-1.5">
                  <span
                    className={`w-3 h-3 rounded-sm ${isQ2Q3 ? 'ring-1 ring-orange-400' : ''}`}
                    style={{ backgroundColor: c.fill }}
                  />
                  <span className={`text-xs font-medium ${isQ2Q3 ? 'text-stone-900 font-bold' : 'text-stone-600'}`}>
                    {q} {q === 'Q2' ? '(Start)' : q === 'Q3' ? '(Variance End)' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'byQuarter' && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-stone-500 font-medium text-xs">Regions:</span>
            {regions.map((reg, idx) => {
              const c = regionPalette[idx % regionPalette.length];
              return (
                <div key={reg} className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.fill }} />
                  <span className="text-stone-700 text-xs font-medium">{reg}</span>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'variance' && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-orange-700 font-medium text-xs">
              <span className="w-3 h-3 rounded-sm bg-orange-600" />
              <span>Revenue Growth (Q3 &gt; Q2)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-rose-700 font-medium text-xs">
              <span className="w-3 h-3 rounded-sm bg-rose-600" />
              <span>Revenue Contraction (Q3 &lt; Q2)</span>
            </div>
          </div>
        )}

        <div className="text-xs text-stone-500">
          Hover over bars for exact currency and units sold
        </div>
      </div>

      {/* SVG Responsive Chart View */}
      <div className="relative w-full overflow-x-auto select-none">
        <div style={{ minWidth: regions.length * (viewMode === 'byRegion' ? 120 : 90) + 120 }}>
          <svg
            viewBox={`0 0 ${Math.max(650, regions.length * 120 + padding.left + padding.right)} ${chartHeight}`}
            className="w-full h-auto overflow-visible"
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Background Grid & Ticks */}
            {ticks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2="100%"
                  y2={tick.y}
                  stroke="#FED7AA"
                  strokeDasharray="3 3"
                  strokeOpacity="0.85"
                />
                <text
                  x={padding.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="monospace"
                  fill="#57534E"
                >
                  ${Math.round(tick.value).toLocaleString('en-US')}
                </text>
              </g>
            ))}

            {/* Mode 1: Bars Grouped by Region */}
            {viewMode === 'byRegion' && (
              <g>
                {regions.map((region, rIdx) => {
                  const svgWidth = Math.max(650, regions.length * 120 + padding.left + padding.right);
                  const availableWidth = svgWidth - padding.left - padding.right;
                  const groupWidth = availableWidth / regions.length;
                  const groupX = padding.left + rIdx * groupWidth;

                  const barGap = 3;
                  const barCount = quarters.length;
                  const totalBarsWidth = groupWidth * 0.72;
                  const barWidth = Math.max(8, (totalBarsWidth - barGap * (barCount - 1)) / barCount);
                  const startX = groupX + (groupWidth - (barWidth * barCount + barGap * (barCount - 1))) / 2;

                  return (
                    <g key={region}>
                      {/* Region Group Label */}
                      <text
                        x={groupX + groupWidth / 2}
                        y={chartHeight - 14}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#1C1917"
                      >
                        {region}
                      </text>

                      {/* Quarters Bars */}
                      {quarters.map((quarter, qIdx) => {
                        const val = data[region]?.[quarter] || 0;
                        const units = unitsData[region]?.[quarter] || 0;
                        const barHeight = (val / yAxisMax) * innerHeight;
                        const barX = startX + qIdx * (barWidth + barGap);
                        const barY = padding.top + innerHeight - barHeight;

                        const colors = quarterColors[quarter] || {
                          fill: '#EA580C',
                          border: '#C2410C',
                        };
                        const isSpecial = quarter === 'Q2' || quarter === 'Q3';

                        return (
                          <g key={quarter}>
                            <rect
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={Math.max(2, barHeight)}
                              rx="3"
                              fill={colors.fill}
                              stroke={colors.border}
                              strokeWidth={isSpecial ? '1.5' : '0.75'}
                              className="transition-opacity duration-150 hover:opacity-85 cursor-pointer"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredItem({
                                  title: `${region} — ${quarter}`,
                                  subtitle: `Units: ${units.toLocaleString()}`,
                                  value: val,
                                  units,
                                  pctShare: matrix.regionTotals[region] ? (val / matrix.regionTotals[region]) * 100 : 0,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top - 8,
                                });
                              }}
                            />
                            {/* Quarter label under each individual bar */}
                            <text
                              x={barX + barWidth / 2}
                              y={chartHeight - 32}
                              textAnchor="middle"
                              fontSize="9"
                              fontFamily="monospace"
                              fill={isSpecial ? '#C2410C' : '#57534E'}
                              fontWeight={isSpecial ? 'bold' : 'normal'}
                            >
                              {quarter}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Mode 2: Bars Grouped by Quarter */}
            {viewMode === 'byQuarter' && (
              <g>
                {quarters.map((quarter, qIdx) => {
                  const svgWidth = Math.max(650, quarters.length * 150 + padding.left + padding.right);
                  const availableWidth = svgWidth - padding.left - padding.right;
                  const groupWidth = availableWidth / quarters.length;
                  const groupX = padding.left + qIdx * groupWidth;

                  const barGap = 4;
                  const barCount = regions.length;
                  const totalBarsWidth = groupWidth * 0.75;
                  const barWidth = Math.max(8, (totalBarsWidth - barGap * (barCount - 1)) / barCount);
                  const startX = groupX + (groupWidth - (barWidth * barCount + barGap * (barCount - 1))) / 2;

                  return (
                    <g key={quarter}>
                      {/* Quarter Group Label */}
                      <text
                        x={groupX + groupWidth / 2}
                        y={chartHeight - 14}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill="#1C1917"
                      >
                        {quarter}
                      </text>

                      {/* Region Bars */}
                      {regions.map((region, rIdx) => {
                        const val = data[region]?.[quarter] || 0;
                        const units = unitsData[region]?.[quarter] || 0;
                        const barHeight = (val / yAxisMax) * innerHeight;
                        const barX = startX + rIdx * (barWidth + barGap);
                        const barY = padding.top + innerHeight - barHeight;

                        const colors = regionPalette[rIdx % regionPalette.length];

                        return (
                          <rect
                            key={region}
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={Math.max(2, barHeight)}
                            rx="3"
                            fill={colors.fill}
                            stroke={colors.border}
                            strokeWidth="1"
                            className="transition-opacity duration-150 hover:opacity-85 cursor-pointer"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredItem({
                                title: `${quarter} — ${region}`,
                                subtitle: `Units: ${units.toLocaleString()}`,
                                value: val,
                                units,
                                pctShare: matrix.quarterTotals[quarter] ? (val / matrix.quarterTotals[quarter]) * 100 : 0,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8,
                              });
                            }}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Mode 3: Variance Waterfall / Delta View */}
            {viewMode === 'variance' && (
              <g>
                {/* Horizontal baseline at middle */}
                {(() => {
                  const maxDelta = Math.max(
                    1000,
                    ...varianceResult.regions.map((r) => r.absDollarChange)
                  ) * 1.2;

                  const midY = padding.top + innerHeight / 2;

                  return (
                    <>
                      {/* Center zero line */}
                      <line
                        x1={padding.left}
                        y1={midY}
                        x2="100%"
                        y2={midY}
                        stroke="#A8A29E"
                        strokeWidth="1.5"
                      />
                      <text
                        x={padding.left - 10}
                        y={midY + 4}
                        textAnchor="end"
                        fontSize="10"
                        fontFamily="monospace"
                        fill="#57534E"
                      >
                        $0 Delta
                      </text>

                      {varianceResult.regions.map((reg, idx) => {
                        const svgWidth = Math.max(650, varianceResult.regions.length * 130 + padding.left + padding.right);
                        const availableWidth = svgWidth - padding.left - padding.right;
                        const colWidth = availableWidth / varianceResult.regions.length;
                        const colX = padding.left + idx * colWidth;
                        const barWidth = Math.min(48, colWidth * 0.55);
                        const barX = colX + (colWidth - barWidth) / 2;

                        const isPositive = reg.dollarChange >= 0;
                        const deltaHeight = (reg.absDollarChange / maxDelta) * (innerHeight / 2);
                        const barY = isPositive ? midY - deltaHeight : midY;

                        return (
                          <g key={reg.region}>
                            {/* Region name */}
                            <text
                              x={colX + colWidth / 2}
                              y={chartHeight - 14}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="600"
                              fill="#1C1917"
                            >
                              {reg.region}
                            </text>

                            {/* Delta bar */}
                            <rect
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={Math.max(3, deltaHeight)}
                              rx="3"
                              fill={isPositive ? '#EA580C' : '#E11D48'}
                              stroke={isPositive ? '#C2410C' : '#BE123C'}
                              strokeWidth="1.5"
                              className="cursor-pointer hover:opacity-85 transition-opacity"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredItem({
                                  title: `${reg.region} (Q2 → Q3 Shift)`,
                                  subtitle: `Q2: ${formatCurrency(reg.q2Revenue)} → Q3: ${formatCurrency(reg.q3Revenue)}`,
                                  value: reg.dollarChange,
                                  units: reg.unitChange,
                                  pctShare: reg.pctChange,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top - 8,
                                });
                              }}
                            />

                            {/* Label above/below bar */}
                            <text
                              x={barX + barWidth / 2}
                              y={isPositive ? barY - 6 : barY + deltaHeight + 14}
                              textAnchor="middle"
                              fontSize="10"
                              fontFamily="monospace"
                              fontWeight="bold"
                              fill={isPositive ? '#C2410C' : '#BE123C'}
                            >
                              {isPositive ? '+' : ''}
                              {formatCurrency(reg.dollarChange)}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredItem && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl bg-white/95 border border-orange-200 shadow-lg text-xs backdrop-blur-md tabular-nums"
          style={{ left: hoveredItem.x, top: hoveredItem.y }}
        >
          <div className="font-semibold text-stone-900">{hoveredItem.title}</div>
          <div className="text-stone-500 text-[11px]">{hoveredItem.subtitle}</div>
          <div className="mt-1 flex items-center justify-between space-x-3 pt-1 border-t border-orange-100">
            <span className="text-stone-500">Revenue:</span>
            <span className="font-mono font-bold text-orange-700">
              {hoveredItem.value >= 0 ? '' : '-'}${Math.abs(Math.round(hoveredItem.value)).toLocaleString('en-US')}
            </span>
          </div>
          {hoveredItem.pctShare !== undefined && (
            <div className="flex items-center justify-between space-x-3 text-[11px]">
              <span className="text-stone-500">Share / Delta:</span>
              <span className="font-mono font-semibold text-stone-800">{formatPercentage(hoveredItem.pctShare, true)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

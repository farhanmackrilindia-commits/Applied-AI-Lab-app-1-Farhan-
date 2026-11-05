import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  CheckCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { SalesOrder } from './types/sales';
import { SAMPLE_SALES_ORDERS } from './data/sampleDatasets';
import { buildRegionQuarterMatrix, calculateQ2Q3Variance, formatCurrency, formatPercentage } from './utils/calculations';
import { Header } from './components/Header';
import { AISummaryCard } from './components/AISummaryCard';
import { RevenueChart } from './components/RevenueChart';
import { RevenueTable } from './components/RevenueTable';
import { CsvUploader } from './components/CsvUploader';
import { OrdersDrawer } from './components/OrdersDrawer';

export default function App() {
  // Primary datasets
  const [orders, setOrders] = useState<SalesOrder[]>(SAMPLE_SALES_ORDERS);
  const [dataName, setDataName] = useState<string>('Sample Global Enterprise Orders (71 lines)');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Global Slicing Filters
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');

  // Filtered orders based on selected slices
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchCh = selectedChannel === 'ALL' || o.channel === selectedChannel;
      const matchProd = selectedProduct === 'ALL' || o.product === selectedProduct;
      return matchCh && matchProd;
    });
  }, [orders, selectedChannel, selectedProduct]);

  // Derived Analytics Matrices
  const matrix = useMemo(() => {
    return buildRegionQuarterMatrix(filteredOrders);
  }, [filteredOrders]);

  const varianceResult = useMemo(() => {
    return calculateQ2Q3Variance(filteredOrders);
  }, [filteredOrders]);

  const handleOrdersLoaded = (newOrders: SalesOrder[], filename: string) => {
    setOrders(newOrders);
    setDataName(filename);
    setSelectedChannel('ALL');
    setSelectedProduct('ALL');
  };

  const handleLoadSample = () => {
    setOrders(SAMPLE_SALES_ORDERS);
    setDataName('Sample Global Enterprise Orders (71 lines)');
    setSelectedChannel('ALL');
    setSelectedProduct('ALL');
  };

  const totalUnits = useMemo(() => {
    return filteredOrders.reduce((acc, o) => acc + o.units, 0);
  }, [filteredOrders]);

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-stone-900 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-950">
      {/* Top Navigation */}
      <Header
        orderCount={orders.length}
        regionCount={matrix.regions.length}
        quarterCount={matrix.quarters.length}
        totalRevenue={matrix.grandTotal}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={handleLoadSample}
        isLoadingAi={false}
      />

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dataset Status Banner & Quick Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-orange-200/80 text-xs">
          <div className="flex items-center space-x-2 text-stone-700">
            <Database className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="text-stone-500">Current Dataset:</span>
            <span className="font-semibold text-stone-900 truncate">{dataName}</span>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <span className="text-stone-500 hidden sm:inline tabular-nums">
              {filteredOrders.length} records analyzed ({totalUnits.toLocaleString()} units)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline flex items-center space-x-1 whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Explore Raw Orders</span>
            </button>
            <span className="text-orange-200">|</span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-xs text-stone-700 hover:text-orange-700 font-medium hover:underline flex items-center space-x-1 whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New CSV</span>
            </button>
          </div>
        </div>

        {/* AI Three-Sentence Summary Card (Prominent Executive Section) */}
        <section aria-label="AI Executive Variance Analysis">
          <AISummaryCard varianceResult={varianceResult} />
        </section>

        {/* Revenue Chart Section */}
        <section aria-label="Regional Revenue Visualization">
          <RevenueChart matrix={matrix} varianceResult={varianceResult} />
        </section>

        {/* Revenue Table Section */}
        <section aria-label="Regional Revenue Pivot Matrix">
          <RevenueTable
            matrix={matrix}
            varianceResult={varianceResult}
            allOrders={orders}
            selectedChannel={selectedChannel}
            selectedProduct={selectedProduct}
            onFilterChange={(channel, product) => {
              setSelectedChannel(channel);
              setSelectedProduct(product);
            }}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-200/80 bg-white py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="text-stone-800 font-medium">
            Quarterly Sales Insights &amp; Region Variance Analyzer
          </p>
          <p className="text-[11px] text-stone-500">
            Quarterly regional revenue matrix &amp; grounded Q2-to-Q3 variance analysis
          </p>
        </div>
      </footer>

      {/* CSV Upload Modal */}
      <CsvUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onOrdersLoaded={handleOrdersLoaded}
      />

      {/* Raw Orders Record Explorer */}
      <OrdersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        orders={filteredOrders}
      />
    </div>
  );
}

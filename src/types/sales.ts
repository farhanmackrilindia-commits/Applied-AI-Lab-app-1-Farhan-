export interface SalesOrder {
  id: string | number;
  quarter: string;
  region: string;
  channel: string;
  product: string;
  units: number;
  discount_pct: number;
  revenue: number;
}

export interface RegionQuarterMatrix {
  regions: string[];
  quarters: string[];
  // matrix[region][quarter] = revenue
  data: Record<string, Record<string, number>>;
  // unitsMatrix[region][quarter] = units
  unitsData: Record<string, Record<string, number>>;
  regionTotals: Record<string, number>;
  quarterTotals: Record<string, number>;
  grandTotal: number;
}

export interface ProductDelta {
  product: string;
  q2Revenue: number;
  q3Revenue: number;
  deltaRevenue: number;
  pctChange: number;
  q2Units: number;
  q3Units: number;
  deltaUnits: number;
}

export interface ChannelDelta {
  channel: string;
  q2Revenue: number;
  q3Revenue: number;
  deltaRevenue: number;
  pctChange: number;
  q2Units: number;
  q3Units: number;
  deltaUnits: number;
}

export interface RegionVarianceAnalysis {
  region: string;
  q2Revenue: number;
  q3Revenue: number;
  dollarChange: number;
  pctChange: number;
  absDollarChange: number;
  absPctChange: number;
  q2Units: number;
  q3Units: number;
  unitChange: number;
  unitPctChange: number;
  q2AvgDiscount: number;
  q3AvgDiscount: number;
  q2OrderCount: number;
  q3OrderCount: number;
  topGrownProduct?: ProductDelta;
  topDeclinedProduct?: ProductDelta;
  topChannel?: ChannelDelta;
  allProducts: ProductDelta[];
  allChannels: ChannelDelta[];
}

export interface VarianceCalculationResult {
  hasQ2AndQ3: boolean;
  regions: RegionVarianceAnalysis[];
  mostChangedByDollar: RegionVarianceAnalysis | null;
  mostChangedByPct: RegionVarianceAnalysis | null;
  overallQ2Revenue: number;
  overallQ3Revenue: number;
  overallDollarChange: number;
  overallPctChange: number;
}

export interface FilterState {
  selectedChannel: string;
  selectedProduct: string;
  searchQuery: string;
}

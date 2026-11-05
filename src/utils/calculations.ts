import {
  SalesOrder,
  RegionQuarterMatrix,
  RegionVarianceAnalysis,
  VarianceCalculationResult,
  ProductDelta,
  ChannelDelta,
} from '../types/sales';

// Natural quarter sort order
function sortQuarters(quarters: string[]): string[] {
  const quarterRank = (q: string): number => {
    const upper = q.toUpperCase();
    if (upper === 'Q1') return 1;
    if (upper === 'Q2') return 2;
    if (upper === 'Q3') return 3;
    if (upper === 'Q4') return 4;
    const match = upper.match(/Q(\d)/);
    if (match) return parseInt(match[1], 10);
    return 99;
  };

  return [...quarters].sort((a, b) => quarterRank(a) - quarterRank(b) || a.localeCompare(b));
}

export function buildRegionQuarterMatrix(orders: SalesOrder[]): RegionQuarterMatrix {
  const regionsSet = new Set<string>();
  const quartersSet = new Set<string>();

  const data: Record<string, Record<string, number>> = {};
  const unitsData: Record<string, Record<string, number>> = {};
  const regionTotals: Record<string, number> = {};
  const quarterTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const order of orders) {
    regionsSet.add(order.region);
    quartersSet.add(order.quarter);

    if (!data[order.region]) {
      data[order.region] = {};
      unitsData[order.region] = {};
      regionTotals[order.region] = 0;
    }

    if (!data[order.region][order.quarter]) {
      data[order.region][order.quarter] = 0;
      unitsData[order.region][order.quarter] = 0;
    }

    if (!quarterTotals[order.quarter]) {
      quarterTotals[order.quarter] = 0;
    }

    data[order.region][order.quarter] += order.revenue;
    unitsData[order.region][order.quarter] += order.units;
    regionTotals[order.region] += order.revenue;
    quarterTotals[order.quarter] += order.revenue;
    grandTotal += order.revenue;
  }

  const quarters = sortQuarters(Array.from(quartersSet));
  // Sort regions by total revenue descending
  const regions = Array.from(regionsSet).sort((a, b) => (regionTotals[b] || 0) - (regionTotals[a] || 0));

  return {
    regions,
    quarters,
    data,
    unitsData,
    regionTotals,
    quarterTotals,
    grandTotal,
  };
}

export function calculateQ2Q3Variance(orders: SalesOrder[]): VarianceCalculationResult {
  const quarters = Array.from(new Set(orders.map((o) => o.quarter.toUpperCase())));
  const hasQ2 = quarters.includes('Q2');
  const hasQ3 = quarters.includes('Q3');

  if (!hasQ2 || !hasQ3) {
    return {
      hasQ2AndQ3: false,
      regions: [],
      mostChangedByDollar: null,
      mostChangedByPct: null,
      overallQ2Revenue: 0,
      overallQ3Revenue: 0,
      overallDollarChange: 0,
      overallPctChange: 0,
    };
  }

  const regionsSet = Array.from(new Set(orders.map((o) => o.region)));

  let overallQ2Rev = 0;
  let overallQ3Rev = 0;

  const regionAnalyses: RegionVarianceAnalysis[] = regionsSet.map((reg) => {
    const regOrders = orders.filter((o) => o.region === reg);
    const q2Orders = regOrders.filter((o) => o.quarter.toUpperCase() === 'Q2');
    const q3Orders = regOrders.filter((o) => o.quarter.toUpperCase() === 'Q3');

    const q2Revenue = q2Orders.reduce((acc, o) => acc + o.revenue, 0);
    const q3Revenue = q3Orders.reduce((acc, o) => acc + o.revenue, 0);
    overallQ2Rev += q2Revenue;
    overallQ3Rev += q3Revenue;

    const dollarChange = q3Revenue - q2Revenue;
    const pctChange = q2Revenue > 0 ? ((q3Revenue - q2Revenue) / q2Revenue) * 100 : q3Revenue > 0 ? 100 : 0;
    const absDollarChange = Math.abs(dollarChange);
    const absPctChange = Math.abs(pctChange);

    const q2Units = q2Orders.reduce((acc, o) => acc + o.units, 0);
    const q3Units = q3Orders.reduce((acc, o) => acc + o.units, 0);
    const unitChange = q3Units - q2Units;
    const unitPctChange = q2Units > 0 ? ((q3Units - q2Units) / q2Units) * 100 : q3Units > 0 ? 100 : 0;

    // Average discounts (weighted by revenue if positive, otherwise simple mean)
    const computeAvgDiscount = (rows: SalesOrder[], totalRev: number): number => {
      if (rows.length === 0) return 0;
      if (totalRev > 0) {
        const weightedSum = rows.reduce((acc, r) => acc + r.discount_pct * r.revenue, 0);
        return weightedSum / totalRev;
      }
      return rows.reduce((acc, r) => acc + r.discount_pct, 0) / rows.length;
    };

    const q2AvgDiscount = computeAvgDiscount(q2Orders, q2Revenue);
    const q3AvgDiscount = computeAvgDiscount(q3Orders, q3Revenue);

    // Product Deltas
    const productsInRegion = Array.from(new Set(regOrders.map((o) => o.product)));
    const productDeltas: ProductDelta[] = productsInRegion.map((prod) => {
      const q2POrders = q2Orders.filter((o) => o.product === prod);
      const q3POrders = q3Orders.filter((o) => o.product === prod);

      const pQ2Rev = q2POrders.reduce((acc, o) => acc + o.revenue, 0);
      const pQ3Rev = q3POrders.reduce((acc, o) => acc + o.revenue, 0);
      const pDeltaRev = pQ3Rev - pQ2Rev;
      const pPct = pQ2Rev > 0 ? (pDeltaRev / pQ2Rev) * 100 : pQ3Rev > 0 ? 100 : 0;

      const pQ2Units = q2POrders.reduce((acc, o) => acc + o.units, 0);
      const pQ3Units = q3POrders.reduce((acc, o) => acc + o.units, 0);
      const pDeltaUnits = pQ3Units - pQ2Units;

      return {
        product: prod,
        q2Revenue: pQ2Rev,
        q3Revenue: pQ3Rev,
        deltaRevenue: pDeltaRev,
        pctChange: pPct,
        q2Units: pQ2Units,
        q3Units: pQ3Units,
        deltaUnits: pDeltaUnits,
      };
    });

    // Sort products by deltaRevenue descending
    productDeltas.sort((a, b) => b.deltaRevenue - a.deltaRevenue);
    const topGrownProduct = productDeltas.find((p) => p.deltaRevenue > 0) || productDeltas[0];
    const topDeclinedProduct = [...productDeltas].reverse().find((p) => p.deltaRevenue < 0);

    // Channel Deltas
    const channelsInRegion = Array.from(new Set(regOrders.map((o) => o.channel)));
    const channelDeltas: ChannelDelta[] = channelsInRegion.map((ch) => {
      const q2ChOrders = q2Orders.filter((o) => o.channel === ch);
      const q3ChOrders = q3Orders.filter((o) => o.channel === ch);

      const chQ2Rev = q2ChOrders.reduce((acc, o) => acc + o.revenue, 0);
      const chQ3Rev = q3ChOrders.reduce((acc, o) => acc + o.revenue, 0);
      const chDeltaRev = chQ3Rev - chQ2Rev;
      const chPct = chQ2Rev > 0 ? (chDeltaRev / chQ2Rev) * 100 : chQ3Rev > 0 ? 100 : 0;

      const chQ2Units = q2ChOrders.reduce((acc, o) => acc + o.units, 0);
      const chQ3Units = q3ChOrders.reduce((acc, o) => acc + o.units, 0);
      const chDeltaUnits = chQ3Units - chQ2Units;

      return {
        channel: ch,
        q2Revenue: chQ2Rev,
        q3Revenue: chQ3Rev,
        deltaRevenue: chDeltaRev,
        pctChange: chPct,
        q2Units: chQ2Units,
        q3Units: chQ3Units,
        deltaUnits: chDeltaUnits,
      };
    });

    channelDeltas.sort((a, b) => Math.abs(b.deltaRevenue) - Math.abs(a.deltaRevenue));
    const topChannel = channelDeltas[0];

    return {
      region: reg,
      q2Revenue,
      q3Revenue,
      dollarChange,
      pctChange,
      absDollarChange,
      absPctChange,
      q2Units,
      q3Units,
      unitChange,
      unitPctChange,
      q2AvgDiscount,
      q3AvgDiscount,
      q2OrderCount: q2Orders.length,
      q3OrderCount: q3Orders.length,
      topGrownProduct,
      topDeclinedProduct,
      topChannel,
      allProducts: productDeltas,
      allChannels: channelDeltas,
    };
  });

  // Sort regions by absolute dollar change descending
  regionAnalyses.sort((a, b) => b.absDollarChange - a.absDollarChange);

  const mostChangedByDollar = regionAnalyses.length > 0 ? regionAnalyses[0] : null;

  // Most changed by percentage (only considering regions with meaningful base revenue or highest % shift)
  const sortedByPct = [...regionAnalyses].sort((a, b) => b.absPctChange - a.absPctChange);
  const mostChangedByPct = sortedByPct.length > 0 ? sortedByPct[0] : null;

  const overallDollarChange = overallQ3Rev - overallQ2Rev;
  const overallPctChange = overallQ2Rev > 0 ? (overallDollarChange / overallQ2Rev) * 100 : 0;

  return {
    hasQ2AndQ3: true,
    regions: regionAnalyses,
    mostChangedByDollar,
    mostChangedByPct,
    overallQ2Revenue: overallQ2Rev,
    overallQ3Revenue: overallQ3Rev,
    overallDollarChange,
    overallPctChange,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(val: number, includeSign = false): string {
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

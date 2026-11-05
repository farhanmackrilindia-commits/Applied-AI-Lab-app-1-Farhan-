import Papa from 'papaparse';
import { SalesOrder } from '../types/sales';

export interface ParseResult {
  orders: SalesOrder[];
  errors: string[];
  warnings: string[];
  mappedColumns: {
    quarter: string | null;
    region: string | null;
    channel: string | null;
    product: string | null;
    units: string | null;
    discount_pct: string | null;
    revenue: string | null;
  };
  totalRawRows: number;
}

function cleanNumber(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).trim().replace(/[$,\s]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function cleanDiscount(val: unknown): number {
  if (typeof val === 'number') {
    // If entered as 0.15, convert to 15.0
    return val > 0 && val <= 1 ? val * 100 : val;
  }
  if (!val) return 0;
  let str = String(val).trim().replace(/[%$,\s]/g, '');
  let num = parseFloat(str);
  if (isNaN(num)) return 0;
  // If entered as a decimal <= 1 (e.g. 0.15), treat as 15%
  if (num > 0 && num <= 1 && !String(val).includes('%')) {
    num = num * 100;
  }
  return num;
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseSalesCsv(csvText: string): ParseResult {
  const result: ParseResult = {
    orders: [],
    errors: [],
    warnings: [],
    mappedColumns: {
      quarter: null,
      region: null,
      channel: null,
      product: null,
      units: null,
      discount_pct: null,
      revenue: null,
    },
    totalRawRows: 0,
  };

  const parsed = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  if (parsed.errors && parsed.errors.length > 0) {
    result.warnings.push(...parsed.errors.slice(0, 5).map((e) => `CSV warning at row ${e.row ?? '?'}: ${e.message}`));
  }

  const rawRows = parsed.data;
  result.totalRawRows = rawRows.length;

  if (rawRows.length === 0) {
    result.errors.push('The uploaded CSV file is empty or contains no data rows.');
    return result;
  }

  // Find column mapping from available headers
  const availableHeaders = Object.keys(rawRows[0] || {});
  const headerMap: Record<string, string> = {};
  for (const h of availableHeaders) {
    headerMap[normalizeHeader(h)] = h;
  }

  const findHeader = (candidates: string[]): string | null => {
    for (const c of candidates) {
      const norm = normalizeHeader(c);
      if (headerMap[norm]) return headerMap[norm];
    }
    // Partial substring match if exact not found
    for (const c of candidates) {
      const norm = normalizeHeader(c);
      const matched = Object.keys(headerMap).find((k) => k.includes(norm) || norm.includes(k));
      if (matched) return headerMap[matched];
    }
    return null;
  };

  const qCol = findHeader(['quarter', 'qtr', 'period']);
  const regCol = findHeader(['region', 'territory', 'geo', 'area']);
  const chCol = findHeader(['channel', 'saleschannel', 'distribution']);
  const prodCol = findHeader(['product', 'productname', 'sku', 'item']);
  const unitsCol = findHeader(['units', 'unit', 'quantity', 'qty', 'volume']);
  const discCol = findHeader(['discount_pct', 'discountpct', 'discount', 'discountpercentage', 'disc']);
  const revCol = findHeader(['revenue', 'sales', 'totalrevenue', 'amount', 'rev']);

  result.mappedColumns = {
    quarter: qCol,
    region: regCol,
    channel: chCol,
    product: prodCol,
    units: unitsCol,
    discount_pct: discCol,
    revenue: revCol,
  };

  const missingColumns: string[] = [];
  if (!qCol) missingColumns.push('quarter');
  if (!regCol) missingColumns.push('region');
  if (!revCol) missingColumns.push('revenue');

  if (missingColumns.length > 0) {
    result.errors.push(`Missing mandatory column(s): ${missingColumns.join(', ')}. Please ensure your CSV headers include quarter, region, and revenue.`);
    return result;
  }

  let validRowCount = 0;
  rawRows.forEach((row, index) => {
    const quarterRaw = qCol ? String(row[qCol] || '').trim() : '';
    const regionRaw = regCol ? String(row[regCol] || '').trim() : '';
    const channelRaw = chCol ? String(row[chCol] || '').trim() : 'Direct';
    const productRaw = prodCol ? String(row[prodCol] || '').trim() : 'Standard Product';
    const unitsRaw = unitsCol ? cleanNumber(row[unitsCol]) : 1;
    const discountRaw = discCol ? cleanDiscount(row[discCol]) : 0;
    const revenueRaw = revCol ? cleanNumber(row[revCol]) : 0;

    if (!quarterRaw || !regionRaw) {
      // Skip empty row or row missing critical identifiers
      return;
    }

    // Format quarter nicely, e.g. "q2" -> "Q2", "quarter 2" -> "Q2"
    let quarter = quarterRaw.toUpperCase();
    if (/^QUARTER\s*(\d)$/i.test(quarterRaw)) {
      const match = quarterRaw.match(/^QUARTER\s*(\d)$/i);
      quarter = `Q${match ? match[1] : quarterRaw}`;
    } else if (/^\d$/.test(quarterRaw)) {
      quarter = `Q${quarterRaw}`;
    }

    validRowCount++;
    result.orders.push({
      id: index + 1,
      quarter,
      region: regionRaw,
      channel: channelRaw || 'Unassigned Channel',
      product: productRaw || 'General Product',
      units: Math.max(0, Math.round(unitsRaw)),
      discount_pct: Math.max(0, discountRaw),
      revenue: Math.max(0, revenueRaw),
    });
  });

  if (result.orders.length === 0) {
    result.errors.push('No valid sales orders could be parsed from the provided CSV file.');
  }

  return result;
}

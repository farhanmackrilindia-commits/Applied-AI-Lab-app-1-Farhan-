import { SalesOrder } from '../types/sales';

export const SAMPLE_SALES_ORDERS: SalesOrder[] = [
  // --- Asia-Pacific (APAC) ---
  // Q1 APAC
  { id: 1, quarter: 'Q1', region: 'Asia-Pacific', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 320, discount_pct: 12.0, revenue: 112640 },
  { id: 2, quarter: 'Q1', region: 'Asia-Pacific', channel: 'Channel Partners', product: 'DataSphere Pro', units: 210, discount_pct: 15.0, revenue: 53550 },
  { id: 3, quarter: 'Q1', region: 'Asia-Pacific', channel: 'Online Store', product: 'Sentinel Security 360', units: 140, discount_pct: 5.0, revenue: 26600 },
  { id: 4, quarter: 'Q1', region: 'Asia-Pacific', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 95, discount_pct: 10.0, revenue: 42750 },

  // Q2 APAC (Total Revenue: ~285,400, Units: 840, Avg Discount: ~14.5%)
  { id: 5, quarter: 'Q2', region: 'Asia-Pacific', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 280, discount_pct: 18.0, revenue: 91840 },
  { id: 6, quarter: 'Q2', region: 'Asia-Pacific', channel: 'Channel Partners', product: 'DataSphere Pro', units: 240, discount_pct: 16.0, revenue: 60480 },
  { id: 7, quarter: 'Q2', region: 'Asia-Pacific', channel: 'Online Store', product: 'Sentinel Security 360', units: 180, discount_pct: 10.0, revenue: 32400 },
  { id: 8, quarter: 'Q2', region: 'Asia-Pacific', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 140, discount_pct: 14.0, revenue: 60200 },
  { id: 9, quarter: 'Q2', region: 'Asia-Pacific', channel: 'Channel Partners', product: 'Apex Cloud Suite', units: 110, discount_pct: 15.0, revenue: 37400 },
  { id: 10, quarter: 'Q2', region: 'Asia-Pacific', channel: 'Online Store', product: 'DataSphere Pro', units: 90, discount_pct: 8.0, revenue: 24840 },

  // Q3 APAC (Total Revenue: ~598,200, Units: 1750, Avg Discount: ~8.2%) -> SURGE of +$312,800 (+109.6%)
  { id: 11, quarter: 'Q3', region: 'Asia-Pacific', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 620, discount_pct: 6.0, revenue: 233120 },
  { id: 12, quarter: 'Q3', region: 'Asia-Pacific', channel: 'Channel Partners', product: 'AI Analytics Hub', units: 410, discount_pct: 7.0, revenue: 190650 },
  { id: 13, quarter: 'Q3', region: 'Asia-Pacific', channel: 'Enterprise Direct', product: 'DataSphere Pro', units: 340, discount_pct: 10.0, revenue: 91800 },
  { id: 14, quarter: 'Q3', region: 'Asia-Pacific', channel: 'Online Store', product: 'Sentinel Security 360', units: 220, discount_pct: 8.0, revenue: 40480 },
  { id: 15, quarter: 'Q3', region: 'Asia-Pacific', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 160, discount_pct: 10.0, revenue: 72000 },

  // Q4 APAC
  { id: 16, quarter: 'Q4', region: 'Asia-Pacific', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 680, discount_pct: 7.0, revenue: 252960 },
  { id: 17, quarter: 'Q4', region: 'Asia-Pacific', channel: 'Channel Partners', product: 'AI Analytics Hub', units: 450, discount_pct: 8.0, revenue: 207000 },
  { id: 18, quarter: 'Q4', region: 'Asia-Pacific', channel: 'Online Store', product: 'DataSphere Pro', units: 280, discount_pct: 6.0, revenue: 78960 },
  { id: 19, quarter: 'Q4', region: 'Asia-Pacific', channel: 'Inside Sales', product: 'Sentinel Security 360', units: 210, discount_pct: 5.0, revenue: 39900 },

  // --- North America ---
  // Q1 North America
  { id: 20, quarter: 'Q1', region: 'North America', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 850, discount_pct: 10.0, revenue: 306000 },
  { id: 21, quarter: 'Q1', region: 'North America', channel: 'Channel Partners', product: 'DataSphere Pro', units: 620, discount_pct: 12.0, revenue: 163680 },
  { id: 22, quarter: 'Q1', region: 'North America', channel: 'Online Store', product: 'Sentinel Security 360', units: 480, discount_pct: 5.0, revenue: 91200 },
  { id: 23, quarter: 'Q1', region: 'North America', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 310, discount_pct: 9.0, revenue: 141050 },

  // Q2 North America (Total Revenue: ~742,000, Units: 2,210)
  { id: 24, quarter: 'Q2', region: 'North America', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 890, discount_pct: 11.0, revenue: 316840 },
  { id: 25, quarter: 'Q2', region: 'North America', channel: 'Channel Partners', product: 'DataSphere Pro', units: 640, discount_pct: 13.0, revenue: 166920 },
  { id: 26, quarter: 'Q2', region: 'North America', channel: 'Online Store', product: 'Sentinel Security 360', units: 420, discount_pct: 6.0, revenue: 78960 },
  { id: 27, quarter: 'Q2', region: 'North America', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 380, discount_pct: 8.0, revenue: 174800 },
  { id: 28, quarter: 'Q2', region: 'North America', channel: 'Enterprise Direct', product: 'DataSphere Pro', units: 180, discount_pct: 10.0, revenue: 48600 },

  // Q3 North America (Total Revenue: ~891,500, Units: 2,560) -> Moderate Growth +$149,500 (+20.1%)
  { id: 29, quarter: 'Q3', region: 'North America', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 1020, discount_pct: 9.0, revenue: 371280 },
  { id: 30, quarter: 'Q3', region: 'North America', channel: 'Channel Partners', product: 'DataSphere Pro', units: 710, discount_pct: 11.0, revenue: 189570 },
  { id: 31, quarter: 'Q3', region: 'North America', channel: 'Online Store', product: 'Sentinel Security 360', units: 490, discount_pct: 5.0, revenue: 93100 },
  { id: 32, quarter: 'Q3', region: 'North America', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 440, discount_pct: 7.0, revenue: 204600 },
  { id: 33, quarter: 'Q3', region: 'North America', channel: 'Enterprise Direct', product: 'AI Analytics Hub', units: 190, discount_pct: 8.0, revenue: 87400 },

  // Q4 North America
  { id: 34, quarter: 'Q4', region: 'North America', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 1180, discount_pct: 10.0, revenue: 424800 },
  { id: 35, quarter: 'Q4', region: 'North America', channel: 'Channel Partners', product: 'DataSphere Pro', units: 820, discount_pct: 12.0, revenue: 216480 },
  { id: 36, quarter: 'Q4', region: 'North America', channel: 'Online Store', product: 'Sentinel Security 360', units: 580, discount_pct: 5.0, revenue: 110200 },
  { id: 37, quarter: 'Q4', region: 'North America', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 510, discount_pct: 8.0, revenue: 234600 },

  // --- Europe (EMEA) ---
  // Q1 EMEA
  { id: 38, quarter: 'Q1', region: 'Europe (EMEA)', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 510, discount_pct: 14.0, revenue: 175440 },
  { id: 39, quarter: 'Q1', region: 'Europe (EMEA)', channel: 'Channel Partners', product: 'DataSphere Pro', units: 410, discount_pct: 16.0, revenue: 103320 },
  { id: 40, quarter: 'Q1', region: 'Europe (EMEA)', channel: 'Online Store', product: 'Sentinel Security 360', units: 310, discount_pct: 8.0, revenue: 57040 },
  { id: 41, quarter: 'Q1', region: 'Europe (EMEA)', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 220, discount_pct: 12.0, revenue: 96800 },

  // Q2 EMEA (Total Revenue: ~462,800, Units: 1,480)
  { id: 42, quarter: 'Q2', region: 'Europe (EMEA)', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 540, discount_pct: 15.0, revenue: 183600 },
  { id: 43, quarter: 'Q2', region: 'Europe (EMEA)', channel: 'Channel Partners', product: 'DataSphere Pro', units: 430, discount_pct: 17.0, revenue: 107070 },
  { id: 44, quarter: 'Q2', region: 'Europe (EMEA)', channel: 'Online Store', product: 'Sentinel Security 360', units: 330, discount_pct: 9.0, revenue: 60060 },
  { id: 45, quarter: 'Q2', region: 'Europe (EMEA)', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 250, discount_pct: 13.0, revenue: 108750 },
  { id: 46, quarter: 'Q2', region: 'Europe (EMEA)', channel: 'Channel Partners', product: 'Apex Cloud Suite', units: 90, discount_pct: 16.0, revenue: 30240 },

  // Q3 EMEA (Total Revenue: ~426,300, Units: 1,360) -> Minor Decline -$36,500 (-7.9%)
  { id: 47, quarter: 'Q3', region: 'Europe (EMEA)', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 480, discount_pct: 16.0, revenue: 161280 },
  { id: 48, quarter: 'Q3', region: 'Europe (EMEA)', channel: 'Channel Partners', product: 'DataSphere Pro', units: 390, discount_pct: 18.0, revenue: 95940 },
  { id: 49, quarter: 'Q3', region: 'Europe (EMEA)', channel: 'Online Store', product: 'Sentinel Security 360', units: 290, discount_pct: 10.0, revenue: 52200 },
  { id: 50, quarter: 'Q3', region: 'Europe (EMEA)', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 240, discount_pct: 14.0, revenue: 103200 },
  { id: 51, quarter: 'Q3', region: 'Europe (EMEA)', channel: 'Channel Partners', product: 'Sentinel Security 360', units: 80, discount_pct: 12.0, revenue: 14080 },

  // Q4 EMEA
  { id: 52, quarter: 'Q4', region: 'Europe (EMEA)', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 590, discount_pct: 13.0, revenue: 205320 },
  { id: 53, quarter: 'Q4', region: 'Europe (EMEA)', channel: 'Channel Partners', product: 'DataSphere Pro', units: 480, discount_pct: 15.0, revenue: 122400 },
  { id: 54, quarter: 'Q4', region: 'Europe (EMEA)', channel: 'Online Store', product: 'Sentinel Security 360', units: 360, discount_pct: 8.0, revenue: 66240 },
  { id: 55, quarter: 'Q4', region: 'Europe (EMEA)', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 310, discount_pct: 11.0, revenue: 137950 },

  // --- Latin America (LATAM) ---
  // Q1 LATAM
  { id: 56, quarter: 'Q1', region: 'Latin America', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 160, discount_pct: 16.0, revenue: 53760 },
  { id: 57, quarter: 'Q1', region: 'Latin America', channel: 'Channel Partners', product: 'DataSphere Pro', units: 140, discount_pct: 18.0, revenue: 34440 },
  { id: 58, quarter: 'Q1', region: 'Latin America', channel: 'Online Store', product: 'Sentinel Security 360', units: 110, discount_pct: 12.0, revenue: 19360 },
  { id: 59, quarter: 'Q1', region: 'Latin America', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 75, discount_pct: 15.0, revenue: 31875 },

  // Q2 LATAM (Total Revenue: ~141,600, Units: 510)
  { id: 60, quarter: 'Q2', region: 'Latin America', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 170, discount_pct: 17.0, revenue: 56440 },
  { id: 61, quarter: 'Q2', region: 'Latin America', channel: 'Channel Partners', product: 'DataSphere Pro', units: 150, discount_pct: 19.0, revenue: 36450 },
  { id: 62, quarter: 'Q2', region: 'Latin America', channel: 'Online Store', product: 'Sentinel Security 360', units: 120, discount_pct: 13.0, revenue: 20880 },
  { id: 63, quarter: 'Q2', region: 'Latin America', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 80, discount_pct: 16.0, revenue: 33600 },

  // Q3 LATAM (Total Revenue: ~184,800, Units: 650) -> Moderate +$43,200 (+30.5%)
  { id: 64, quarter: 'Q3', region: 'Latin America', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 220, discount_pct: 15.0, revenue: 74800 },
  { id: 65, quarter: 'Q3', region: 'Latin America', channel: 'Channel Partners', product: 'DataSphere Pro', units: 190, discount_pct: 17.0, revenue: 47310 },
  { id: 66, quarter: 'Q3', region: 'Latin America', channel: 'Online Store', product: 'Sentinel Security 360', units: 150, discount_pct: 11.0, revenue: 26700 },
  { id: 67, quarter: 'Q3', region: 'Latin America', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 110, discount_pct: 14.0, revenue: 47300 },

  // Q4 LATAM
  { id: 68, quarter: 'Q4', region: 'Latin America', channel: 'Enterprise Direct', product: 'Apex Cloud Suite', units: 250, discount_pct: 14.0, revenue: 86000 },
  { id: 69, quarter: 'Q4', region: 'Latin America', channel: 'Channel Partners', product: 'DataSphere Pro', units: 210, discount_pct: 16.0, revenue: 52920 },
  { id: 70, quarter: 'Q4', region: 'Latin America', channel: 'Online Store', product: 'Sentinel Security 360', units: 170, discount_pct: 10.0, revenue: 30600 },
  { id: 71, quarter: 'Q4', region: 'Latin America', channel: 'Inside Sales', product: 'AI Analytics Hub', units: 130, discount_pct: 13.0, revenue: 56550 },
];

export function getSampleCsvString(): string {
  const headers = ['quarter', 'region', 'channel', 'product', 'units', 'discount_pct', 'revenue'];
  const rows = SAMPLE_SALES_ORDERS.map((item) => [
    item.quarter,
    item.region,
    item.channel,
    item.product,
    item.units.toString(),
    item.discount_pct.toString(),
    item.revenue.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((r) => r.map((c) => (c.includes(',') ? `"${c}"` : c)).join(','))].join('\n');
}

export function getTemplateCsvString(): string {
  const headers = ['quarter', 'region', 'channel', 'product', 'units', 'discount_pct', 'revenue'];
  const exampleRow1 = ['Q2', 'North America', 'Enterprise Direct', 'Apex Cloud Suite', '120', '10.0', '43200.00'];
  const exampleRow2 = ['Q3', 'North America', 'Enterprise Direct', 'Apex Cloud Suite', '190', '8.5', '69530.00'];
  const exampleRow3 = ['Q2', 'Asia-Pacific', 'Channel Partners', 'DataSphere Pro', '85', '12.0', '22440.00'];
  const exampleRow4 = ['Q3', 'Asia-Pacific', 'Channel Partners', 'DataSphere Pro', '210', '7.0', '58590.00'];

  return [headers.join(','), exampleRow1.join(','), exampleRow2.join(','), exampleRow3.join(','), exampleRow4.join(',')].join('\n');
}

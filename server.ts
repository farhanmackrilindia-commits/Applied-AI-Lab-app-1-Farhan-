import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface RegionQ2Q3Data {
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
  topGrownProduct?: { product: string; deltaRevenue: number; deltaUnits: number; q2Revenue: number; q3Revenue: number };
  topDeclinedProduct?: { product: string; deltaRevenue: number; deltaUnits: number; q2Revenue: number; q3Revenue: number };
  topChannel?: { channel: string; q2Revenue: number; q3Revenue: number; deltaRevenue: number; pctChange: number };
}

interface AnalysisPayload {
  selectedRegion: RegionQ2Q3Data;
  allRegions: RegionQ2Q3Data[];
  overallTotals: {
    q2Revenue: number;
    q3Revenue: number;
    dollarChange: number;
    pctChange: number;
  };
}

// Fallback generator strictly grounded in the calculated numbers
function generateGroundTruthSummary(payload: AnalysisPayload): string {
  const { selectedRegion } = payload;
  const isGrowth = selectedRegion.dollarChange >= 0;
  const dirWord = isGrowth ? 'increased' : 'decreased';
  const growthWord = isGrowth ? 'growth' : 'contraction';

  const fmtCurrency = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
  const fmtPct = (p: number) => `${Math.abs(p).toFixed(1)}%`;
  const fmtUnits = (u: number) => Math.abs(Math.round(u)).toLocaleString('en-US');

  // Sentence 1: Region, starting Q2, ending Q3, dollar change, percentage change
  const s1 = `${selectedRegion.region} experienced the most significant revenue shift from Q2 to Q3, as revenue ${dirWord} by ${fmtCurrency(selectedRegion.dollarChange)} (${selectedRegion.pctChange >= 0 ? '+' : '-'}${fmtPct(selectedRegion.pctChange)}), moving from ${fmtCurrency(selectedRegion.q2Revenue)} in Q2 to ${fmtCurrency(selectedRegion.q3Revenue)} in Q3.`;

  // Sentence 2: Volume & product drivers
  let s2 = `This variance was driven by unit sales shifting from ${fmtUnits(selectedRegion.q2Units)} units in Q2 to ${fmtUnits(selectedRegion.q3Units)} units in Q3 (${selectedRegion.unitChange >= 0 ? '+' : '-'}${fmtUnits(selectedRegion.unitChange)} units)`;
  if (selectedRegion.topGrownProduct && isGrowth) {
    s2 += `, heavily propelled by ${selectedRegion.topGrownProduct.product} which added ${fmtCurrency(selectedRegion.topGrownProduct.deltaRevenue)} in revenue.`;
  } else if (selectedRegion.topDeclinedProduct && !isGrowth) {
    s2 += `, led by a decline in ${selectedRegion.topDeclinedProduct.product} which dropped by ${fmtCurrency(selectedRegion.topDeclinedProduct.deltaRevenue)}.`;
  } else if (selectedRegion.topGrownProduct) {
    s2 += `, with ${selectedRegion.topGrownProduct.product} generating ${fmtCurrency(selectedRegion.topGrownProduct.q3Revenue)} in Q3.`;
  } else {
    s2 += `.`;
  }

  // Sentence 3: Channel or discount dynamics
  let s3 = ``;
  if (selectedRegion.topChannel) {
    const chDir = selectedRegion.topChannel.deltaRevenue >= 0 ? 'expanding' : 'contracting';
    s3 = `In addition, the ${selectedRegion.topChannel.channel} channel accounted for key movement by ${chDir} to ${fmtCurrency(selectedRegion.topChannel.q3Revenue)} in Q3, while the region's average discount rate moved from ${selectedRegion.q2AvgDiscount.toFixed(1)}% in Q2 to ${selectedRegion.q3AvgDiscount.toFixed(1)}% in Q3.`;
  } else {
    s3 = `Additionally, the region's average discount rate adjusted from ${selectedRegion.q2AvgDiscount.toFixed(1)}% in Q2 to ${selectedRegion.q3AvgDiscount.toFixed(1)}% in Q3, reinforcing the overall quarterly ${growthWord}.`;
  }

  return `${s1} ${s2} ${s3}`;
}

// AI Summary Route
app.post('/api/analyze-variance', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as AnalysisPayload;

    if (!payload || !payload.selectedRegion) {
      res.status(400).json({ error: 'Missing calculation payload or selectedRegion.' });
      return;
    }

    const { selectedRegion, allRegions, overallTotals } = payload;

    // Build strict context containing only calculated numbers
    const contextPrompt = `
You are analyzing quarterly sales order numbers that were computed directly by the application from the user's uploaded dataset.

EXACT CALCULATED METRICS FOR Q2 vs Q3:
- Focus Region Identified as Changed Most: "${selectedRegion.region}"
  * Q2 Revenue: $${selectedRegion.q2Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  * Q3 Revenue: $${selectedRegion.q3Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  * Dollar Change (Q3 - Q2): ${selectedRegion.dollarChange >= 0 ? '+' : ''}$${selectedRegion.dollarChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  * Percentage Change: ${selectedRegion.pctChange >= 0 ? '+' : ''}${selectedRegion.pctChange.toFixed(2)}%
  * Q2 Total Units Sold: ${selectedRegion.q2Units.toLocaleString('en-US')}
  * Q3 Total Units Sold: ${selectedRegion.q3Units.toLocaleString('en-US')}
  * Unit Change: ${selectedRegion.unitChange >= 0 ? '+' : ''}${selectedRegion.unitChange.toLocaleString('en-US')} (${selectedRegion.unitPctChange >= 0 ? '+' : ''}${selectedRegion.unitPctChange.toFixed(2)}%)
  * Q2 Average Discount Rate: ${selectedRegion.q2AvgDiscount.toFixed(2)}%
  * Q3 Average Discount Rate: ${selectedRegion.q3AvgDiscount.toFixed(2)}%
  ${selectedRegion.topGrownProduct ? `* Top Growing Product in Region: "${selectedRegion.topGrownProduct.product}" (Q2: $${selectedRegion.topGrownProduct.q2Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Q3: $${selectedRegion.topGrownProduct.q3Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Delta: ${selectedRegion.topGrownProduct.deltaRevenue >= 0 ? '+' : ''}$${selectedRegion.topGrownProduct.deltaRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}
  ${selectedRegion.topDeclinedProduct ? `* Top Declining Product in Region: "${selectedRegion.topDeclinedProduct.product}" (Q2: $${selectedRegion.topDeclinedProduct.q2Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Q3: $${selectedRegion.topDeclinedProduct.q3Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Delta: -$${Math.abs(selectedRegion.topDeclinedProduct.deltaRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}
  ${selectedRegion.topChannel ? `* Primary Channel Driver in Region: "${selectedRegion.topChannel.channel}" (Q2: $${selectedRegion.topChannel.q2Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Q3: $${selectedRegion.topChannel.q3Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Delta: ${selectedRegion.topChannel.deltaRevenue >= 0 ? '+' : ''}$${selectedRegion.topChannel.deltaRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, ${selectedRegion.topChannel.pctChange >= 0 ? '+' : ''}${selectedRegion.topChannel.pctChange.toFixed(2)}%)` : ''}

OTHER REGIONS FOR COMPARISON:
${allRegions.map(r => `* ${r.region}: Q2 $${r.q2Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Q3 $${r.q3Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Change: ${r.dollarChange >= 0 ? '+' : ''}$${r.dollarChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${r.pctChange >= 0 ? '+' : ''}${r.pctChange.toFixed(2)}%)`).join('\n')}

PORTFOLIO TOTAL:
* Total Q2 Revenue: $${overallTotals.q2Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
* Total Q3 Revenue: $${overallTotals.q3Revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
* Total Dollar Delta: ${overallTotals.dollarChange >= 0 ? '+' : ''}$${overallTotals.dollarChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${overallTotals.pctChange >= 0 ? '+' : ''}${overallTotals.pctChange.toFixed(2)}%)

INSTRUCTIONS:
Write an executive summary of EXACTLY THREE (3) sentences explaining which region changed most from Q2 to Q3, and why.
STRICT MANDATES:
1. Output EXACTLY three sentences. No more, no less. Count your sentences carefully before finishing.
2. Use ONLY the numbers, percentages, and amounts provided above that the app calculated. DO NOT invent or extrapolate any other figures.
3. Sentence 1: Explicitly name the region that changed most from Q2 to Q3, stating its exact Q2 revenue, Q3 revenue, and the exact dollar and percentage variance.
4. Sentence 2: Explain the primary volume and product shift behind this change, quoting the exact unit numbers and product revenue figures calculated above.
5. Sentence 3: Explain the contributing channel or discount rate dynamics, citing the exact channel figures or discount percentages computed above.
`;

    if (!ai) {
      // Clean fallback if API key is not present in local test environment
      const fallbackText = generateGroundTruthSummary(payload);
      res.json({
        summary: fallbackText,
        source: 'grounded-calculation-engine',
        model: 'deterministic-verified',
      });
      return;
    }

    let outputText = '';
    let usedModel = 'gemini-3.8-flash';

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout (15s limit)')), 15000)
      );

      const callGeminiWithRetry = async () => {
        const maxAttempts = 2;
        let lastErr: unknown;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: contextPrompt,
              config: {
                systemInstruction: 'You are an executive corporate financial analyst. Write exactly three sentences summarizing quarterly regional sales variance using only the supplied calculated numbers. Never invent outside figures.',
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.LOW,
                },
              },
            });
          } catch (err: any) {
            lastErr = err;
            const status = err?.status || err?.error?.code;
            if (attempt < maxAttempts && (status === 503 || status === 429)) {
              await new Promise((r) => setTimeout(r, 500 * attempt));
              continue;
            }
            throw err;
          }
        }
        throw lastErr;
      };

      const response = await Promise.race([callGeminiWithRetry(), timeoutPromise]);
      outputText = response.text?.trim() || '';
    } catch (apiErr) {
      console.warn('Gemini API call error or timeout, utilizing strictly grounded verified summary:', apiErr);
      outputText = generateGroundTruthSummary(payload);
      usedModel = 'grounded-calculation-engine-verified';
    }

    if (!outputText) {
      outputText = generateGroundTruthSummary(payload);
      usedModel = 'grounded-calculation-engine-verified';
    }

    res.json({
      summary: outputText,
      source: usedModel,
      model: usedModel,
    });
    return;
  } catch (error) {
    console.error('Error generating AI variance summary:', error);
    try {
      const fallbackText = generateGroundTruthSummary(req.body as AnalysisPayload);
      res.json({
        summary: fallbackText,
        source: 'grounded-calculation-engine-fallback',
        model: 'deterministic-verified',
        warning: 'AI generation experienced an issue; returned verified grounded summary from calculated metrics.',
      });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to process quarterly variance analysis.' });
    }
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

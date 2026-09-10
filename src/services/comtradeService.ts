import { 
  ComtradeApiResponse, 
  ComtradeRecord, 
  QueryParams, 
  TradeSummaryStats,
  BusinessLetterRequestPayload,
  BusinessLetterResult
} from '../types';
import { POPULAR_REPORTERS, POPULAR_PARTNERS, POPULAR_COMMODITIES } from '../data/referenceData';

const STORAGE_PRIMARY_KEY = 'un_comtrade_primary_key';
const STORAGE_SECONDARY_KEY = 'un_comtrade_secondary_key';
const STORAGE_ACTIVE_KEY_TYPE = 'un_comtrade_active_key_type'; // 'primary' | 'secondary'

// Client-Side In-Memory Cache (5 minutes) & In-Flight Promise Deduplication
const clientMemoryCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<any>>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000;

export async function clientFetchWithRetry(url: string, headers: Record<string, string>): Promise<any> {
  const cacheKey = `${url}_${headers['x-comtrade-key'] || 'default'}`;
  
  // 1. Check client memory cache
  const cached = clientMemoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  // 2. Deduplicate in-flight requests (prevents blasting the backend with 5 identical queries simultaneously)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const promise = (async () => {
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      attempts++;
      try {
        const res = await fetch(url, { method: 'GET', headers });
        
        let data: any = null;
        const contentType = res.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          data = await res.json().catch(() => null);
        } else {
          const rawText = await res.text().catch(() => '');
          try {
            data = JSON.parse(rawText);
          } catch {
            data = { error: rawText.slice(0, 300) || `Server error (HTTP ${res.status})` };
          }
        }

        if (res.ok && data) {
          clientMemoryCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }

        // If rate limit hit (429), wait 1.2s and retry once automatically
        if (res.status === 429 && attempts < maxAttempts) {
          console.warn('[Client 429 Auto-Retry] Waiting 1.2s before retry...');
          await new Promise(resolve => setTimeout(resolve, 1200));
          continue;
        }

        const errorMessage = data?.error || data?.message || `UN Comtrade API error (HTTP ${res.status})`;
        throw new Error(errorMessage);
      } catch (err: any) {
        if (attempts >= maxAttempts) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  })();

  inFlightRequests.set(cacheKey, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

export function getStoredApiKeys() {
  const primaryKey = localStorage.getItem(STORAGE_PRIMARY_KEY) || '';
  const secondaryKey = localStorage.getItem(STORAGE_SECONDARY_KEY) || '';
  const activeKeyType = (localStorage.getItem(STORAGE_ACTIVE_KEY_TYPE) as 'primary' | 'secondary') || 'primary';
  
  const activeKey = activeKeyType === 'primary' ? primaryKey : secondaryKey;

  return {
    primaryKey,
    secondaryKey,
    activeKeyType,
    activeKey: activeKey || primaryKey || secondaryKey
  };
}

export function saveStoredApiKeys(primary: string, secondary: string, activeType: 'primary' | 'secondary' = 'primary') {
  localStorage.setItem(STORAGE_PRIMARY_KEY, primary.trim());
  localStorage.setItem(STORAGE_SECONDARY_KEY, secondary.trim());
  localStorage.setItem(STORAGE_ACTIVE_KEY_TYPE, activeType);
}

export async function checkServerApiStatus() {
  try {
    const res = await fetch('/api/comtrade/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to get API status:', e);
  }
  return { hasConfiguredKey: false, registeredEmail: 'DIGINORON@GMAIL.COM' };
}

export async function testSubscriptionKey(key: string) {
  const response = await fetch('/api/comtrade/test-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  return await response.json();
}

export async function fetchComtradeData(params: QueryParams, customKey?: string): Promise<ComtradeApiResponse> {
  const { activeKey } = getStoredApiKeys();
  const keyToUse = customKey !== undefined ? customKey : activeKey;

  const urlParams = new URLSearchParams();
  urlParams.set('typeCode', params.typeCode || 'C');
  urlParams.set('freqCode', params.freqCode || 'A');
  urlParams.set('clCode', params.clCode || 'HS');
  urlParams.set('reporterCode', params.reporterCode);
  if (params.partnerCode !== undefined) urlParams.set('partnerCode', params.partnerCode);
  if (params.partner2Code) urlParams.set('partner2Code', params.partner2Code);
  urlParams.set('period', params.period);
  urlParams.set('cmdCode', params.cmdCode);
  urlParams.set('flowCode', params.flowCode);
  if (params.customsCode) urlParams.set('customsCode', params.customsCode);
  if (params.motCode) urlParams.set('motCode', params.motCode);

  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };

  if (keyToUse && keyToUse.trim().length > 0) {
    headers['x-comtrade-key'] = keyToUse.trim();
  }

  const endpoint = `/api/comtrade/data?${urlParams.toString()}`;
  return await clientFetchWithRetry(endpoint, headers);
}

// Country & Commodity lookup helpers for enriching records
export function getCountryName(code: number | string | undefined, lang: 'fa' | 'en' = 'en'): string {
  if (code === undefined || code === null) return 'N/A';
  const numCode = Number(code);
  if (numCode === 0) return lang === 'fa' ? 'جهان (همه کشورها)' : 'World (All)';
  
  const found = POPULAR_PARTNERS.find(c => c.id === numCode);
  if (found) {
    return lang === 'fa' ? `${found.flag || ''} ${found.nameFa}` : `${found.flag || ''} ${found.nameEn} (${found.iso})`;
  }
  return `Code ${code}`;
}

export function getCommodityName(cmdCode: string | undefined, lang: 'fa' | 'en' = 'en'): string {
  if (!cmdCode) return 'N/A';
  if (cmdCode === 'TOTAL') return lang === 'fa' ? 'تمام کالاها (مجموع)' : 'Total (All Commodities)';
  
  const found = POPULAR_COMMODITIES.find(c => c.id === cmdCode);
  if (found) {
    return lang === 'fa' ? found.nameFa : found.nameEn;
  }
  return `HS ${cmdCode}`;
}

export function getFlowName(flowCode: string | undefined, lang: 'fa' | 'en' = 'en'): { name: string; type: 'export' | 'import' | 're-export' | 'other' } {
  if (!flowCode) return { name: 'Unknown', type: 'other' };
  const code = flowCode.toUpperCase();
  if (code === 'M') return { name: lang === 'fa' ? 'واردات' : 'Imports', type: 'import' };
  if (code === 'X') return { name: lang === 'fa' ? 'صادرات' : 'Exports', type: 'export' };
  if (code === 'RX') return { name: lang === 'fa' ? 'صادرات مجدد' : 'Re-exports', type: 're-export' };
  if (code === 'FM') return { name: lang === 'fa' ? 'واردات مجدد' : 'Re-imports', type: 'other' };
  return { name: flowCode, type: 'other' };
}

// Compute aggregate statistics
export function calculateSummaryStats(records: ComtradeRecord[]): TradeSummaryStats {
  let totalTradeValue = 0;
  let totalExports = 0;
  let totalImports = 0;
  let totalReExports = 0;
  let totalNetWeightKg = 0;

  const partnerTotals: Record<string, number> = {};
  const cmdTotals: Record<string, number> = {};

  for (const r of records) {
    const val = Number(r.primaryValue) || 0;
    const wgt = Number(r.netWgt) || 0;
    const flow = (r.flowCode || '').toUpperCase();

    totalTradeValue += val;
    totalNetWeightKg += wgt;

    if (flow === 'X') {
      totalExports += val;
    } else if (flow === 'M') {
      totalImports += val;
    } else if (flow === 'RX') {
      totalReExports += val;
    }

    // Partner tracking
    const pKey = r.partnerDesc || String(r.partnerCode || 'Unknown');
    partnerTotals[pKey] = (partnerTotals[pKey] || 0) + val;

    // Commodity tracking
    const cKey = r.cmdDesc || r.cmdCode || 'TOTAL';
    cmdTotals[cKey] = (cmdTotals[cKey] || 0) + val;
  }

  // Find top partner
  let topPartner: { name: string; value: number } | undefined;
  for (const [name, value] of Object.entries(partnerTotals)) {
    if (!topPartner || value > topPartner.value) {
      topPartner = { name, value };
    }
  }

  // Find top commodity
  let topCommodity: { name: string; value: number } | undefined;
  for (const [name, value] of Object.entries(cmdTotals)) {
    if (!topCommodity || value > topCommodity.value) {
      topCommodity = { name, value };
    }
  }

  return {
    totalTradeValue,
    totalExports,
    totalImports,
    totalReExports,
    tradeBalance: totalExports - totalImports,
    totalNetWeightKg,
    recordCount: records.length,
    topPartner,
    topCommodity
  };
}

// Transform records for Time Series Charts
export function transformTimeSeriesData(records: ComtradeRecord[], lang: 'fa' | 'en' = 'en') {
  const periodMap: Record<string, { period: string; exports: number; imports: number; reExports: number; netBalance: number; total: number }> = {};

  for (const r of records) {
    const p = String(r.period || r.refYear || 'N/A');
    if (!periodMap[p]) {
      periodMap[p] = { period: p, exports: 0, imports: 0, reExports: 0, netBalance: 0, total: 0 };
    }

    const val = Number(r.primaryValue) || 0;
    const flow = (r.flowCode || '').toUpperCase();

    if (flow === 'X') {
      periodMap[p].exports += val;
    } else if (flow === 'M') {
      periodMap[p].imports += val;
    } else if (flow === 'RX') {
      periodMap[p].reExports += val;
    }
    periodMap[p].total += val;
    periodMap[p].netBalance = periodMap[p].exports - periodMap[p].imports;
  }

  return Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));
}

// Transform records for Partner breakdown charts
export function transformPartnerData(records: ComtradeRecord[], lang: 'fa' | 'en' = 'en', limit = 10) {
  const partnerMap: Record<string, { partner: string; partnerCode: number; exports: number; imports: number; total: number; flag?: string }> = {};

  for (const r of records) {
    const code = Number(r.partnerCode ?? 0);
    const partnerItem = POPULAR_PARTNERS.find(p => p.id === code);
    const partnerName = partnerItem ? (lang === 'fa' ? partnerItem.nameFa : partnerItem.nameEn) : (r.partnerDesc || `Country ${code}`);
    const flag = partnerItem?.flag || '🌐';

    if (!partnerMap[partnerName]) {
      partnerMap[partnerName] = { partner: partnerName, partnerCode: code, exports: 0, imports: 0, total: 0, flag };
    }

    const val = Number(r.primaryValue) || 0;
    const flow = (r.flowCode || '').toUpperCase();

    if (flow === 'X') partnerMap[partnerName].exports += val;
    else if (flow === 'M') partnerMap[partnerName].imports += val;
    partnerMap[partnerName].total += val;
  }

  return Object.values(partnerMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// Transform records for Commodity breakdown charts
export function transformCommodityData(records: ComtradeRecord[], lang: 'fa' | 'en' = 'en', limit = 10) {
  const cmdMap: Record<string, { commodity: string; cmdCode: string; value: number; weight: number }> = {};

  for (const r of records) {
    const code = String(r.cmdCode || 'TOTAL');
    const cmdItem = POPULAR_COMMODITIES.find(c => c.id === code);
    const cmdName = cmdItem ? (lang === 'fa' ? cmdItem.nameFa : cmdItem.nameEn) : (r.cmdDesc || `Code ${code}`);

    if (!cmdMap[code]) {
      cmdMap[code] = { commodity: cmdName, cmdCode: code, value: 0, weight: 0 };
    }

    cmdMap[code].value += Number(r.primaryValue) || 0;
    cmdMap[code].weight += Number(r.netWgt) || 0;
  }

  return Object.values(cmdMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

// 1. Fetch World Share
export async function fetchWorldShare(
  period: string, 
  reporterCode: string, 
  typeCode: 'C' | 'S' = 'C', 
  freqCode: 'A' | 'M' = 'A',
  customKey?: string
) {
  const { activeKey } = getStoredApiKeys();
  const keyToUse = customKey !== undefined ? customKey : activeKey;

  const urlParams = new URLSearchParams();
  urlParams.set('typeCode', typeCode);
  urlParams.set('freqCode', freqCode);
  urlParams.set('period', period);
  urlParams.set('reporterCode', reporterCode);

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (keyToUse) headers['x-comtrade-key'] = keyToUse.trim();

  return await clientFetchWithRetry(`/api/comtrade/world-share?${urlParams.toString()}`, headers);
}

// 2. Fetch MBS Historical Data
export async function fetchMbsData(params: {
  series_type?: string;
  year?: string;
  country_code?: string;
  period?: string;
  period_type?: string;
  table_type?: string;
  format?: string;
  customKey?: string;
}) {
  const { activeKey } = getStoredApiKeys();
  const keyToUse = params.customKey !== undefined ? params.customKey : activeKey;

  const urlParams = new URLSearchParams();
  if (params.series_type) urlParams.set('series_type', params.series_type);
  if (params.year) urlParams.set('year', params.year);
  if (params.country_code) urlParams.set('country_code', params.country_code);
  if (params.period) urlParams.set('period', params.period);
  if (params.period_type) urlParams.set('period_type', params.period_type);
  if (params.table_type) urlParams.set('table_type', params.table_type);
  if (params.format) urlParams.set('format', params.format);

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (keyToUse) headers['x-comtrade-key'] = keyToUse.trim();

  return await clientFetchWithRetry(`/api/comtrade/mbs?${urlParams.toString()}`, headers);
}

// 3. Fetch Tariffline & Mode of Transport (MoT) & 2nd Partner
export async function fetchTarifflineTransport(params: {
  reporterCode?: string;
  partnerCode?: string;
  partner2Code?: string;
  period?: string;
  cmdCode?: string;
  flowCode?: string;
  customsCode?: string;
  motCode?: string;
  typeCode?: 'C' | 'S';
  freqCode?: 'A' | 'M';
  clCode?: string;
  customKey?: string;
}) {
  const { activeKey } = getStoredApiKeys();
  const keyToUse = params.customKey !== undefined ? params.customKey : activeKey;

  const urlParams = new URLSearchParams();
  urlParams.set('typeCode', params.typeCode || 'C');
  urlParams.set('freqCode', params.freqCode || 'A');
  urlParams.set('clCode', params.clCode || 'HS');
  if (params.reporterCode) urlParams.set('reporterCode', params.reporterCode);
  if (params.partnerCode) urlParams.set('partnerCode', params.partnerCode);
  if (params.partner2Code) urlParams.set('partner2Code', params.partner2Code);
  if (params.period) urlParams.set('period', params.period);
  if (params.cmdCode) urlParams.set('cmdCode', params.cmdCode);
  if (params.flowCode) urlParams.set('flowCode', params.flowCode);
  if (params.customsCode) urlParams.set('customsCode', params.customsCode);
  if (params.motCode) urlParams.set('motCode', params.motCode);

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (keyToUse) headers['x-comtrade-key'] = keyToUse.trim();

  return await clientFetchWithRetry(`/api/comtrade/tariffline?${urlParams.toString()}`, headers);
}

// 4. Fetch Data Availability (DA) Matrix
export async function fetchDataAvailability(params: {
  reporterCode?: string;
  period?: string;
  typeCode?: 'C' | 'S';
  freqCode?: 'A' | 'M';
  clCode?: string;
  isTariffline?: boolean;
  customKey?: string;
}) {
  const { activeKey } = getStoredApiKeys();
  const keyToUse = params.customKey !== undefined ? params.customKey : activeKey;

  const urlParams = new URLSearchParams();
  urlParams.set('typeCode', params.typeCode || 'C');
  urlParams.set('freqCode', params.freqCode || 'A');
  urlParams.set('clCode', params.clCode || 'HS');
  if (params.reporterCode) urlParams.set('reporterCode', params.reporterCode);
  if (params.period) urlParams.set('period', params.period);
  if (params.isTariffline) urlParams.set('tariffline', 'true');

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (keyToUse) headers['x-comtrade-key'] = keyToUse.trim();

  return await clientFetchWithRetry(`/api/comtrade/data-availability?${urlParams.toString()}`, headers);
}

// 5. Fetch UN Comtrade Releases Feed
export async function fetchComtradeReleases(customKey?: string) {
  const { activeKey } = getStoredApiKeys();
  const keyToUse = customKey !== undefined ? customKey : activeKey;

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (keyToUse) headers['x-comtrade-key'] = keyToUse.trim();

  return await clientFetchWithRetry('/api/comtrade/releases', headers);
}

// 6. Fetch Bilateral Trade Asymmetry & Mirror Data Tool (getBilateralData)
export async function fetchBilateralData(params: {
  reporterCode?: string;
  partnerCode?: string;
  period?: string;
  cmdCode?: string;
  flowCode?: string;
  typeCode?: 'C' | 'S';
  freqCode?: 'A' | 'M';
  clCode?: string;
  includeDesc?: boolean;
  customKey?: string;
}) {
  const { activeKey } = getStoredApiKeys();
  const keyToUse = params.customKey !== undefined ? params.customKey : activeKey;

  const urlParams = new URLSearchParams();
  urlParams.set('typeCode', params.typeCode || 'C');
  urlParams.set('freqCode', params.freqCode || 'A');
  urlParams.set('clCode', params.clCode || 'HS');
  if (params.reporterCode) urlParams.set('reporterCode', params.reporterCode);
  if (params.partnerCode) urlParams.set('partnerCode', params.partnerCode);
  if (params.period) urlParams.set('period', params.period);
  if (params.cmdCode) urlParams.set('cmdCode', params.cmdCode);
  if (params.flowCode) urlParams.set('flowCode', params.flowCode);
  if (params.includeDesc !== undefined) urlParams.set('includeDesc', String(params.includeDesc));

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (keyToUse) headers['x-comtrade-key'] = keyToUse.trim();

  return await clientFetchWithRetry(`/api/comtrade/bilateral?${urlParams.toString()}`, headers);
}

// 7. Fetch Pivoted Trade Balance Tool (getTradeBalance)
export async function fetchTradeBalanceTool(params: {
  reporterCode?: string;
  partnerCode?: string;
  partner2Code?: string;
  period?: string;
  cmdCode?: string;
  customsCode?: string;
  motCode?: string;
  aggregateBy?: string;
  breakdownMode?: string;
  typeCode?: 'C' | 'S';
  freqCode?: 'A' | 'M';
  clCode?: string;
  includeDesc?: boolean;
  customKey?: string;
}) {
  const { activeKey } = getStoredApiKeys();
  const keyToUse = params.customKey !== undefined ? params.customKey : activeKey;

  const urlParams = new URLSearchParams();
  urlParams.set('typeCode', params.typeCode || 'C');
  urlParams.set('freqCode', params.freqCode || 'A');
  urlParams.set('clCode', params.clCode || 'HS');
  if (params.reporterCode) urlParams.set('reporterCode', params.reporterCode);
  if (params.partnerCode) urlParams.set('partnerCode', params.partnerCode);
  if (params.partner2Code) urlParams.set('partner2Code', params.partner2Code);
  if (params.period) urlParams.set('period', params.period);
  if (params.cmdCode) urlParams.set('cmdCode', params.cmdCode);
  if (params.customsCode) urlParams.set('customsCode', params.customsCode);
  if (params.motCode) urlParams.set('motCode', params.motCode);
  if (params.aggregateBy) urlParams.set('aggregateBy', params.aggregateBy);
  if (params.breakdownMode) urlParams.set('breakdownMode', params.breakdownMode);
  if (params.includeDesc !== undefined) urlParams.set('includeDesc', String(params.includeDesc));

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (keyToUse) headers['x-comtrade-key'] = keyToUse.trim();

  return await clientFetchWithRetry(`/api/comtrade/trade-balance?${urlParams.toString()}`, headers);
}

// 8. Request AI Smart Trade Advisor from Engine (Gemini 3.5 Flash Lite)
export async function requestSmartTradeAdvice(payload: {
  originCountry: string;
  destinationCountry: string;
  hsCode: string;
  hsTitle: string;
  period: string;
  structuredContext: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  userQuery?: string;
  customKey?: string;
  model?: string;
}): Promise<{ success: boolean; advice: string; model?: string; durationMs?: number; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (payload.customKey) {
      headers['x-avalai-key'] = payload.customKey.trim();
    }

    const response = await fetch('/api/ai/trade-advisor', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return {
        success: true,
        advice: data.advice,
        model: data.model,
        durationMs: data.durationMs
      };
    }

    return {
      success: false,
      advice: '',
      error: data.error || `خطا در ارتباط با مدل هوش مصنوعی (${response.status})`
    };
  } catch (err: any) {
    console.error('Failed to call AI Trade Advisor API:', err);
    return {
      success: false,
      advice: '',
      error: err.message || 'عدم امکان برقراری ارتباط با سرور هوش مصنوعی'
    };
  }
}

/**
 * Request International Commercial Business Letter (ICC Standards)
 */
export async function requestBusinessLetterGeneration(
  payload: BusinessLetterRequestPayload
): Promise<{
  success: boolean;
  data?: BusinessLetterResult;
  model?: string;
  durationMs?: number;
  error?: string;
}> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (payload.customKey) {
      headers['x-avalai-key'] = payload.customKey.trim();
    }

    const response = await fetch('/api/ai/business-letter', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok && result.success && result.data) {
      return {
        success: true,
        data: result.data,
        model: result.model,
        durationMs: result.durationMs
      };
    }

    return {
      success: false,
      error: result.error || `خطا در نگارش نامه تجاری (${response.status})`
    };
  } catch (err: any) {
    console.error('Failed to call Business Letter AI API:', err);
    return {
      success: false,
      error: err.message || 'عدم امکان ارتباط با سرور هوش مصنوعی نگارش نامه'
    };
  }
}



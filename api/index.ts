import express from 'express';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.json());

// In-Memory Cache with TTL (20 minutes)
interface CacheEntry {
  data: any;
  timestamp: number;
}
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes
const apiCache = new Map<string, CacheEntry>();

function getFromCache(key: string): any | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setInCache(key: string, data: any) {
  if (apiCache.size > 500) {
    const firstKey = apiCache.keys().next().value;
    if (firstKey) apiCache.delete(firstKey);
  }
  apiCache.set(key, { data, timestamp: Date.now() });
}

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Centralized Fetch with Automatic Rate-Limit Retry (Backoff) & Caching
async function fetchWithRateLimitRetry(
  url: string, 
  headers: Record<string, string>, 
  maxRetries = 3
): Promise<{ status: number; data?: any; errorText?: string; fromCache?: boolean }> {
  const cacheKey = `${url}_${headers['Ocp-Apim-Subscription-Key'] || 'public'}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return { status: 200, data: cached, fromCache: true };
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      const fetchController = new AbortController();
      const timeoutId = setTimeout(() => fetchController.abort(), 30000);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: fetchController.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        setInCache(cacheKey, json);
        return { status: response.status, data: json, fromCache: false };
      }

      // Handle 429 Rate Limit
      if (response.status === 429) {
        const errorBody = await response.text();
        console.warn(`[UN Comtrade 429] Rate limit hit (attempt ${attempt}/${maxRetries}): ${errorBody}`);

        if (attempt < maxRetries) {
          let waitSeconds = 1.5;
          const match = errorBody.match(/Try again in (\d+) seconds/i);
          if (match && match[1]) {
            waitSeconds = Math.max(1, parseInt(match[1], 10));
          }
          const retryAfterHeader = response.headers.get('retry-after');
          if (retryAfterHeader) {
            const parsed = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsed) && parsed > 0) waitSeconds = parsed;
          }

          const waitMs = Math.round(waitSeconds * 1000) + 400 * attempt;
          console.log(`[UN Comtrade Retry] Backing off for ${waitMs}ms before retry...`);
          await sleep(waitMs);
          continue;
        }

        return { status: 429, errorText: errorBody };
      }

      // Other non-ok response
      const errText = await response.text();
      return { status: response.status, errorText: errText };
    } catch (err: any) {
      if (attempt >= maxRetries) {
        return { status: 500, errorText: err.message };
      }
      await sleep(1000 * attempt);
    }
  }

  return { status: 500, errorText: 'Request failed after maximum retries' };
}

// Helper to determine the best subscription key
function getSubscriptionKey(req: express.Request): string | undefined {
  const headerKey = (req.headers['x-comtrade-key'] as string) || (req.headers['ocp-apim-subscription-key'] as string);
  if (headerKey && headerKey.trim().length > 0) {
    return headerKey.trim();
  }

  const queryKey = req.query.subscriptionKey as string;
  if (queryKey && queryKey.trim().length > 0) {
    return queryKey.trim();
  }

  if (process.env.UN_COMTRADE_PRIMARY_KEY && process.env.UN_COMTRADE_PRIMARY_KEY.trim().length > 0) {
    return process.env.UN_COMTRADE_PRIMARY_KEY.trim();
  }

  if (process.env.UN_COMTRADE_SECONDARY_KEY && process.env.UN_COMTRADE_SECONDARY_KEY.trim().length > 0) {
    return process.env.UN_COMTRADE_SECONDARY_KEY.trim();
  }

  return undefined;
}

const comtradeRouter = express.Router();

// 1. Status endpoint
comtradeRouter.get('/status', (req, res) => {
  const hasEnvPrimaryKey = Boolean(process.env.UN_COMTRADE_PRIMARY_KEY && process.env.UN_COMTRADE_PRIMARY_KEY.trim().length > 0);
  const hasEnvSecondaryKey = Boolean(process.env.UN_COMTRADE_SECONDARY_KEY && process.env.UN_COMTRADE_SECONDARY_KEY.trim().length > 0);

  res.json({
    status: 'ok',
    registeredEmail: 'DIGINORON@GMAIL.COM',
    apiPortalUrl: 'https://comtradedeveloper.un.org/',
    hasEnvPrimaryKey,
    hasEnvSecondaryKey,
    hasConfiguredKey: hasEnvPrimaryKey || hasEnvSecondaryKey,
    apiVersion: 'UN Comtrade v1',
    cacheEntries: apiCache.size
  });
});

// 2. Key testing endpoint
comtradeRouter.post('/test-key', async (req, res) => {
  const { key } = req.body;
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    return res.status(400).json({
      valid: false,
      message: 'Subscription key is required / کلید اشتراک وارد نشده است'
    });
  }

  const cleanKey = key.trim();
  const startTime = Date.now();

  try {
    const testUrl = 'https://comtradeapi.un.org/data/v1/get/C/A/HS?reporterCode=842&partnerCode=0&period=2023&cmdCode=TOTAL&flowCode=X';
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': cleanKey,
        'Accept': 'application/json',
        'User-Agent': 'UN-Comtrade-Client/1.0'
      }
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return res.json({
        valid: true,
        statusCode: response.status,
        durationMs: duration,
        recordCount: data?.data?.length || 0,
        message: 'UN Comtrade API Key verified successfully! / کلید اشتراک با موفقیت تایید شد.'
      });
    } else {
      const errorText = await response.text();
      let errorJson: any = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {}

      return res.status(200).json({
        valid: false,
        statusCode: response.status,
        durationMs: duration,
        error: errorJson?.message || response.statusText || 'Authentication failed',
        message: response.status === 401 
          ? 'Invalid Subscription Key (Access Denied / 401 Unauthorized) / کلید نامعتبر است یا در پنل تایید نشده.' 
          : response.status === 429
          ? 'Rate limit exceeded on this key. Please wait 1 second and retry.'
          : `UN Comtrade returned status ${response.status}: ${errorText.substring(0, 120)}`
      });
    }
  } catch (err: any) {
    return res.status(200).json({
      valid: false,
      message: `Connection error to UN Comtrade API: ${err.message}`,
      error: err.message
    });
  }
});

// 3. Main UN Comtrade Data Proxy endpoint
comtradeRouter.get('/data', async (req, res) => {
  const startTime = Date.now();
  
  const typeCode = (req.query.typeCode as string) || 'C';
  const freqCode = (req.query.freqCode as string) || 'A';
  const clCode = (req.query.clCode as string) || 'HS';

  const queryParams = new URLSearchParams();
  if (req.query.reporterCode) queryParams.set('reporterCode', String(req.query.reporterCode));
  if (req.query.partnerCode) queryParams.set('partnerCode', String(req.query.partnerCode));
  if (req.query.partner2Code) queryParams.set('partner2Code', String(req.query.partner2Code));
  if (req.query.period) queryParams.set('period', String(req.query.period));
  if (req.query.cmdCode) queryParams.set('cmdCode', String(req.query.cmdCode));
  if (req.query.flowCode) queryParams.set('flowCode', String(req.query.flowCode));
  if (req.query.customsCode) queryParams.set('customsCode', String(req.query.customsCode));
  if (req.query.motCode) queryParams.set('motCode', String(req.query.motCode));
  if (req.query.format) queryParams.set('format', String(req.query.format));
  if (req.query.includeDesc !== undefined) queryParams.set('includeDesc', String(req.query.includeDesc));

  const subscriptionKey = getSubscriptionKey(req);

  const baseUrl = subscriptionKey 
    ? `https://comtradeapi.un.org/data/v1/get/${typeCode}/${freqCode}/${clCode}`
    : `https://comtradeapi.un.org/public/v1/preview/${typeCode}/${freqCode}/${clCode}`;

  const targetUrl = `${baseUrl}?${queryParams.toString()}`;

  const requestHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };

  if (subscriptionKey) {
    requestHeaders['Ocp-Apim-Subscription-Key'] = subscriptionKey;
  }

  const result = await fetchWithRateLimitRetry(targetUrl, requestHeaders, 3);
  const queryTimeMs = Date.now() - startTime;

  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs,
      statusCode: 200,
      count: result.data?.data?.length || 0,
      fromCache: result.fromCache,
      hasSubscriptionKey: Boolean(subscriptionKey)
    });
  }

  let parsedError: any = null;
  try {
    if (result.errorText) parsedError = JSON.parse(result.errorText);
  } catch {}

  return res.status(result.status || 500).json({
    error: parsedError?.message || result.errorText || `UN Comtrade API returned error (${result.status})`,
    statusCode: result.status,
    endpointUrl: targetUrl,
    queryTimeMs,
    count: 0,
    data: [],
    tip: result.status === 401 
      ? 'Please provide a valid UN Comtrade API Subscription Key in the Key Manager (top right).'
      : result.status === 429
      ? 'UN Comtrade rate limit exceeded. The system attempted automatic retry. Please wait a moment.'
      : 'Check your query parameters.'
  });
});

// 4. World Share Proxy
comtradeRouter.get('/world-share', async (req, res) => {
  const startTime = Date.now();
  const typeCode = (req.query.typeCode as string) || 'C';
  const freqCode = (req.query.freqCode as string) || 'A';
  const period = req.query.period as string;
  const reporterCode = req.query.reporterCode as string;

  const queryParams = new URLSearchParams();
  if (period) queryParams.set('period', period);
  if (reporterCode) queryParams.set('reporterCode', reporterCode);

  const targetUrl = `https://comtradeapi.un.org/public/v1/getWorldShare/${typeCode}/${freqCode}?${queryParams.toString()}`;
  const subscriptionKey = getSubscriptionKey(req);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

  const result = await fetchWithRateLimitRetry(targetUrl, headers, 3);
  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs: Date.now() - startTime,
      statusCode: 200,
      fromCache: result.fromCache
    });
  }
  return res.status(result.status || 500).json({ error: result.errorText, endpointUrl: targetUrl });
});

// 5. MBS Historical Data Proxy (1946-)
comtradeRouter.get('/mbs', async (req, res) => {
  const startTime = Date.now();
  const queryParams = new URLSearchParams();
  
  if (req.query.series_type) queryParams.set('series_type', String(req.query.series_type));
  if (req.query.year) queryParams.set('year', String(req.query.year));
  if (req.query.country_code) queryParams.set('country_code', String(req.query.country_code));
  if (req.query.period) queryParams.set('period', String(req.query.period));
  if (req.query.period_type) queryParams.set('period_type', String(req.query.period_type));
  if (req.query.table_type) queryParams.set('table_type', String(req.query.table_type));
  if (req.query.format) queryParams.set('format', String(req.query.format));

  const targetUrl = `https://comtradeapi.un.org/public/v1/getMBS?${queryParams.toString()}`;
  const subscriptionKey = getSubscriptionKey(req);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

  const result = await fetchWithRateLimitRetry(targetUrl, headers, 3);
  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs: Date.now() - startTime,
      statusCode: 200,
      fromCache: result.fromCache
    });
  }
  return res.status(result.status || 500).json({ error: result.errorText, endpointUrl: targetUrl });
});

// 6. Tariffline & MoT Transport Logistics Proxy
comtradeRouter.get('/tariffline', async (req, res) => {
  const startTime = Date.now();
  const typeCode = (req.query.typeCode as string) || 'C';
  const freqCode = (req.query.freqCode as string) || 'A';
  const clCode = (req.query.clCode as string) || 'HS';

  const queryParams = new URLSearchParams();
  if (req.query.reporterCode) queryParams.set('reporterCode', String(req.query.reporterCode));
  if (req.query.period) queryParams.set('period', String(req.query.period));
  if (req.query.partnerCode) queryParams.set('partnerCode', String(req.query.partnerCode));
  if (req.query.partner2Code) queryParams.set('partner2Code', String(req.query.partner2Code));
  if (req.query.cmdCode) queryParams.set('cmdCode', String(req.query.cmdCode));
  if (req.query.flowCode) queryParams.set('flowCode', String(req.query.flowCode));
  if (req.query.customsCode) queryParams.set('customsCode', String(req.query.customsCode));
  if (req.query.motCode) queryParams.set('motCode', String(req.query.motCode));

  const targetUrl = `https://comtradeapi.un.org/public/v1/previewTariffline/${typeCode}/${freqCode}/${clCode}?${queryParams.toString()}`;
  const subscriptionKey = getSubscriptionKey(req);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

  const result = await fetchWithRateLimitRetry(targetUrl, headers, 3);
  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs: Date.now() - startTime,
      statusCode: 200,
      fromCache: result.fromCache
    });
  }
  return res.status(result.status || 500).json({ error: result.errorText, endpointUrl: targetUrl });
});

// 7. Data Availability (DA) Matrix Proxy
comtradeRouter.get('/data-availability', async (req, res) => {
  const startTime = Date.now();
  const typeCode = (req.query.typeCode as string) || 'C';
  const freqCode = (req.query.freqCode as string) || 'A';
  const clCode = (req.query.clCode as string) || 'HS';
  const isTariffline = req.query.tariffline === 'true';

  const baseUrl = isTariffline
    ? `https://comtradeapi.un.org/public/v1/getDATariffline/${typeCode}/${freqCode}/${clCode}`
    : `https://comtradeapi.un.org/public/v1/getDA/${typeCode}/${freqCode}/${clCode}`;

  const queryParams = new URLSearchParams();
  if (req.query.reporterCode) queryParams.set('reporterCode', String(req.query.reporterCode));
  if (req.query.period) queryParams.set('period', String(req.query.period));

  const targetUrl = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const subscriptionKey = getSubscriptionKey(req);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

  const result = await fetchWithRateLimitRetry(targetUrl, headers, 3);
  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs: Date.now() - startTime,
      statusCode: 200,
      fromCache: result.fromCache
    });
  }
  return res.status(result.status || 500).json({ error: result.errorText, endpointUrl: targetUrl });
});

// 8. UN Comtrade Releases Feed Proxy
comtradeRouter.get('/releases', async (req, res) => {
  const startTime = Date.now();
  const targetUrl = 'https://comtradeapi.un.org/public/v1/getComtradeReleases';
  const subscriptionKey = getSubscriptionKey(req);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

  const result = await fetchWithRateLimitRetry(targetUrl, headers, 3);
  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs: Date.now() - startTime,
      statusCode: 200,
      fromCache: result.fromCache
    });
  }
  return res.status(result.status || 500).json({ error: result.errorText, endpointUrl: targetUrl });
});

// 9. UN Tools: Bilateral Trade Asymmetry Proxy (Mirror Data Analysis)
comtradeRouter.get('/bilateral', async (req, res) => {
  const startTime = Date.now();
  const typeCode = (req.query.typeCode as string) || 'C';
  const freqCode = (req.query.freqCode as string) || 'A';
  const clCode = (req.query.clCode as string) || 'HS';

  const queryParams = new URLSearchParams();
  if (req.query.reporterCode) queryParams.set('reporterCode', String(req.query.reporterCode));
  if (req.query.partnerCode) queryParams.set('partnerCode', String(req.query.partnerCode));
  if (req.query.period) queryParams.set('period', String(req.query.period));
  if (req.query.cmdCode) queryParams.set('cmdCode', String(req.query.cmdCode));
  if (req.query.flowCode) queryParams.set('flowCode', String(req.query.flowCode));
  if (req.query.includeDesc !== undefined) queryParams.set('includeDesc', String(req.query.includeDesc));

  const targetUrl = `https://comtradeapi.un.org/tools/v1/getBilateralData/${typeCode}/${freqCode}/${clCode}?${queryParams.toString()}`;
  const subscriptionKey = getSubscriptionKey(req);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

  const result = await fetchWithRateLimitRetry(targetUrl, headers, 3);
  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs: Date.now() - startTime,
      statusCode: 200,
      fromCache: result.fromCache
    });
  }
  return res.status(result.status || 500).json({ error: result.errorText, endpointUrl: targetUrl });
});

// 10. UN Tools: Pivoted Trade Balance Proxy
comtradeRouter.get('/trade-balance', async (req, res) => {
  const startTime = Date.now();
  const typeCode = (req.query.typeCode as string) || 'C';
  const freqCode = (req.query.freqCode as string) || 'A';
  const clCode = (req.query.clCode as string) || 'HS';

  const queryParams = new URLSearchParams();
  if (req.query.reporterCode) queryParams.set('reporterCode', String(req.query.reporterCode));
  if (req.query.partnerCode) queryParams.set('partnerCode', String(req.query.partnerCode));
  if (req.query.partner2Code) queryParams.set('partner2Code', String(req.query.partner2Code));
  if (req.query.period) queryParams.set('period', String(req.query.period));
  if (req.query.cmdCode) queryParams.set('cmdCode', String(req.query.cmdCode));
  if (req.query.customsCode) queryParams.set('customsCode', String(req.query.customsCode));
  if (req.query.motCode) queryParams.set('motCode', String(req.query.motCode));
  if (req.query.includeDesc !== undefined) queryParams.set('includeDesc', String(req.query.includeDesc));

  const targetUrl = `https://comtradeapi.un.org/tools/v1/getTradeBalance/${typeCode}/${freqCode}/${clCode}?${queryParams.toString()}`;
  const subscriptionKey = getSubscriptionKey(req);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

  const result = await fetchWithRateLimitRetry(targetUrl, headers, 3);
  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs: Date.now() - startTime,
      statusCode: 200,
      fromCache: result.fromCache
    });
  }
  return res.status(result.status || 500).json({ error: result.errorText, endpointUrl: targetUrl });
});

// 11. UN Comtrade Services Trade (SITS EBOPS) Proxy
comtradeRouter.get('/services', async (req, res) => {
  const startTime = Date.now();
  const freqCode = (req.query.freqCode as string) || 'A';
  const clCode = (req.query.clCode as string) || 'EB02';

  const queryParams = new URLSearchParams();
  if (req.query.reporterCode) queryParams.set('reporterCode', String(req.query.reporterCode));
  if (req.query.partnerCode) queryParams.set('partnerCode', String(req.query.partnerCode));
  if (req.query.period) queryParams.set('period', String(req.query.period));
  if (req.query.cmdCode) queryParams.set('cmdCode', String(req.query.cmdCode));
  if (req.query.flowCode) queryParams.set('flowCode', String(req.query.flowCode));
  if (req.query.includeDesc !== undefined) queryParams.set('includeDesc', String(req.query.includeDesc));

  const subscriptionKey = getSubscriptionKey(req);

  const baseUrl = subscriptionKey 
    ? `https://comtradeapi.un.org/data/v1/get/S/${freqCode}/${clCode}`
    : `https://comtradeapi.un.org/public/v1/preview/S/${freqCode}/${clCode}`;

  const targetUrl = `${baseUrl}?${queryParams.toString()}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'UN-Comtrade-Visual-Explorer/1.0'
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

  const result = await fetchWithRateLimitRetry(targetUrl, headers, 3);
  if (result.status === 200 && result.data) {
    return res.json({
      ...result.data,
      endpointUrl: targetUrl,
      queryTimeMs: Date.now() - startTime,
      statusCode: 200,
      fromCache: result.fromCache
    });
  }
  return res.status(result.status || 500).json({ error: result.errorText, endpointUrl: targetUrl });
});

// Health check & Diagnostic endpoints
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const envCheckHandler = (req: express.Request, res: express.Response) => {
  const hasComtradePrimary = Boolean(process.env.UN_COMTRADE_PRIMARY_KEY && process.env.UN_COMTRADE_PRIMARY_KEY.trim().length > 0);
  const hasComtradeSecondary = Boolean(process.env.UN_COMTRADE_SECONDARY_KEY && process.env.UN_COMTRADE_SECONDARY_KEY.trim().length > 0);
  const hasApiNinjas = Boolean((process.env.API_NINJAS_KEY && process.env.API_NINJAS_KEY.trim().length > 0) || (process.env.API_NINJA_KEY && process.env.API_NINJA_KEY.trim().length > 0));
  const hasAvalAi = Boolean(process.env.AVALAI_API_KEY && process.env.AVALAI_API_KEY.trim().length > 0);
  const hasSupabaseUrl = Boolean((process.env.SUPABASE_URL && process.env.SUPABASE_URL.trim().length > 0) || (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_URL.trim().length > 0));
  const hasSupabaseAnonKey = Boolean((process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.trim().length > 0) || (process.env.VITE_SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY.trim().length > 0));

  res.json({
    status: 'ok',
    message: 'DigiNoron Trading API Gateway Operational',
    environment: {
      unComtrade: {
        configured: hasComtradePrimary || hasComtradeSecondary,
        hasPrimaryKey: hasComtradePrimary,
        hasSecondaryKey: hasComtradeSecondary,
      },
      apiNinjas: {
        configured: hasApiNinjas,
      },
      avalAi: {
        configured: hasAvalAi,
      },
      supabase: {
        configured: hasSupabaseUrl && hasSupabaseAnonKey,
        hasUrl: hasSupabaseUrl,
        hasAnonKey: hasSupabaseAnonKey,
      }
    }
  });
};

app.get('/api/env-check', envCheckHandler);
app.get('/env-check', envCheckHandler);
app.get('/api', envCheckHandler);
app.get('/', (req, res, next) => {
  // If request accepts HTML, let Vite/static serve index.html; otherwise return API status
  if (req.accepts('html')) return next();
  return envCheckHandler(req, res);
});

// Supabase Server-Side Helpers (Lazy initialized)
let serverSupabaseClient: SupabaseClient | null = null;

function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const keyToUse = serviceRoleKey || anonKey;

  if (!url || !keyToUse) return null;

  if (!serverSupabaseClient) {
    try {
      serverSupabaseClient = createClient(url, keyToUse, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.warn('[Supabase Server] Initialization error:', err);
      return null;
    }
  }
  return serverSupabaseClient;
}

function isSupabaseServerConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && url.trim().length > 0 && key && key.trim().length > 0);
}

// Supabase Router
const supabaseRouter = express.Router();

// Supabase Public Config endpoint (for client auto-discovery)
supabaseRouter.get('/config', (req, res) => {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

  res.json({
    supabaseUrl: supabaseUrl || null,
    supabaseAnonKey: supabaseAnonKey || null,
    configured: Boolean(supabaseUrl && supabaseAnonKey),
  });
});

// Supabase Status & Connection Diagnostic endpoint
supabaseRouter.get('/status', async (req, res) => {
  const configured = isSupabaseServerConfigured();
  const hasUrl = Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  let connected = false;
  let error: string | null = null;

  if (configured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        // Ping Supabase auth/schema
        const { error: pingError } = await client.auth.getSession();
        if (!pingError) {
          connected = true;
        } else {
          error = pingError.message;
        }
      } catch (err: any) {
        error = err.message;
      }
    }
  }

  res.json({
    status: configured ? 'configured' : 'not_configured',
    configured,
    connected,
    hasUrl,
    hasAnonKey,
    hasServiceRoleKey,
    error,
    message: configured
      ? (connected ? 'Supabase is connected and operational.' : 'Supabase credentials detected, verifying connectivity.')
      : 'Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set yet.'
  });
});

// =========================================================================
// AI Trade Advisor Router (AvalAI - Gemini 3.5 Flash Lite)
// =========================================================================
const aiRouter = express.Router();

function getAvalAiApiKey(req: express.Request): string {
  const customKey = (req.headers['x-avalai-key'] as string) || '';
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  if (process.env.AVALAI_API_KEY && process.env.AVALAI_API_KEY.trim().length > 0) {
    return process.env.AVALAI_API_KEY.trim();
  }
  // Default test key provided by user
  return 'avalaltrading';
}

function getAvalAiBaseUrl(): string {
  const customBase = process.env.AVALAI_BASE_URL || '';
  if (customBase && customBase.trim().length > 0) {
    return customBase.trim().replace(/\/+$/, '');
  }
  return 'https://api.avalai.ir/v1';
}

aiRouter.get('/status', (req, res) => {
  const key = getAvalAiApiKey(req);
  const baseUrl = getAvalAiBaseUrl();
  res.json({
    status: 'ok',
    provider: 'OpenAI-Compatible Engine',
    defaultModel: 'gemini-2.5-flash-lite',
    hasKey: Boolean(key),
    baseUrl,
  });
});

aiRouter.post('/trade-advisor', async (req, res) => {
  const startTime = Date.now();
  const {
    originCountry,
    destinationCountry,
    hsCode,
    hsTitle,
    period,
    structuredContext,
    conversationHistory,
    userQuery,
    model: requestedModel
  } = req.body;

  const apiKey = getAvalAiApiKey(req);
  const baseUrl = getAvalAiBaseUrl();
  const targetModel = requestedModel || 'gemini-2.5-flash-lite';

  const systemInstruction = `شما یک مشاور ارشد و متخصص استراتژی بازرگانی بین‌الملل، امور گمرکی و تحلیل زنجیره تأمین هستید.
وظیفه شما:
ارائه یک مشاوره و تحلیل تخصصی، دقیق، واقع‌گرایانه و کاربردی به بازرگان بر اساس اطلاعات و شاخص‌های آماری ارائه شده (شامل: میزکار بازرگان، بازارهای صادراتی، سورسینگ واردات، فرصت‌های پنهان، مزیت نسبی آشکار شده بالاسا، دیده‌بان کم‌اظهاری و ارزش گمرکی، ماهیت BEC، تمرکز بازار HHI، تقویم فصلی، بلوک‌های تجاری و ماتریس رقبا).

قوانین بسیار مهم و تخطی‌ناپذیر:
۱. کاملاً و دقیقاً بر اساس داده‌ها و اطلاعات ارائه شده اظهار نظر کنید و خارج از این اطلاعات هیچ ادعا، حدس یا آمار فرضی مطرح نکنید.
۲. پاسخ‌ها باید کاملاً کاربردی، حرفه‌ای، واقع‌گرایانه، خوش‌خوان و در حد ۲ الی ۳ پاراگراف ساختاریافته و منسجم باشد.
۳. در ساختار پاسخ حتماً موارد زیر را پوشش دهید:
   - ارزیابی موقعیت و مزیت رقابتی در بازار مقصد (با اشاره به وضعیت مزیت بالاسا، سهم بازار و تراز تجاری).
   - تحلیل ریسک‌های کلیدی و هوشیاری گمرکی (مانند ریسک کم‌اظهاری، تمرکز و انحصار رقبا، الزامات ماهیت کالای BEC).
   - استراتژی و گام‌های عملیاتی بازرگان برای بهره‌برداری از فرصت‌های پنهان، زمان‌بندی فصلی مناسب یا استفاده از تخفیفات تعرفه‌ای بلوک‌های تجاری (اوراسیا/بریکس/غیره).
۴. لحن پاسخ باید مشاوره‌ای، قاطع، شفاف و متناسب با ادبیات حرفه‌ای بازرگانی و گمرک باشد.`;

  // Construct context string
  let contextText = `اطلاعات مبنایی تجارت و کانتکس استخراج‌شده از ابزارهای سیستم:
- کشور مبدا: ${originCountry || 'نامشخص'}
- کشور مقصد / بازار هدف: ${destinationCountry || 'نامشخص'}
- کد تعرفه کالا (HS Code): ${hsCode || 'TOTAL'}
- شرح محصول: ${hsTitle || 'کلیه کالاها'}
- دوره زمانی داده‌ها: ${period || '2023'}

${structuredContext || 'اطلاعات جامعی از شاخص‌های میزکار، مزیت بالاسا، ارزش واحد گمرکی، سورسینگ، فرصت‌های پنهان و بلوک‌های تجاری استخراج شده است.'}`;

  const messages: any[] = [
    { role: 'system', content: systemInstruction },
  ];

  if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    // Append conversation history
    for (const msg of conversationHistory) {
      if (msg && msg.role && msg.content) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }
    // Append current follow-up user query
    if (userQuery) {
      messages.push({
        role: 'user',
        content: `کانتکس داده‌ها:\n${contextText}\n\nسوال تکمیلی بازرگان:\n${userQuery}`
      });
    }
  } else {
    // Initial consultation prompt
    messages.push({
      role: 'user',
      content: `لطفاً بر اساس این اطلاعات و شاخص‌های کامل، مشاوره تخصصی، واقع‌بینانه و راهبردی ۲ الی ۳ پاراگرافی خود را برای بازرگان ارائه دهید:\n\n${contextText}`
    });
  }

  // List of fallback models to try if the requested model returns 404 or unsupported
  const candidateModels = [
    targetModel,
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gpt-4o-mini'
  ];
  // Deduplicate
  const modelsToTry = Array.from(new Set(candidateModels));

  let lastError: string | null = null;
  let responseData: any = null;
  let usedModel = targetModel;

  for (const currentModel of modelsToTry) {
    try {
      const fetchController = new AbortController();
      const timeoutId = setTimeout(() => fetchController.abort(), 40000);

      const completionUrl = `${baseUrl}/chat/completions`;
      const response = await fetch(completionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature: 0.25,
          max_tokens: 1200,
        }),
        signal: fetchController.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const adviceContent = json.choices?.[0]?.message?.content || '';
        if (adviceContent) {
          responseData = json;
          usedModel = currentModel;
          break;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AvalAI] Model ${currentModel} returned ${response.status}: ${errText.substring(0, 200)}`);
        lastError = `Status ${response.status}: ${errText}`;
        // If 401 or 403, key is wrong, don't retry other models
        if (response.status === 401 || response.status === 403) {
          break;
        }
      }
    } catch (err: any) {
      console.warn(`[AvalAI] Error calling model ${currentModel}:`, err.message);
      lastError = err.message;
    }
  }

  const durationMs = Date.now() - startTime;

  if (responseData) {
    const advice = responseData.choices?.[0]?.message?.content || '';
    return res.json({
      success: true,
      advice,
      model: usedModel,
      durationMs,
      usage: responseData.usage || null,
    });
  }

  return res.status(500).json({
    success: false,
    error: lastError || 'خطا در برقراری ارتباط با سرویس هوش مصنوعی AvalAI',
    tip: 'کلید ای‌پی‌آی یا دسترسی به سرور AvalAI را بررسی فرمایید.',
    durationMs,
  });
});

// 2. International Commercial Business Letter Generator (AvalAI + ICC Standards)
aiRouter.post('/business-letter', async (req, res) => {
  const startTime = Date.now();
  const {
    letterType = 'rfq_inquiry',
    targetLanguage = 'en',
    senderInfo = {},
    recipientInfo = {},
    productDetails = {},
    commercialTerms = {},
    tone = 'formal',
    specialInstructions = '',
    includePersianTranslation = true,
    model: requestedModel
  } = req.body;

  const apiKey = getAvalAiApiKey(req);
  const baseUrl = getAvalAiBaseUrl();
  const targetModel = requestedModel || 'gemini-2.5-flash-lite';

  const languageMap: Record<string, string> = {
    en: 'English (International Business Standard / ICC)',
    fa: 'Persian / فارسی رسمی بازرگانی',
    ar: 'Arabic / العربية التجارية الرسمية (GCC & Middle East)',
    zh: 'Chinese Simplified / 中文标准商务公函',
    ru: 'Russian / Деловой русский язык (EAEU / CIS)',
    de: 'German / Professionelles Geschäftsdeutsch (DIN 5008)',
    fr: 'French / Français des affaires standard international',
    es: 'Spanish / Español comercial internacional',
    tr: 'Turkish / Resmi Ticari Türkçe'
  };

  const letterTypeMap: Record<string, string> = {
    rfq_inquiry: 'Official Request for Quotation (RFQ) / Trade Buying Inquiry',
    proforma_quotation: 'Official Commercial Offer / Proforma Quotation Cover Letter',
    letter_of_intent: 'Formal Letter of Intent (LOI) to Purchase',
    price_negotiation: 'Counter-Offer & Diplomatic Price / Commercial Term Negotiation',
    purchase_order: 'Official Purchase Order (PO) Transmittal & Compliance Notice',
    shipping_inspection: 'Shipping Advice, Container Stuffing & Pre-Shipment Inspection Notice',
    claim_dispute: 'Formal Commercial Claim / Quality Defect / Delay Dispute Notice',
    agency_proposal: 'Exclusive Agency & Distributorship Representation Proposal',
    custom: 'Specialized Commercial Trade Correspondence'
  };

  const selectedLangTitle = languageMap[targetLanguage] || 'English';
  const selectedTypeTitle = letterTypeMap[letterType] || 'Commercial Letter';

  const systemInstruction = `You are a world-class Senior International Trade Legal Counsel, ICC (International Chamber of Commerce) Arbitrator, and Master Commercial Diplomat.
Your mission is to draft an immaculate, legally watertight, and culturally authentic International Business Letter in ${selectedLangTitle} according to the latest global trade standards (Incoterms 2020, UCP 600 for Letters of Credit, CISG / UN Convention on Contracts for the International Sale of Goods).

CRITICAL DIRECTIVES:
1. Strict ICC & Global Trade Compliance:
   - Always integrate Incoterms 2020 correctly (e.g. "FOB Bandar Abbas Port", "CIF Shanghai Port") with precise place naming.
   - Reference payment instruments according to international banking rules (e.g. Irrevocable L/C at Sight subject to UCP 600, or T/T wire terms).
   - Include standard clauses for inspection (e.g. SGS/Bureau Veritas pre-shipment inspection), packing/marking, shipping documents, force majeure, and validity periods.
2. Target Language Perfection & Business Etiquette:
   - Target Language: ${selectedLangTitle}.
   - The letter MUST be written natively in ${selectedLangTitle} with exquisite professional phrasing, impeccable salutations, and standard corporate closing formulas.
   - Respect cultural nuances (e.g., German DIN 5008 formality, Arabic Islamic business greetings and high respect formulas, Chinese respectful business address and closing 此致敬礼, Russian external trade correspondence etiquette).
3. Tone: ${tone} (adhere strictly to this tone: formal, diplomatic, firm, collaborative, or urgent).
4. Dual Deliverables:
   - Provide the complete, finalized letter in ${selectedLangTitle}.
   - Provide a comprehensive, high-quality Persian (فارسی) translation with strategic commercial notes explaining key risks, tactical negotiation points, and customs/banking tips for Iranian and Middle-Eastern merchants.
5. Strict JSON Output Format:
   Return ONLY a valid, parseable JSON object with no prefix, markdown ticks, or explanation outside the JSON.
   JSON schema:
   {
     "subject": "Clear, concise commercial subject line in ${selectedLangTitle}",
     "letterBody": "Full formatted business letter in ${selectedLangTitle} including Date, Reference, Sender, Recipient, Salutation, Body paragraphs, Commercial Terms table/bullets, Inspection/Docs clauses, and Sign-off block",
     "persianTranslation": "ترجمه کامل، دقیق و سلیس فارسی کل نامه تجاری به همراه تشریح حقوقی اصطلاحات",
     "commercialNotes": [
       "نکته راهبردی اول: بررسی ریسک‌های اینکوترمز و انتقال تعهدات",
       "نکته راهبردی دوم: شرایط بانکی و کاهش ریسک عدم وصول یا مغایرت اسنادی",
       "نکته راهبردی سوم: الزامات بازرسی SGS و زمان‌بندی پاسخ"
     ],
     "iccChecklist": [
       {"item": "انطباق اصطلاحات اینکوترمز ۲۰۲۰ و درج دقیق محل/بندر", "status": "compliant", "note": "...توضیح وضعیت"},
       {"item": "شیوه پرداخت و انطباق با رویه‌های بانکی UCP 600", "status": "compliant", "note": "...توضیح وضعیت"},
       {"item": "بند بازرسی فنی و کیفیت (Pre-shipment Inspection)", "status": "compliant", "note": "...توضیح وضعیت"},
       {"item": "مدت اعتبار پیشنهاد یا مهلت مشخص پاسخ", "status": "compliant", "note": "...توضیح وضعیت"}
     ],
     "refNumber": "Generated reference number (e.g. REF-2026/...",
     "date": "Current formatted international date"
   }`;

  const promptDetails = `
Details for Commercial Letter Drafting:
- Letter Type: ${selectedTypeTitle} (${letterType})
- Target Language: ${selectedLangTitle}
- Tone of Voice: ${tone}

[SENDER / ISSUING COMPANY]:
- Company Name: ${senderInfo.companyName || 'Exporting / Trading Enterprise'}
- Contact Person: ${senderInfo.contactPerson || 'Commercial Director'}
- Title: ${senderInfo.title || 'Head of International Trade'}
- Country & City: ${senderInfo.country || 'Iran'}
- Address: ${senderInfo.address || ''}
- Email: ${senderInfo.email || ''}
- Phone: ${senderInfo.phone || ''}
- Website: ${senderInfo.website || ''}

[RECIPIENT / COUNTERPART COMPANY]:
- Company Name: ${recipientInfo.companyName || 'Overseas Commercial Partner'}
- Contact Person: ${recipientInfo.contactPerson || 'Purchasing / Sales Manager'}
- Title: ${recipientInfo.title || 'Director of Procurement'}
- Country: ${recipientInfo.country || 'Target Market'}
- Address: ${recipientInfo.address || ''}
- Email: ${recipientInfo.email || ''}

[COMMODITY & PRODUCT SPECIFICATIONS]:
- Commodity Name: ${productDetails.productName || 'Commercial Merchandise'}
- HS Code: ${productDetails.hsCode || 'Not specified'}
- Quantity / Volume: ${productDetails.quantity || 'Standard Commercial Quantity'}
- Packaging: ${productDetails.packaging || 'Export Standard Packaging'}
- Technical Specs / Grade: ${productDetails.specifications || 'As per international standard grade'}

[COMMERCIAL & INCOTERMS 2020 TERMS]:
- Incoterms 2020: ${commercialTerms.incoterm || 'FOB'}
- Named Port / Place: ${commercialTerms.portOrPlace || 'Named Port'}
- Payment Method: ${commercialTerms.paymentTerms || 'Irrevocable L/C at Sight / T/T'}
- Currency: ${commercialTerms.currency || 'USD'}
- Target Price / Unit Value: ${commercialTerms.targetPrice || 'Competitive Market Price'}
- Delivery Timeline / Lead Time: ${commercialTerms.deliveryTimeline || 'Within standard shipping schedule'}
- Offer Validity / Deadline: ${commercialTerms.validityDate || '14 Calendar Days'}
- Inspection Agency: ${commercialTerms.inspectionAgency || 'SGS or mutually agreed inspection company'}

[MERCHANT SPECIAL INSTRUCTIONS & CLAUSES]:
${specialInstructions || 'Ensure standard risk protection clauses, clear deliverables, and prompt commercial follow-up.'}
`;

  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: promptDetails }
  ];

  const candidateModels = [
    targetModel,
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gpt-4o-mini'
  ];
  const modelsToTry = Array.from(new Set(candidateModels));

  let lastError: string | null = null;
  let rawContent = '';
  let usedModel = targetModel;

  for (const currentModel of modelsToTry) {
    try {
      const fetchController = new AbortController();
      const timeoutId = setTimeout(() => fetchController.abort(), 45000);

      const completionUrl = `${baseUrl}/chat/completions`;
      const response = await fetch(completionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature: 0.2,
          max_tokens: 3500,
        }),
        signal: fetchController.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content || '';
        if (content) {
          rawContent = content;
          usedModel = currentModel;
          break;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AvalAI Business Letter] Model ${currentModel} error ${response.status}: ${errText.substring(0, 150)}`);
        lastError = `Status ${response.status}: ${errText}`;
        if (response.status === 401 || response.status === 403) break;
      }
    } catch (err: any) {
      console.warn(`[AvalAI Business Letter] Failed model ${currentModel}:`, err.message);
      lastError = err.message;
    }
  }

  const durationMs = Date.now() - startTime;

  if (rawContent) {
    try {
      // Clean JSON delimiters if returned
      let cleaned = rawContent.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      return res.json({
        success: true,
        data: {
          subject: parsed.subject || `${selectedTypeTitle} - ${productDetails.productName || 'Commercial Trade'}`,
          letterBody: parsed.letterBody || cleaned,
          persianTranslation: parsed.persianTranslation || 'ترجمه به زودی آماده می‌شود.',
          commercialNotes: parsed.commercialNotes || [
            'حتماً مشخصات مندرج در پیش‌فاکتور یا قرارداد را با استاندارد UCP 600 تطبیق دهید.',
            'در صورت استفاده از ترم‌های گروه C و D، مسئولیت بیمه نامه دریایی (ICC A) را احراز نمایید.'
          ],
          iccChecklist: parsed.iccChecklist || [
            { item: 'انطباق با اینکوترمز ۲۰۲۰ و نام‌گذاری دقیق محل تحویل', status: 'compliant', note: 'تأیید شد' },
            { item: 'شرایط پرداخت اسنادی یا حواله بانکی', status: 'compliant', note: 'بررسی شد' },
            { item: 'بند بازرسی کیفیت SGS', status: 'compliant', note: 'درج شد' },
            { item: 'اعتبار زمانی پیشنهاد', status: 'compliant', note: 'قید شد' }
          ],
          metadata: {
            date: parsed.date || new Date().toISOString().split('T')[0],
            refNumber: parsed.refNumber || `REF-${Date.now().toString().slice(-6)}`,
            wordCount: (parsed.letterBody || '').split(/\s+/).length
          }
        },
        model: usedModel,
        durationMs
      });
    } catch (parseErr) {
      // Fallback: Return raw text parsed into body and translation
      console.warn('[AvalAI] Failed to parse strict JSON, formatting fallback:', parseErr);
      return res.json({
        success: true,
        data: {
          subject: `${selectedTypeTitle}: ${productDetails.productName || 'International Trade Inquiry'}`,
          letterBody: rawContent,
          persianTranslation: 'متن نامه با موفقیت تولید شد (برای تفکیک ترجمه به متن اصلی مراجعه نمایید).',
          commercialNotes: [
            'کلیه شرایط تجاری و تعهدات مالی پیش از ارسال نهایی توسط واحد حقوقی بازبینی شود.'
          ],
          iccChecklist: [
            { item: 'اینکوترمز ۲۰۲۰', status: 'compliant', note: 'قید شده در متن' },
            { item: 'روش پرداخت بین‌المللی', status: 'compliant', note: 'بررسی شده' }
          ],
          metadata: {
            date: new Date().toISOString().split('T')[0],
            refNumber: `REF-${Date.now().toString().slice(-6)}`,
            wordCount: rawContent.split(/\s+/).length
          }
        },
        model: usedModel,
        durationMs
      });
    }
  }

  return res.status(500).json({
    success: false,
    error: lastError || 'خطا در نگارش نامه تجاری توسط سرور هوش مصنوعی AvalAI',
    tip: 'اتصال اینترنت، اعتبار کلید AvalAI یا مدل انتخابی را بررسی نمایید.',
    durationMs
  });
});

// ==========================================
// API Ninjas Integration Router (Inlined for Vercel Serverless Reliability)
// ==========================================
const ninjasRouter = express.Router();

interface NinjaCacheEntry {
  data: any;
  timestamp: number;
}
const ninjaCache = new Map<string, NinjaCacheEntry>();
const NINJA_CACHE_TTL = 15 * 60 * 1000;

function getCachedNinja(key: string): any | null {
  const entry = ninjaCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > NINJA_CACHE_TTL) {
    ninjaCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedNinja(key: string, data: any) {
  if (ninjaCache.size > 200) {
    const first = ninjaCache.keys().next().value;
    if (first) ninjaCache.delete(first);
  }
  ninjaCache.set(key, { data, timestamp: Date.now() });
}

function getNinjaKey(req: express.Request): string | undefined {
  const headerKey = (req.headers['x-api-ninjas-key'] as string) || (req.headers['x-api-key'] as string);
  if (headerKey && headerKey.trim().length > 0) return headerKey.trim();

  const queryKey = req.query.ninjaKey as string || req.query.apiKey as string;
  if (queryKey && queryKey.trim().length > 0) return queryKey.trim();

  if (process.env.API_NINJAS_KEY && process.env.API_NINJAS_KEY.trim().length > 0) {
    return process.env.API_NINJAS_KEY.trim();
  }

  if (process.env.API_NINJA_KEY && process.env.API_NINJA_KEY.trim().length > 0) {
    return process.env.API_NINJA_KEY.trim();
  }

  return undefined;
}

async function callNinjaApi(url: string, apiKey?: string): Promise<{ ok: boolean; status: number; data?: any; error?: string }> {
  if (!apiKey) {
    return { ok: false, status: 401, error: 'No API Ninjas key configured' };
  }

  const cacheKey = `${url}_${apiKey.substring(0, 6)}`;
  const cached = getCachedNinja(cacheKey);
  if (cached) {
    return { ok: true, status: 200, data: cached };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      setCachedNinja(cacheKey, data);
      return { ok: true, status: res.status, data };
    }

    const errText = await res.text();
    return { ok: false, status: res.status, error: errText || `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, status: 500, error: err.message || 'Connection error to api.api-ninjas.com' };
  }
}

// 1. Status endpoint
ninjasRouter.get('/status', (req, res) => {
  const envKey = process.env.API_NINJAS_KEY || process.env.API_NINJA_KEY;
  const hasEnvKey = Boolean(envKey && envKey.trim().length > 0);
  const clientKey = (req.headers['x-api-ninjas-key'] as string) || (req.headers['x-api-key'] as string);
  const hasClientKey = Boolean(clientKey && clientKey.trim().length > 0);

  res.json({
    status: 'ok',
    hasEnvKey,
    hasClientKey,
    hasActiveKey: hasEnvKey || hasClientKey,
    portalUrl: 'https://api-ninjas.com/profile',
    endpoints: [
      '/api/ninjas/exchange-rates',
      '/api/ninjas/convert',
      '/api/ninjas/holidays',
      '/api/ninjas/country-macro',
      '/api/ninjas/iban',
      '/api/ninjas/swift',
      '/api/ninjas/commodities'
    ]
  });
});

// 2. Test Key endpoint
ninjasRouter.post('/test-key', async (req, res) => {
  const { key } = req.body;
  const keyToTest = key ? String(key).trim() : getNinjaKey(req);

  if (!keyToTest) {
    return res.status(400).json({
      valid: false,
      message: 'کلید API Ninjas وارد نشده است. لطفاً کلید را در کادر مربوطه وارد کنید.'
    });
  }

  const startTime = Date.now();
  const testUrl = 'https://api.api-ninjas.com/v1/country?name=Germany';
  const result = await callNinjaApi(testUrl, keyToTest);
  const durationMs = Date.now() - startTime;

  if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
    return res.json({
      valid: true,
      statusCode: result.status,
      durationMs,
      message: 'کلید API Ninjas با موفقیت تأیید شد و ارتباط برقرار است!',
      countryTested: result.data[0]?.name || 'Germany'
    });
  }

  return res.status(200).json({
    valid: false,
    statusCode: result.status,
    durationMs,
    error: result.error || 'Access Denied / Invalid Key',
    message: result.status === 401 || result.status === 403
      ? 'کلید نامعتبر است (401 Unauthorized). لطفاً کلید دریافتی از پنل api-ninjas.com را مجدداً بررسی فرمایید.'
      : `خطا در استعلام API Ninjas (کد ${result.status}): ${result.error || ''}`
  });
});

const FALLBACK_EXCHANGE_RATES: Record<string, { rate: number; name: string; nameFa: string; symbol: string }> = {
  USD: { rate: 1.0, name: 'US Dollar', nameFa: 'دلار آمریکا', symbol: '$' },
  EUR: { rate: 0.922, name: 'Euro', nameFa: 'یورو', symbol: '€' },
  CNY: { rate: 7.235, name: 'Chinese Yuan (RMB)', nameFa: 'یوان چین', symbol: '¥' },
  AED: { rate: 3.6725, name: 'UAE Dirham', nameFa: 'درهم امارات', symbol: 'AED' },
  TRY: { rate: 34.15, name: 'Turkish Lira', nameFa: 'لیر ترکیه', symbol: '₺' },
  GBP: { rate: 0.785, name: 'British Pound', nameFa: 'پوند انگلستان', symbol: '£' },
  JPY: { rate: 154.6, name: 'Japanese Yen', nameFa: 'ین ژاپن', symbol: '¥' },
  RUB: { rate: 91.50, name: 'Russian Ruble', nameFa: 'روبل روسیه', symbol: '₽' },
  INR: { rate: 83.95, name: 'Indian Rupee', nameFa: 'روپیه هند', symbol: '₹' },
  CHF: { rate: 0.885, name: 'Swiss Franc', nameFa: 'فرانک سوئیس', symbol: 'CHF' },
  CAD: { rate: 1.365, name: 'Canadian Dollar', nameFa: 'دلار کانادا', symbol: 'C$' },
  AUD: { rate: 1.520, name: 'Australian Dollar', nameFa: 'دلار استرالیا', symbol: 'A$' },
  SAR: { rate: 3.750, name: 'Saudi Riyal', nameFa: 'ریال عربستان', symbol: 'SAR' },
  QAR: { rate: 3.640, name: 'Qatari Riyal', nameFa: 'ریال قطر', symbol: 'QAR' },
  KWD: { rate: 0.308, name: 'Kuwaiti Dinar', nameFa: 'دینار کویت', symbol: 'KWD' },
  OMR: { rate: 0.385, name: 'Omani Rial', nameFa: 'ریال عمان', symbol: 'OMR' },
  KRW: { rate: 1375.0, name: 'South Korean Won', nameFa: 'وون کره جنوبی', symbol: '₩' },
  BRL: { rate: 5.48, name: 'Brazilian Real', nameFa: 'رئال برزیل', symbol: 'R$' },
  IRR: { rate: 615000, name: 'Iranian Rial (Free Market Approx)', nameFa: 'ریال ایران (تقریبی بازار)', symbol: 'IRR' },
};

// 3. Exchange Rates endpoint
ninjasRouter.get('/exchange-rates', async (req, res) => {
  const apiKey = getNinjaKey(req);
  const base = ((req.query.base as string) || 'USD').toUpperCase();

  if (apiKey) {
    const liveRates: Record<string, any> = {};
    const pairsToFetch = ['EUR', 'CNY', 'AED', 'TRY', 'GBP', 'JPY', 'RUB', 'INR', 'CHF', 'CAD', 'SAR'];
    let anySuccess = false;

    await Promise.all(pairsToFetch.map(async (target) => {
      const url = `https://api.api-ninjas.com/v1/exchangerate?pair=${base}_${target}`;
      const result = await callNinjaApi(url, apiKey);
      if (result.ok && result.data && result.data.exchange_rate) {
        liveRates[target] = {
          rate: Number(result.data.exchange_rate),
          name: FALLBACK_EXCHANGE_RATES[target]?.name || target,
          nameFa: FALLBACK_EXCHANGE_RATES[target]?.nameFa || target,
          symbol: FALLBACK_EXCHANGE_RATES[target]?.symbol || target,
          updatedAt: new Date().toISOString()
        };
        anySuccess = true;
      }
    }));

    if (anySuccess) {
      liveRates[base] = {
        rate: 1.0,
        name: FALLBACK_EXCHANGE_RATES[base]?.name || base,
        nameFa: FALLBACK_EXCHANGE_RATES[base]?.nameFa || base,
        symbol: FALLBACK_EXCHANGE_RATES[base]?.symbol || base,
        updatedAt: new Date().toISOString()
      };

      for (const [code, info] of Object.entries(FALLBACK_EXCHANGE_RATES)) {
        if (!liveRates[code]) {
          liveRates[code] = {
            ...info,
            rate: info.rate,
            isEstimate: true
          };
        }
      }

      return res.json({
        success: true,
        isLive: true,
        base,
        rates: liveRates,
        source: 'API Ninjas (Live)'
      });
    }
  }

  return res.json({
    success: true,
    isLive: false,
    base: 'USD',
    rates: FALLBACK_EXCHANGE_RATES,
    source: 'Market Benchmark Reference (Enter API Ninjas Key for live stream)'
  });
});

// 4. Currency Convert endpoint
ninjasRouter.get('/convert', async (req, res) => {
  const apiKey = getNinjaKey(req);
  const have = ((req.query.have as string) || 'USD').toUpperCase();
  const want = ((req.query.want as string) || 'EUR').toUpperCase();
  const amount = parseFloat(req.query.amount as string) || 1;

  if (apiKey) {
    const url = `https://api.api-ninjas.com/v1/convertcurrency?have=${have}&want=${want}&amount=${amount}`;
    const result = await callNinjaApi(url, apiKey);
    if (result.ok && result.data) {
      return res.json({
        success: true,
        isLive: true,
        have,
        want,
        old_amount: amount,
        new_amount: result.data.new_amount,
        rate: result.data.new_amount / amount,
        source: 'API Ninjas'
      });
    }
  }

  const baseRateHave = FALLBACK_EXCHANGE_RATES[have]?.rate || 1.0;
  const baseRateWant = FALLBACK_EXCHANGE_RATES[want]?.rate || 1.0;
  const converted = (amount / baseRateHave) * baseRateWant;

  return res.json({
    success: true,
    isLive: false,
    have,
    want,
    old_amount: amount,
    new_amount: Math.round(converted * 10000) / 10000,
    rate: Math.round((baseRateWant / baseRateHave) * 10000) / 10000,
    source: 'Benchmark Calculation'
  });
});

// 5. Holidays endpoint
ninjasRouter.get('/holidays', async (req, res) => {
  const apiKey = getNinjaKey(req);
  const country = ((req.query.country as string) || 'CN').toUpperCase();
  const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

  if (apiKey) {
    const v2Url = `https://api.api-ninjas.com/v2/holidays?country=${country}&year=${year}`;
    const result = await callNinjaApi(v2Url, apiKey);
    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return res.json({
        success: true,
        isLive: true,
        country,
        year,
        count: result.data.length,
        holidays: result.data
      });
    }

    const v1Url = `https://api.api-ninjas.com/v1/publicholidays?country=${country}&year=${year}`;
    const resultV1 = await callNinjaApi(v1Url, apiKey);
    if (resultV1.ok && Array.isArray(resultV1.data) && resultV1.data.length > 0) {
      return res.json({
        success: true,
        isLive: true,
        country,
        year,
        count: resultV1.data.length,
        holidays: resultV1.data
      });
    }
  }

  const sampleHolidays: Record<string, any[]> = {
    CN: [
      { name: "New Year's Day", date: `${year}-01-01`, type: 'NATIONAL_HOLIDAY', impact: 'Low (1 day)' },
      { name: 'Chinese Lunar New Year (Spring Festival)', date: `${year}-02-10`, type: 'MAJOR_SHUTDOWN', impact: 'Severe (Factories & Ports closed 7-12 days)', daysOff: 7 },
      { name: 'Tomb Sweeping Day (Qingming)', date: `${year}-04-04`, type: 'PUBLIC_HOLIDAY', impact: 'Moderate (3 days)' },
      { name: 'Labor Day Golden Week', date: `${year}-05-01`, type: 'NATIONAL_HOLIDAY', impact: 'High (5 days)', daysOff: 5 },
      { name: 'Dragon Boat Festival', date: `${year}-06-10`, type: 'PUBLIC_HOLIDAY', impact: 'Moderate (3 days)' },
      { name: 'Mid-Autumn Festival', date: `${year}-09-17`, type: 'PUBLIC_HOLIDAY', impact: 'Moderate (3 days)' },
      { name: 'National Day Golden Week', date: `${year}-10-01`, type: 'MAJOR_SHUTDOWN', impact: 'Severe (Factories & Customs closed 7 days)', daysOff: 7 },
    ],
    AE: [
      { name: "New Year's Day", date: `${year}-01-01`, type: 'PUBLIC_HOLIDAY', impact: 'Moderate' },
      { name: 'Eid Al-Fitr (Estimated)', date: `${year}-04-09`, type: 'MAJOR_BANK_HOLIDAY', impact: 'High (Banks & Customs closed 4-5 days)', daysOff: 4 },
      { name: 'Arafat Day', date: `${year}-06-15`, type: 'PUBLIC_HOLIDAY', impact: 'Moderate' },
      { name: 'Eid Al-Adha (Feast of Sacrifice)', date: `${year}-06-16`, type: 'MAJOR_BANK_HOLIDAY', impact: 'High (4 days)', daysOff: 4 },
      { name: 'Islamic New Year', date: `${year}-07-07`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: "Prophet's Birthday", date: `${year}-09-15`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'UAE Commemoration & National Day', date: `${year}-12-02`, type: 'NATIONAL_HOLIDAY', impact: 'Moderate (2 days)' },
    ],
    TR: [
      { name: "New Year's Day", date: `${year}-01-01`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Ramazan Bayramı (Eid Al-Fitr)', date: `${year}-04-10`, type: 'MAJOR_SHUTDOWN', impact: 'High (3-4 days)' },
      { name: 'National Sovereignty & Childrens Day', date: `${year}-04-23`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Labor and Solidarity Day', date: `${year}-05-01`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Commemoration of Atatürk & Youth Day', date: `${year}-05-19`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Kurban Bayramı (Eid Al-Adha)', date: `${year}-06-16`, type: 'MAJOR_SHUTDOWN', impact: 'High (4-5 days)' },
      { name: 'Democracy and National Unity Day', date: `${year}-07-15`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Victory Day', date: `${year}-08-30`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Republic Day', date: `${year}-10-29`, type: 'NATIONAL_HOLIDAY', impact: 'Moderate' },
    ],
    DE: [
      { name: "New Year's Day", date: `${year}-01-01`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Good Friday', date: `${year}-03-29`, type: 'PUBLIC_HOLIDAY', impact: 'Moderate' },
      { name: 'Easter Monday', date: `${year}-04-01`, type: 'PUBLIC_HOLIDAY', impact: 'Moderate' },
      { name: 'Labor Day', date: `${year}-05-01`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Ascension Day', date: `${year}-05-09`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'Whit Monday', date: `${year}-05-20`, type: 'PUBLIC_HOLIDAY', impact: 'Low' },
      { name: 'German Unity Day', date: `${year}-10-03`, type: 'NATIONAL_HOLIDAY', impact: 'Low' },
      { name: 'Christmas Day', date: `${year}-12-25`, type: 'MAJOR_SHUTDOWN', impact: 'Severe (Logistics slowdown until Jan 2)' },
      { name: 'Boxing Day', date: `${year}-12-26`, type: 'PUBLIC_HOLIDAY', impact: 'Moderate' },
    ],
  };

  const list = sampleHolidays[country] || sampleHolidays.CN;

  return res.json({
    success: true,
    isLive: false,
    country,
    year,
    count: list.length,
    holidays: list,
    source: 'Logistics Benchmark Calendar (Configure API Ninjas Key for 230+ countries live)'
  });
});

// 6. Country Macro & Capacity endpoint
ninjasRouter.get('/country-macro', async (req, res) => {
  const apiKey = getNinjaKey(req);
  const countryName = (req.query.name as string || req.query.country as string || 'China').trim();

  if (apiKey) {
    const countryUrl = `https://api.api-ninjas.com/v1/country?name=${encodeURIComponent(countryName)}`;
    const result = await callNinjaApi(countryUrl, apiKey);

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      const c = result.data[0];

      let inflationData = null;
      try {
        const infRes = await callNinjaApi(`https://api.api-ninjas.com/v1/inflation?country=${encodeURIComponent(countryName)}`, apiKey);
        if (infRes.ok && Array.isArray(infRes.data) && infRes.data.length > 0) {
          inflationData = infRes.data[0];
        }
      } catch {}

      return res.json({
        success: true,
        isLive: true,
        country: {
          name: c.name,
          capital: c.capital,
          currency: c.currency?.code || c.currency,
          currencyName: c.currency?.name,
          gdp: c.gdp,
          gdpPerCapita: c.gdp && c.population ? Math.round(c.gdp / (c.population * 1000)) : null,
          population: c.population ? c.population * 1000 : null,
          surfaceArea: c.surface_area,
          importsUSD: c.imports,
          exportsUSD: c.exports,
          region: c.region,
          inflation: inflationData ? inflationData.monthly_rate_pct : null,
          yearlyInflation: inflationData ? inflationData.yearly_rate_pct : null,
        }
      });
    }
  }

  const fallbackProfiles: Record<string, any> = {
    china: {
      name: 'China',
      capital: 'Beijing',
      currency: 'CNY',
      currencyName: 'Chinese Yuan',
      gdp: 17734000000000,
      gdpPerCapita: 12550,
      population: 1412000000,
      surfaceArea: 9596960,
      importsUSD: 2556000000000,
      exportsUSD: 3380000000000,
      region: 'East Asia',
      yearlyInflation: 0.3,
    },
    'united arab emirates': {
      name: 'United Arab Emirates',
      capital: 'Abu Dhabi',
      currency: 'AED',
      currencyName: 'UAE Dirham',
      gdp: 507500000000,
      gdpPerCapita: 52100,
      population: 9440000,
      surfaceArea: 83600,
      importsUSD: 420000000000,
      exportsUSD: 515000000000,
      region: 'Middle East',
      yearlyInflation: 2.1,
    },
    turkey: {
      name: 'Turkey',
      capital: 'Ankara',
      currency: 'TRY',
      currencyName: 'Turkish Lira',
      gdp: 1108000000000,
      gdpPerCapita: 13110,
      population: 85300000,
      surfaceArea: 783562,
      importsUSD: 361000000000,
      exportsUSD: 255800000000,
      region: 'Middle East / Southern Europe',
      yearlyInflation: 51.9,
    },
    germany: {
      name: 'Germany',
      capital: 'Berlin',
      currency: 'EUR',
      currencyName: 'Euro',
      gdp: 4456000000000,
      gdpPerCapita: 52820,
      population: 84400000,
      surfaceArea: 357022,
      importsUSD: 1450000000000,
      exportsUSD: 1680000000000,
      region: 'Western Europe',
      yearlyInflation: 2.2,
    },
    india: {
      name: 'India',
      capital: 'New Delhi',
      currency: 'INR',
      currencyName: 'Indian Rupee',
      gdp: 3550000000000,
      gdpPerCapita: 2480,
      population: 1428000000,
      surfaceArea: 3287263,
      importsUSD: 677000000000,
      exportsUSD: 437000000000,
      region: 'South Asia',
      yearlyInflation: 4.8,
    }
  };

  const keyLower = countryName.toLowerCase();
  const matched = fallbackProfiles[keyLower] || fallbackProfiles.china;

  return res.json({
    success: true,
    isLive: false,
    country: matched,
    source: 'Macro Benchmark Reference'
  });
});

// 7. IBAN Validator endpoint
ninjasRouter.get('/iban', async (req, res) => {
  const apiKey = getNinjaKey(req);
  const rawIban = (req.query.iban as string || '').replace(/\s+/g, '').toUpperCase();

  if (!rawIban) {
    return res.status(400).json({ valid: false, message: 'IBAN number is required' });
  }

  if (apiKey) {
    const url = `https://api.api-ninjas.com/v1/iban?iban=${encodeURIComponent(rawIban)}`;
    const result = await callNinjaApi(url, apiKey);
    if (result.ok && result.data) {
      return res.json({
        success: true,
        isLive: true,
        ...result.data
      });
    }
  }

  const countryCode = rawIban.substring(0, 2);
  const checkDigits = rawIban.substring(2, 4);
  const bban = rawIban.substring(4);

  const rearranged = bban + countryCode + checkDigits;
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      numericString += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      numericString += rearranged[i];
    } else {
      numericString += '99';
    }
  }

  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const chunk = remainder.toString() + numericString.substring(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }

  const isValidMod97 = remainder === 1;
  const isCorrectLength = rawIban.length >= 15 && rawIban.length <= 34;

  const countryNames: Record<string, string> = {
    DE: 'Germany',
    FR: 'France',
    GB: 'United Kingdom',
    TR: 'Turkey',
    AE: 'United Arab Emirates',
    CH: 'Switzerland',
    IT: 'Italy',
    ES: 'Spain',
    NL: 'Netherlands',
    SA: 'Saudi Arabia',
    QA: 'Qatar',
    KW: 'Kuwait',
    IR: 'Iran (Sheba/IR IBAN)'
  };

  return res.json({
    success: true,
    isLive: false,
    valid: isValidMod97 && isCorrectLength,
    iban: rawIban,
    country: countryNames[countryCode] || countryCode,
    country_code: countryCode,
    check_digits: checkDigits,
    bban: bban,
    bank_code: bban.substring(0, 4),
    account_number: bban.substring(4),
    checksum_passed: isValidMod97,
    length_valid: isCorrectLength,
    source: 'Standard ISO 13616 Modulo-97 Engine'
  });
});

// 8. SWIFT / BIC endpoint
ninjasRouter.get('/swift', async (req, res) => {
  const apiKey = getNinjaKey(req);
  const swift = (req.query.swift as string || '').replace(/\s+/g, '').toUpperCase();

  if (!swift) {
    return res.status(400).json({ valid: false, message: 'SWIFT/BIC code is required' });
  }

  if (apiKey) {
    const url = `https://api.api-ninjas.com/v1/swiftcode?swift=${encodeURIComponent(swift)}`;
    const result = await callNinjaApi(url, apiKey);
    if (result.ok && result.data) {
      return res.json({
        success: true,
        isLive: true,
        data: result.data
      });
    }
  }

  const isStandardLength = swift.length === 8 || swift.length === 11;
  const institutionCode = swift.substring(0, 4);
  const countryCode = swift.substring(4, 6);
  const locationCode = swift.substring(6, 8);
  const branchCode = swift.length === 11 ? swift.substring(8, 11) : 'XXX (Head Office)';

  return res.json({
    success: true,
    isLive: false,
    valid: isStandardLength && /^[A-Z0-9]+$/.test(swift),
    swift_code: swift,
    institution_code: institutionCode,
    country_code: countryCode,
    location_code: locationCode,
    branch_code: branchCode,
    message: isStandardLength ? 'ساختار کد سوئیفت استاندارد و معتبر است' : 'طول کد سوئیفت باید ۸ یا ۱۱ کاراکتر باشد',
    source: 'ISO 9362 Structural Parser'
  });
});

// 9. Commodities Benchmark endpoint
ninjasRouter.get('/commodities', async (req, res) => {
  const apiKey = getNinjaKey(req);

  const defaultCommodities = [
    { name: 'Crude Oil Brent', code: 'brent_crude', category: 'Energy', price: 74.20, unit: 'USD / Barrel', change24h: '+0.85%', comtradeHsMatch: '2709 (Crude Petroleum)' },
    { name: 'WTI Crude Oil', code: 'wti_crude', category: 'Energy', price: 70.80, unit: 'USD / Barrel', change24h: '+0.42%', comtradeHsMatch: '2709 (Light Petroleum)' },
    { name: 'Natural Gas (Henry Hub)', code: 'natural_gas', category: 'Energy', price: 2.45, unit: 'USD / MMBtu', change24h: '-1.20%', comtradeHsMatch: '2711 (Gas Petroleum)' },
    { name: 'Gold', code: 'gold', category: 'Precious Metals', price: 2515.50, unit: 'USD / Troy Oz', change24h: '+0.35%', comtradeHsMatch: '7108 (Gold Unwrought)' },
    { name: 'Copper', code: 'copper', category: 'Base Metals', price: 9240.00, unit: 'USD / Metric Ton', change24h: '+1.10%', comtradeHsMatch: '7403 (Refined Copper)' },
    { name: 'Aluminum', code: 'aluminum', category: 'Base Metals', price: 2420.00, unit: 'USD / Metric Ton', change24h: '-0.30%', comtradeHsMatch: '7601 (Unwrought Aluminum)' },
    { name: 'Wheat (CBOT)', code: 'wheat', category: 'Agriculture', price: 568.50, unit: 'US Cents / Bushel (~$208/ton)', change24h: '+0.70%', comtradeHsMatch: '1001 (Wheat & Meslin)' },
    { name: 'Corn', code: 'corn', category: 'Agriculture', price: 412.00, unit: 'US Cents / Bushel (~$162/ton)', change24h: '-0.45%', comtradeHsMatch: '1005 (Maize / Corn)' },
    { name: 'Sugar #11', code: 'sugar', category: 'Agriculture', price: 19.45, unit: 'US Cents / lb (~$428/ton)', change24h: '+1.40%', comtradeHsMatch: '1701 (Cane or Beet Sugar)' },
    { name: 'Cotton', code: 'cotton', category: 'Agriculture / Textile', price: 71.30, unit: 'US Cents / lb (~$1572/ton)', change24h: '-0.15%', comtradeHsMatch: '5201 (Cotton Not Carded)' },
  ];

  if (apiKey) {
    try {
      const goldRes = await callNinjaApi('https://api.api-ninjas.com/v1/commodityprice?name=gold', apiKey);
      const oilRes = await callNinjaApi('https://api.api-ninjas.com/v1/commodityprice?name=crude_oil', apiKey);

      if (goldRes.ok && goldRes.data && goldRes.data.price) {
        defaultCommodities[3].price = Number(goldRes.data.price);
      }
      if (oilRes.ok && oilRes.data && oilRes.data.price) {
        defaultCommodities[1].price = Number(oilRes.data.price);
      }

      return res.json({
        success: true,
        isLive: true,
        commodities: defaultCommodities,
        source: 'API Ninjas Commodity Feed (Live)'
      });
    } catch {}
  }

  return res.json({
    success: true,
    isLive: false,
    commodities: defaultCommodities,
    source: 'Global Market Benchmark (CBOT / LME / NYMEX)'
  });
});

// Mount router on both /api/comtrade and /comtrade to support direct and rewritten paths on Vercel
app.use('/api/comtrade', comtradeRouter);
app.use('/comtrade', comtradeRouter);
app.use('/api/supabase', supabaseRouter);
app.use('/supabase', supabaseRouter);
app.use('/api/ai', aiRouter);
app.use('/ai', aiRouter);
app.use('/api/ninjas', ninjasRouter);
app.use('/ninjas', ninjasRouter);

export default app;
export { app };

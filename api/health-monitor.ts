import express from 'express';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

// =========================================================================
// TYPES & INTERFACES (Self-Contained for 100% Vercel ESM Compatibility)
// =========================================================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
export type TestType = 'basic' | 'functional' | 'integration';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface RegisteredTool {
  id: string;
  name: string;
  nameFa: string;
  category: 'core' | 'comtrade' | 'ai' | 'ninjas' | 'database';
  endpoint: string;
  method: 'GET' | 'POST';
  testLevels: TestType[];
  expectedStatus: number[];
  getHeaders?: (level: TestType) => Record<string, string>;
  getPayload?: (level: TestType) => any;
  validateResponse: (data: any, statusCode: number, durationMs: number) => { ok: boolean; status: HealthStatus; error?: string };
}

export interface CheckResult {
  tool_id: string;
  tool_name: string;
  category: string;
  status: HealthStatus;
  test_type: TestType;
  response_time_ms: number;
  http_status: number;
  error_code?: string | null;
  error_message?: string | null;
  checked_at: string;
  metadata?: Record<string, any>;
}

export interface IncidentRecord {
  id?: string;
  tool_id: string;
  tool_name: string;
  incident_type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  error_message: string;
  first_seen_at?: string;
  last_seen_at: string;
  resolved_at?: string | null;
  consecutive_failures: number;
  occurrences: number;
  metadata?: Record<string, any>;
}

export interface MonitorRunSummary {
  id: string;
  started_at: string;
  completed_at: string;
  trigger_source: 'cron' | 'manual' | 'external';
  test_type: TestType;
  total_tools: number;
  healthy_count: number;
  degraded_count: number;
  unhealthy_count: number;
  unknown_count: number;
  run_status: 'running' | 'completed' | 'failed' | 'skipped_locked';
  execution_duration_ms: number;
  error_message?: string | null;
}

// In-Memory Fallback Store (When Supabase is not yet configured or for fast caching)
interface MemoryStore {
  runs: MonitorRunSummary[];
  checks: CheckResult[];
  incidents: IncidentRecord[];
  lastRunAt: string | null;
}

const memoryStore: MemoryStore = {
  runs: [],
  checks: [],
  incidents: [],
  lastRunAt: null,
};

// =========================================================================
// DYNAMIC TOOL REGISTRY (Comprehensive Catalog of App Capabilities)
// =========================================================================

export const REGISTERED_TOOLS: RegisteredTool[] = [
  // 1. Core API & Gateway Health
  {
    id: 'core_gateway_health',
    name: 'API Gateway Health Status',
    nameFa: 'هسته گیت‌وی سرور و مسیریابی',
    category: 'core',
    endpoint: '/api/health',
    method: 'GET',
    testLevels: ['basic', 'functional', 'integration'],
    expectedStatus: [200],
    validateResponse: (data, statusCode, durationMs) => {
      if (statusCode !== 200 || data?.status !== 'ok') {
        return { ok: false, status: 'unhealthy', error: `Invalid health status: ${JSON.stringify(data)}` };
      }
      return { ok: true, status: durationMs > 2500 ? 'degraded' : 'healthy' };
    },
  },
  {
    id: 'core_env_diagnostic',
    name: 'Environment Secrets Diagnostic',
    nameFa: 'پیکربندی متغیرهای محیطی سیستم',
    category: 'core',
    endpoint: '/api/env-check',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode, durationMs) => {
      if (statusCode !== 200 || !data?.environment) {
        return { ok: false, status: 'unhealthy', error: 'Missing environment diagnostic tree' };
      }
      return { ok: true, status: durationMs > 2500 ? 'degraded' : 'healthy' };
    },
  },

  // 2. Supabase Database & Auth Gateway
  {
    id: 'supabase_gateway_status',
    name: 'Supabase Gateway & Auth Proxy',
    nameFa: 'اتصال پایگاه داده و احراز هویت سوپابیس',
    category: 'database',
    endpoint: '/api/supabase/status',
    method: 'GET',
    testLevels: ['basic', 'functional', 'integration'],
    expectedStatus: [200],
    validateResponse: (data, statusCode, durationMs) => {
      if (statusCode !== 200) {
        return { ok: false, status: 'unhealthy', error: `HTTP ${statusCode}` };
      }
      if (!data?.configured) {
        return { ok: true, status: 'degraded', error: 'Supabase variables not configured yet in environment' };
      }
      return { ok: true, status: durationMs > 3500 ? 'degraded' : 'healthy' };
    },
  },
  {
    id: 'supabase_proxy_config',
    name: 'Supabase Client Auto-Config',
    nameFa: 'تنظیمات پروکسی معکوس سوپابیس (ضد تحریم)',
    category: 'database',
    endpoint: '/api/supabase/config',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || data?.proxyEnabled !== true) {
        return { ok: false, status: 'unhealthy', error: 'Supabase proxy config failed' };
      }
      return { ok: true, status: 'healthy' };
    },
  },

  // 3. UN Comtrade Global Trade Intelligence
  {
    id: 'comtrade_gateway_status',
    name: 'UN Comtrade Gateway Status',
    nameFa: 'وضعیت درگاه داده‌های سازمان ملل UN Comtrade',
    category: 'comtrade',
    endpoint: '/api/comtrade/status',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode, durationMs) => {
      if (statusCode !== 200 || data?.status !== 'ok') {
        return { ok: false, status: 'unhealthy', error: 'UN Comtrade gateway reported abnormal status' };
      }
      return { ok: true, status: durationMs > 3000 ? 'degraded' : 'healthy' };
    },
  },
  {
    id: 'comtrade_data_explorer',
    name: 'UN Comtrade Data Flows API',
    nameFa: 'کاوشگر جریان‌های تجاری جهانی (HS/SITC)',
    category: 'comtrade',
    endpoint: '/api/comtrade/data?reporterCode=842&partnerCode=0&period=2023&cmdCode=TOTAL&flowCode=X',
    method: 'GET',
    testLevels: ['basic', 'functional', 'integration'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode, durationMs) => {
      if (statusCode === 200 && Array.isArray(data?.data)) {
        return { ok: true, status: durationMs > 5000 ? 'degraded' : 'healthy' };
      }
      if (statusCode === 401 || data?.tip?.includes('Subscription Key')) {
        return { ok: true, status: 'degraded', error: 'Requires user-supplied UN Comtrade subscription key' };
      }
      if (statusCode === 429) {
        return { ok: true, status: 'degraded', error: 'UN Comtrade public rate limit reached' };
      }
      return { ok: false, status: 'unhealthy', error: data?.error || `HTTP ${statusCode}` };
    },
  },
  {
    id: 'comtrade_world_share',
    name: 'UN Comtrade World Share Matrix',
    nameFa: 'ماتریس سهم تجارت جهانی',
    category: 'comtrade',
    endpoint: '/api/comtrade/world-share?period=2023&reporterCode=842',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode) => {
      if (statusCode === 200) return { ok: true, status: 'healthy' };
      if (statusCode === 401 || statusCode === 429) return { ok: true, status: 'degraded', error: 'Rate limit / Auth' };
      return { ok: false, status: 'unhealthy', error: data?.error || `HTTP ${statusCode}` };
    },
  },
  {
    id: 'comtrade_mbs_historical',
    name: 'UN Comtrade Historical MBS (1946-)',
    nameFa: 'بولتن تاریخی ماهانه آمار بازرگانی MBS',
    category: 'comtrade',
    endpoint: '/api/comtrade/mbs?year=2023&country_code=842',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode) => {
      if (statusCode === 200) return { ok: true, status: 'healthy' };
      if (statusCode === 401 || statusCode === 429) return { ok: true, status: 'degraded' };
      return { ok: false, status: 'unhealthy', error: `HTTP ${statusCode}` };
    },
  },
  {
    id: 'comtrade_tariffline_mot',
    name: 'Tariffline & Logistics MoT Feed',
    nameFa: 'تعرفه‌های جزئی و شیوه‌های حمل‌ونقل MoT',
    category: 'comtrade',
    endpoint: '/api/comtrade/tariffline?reporterCode=842&period=2023&cmdCode=TOTAL',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode) => {
      if (statusCode === 200) return { ok: true, status: 'healthy' };
      if (statusCode === 401 || statusCode === 429) return { ok: true, status: 'degraded' };
      return { ok: false, status: 'unhealthy', error: `HTTP ${statusCode}` };
    },
  },
  {
    id: 'comtrade_data_availability',
    name: 'UN Comtrade Data Availability (DA)',
    nameFa: 'ماتریس دسترسی به داده‌های کشورهای عضو',
    category: 'comtrade',
    endpoint: '/api/comtrade/data-availability?reporterCode=842&period=2023',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode) => {
      if (statusCode === 200) return { ok: true, status: 'healthy' };
      if (statusCode === 401 || statusCode === 429) return { ok: true, status: 'degraded' };
      return { ok: false, status: 'unhealthy', error: `HTTP ${statusCode}` };
    },
  },
  {
    id: 'comtrade_releases_feed',
    name: 'UN Comtrade Official Releases',
    nameFa: 'خبرخوان آخرین انتشار داده‌های آماری گمرکات',
    category: 'comtrade',
    endpoint: '/api/comtrade/releases',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode) => {
      if (statusCode === 200) return { ok: true, status: 'healthy' };
      if (statusCode === 401 || statusCode === 429) return { ok: true, status: 'degraded' };
      return { ok: false, status: 'unhealthy', error: `HTTP ${statusCode}` };
    },
  },
  {
    id: 'comtrade_bilateral_mirror',
    name: 'Bilateral Trade Asymmetry & Mirror Data',
    nameFa: 'تحلیل عدم تقارن تجارت دوجانبه و داده‌های آینه‌ای',
    category: 'comtrade',
    endpoint: '/api/comtrade/bilateral?reporterCode=842&partnerCode=156&period=2023&cmdCode=TOTAL&flowCode=M',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode) => {
      if (statusCode === 200) return { ok: true, status: 'healthy' };
      if (statusCode === 401 || statusCode === 429) return { ok: true, status: 'degraded' };
      return { ok: false, status: 'unhealthy', error: `HTTP ${statusCode}` };
    },
  },
  {
    id: 'comtrade_trade_balance',
    name: 'Pivoted Trade Balance Engine',
    nameFa: 'موتور تراز تجاری و موازنه صادرات و واردات',
    category: 'comtrade',
    endpoint: '/api/comtrade/trade-balance?reporterCode=842&period=2023&cmdCode=TOTAL',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode) => {
      if (statusCode === 200) return { ok: true, status: 'healthy' };
      if (statusCode === 401 || statusCode === 429) return { ok: true, status: 'degraded' };
      return { ok: false, status: 'unhealthy', error: `HTTP ${statusCode}` };
    },
  },
  {
    id: 'comtrade_services_sits',
    name: 'SITS EBOPS Commercial Services Trade',
    nameFa: 'آمار تجارت بین‌الملل خدمات بازرگانی (SITS)',
    category: 'comtrade',
    endpoint: '/api/comtrade/services?reporterCode=842&period=2023',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200, 401, 429],
    validateResponse: (data, statusCode) => {
      if (statusCode === 200) return { ok: true, status: 'healthy' };
      if (statusCode === 401 || statusCode === 429) return { ok: true, status: 'degraded' };
      return { ok: false, status: 'unhealthy', error: `HTTP ${statusCode}` };
    },
  },

  // 4. AvalAI / LLM Services (Zero Token Cost in Basic Mode)
  {
    id: 'ai_gateway_status',
    name: 'AvalAI Engine Status',
    nameFa: 'وضعیت درگاه سرویس هوش مصنوعی AvalAI',
    category: 'ai',
    endpoint: '/api/ai/status',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || data?.status !== 'ok') {
        return { ok: false, status: 'unhealthy', error: 'AI Gateway status endpoint not operational' };
      }
      return { ok: true, status: 'healthy' };
    },
  },
  {
    id: 'ai_trade_advisor_probe',
    name: 'Smart Trade Advisor (AI)',
    nameFa: 'مشاور ارشد هوشمند تجارت بین‌الملل (AI)',
    category: 'ai',
    endpoint: '/api/ai/trade-advisor',
    method: 'POST',
    testLevels: ['basic', 'functional', 'integration'],
    expectedStatus: [200],
    getHeaders: (level) => ({
      'Content-Type': 'application/json',
      'x-health-check': level === 'integration' ? 'live' : 'probe',
    }),
    getPayload: (level) => ({
      healthCheck: level !== 'integration',
      originCountry: 'Iran',
      destinationCountry: 'China',
      hsCode: 'TOTAL',
      userQuery: level === 'integration' ? 'خلاصه وضعیت' : undefined,
    }),
    validateResponse: (data, statusCode, durationMs) => {
      if (statusCode !== 200) {
        return { ok: false, status: 'unhealthy', error: data?.error || `HTTP ${statusCode}` };
      }
      if (data?.healthy || data?.success) {
        return { ok: true, status: durationMs > 8000 ? 'degraded' : 'healthy' };
      }
      return { ok: false, status: 'unhealthy', error: data?.error || 'Invalid AI probe output' };
    },
  },
  {
    id: 'ai_business_letter_probe',
    name: 'ICC Business Letter Generator (AI)',
    nameFa: 'نگارش نامه‌های رسمی تجاری منطبق بر ICC (AI)',
    category: 'ai',
    endpoint: '/api/ai/business-letter',
    method: 'POST',
    testLevels: ['basic', 'functional', 'integration'],
    expectedStatus: [200],
    getHeaders: (level) => ({
      'Content-Type': 'application/json',
      'x-health-check': level === 'integration' ? 'live' : 'probe',
    }),
    getPayload: (level) => ({
      healthCheck: level !== 'integration',
      letterType: 'rfq_inquiry',
      targetLanguage: 'en',
    }),
    validateResponse: (data, statusCode, durationMs) => {
      if (statusCode !== 200) {
        return { ok: false, status: 'unhealthy', error: data?.error || `HTTP ${statusCode}` };
      }
      if (data?.healthy || data?.success) {
        return { ok: true, status: durationMs > 8000 ? 'degraded' : 'healthy' };
      }
      return { ok: false, status: 'unhealthy', error: data?.error || 'Invalid letter probe output' };
    },
  },

  // 5. API Ninjas Global Trade & Financial Intelligence
  {
    id: 'ninjas_gateway_status',
    name: 'API Ninjas Gateway Status',
    nameFa: 'وضعیت درگاه شاخص‌های مالی و گمرکی API Ninjas',
    category: 'ninjas',
    endpoint: '/api/ninjas/status',
    method: 'GET',
    testLevels: ['basic'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || data?.status !== 'ok') {
        return { ok: false, status: 'unhealthy', error: 'API Ninjas status check failed' };
      }
      return { ok: true, status: 'healthy' };
    },
  },
  {
    id: 'ninjas_exchange_rates',
    name: 'Live FX & Multi-Currency Benchmark',
    nameFa: 'نرخ برابری زنده ارزهای تجاری و مبادله‌ای',
    category: 'ninjas',
    endpoint: '/api/ninjas/exchange-rates?base=USD',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode, durationMs) => {
      if (statusCode !== 200 || !data?.rates) {
        return { ok: false, status: 'unhealthy', error: 'Missing exchange rates in response' };
      }
      return { ok: true, status: durationMs > 3000 ? 'degraded' : 'healthy' };
    },
  },
  {
    id: 'ninjas_currency_convert',
    name: 'Commercial Currency Converter',
    nameFa: 'موتور تبدیل ارز با ضریب بازرگانی',
    category: 'ninjas',
    endpoint: '/api/ninjas/convert?have=USD&want=EUR&amount=100',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || typeof data?.new_amount !== 'number') {
        return { ok: false, status: 'unhealthy', error: 'Invalid conversion response structure' };
      }
      return { ok: true, status: 'healthy' };
    },
  },
  {
    id: 'ninjas_customs_holidays',
    name: 'Global Trade & Customs Holidays',
    nameFa: 'تقویم تعطیلات گمرکات و بنادر تجاری جهان',
    category: 'ninjas',
    endpoint: '/api/ninjas/holidays?country=CN&year=2024',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || !Array.isArray(data?.holidays)) {
        return { ok: false, status: 'unhealthy', error: 'Missing holidays list' };
      }
      return { ok: true, status: 'healthy' };
    },
  },
  {
    id: 'ninjas_country_macro',
    name: 'Country Macro & Economic Indicators',
    nameFa: 'شاخص‌های کلان اقتصادی، GDP و ظرفیت تجاری',
    category: 'ninjas',
    endpoint: '/api/ninjas/country-macro?country=China',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || !data?.country?.name) {
        return { ok: false, status: 'unhealthy', error: 'Missing country macro details' };
      }
      return { ok: true, status: 'healthy' };
    },
  },
  {
    id: 'ninjas_iban_validator',
    name: 'IBAN Trade Finance Validator (ISO 13616)',
    nameFa: 'اعتبارسنجی بین‌المللی شماره شبا و حساب بانکی',
    category: 'ninjas',
    endpoint: '/api/ninjas/iban?iban=DE89370400440532013000',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || !data?.iban) {
        return { ok: false, status: 'unhealthy', error: 'Standard test IBAN validation failed' };
      }
      return { ok: true, status: 'healthy' };
    },
  },
  {
    id: 'ninjas_swift_parser',
    name: 'SWIFT / BIC Banking Verifier (ISO 9362)',
    nameFa: 'اعتبارسنجی کد سوئیفت بانکی بازرگانی',
    category: 'ninjas',
    endpoint: '/api/ninjas/swift?swift=DEUTDEDDFXX',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || data?.success !== true) {
        return { ok: false, status: 'unhealthy', error: 'Standard test SWIFT validation failed' };
      }
      return { ok: true, status: 'healthy' };
    },
  },
  {
    id: 'ninjas_commodities_feed',
    name: 'Global Commodities Benchmark (CBOT/LME)',
    nameFa: 'دیده‌بان قیمت کالاهای اساسی و کامودیتی‌ها',
    category: 'ninjas',
    endpoint: '/api/ninjas/commodities',
    method: 'GET',
    testLevels: ['basic', 'functional'],
    expectedStatus: [200],
    validateResponse: (data, statusCode) => {
      if (statusCode !== 200 || !Array.isArray(data?.commodities)) {
        return { ok: false, status: 'unhealthy', error: 'Missing commodities list' };
      }
      return { ok: true, status: 'healthy' };
    },
  },
];

// =========================================================================
// SUPABASE CLIENT (Lazy initialized with Service Role Key for server ops)
// =========================================================================

let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !serviceKey) return null;

  if (!supabaseAdminClient) {
    try {
      supabaseAdminClient = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } catch (err) {
      console.warn('[Health Monitor] Supabase Admin Init Error:', err);
      return null;
    }
  }
  return supabaseAdminClient;
}

// =========================================================================
// SECURITY & AUTHENTICATION HELPER
// =========================================================================

export function isAuthorizedRequest(req: express.Request): boolean {
  const cronSecret = (process.env.CRON_SECRET || '').trim();
  const adminKey = (process.env.ADMIN_MONITOR_KEY || '').trim();

  // If neither key is configured in environment, allow execution (development / initial setup mode)
  if (!cronSecret && !adminKey) {
    return true;
  }

  // 1. Check Authorization Bearer header
  const authHeader = (req.headers['authorization'] as string) || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === cronSecret || token === adminKey) return true;
  }

  // 2. Check custom headers
  const customHeader = (req.headers['x-cron-secret'] as string) || (req.headers['x-admin-key'] as string) || '';
  if (customHeader && (customHeader === cronSecret || customHeader === adminKey)) return true;

  // 3. Check query parameter
  const querySecret = (req.query.secret as string) || (req.query.key as string) || '';
  if (querySecret && (querySecret === cronSecret || querySecret === adminKey)) return true;

  return false;
}

// =========================================================================
// TEST EXECUTION ENGINE WITH RETRY & TIMEOUT
// =========================================================================

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function testToolWithRetry(
  tool: RegisteredTool,
  baseUrl: string,
  testType: TestType = 'basic',
  maxRetries = 1
): Promise<CheckResult> {
  const targetUrl = `${baseUrl}${tool.endpoint}`;
  const timeoutMs = testType === 'integration' ? 25000 : 8000;

  let attempt = 0;
  let lastResult: CheckResult = {
    tool_id: tool.id,
    tool_name: tool.name,
    category: tool.category,
    status: 'unknown',
    test_type: testType,
    response_time_ms: 0,
    http_status: 0,
    checked_at: new Date().toISOString(),
  };

  while (attempt <= maxRetries) {
    attempt++;
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'Diginoron-Health-Monitor/1.0',
        ...(tool.getHeaders ? tool.getHeaders(testType) : {}),
      };

      const options: RequestInit = {
        method: tool.method,
        headers,
        signal: controller.signal,
      };

      if (tool.method === 'POST' && tool.getPayload) {
        options.body = JSON.stringify(tool.getPayload(testType));
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(targetUrl, options);
      clearTimeout(timeoutId);

      const durationMs = Date.now() - startTime;
      const httpStatus = response.status;

      let responseData: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        const text = await response.text();
        responseData = { textPreview: text.substring(0, 200) };
      }

      const validation = tool.validateResponse(responseData, httpStatus, durationMs);

      lastResult = {
        tool_id: tool.id,
        tool_name: tool.name,
        category: tool.category,
        status: validation.status,
        test_type: testType,
        response_time_ms: durationMs,
        http_status: httpStatus,
        error_code: validation.ok ? null : `HTTP_${httpStatus}`,
        error_message: validation.error || null,
        checked_at: new Date().toISOString(),
        metadata: {
          endpoint: tool.endpoint,
          method: tool.method,
          attempt,
          hasPayload: Boolean(options.body),
        },
      };

      // If healthy or degraded, no need to retry
      if (validation.status === 'healthy' || validation.status === 'degraded') {
        return lastResult;
      }

      // If unhealthy and we still have retries left, wait briefly and retry
      if (attempt <= maxRetries) {
        await sleep(1200);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;
      const isAbort = err.name === 'AbortError';

      lastResult = {
        tool_id: tool.id,
        tool_name: tool.name,
        category: tool.category,
        status: 'unhealthy',
        test_type: testType,
        response_time_ms: durationMs,
        http_status: isAbort ? 504 : 500,
        error_code: isAbort ? 'TIMEOUT' : 'FETCH_EXCEPTION',
        error_message: isAbort ? `Request exceeded ${timeoutMs}ms limit` : err.message,
        checked_at: new Date().toISOString(),
        metadata: { endpoint: tool.endpoint, method: tool.method, attempt, isAbort },
      };

      if (attempt <= maxRetries) {
        await sleep(1200);
      }
    }
  }

  return lastResult;
}

// =========================================================================
// INCIDENT MANAGEMENT & STATE UPDATER
// =========================================================================

export async function processToolIncidents(
  check: CheckResult,
  supabase: SupabaseClient | null
): Promise<void> {
  const isProblematic = check.status === 'unhealthy' || (check.status === 'degraded' && check.error_message);

  if (isProblematic) {
    const incidentType = check.error_code || (check.response_time_ms > 4000 ? 'degraded_performance' : 'unhealthy_state');
    const severity: IncidentSeverity = check.status === 'unhealthy' ? 'high' : 'medium';
    const errorMsg = check.error_message || `HTTP ${check.http_status} unexpected behavior`;

    if (supabase) {
      try {
        // 1. Check for open incident
        const { data: openIncidents } = await supabase
          .from('health_incidents')
          .select('*')
          .eq('tool_id', check.tool_id)
          .neq('status', 'resolved')
          .limit(1);

        if (openIncidents && openIncidents.length > 0) {
          const current = openIncidents[0];
          await supabase
            .from('health_incidents')
            .update({
              last_seen_at: new Date().toISOString(),
              consecutive_failures: (current.consecutive_failures || 1) + 1,
              occurrences: (current.occurrences || 1) + 1,
              error_message: errorMsg,
              severity: current.severity === 'critical' ? 'critical' : severity,
            })
            .eq('id', current.id);
        } else {
          await supabase.from('health_incidents').insert({
            tool_id: check.tool_id,
            tool_name: check.tool_name,
            incident_type: incidentType,
            severity,
            status: 'open',
            error_message: errorMsg,
            first_seen_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            consecutive_failures: 1,
            occurrences: 1,
            metadata: check.metadata || {},
          });
        }
      } catch (err) {
        console.warn('[Incidents Sync] Database incident write error:', err);
      }
    }

    // Memory Store Update
    const memIdx = memoryStore.incidents.findIndex(i => i.tool_id === check.tool_id && i.status !== 'resolved');
    if (memIdx >= 0) {
      memoryStore.incidents[memIdx].last_seen_at = new Date().toISOString();
      memoryStore.incidents[memIdx].consecutive_failures += 1;
      memoryStore.incidents[memIdx].occurrences += 1;
      memoryStore.incidents[memIdx].error_message = errorMsg;
    } else {
      memoryStore.incidents.unshift({
        tool_id: check.tool_id,
        tool_name: check.tool_name,
        incident_type: incidentType,
        severity,
        status: 'open',
        error_message: errorMsg,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        consecutive_failures: 1,
        occurrences: 1,
        metadata: check.metadata || {},
      });
    }
  } else if (check.status === 'healthy') {
    // Tool is recovered! Auto-resolve all open incidents
    if (supabase) {
      try {
        await supabase
          .from('health_incidents')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('tool_id', check.tool_id)
          .neq('status', 'resolved');
      } catch (err) {
        console.warn('[Incidents Sync] Auto-resolve error:', err);
      }
    }

    // Memory Store Auto-Resolve
    for (const inc of memoryStore.incidents) {
      if (inc.tool_id === check.tool_id && inc.status !== 'resolved') {
        inc.status = 'resolved';
        inc.resolved_at = new Date().toISOString();
      }
    }
  }
}

// =========================================================================
// RUN MONITOR PIPELINE (Concurrency Lock, Parallel Execution, Retention)
// =========================================================================

export async function runMonitoringPipeline(
  baseUrl: string,
  options: {
    testType?: TestType;
    triggerSource?: 'cron' | 'manual' | 'external';
    toolId?: string;
  } = {}
): Promise<{ success: boolean; run: MonitorRunSummary; checks: CheckResult[]; skipped?: boolean; reason?: string }> {
  const testType = options.testType || 'basic';
  const triggerSource = options.triggerSource || 'manual';
  const supabase = getSupabaseAdmin();
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startedAt = new Date().toISOString();

  // 1. Concurrency Lock: Check if a run is already 'running' within the last 2 minutes
  if (supabase) {
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data: runningJobs } = await supabase
        .from('health_monitor_runs')
        .select('id, started_at')
        .eq('run_status', 'running')
        .gt('started_at', twoMinutesAgo)
        .limit(1);

      if (runningJobs && runningJobs.length > 0) {
        return {
          success: false,
          skipped: true,
          reason: 'skipped_locked',
          run: {
            id: runId,
            started_at: startedAt,
            completed_at: new Date().toISOString(),
            trigger_source: triggerSource,
            test_type: testType,
            total_tools: 0,
            healthy_count: 0,
            degraded_count: 0,
            unhealthy_count: 0,
            unknown_count: 0,
            run_status: 'skipped_locked',
            execution_duration_ms: 0,
            error_message: 'Another monitoring run is currently in progress within lock interval (2m)',
          },
          checks: [],
        };
      }

      // Insert Initial Running Record
      await supabase.from('health_monitor_runs').insert({
        id: runId,
        started_at: startedAt,
        trigger_source: triggerSource,
        test_type: testType,
        run_status: 'running',
      });
    } catch (lockErr) {
      console.warn('[Health Monitor] Concurrency lock check warning:', lockErr);
    }
  }

  // 2. Filter Tools
  const toolsToRun = options.toolId
    ? REGISTERED_TOOLS.filter(t => t.id === options.toolId)
    : REGISTERED_TOOLS;

  // 3. Parallel Batch Execution (Batches of 5 to avoid overwhelming the local serverless runtime)
  const checks: CheckResult[] = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < toolsToRun.length; i += BATCH_SIZE) {
    const chunk = toolsToRun.slice(i, i + BATCH_SIZE);
    const chunkPromises = chunk.map(tool => testToolWithRetry(tool, baseUrl, testType, 1));
    const settled = await Promise.allSettled(chunkPromises);

    for (const item of settled) {
      if (item.status === 'fulfilled') {
        checks.push(item.value);
      }
    }
  }

  const durationMs = Date.now() - new Date(startedAt).getTime();
  const completedAt = new Date().toISOString();

  // 4. Compute Counts
  let healthyCount = 0;
  let degradedCount = 0;
  let unhealthyCount = 0;
  let unknownCount = 0;

  for (const c of checks) {
    if (c.status === 'healthy') healthyCount++;
    else if (c.status === 'degraded') degradedCount++;
    else if (c.status === 'unhealthy') unhealthyCount++;
    else unknownCount++;
  }

  const runSummary: MonitorRunSummary = {
    id: runId,
    started_at: startedAt,
    completed_at: completedAt,
    trigger_source: triggerSource,
    test_type: testType,
    total_tools: checks.length,
    healthy_count: healthyCount,
    degraded_count: degradedCount,
    unhealthy_count: unhealthyCount,
    unknown_count: unknownCount,
    run_status: 'completed',
    execution_duration_ms: durationMs,
  };

  // 5. Save to Supabase & Process Incidents
  if (supabase) {
    try {
      // Update Run Status
      await supabase
        .from('health_monitor_runs')
        .update({
          completed_at: completedAt,
          total_tools: checks.length,
          healthy_count: healthyCount,
          degraded_count: degradedCount,
          unhealthy_count: unhealthyCount,
          unknown_count: unknownCount,
          run_status: 'completed',
          execution_duration_ms: durationMs,
        })
        .eq('id', runId);

      // Insert Health Checks in batch
      const checkRows = checks.map(c => ({
        run_id: runId,
        tool_id: c.tool_id,
        tool_name: c.tool_name,
        category: c.category,
        status: c.status,
        test_type: c.test_type,
        response_time_ms: c.response_time_ms,
        http_status: c.http_status,
        error_code: c.error_code,
        error_message: c.error_message,
        checked_at: c.checked_at,
        metadata: c.metadata || {},
      }));

      await supabase.from('health_checks').insert(checkRows);

      // Process incidents asynchronously
      await Promise.allSettled(checks.map(c => processToolIncidents(c, supabase)));

      // Execute Data Retention Cleanup once per day or on run
      await runDataRetentionCleanup(supabase);
    } catch (saveErr) {
      console.warn('[Health Monitor] Error persisting run to Supabase:', saveErr);
    }
  } else {
    // Process incidents against memory store
    await Promise.allSettled(checks.map(c => processToolIncidents(c, null)));
  }

  // Update Memory Store
  memoryStore.runs.unshift(runSummary);
  if (memoryStore.runs.length > 100) memoryStore.runs.pop();
  memoryStore.checks.unshift(...checks);
  if (memoryStore.checks.length > 500) memoryStore.checks = memoryStore.checks.slice(0, 500);
  memoryStore.lastRunAt = completedAt;

  return {
    success: true,
    run: runSummary,
    checks,
  };
}

// =========================================================================
// DATA RETENTION POLICY ENGINE
// =========================================================================

export async function runDataRetentionCleanup(supabase?: SupabaseClient | null): Promise<{ prunedChecks: number }> {
  const client = supabase || getSupabaseAdmin();
  let prunedCount = 0;

  if (client) {
    try {
      // 1. Delete healthy checks older than 14 days
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const { error: delHealthyErr } = await client
        .from('health_checks')
        .delete()
        .eq('status', 'healthy')
        .lt('checked_at', fourteenDaysAgo);

      if (!delHealthyErr) prunedCount += 1;

      // 2. Delete degraded/unhealthy checks older than 90 days
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      await client
        .from('health_checks')
        .delete()
        .in('status', ['degraded', 'unhealthy'])
        .lt('checked_at', ninetyDaysAgo);
    } catch (err) {
      console.warn('[Data Retention] Cleanup warning:', err);
    }
  }

  return { prunedChecks: prunedCount };
}

// =========================================================================
// MANAGEMENT API DATA FETCHERS
// =========================================================================

export async function getHealthSummary(): Promise<any> {
  const supabase = getSupabaseAdmin();

  let latestRun: MonitorRunSummary | null = memoryStore.runs[0] || null;
  let totalChecksRecorded = memoryStore.checks.length;
  let openIncidentsCount = memoryStore.incidents.filter(i => i.status !== 'resolved').length;
  let recentChecks: CheckResult[] = memoryStore.checks.slice(0, 100);

  if (supabase) {
    try {
      const { data: runs } = await supabase
        .from('health_monitor_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1);

      if (runs && runs.length > 0) {
        latestRun = runs[0];
      }

      const { count: openCount } = await supabase
        .from('health_incidents')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'resolved');

      if (openCount !== null) openIncidentsCount = openCount;

      const { data: dbChecks } = await supabase
        .from('health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(100);

      if (dbChecks && dbChecks.length > 0) {
        recentChecks = dbChecks;
      }
    } catch (err) {
      console.warn('[Health Summary] Error querying Supabase, using memory store:', err);
    }
  }

  // Calculate Overall Uptime Percentage from recent checks
  const totalRecent = recentChecks.length;
  const healthyRecent = recentChecks.filter(c => c.status === 'healthy').length;
  const uptime24h = totalRecent > 0 ? Math.round((healthyRecent / totalRecent) * 1000) / 10 : 100;

  // Average response time
  const totalTime = recentChecks.reduce((acc, c) => acc + (c.response_time_ms || 0), 0);
  const avgResponseTimeMs = totalRecent > 0 ? Math.round(totalTime / totalRecent) : 0;

  return {
    status: openIncidentsCount > 0 ? (latestRun?.unhealthy_count ? 'unhealthy' : 'degraded') : 'healthy',
    totalRegisteredTools: REGISTERED_TOOLS.length,
    lastCheckedAt: latestRun?.completed_at || memoryStore.lastRunAt || null,
    uptimePercentage: uptime24h,
    averageResponseTimeMs: avgResponseTimeMs,
    openIncidentsCount,
    latestRun,
    systemOverview: {
      healthyTools: latestRun?.healthy_count ?? REGISTERED_TOOLS.length,
      degradedTools: latestRun?.degraded_count ?? 0,
      unhealthyTools: latestRun?.unhealthy_count ?? 0,
    },
    databaseConnected: Boolean(supabase),
  };
}

export async function getToolsStatusList(): Promise<any[]> {
  const supabase = getSupabaseAdmin();
  const toolMap = new Map<string, { tool: RegisteredTool; latestCheck?: CheckResult; activeIncident?: IncidentRecord }>();

  for (const t of REGISTERED_TOOLS) {
    toolMap.set(t.id, { tool: t });
  }

  if (supabase) {
    try {
      // Fetch latest check for each tool
      const { data: checks } = await supabase
        .from('health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(200);

      if (checks) {
        for (const c of checks) {
          const entry = toolMap.get(c.tool_id);
          if (entry && !entry.latestCheck) {
            entry.latestCheck = c;
          }
        }
      }

      // Fetch active incidents
      const { data: incidents } = await supabase
        .from('health_incidents')
        .select('*')
        .neq('status', 'resolved');

      if (incidents) {
        for (const inc of incidents) {
          const entry = toolMap.get(inc.tool_id);
          if (entry) {
            entry.activeIncident = inc;
          }
        }
      }
    } catch (err) {
      console.warn('[Tools Status] Supabase fetch error, falling back to memory store:', err);
    }
  }

  // Fallback to memory store if no database data
  for (const [id, entry] of toolMap.entries()) {
    if (!entry.latestCheck) {
      entry.latestCheck = memoryStore.checks.find(c => c.tool_id === id);
    }
    if (!entry.activeIncident) {
      entry.activeIncident = memoryStore.incidents.find(i => i.tool_id === id && i.status !== 'resolved');
    }
  }

  return Array.from(toolMap.values()).map(({ tool, latestCheck, activeIncident }) => ({
    id: tool.id,
    name: tool.name,
    nameFa: tool.nameFa,
    category: tool.category,
    endpoint: tool.endpoint,
    method: tool.method,
    status: latestCheck?.status || 'unknown',
    responseTimeMs: latestCheck?.response_time_ms || null,
    httpStatus: latestCheck?.http_status || null,
    lastCheckedAt: latestCheck?.checked_at || null,
    errorMessage: latestCheck?.error_message || activeIncident?.error_message || null,
    hasActiveIncident: Boolean(activeIncident),
    incidentDetails: activeIncident || null,
  }));
}

export async function getToolDetail(toolId: string, limit = 50): Promise<any> {
  const tool = REGISTERED_TOOLS.find(t => t.id === toolId);
  if (!tool) return null;

  const supabase = getSupabaseAdmin();
  let history: CheckResult[] = [];
  let incidents: IncidentRecord[] = [];

  if (supabase) {
    try {
      const { data: dbHistory } = await supabase
        .from('health_checks')
        .select('*')
        .eq('tool_id', toolId)
        .order('checked_at', { ascending: false })
        .limit(limit);

      if (dbHistory) history = dbHistory;

      const { data: dbIncidents } = await supabase
        .from('health_incidents')
        .select('*')
        .eq('tool_id', toolId)
        .order('last_seen_at', { ascending: false })
        .limit(20);

      if (dbIncidents) incidents = dbIncidents;
    } catch (err) {
      console.warn('[Tool Detail] DB query warning:', err);
    }
  }

  if (history.length === 0) {
    history = memoryStore.checks.filter(c => c.tool_id === toolId).slice(0, limit);
  }
  if (incidents.length === 0) {
    incidents = memoryStore.incidents.filter(i => i.tool_id === toolId);
  }

  const totalChecks = history.length;
  const healthyCount = history.filter(c => c.status === 'healthy').length;
  const uptime = totalChecks > 0 ? Math.round((healthyCount / totalChecks) * 1000) / 10 : 100;

  return {
    tool,
    uptimePercentage: uptime,
    totalChecks,
    currentStatus: history[0]?.status || 'unknown',
    latestResponseTimeMs: history[0]?.response_time_ms || null,
    history,
    incidents,
  };
}

export async function getIncidentsList(statusFilter: string = 'open'): Promise<IncidentRecord[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      let query = supabase.from('health_incidents').select('*').order('last_seen_at', { ascending: false });
      if (statusFilter === 'open') {
        query = query.neq('status', 'resolved');
      } else if (statusFilter === 'resolved') {
        query = query.eq('status', 'resolved');
      }
      const { data } = await query.limit(100);
      if (data) return data;
    } catch (err) {
      console.warn('[Incidents List] Supabase error:', err);
    }
  }

  return memoryStore.incidents.filter(inc => {
    if (statusFilter === 'open') return inc.status !== 'resolved';
    if (statusFilter === 'resolved') return inc.status === 'resolved';
    return true;
  });
}

// =========================================================================
// EXPRESS ROUTER & CONTROLLER
// =========================================================================

const healthMonitorRouter = express.Router();

// Base URL Resolver
function getBaseUrl(req: express.Request): string {
  // When running locally inside Express/Node server, use 127.0.0.1 loopback for zero latency & no hairpinning
  const host = req.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1') || process.env.NODE_ENV !== 'production') {
    return `http://127.0.0.1:${process.env.PORT || 3000}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }
  if (process.env.APP_URL && process.env.APP_URL.trim().length > 0) {
    return process.env.APP_URL.trim().replace(/\/+$/, '');
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${protocol}://${host}`;
}

// Main Handler (Handles both query ?action=... and direct subpaths)
const handleAction = async (req: express.Request, res: express.Response) => {
  const action = (req.query.action as string) || req.path.replace(/^\/+/, '') || 'summary';

  try {
    switch (action) {
      // 1. System Summary
      case 'summary': {
        const summary = await getHealthSummary();
        return res.json({ success: true, data: summary });
      }

      // 2. All Registered Tools Status
      case 'tools': {
        const tools = await getToolsStatusList();
        return res.json({ success: true, count: tools.length, data: tools });
      }

      // 3. Tool Detail & History
      case 'tool-detail': {
        const toolId = (req.query.toolId as string || req.query.id as string || '').trim();
        if (!toolId) {
          return res.status(400).json({ success: false, error: 'toolId query parameter is required' });
        }
        const limit = parseInt(req.query.limit as string, 10) || 50;
        const detail = await getToolDetail(toolId, limit);
        if (!detail) {
          return res.status(404).json({ success: false, error: `Tool ${toolId} not found in registry` });
        }
        return res.json({ success: true, data: detail });
      }

      // 4. Incidents List
      case 'incidents': {
        const status = (req.query.status as string) || 'open';
        const incidents = await getIncidentsList(status);
        return res.json({ success: true, count: incidents.length, data: incidents });
      }

      // 5. Trigger Health Monitoring Run (Cron or Manual)
      case 'run': {
        // Enforce Authorization for execution
        if (!isAuthorizedRequest(req)) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized: Valid CRON_SECRET or ADMIN_MONITOR_KEY required to execute monitoring runs.',
            tip: 'Pass Bearer token or ?secret=<key>',
          });
        }

        const baseUrl = getBaseUrl(req);
        const testType = ((req.query.testType as string) || (req.body?.testType as string) || 'basic') as TestType;
        const triggerSource = ((req.query.source as string) || (req.body?.triggerSource as string) || 'manual') as any;
        const toolId = (req.query.toolId as string) || req.body?.toolId;

        const result = await runMonitoringPipeline(baseUrl, {
          testType,
          triggerSource,
          toolId,
        });

        return res.json({
          success: result.success,
          skipped: result.skipped || false,
          reason: result.reason,
          run: result.run,
          totalTested: result.checks.length,
          healthy: result.run.healthy_count,
          degraded: result.run.degraded_count,
          unhealthy: result.run.unhealthy_count,
          resultsPreview: result.checks.map(c => ({
            id: c.tool_id,
            status: c.status,
            timeMs: c.response_time_ms,
            error: c.error_message,
          })),
        });
      }

      // 6. Data Retention Cleanup
      case 'cleanup': {
        if (!isAuthorizedRequest(req)) {
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const result = await runDataRetentionCleanup();
        return res.json({ success: true, message: 'Data retention policy executed', ...result });
      }

      default: {
        const summary = await getHealthSummary();
        return res.json({
          success: true,
          action: 'summary_fallback',
          data: summary,
          availableActions: ['summary', 'tools', 'tool-detail', 'incidents', 'run', 'cleanup'],
        });
      }
    }
  } catch (err: any) {
    console.error('[Health Monitor Handler Error]:', err);
    return res.status(500).json({
      success: false,
      error: `Internal health monitor error: ${err.message}`,
    });
  }
};

// Route matching for Express mounting
healthMonitorRouter.all('/', handleAction);
healthMonitorRouter.all('/summary', handleAction);
healthMonitorRouter.all('/tools', handleAction);
healthMonitorRouter.all('/tool-detail', handleAction);
healthMonitorRouter.all('/incidents', handleAction);
healthMonitorRouter.all('/run', handleAction);
healthMonitorRouter.all('/cleanup', handleAction);
healthMonitorRouter.all('/*', handleAction);

// Hybrid Vercel Serverless Function & Express Middleware Handler
export default async function handler(req: any, res: any, next?: any) {
  // Polyfill helper methods if running in minimal serverless context
  if (typeof res.status !== 'function') {
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== 'function') {
    res.json = (data: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  // 1. If called as Express router middleware (3 arguments: req, res, next)
  if (typeof next === 'function') {
    return healthMonitorRouter(req, res, next);
  }

  // 2. If called directly as Vercel Serverless Function (2 arguments: req, res)
  // Ensure POST/PUT request body is parsed if Vercel didn't parse it
  if (!req.body && req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw) req.body = JSON.parse(raw);
    } catch {
      req.body = {};
    }
  }

  return handleAction(req, res);
}

export { healthMonitorRouter, handleAction };

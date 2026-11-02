const STORAGE_NINJA_KEY = 'api_ninjas_stored_key';

// In-memory cache for client calls
const ninjaClientCache = new Map<string, { data: any; timestamp: number }>();
const CLIENT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function getStoredNinjaKey(): string {
  return localStorage.getItem(STORAGE_NINJA_KEY) || '';
}

export function saveStoredNinjaKey(key: string): void {
  localStorage.setItem(STORAGE_NINJA_KEY, key.trim());
  ninjaClientCache.clear(); // clear cache on key update
}

export function clearStoredNinjaKey(): void {
  localStorage.removeItem(STORAGE_NINJA_KEY);
  ninjaClientCache.clear();
}

function getNinjaHeaders(): Record<string, string> {
  const key = getStoredNinjaKey();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (key) {
    headers['X-Api-Ninjas-Key'] = key;
  }
  return headers;
}

export async function checkNinjaStatus(): Promise<{
  hasActiveKey: boolean;
  hasEnvKey: boolean;
  hasClientKey: boolean;
  portalUrl: string;
}> {
  try {
    const res = await fetch('/api/ninjas/status', {
      headers: getNinjaHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Could not reach /api/ninjas/status', e);
  }
  const hasClient = Boolean(getStoredNinjaKey());
  return {
    hasActiveKey: hasClient,
    hasEnvKey: false,
    hasClientKey: hasClient,
    portalUrl: 'https://api-ninjas.com/profile',
  };
}

export async function testNinjaKey(keyToTest: string): Promise<{
  valid: boolean;
  message: string;
  statusCode?: number;
  durationMs?: number;
  countryTested?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/ninjas/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: keyToTest.trim() }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      valid: false,
      message: `خطای ارتباط با سرور: ${err.message}`,
    };
  }
}

export interface ExchangeRateItem {
  rate: number;
  name: string;
  nameFa: string;
  symbol: string;
  updatedAt?: string;
  isEstimate?: boolean;
}

export async function fetchExchangeRates(base = 'USD'): Promise<{
  success: boolean;
  isLive: boolean;
  base: string;
  rates: Record<string, ExchangeRateItem>;
  source: string;
}> {
  const cacheKey = `rates_${base}`;
  const cached = ninjaClientCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`/api/ninjas/exchange-rates?base=${encodeURIComponent(base)}`, {
      headers: getNinjaHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      ninjaClientCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
  } catch (e) {
    console.warn('fetchExchangeRates error:', e);
  }

  // Fallback
  return {
    success: true,
    isLive: false,
    base: 'USD',
    rates: {
      USD: { rate: 1.0, name: 'US Dollar', nameFa: 'دلار آمریکا', symbol: '$' },
      EUR: { rate: 0.922, name: 'Euro', nameFa: 'یورو', symbol: '€' },
      CNY: { rate: 7.235, name: 'Chinese Yuan', nameFa: 'یوان چین', symbol: '¥' },
      AED: { rate: 3.6725, name: 'UAE Dirham', nameFa: 'درهم امارات', symbol: 'AED' },
      TRY: { rate: 34.15, name: 'Turkish Lira', nameFa: 'لیر ترکیه', symbol: '₺' },
    },
    source: 'Benchmark Fallback',
  };
}

export async function convertCurrency(
  amount: number,
  have: string,
  want: string
): Promise<{
  success: boolean;
  isLive: boolean;
  have: string;
  want: string;
  old_amount: number;
  new_amount: number;
  rate: number;
  source: string;
}> {
  try {
    const res = await fetch(
      `/api/ninjas/convert?have=${encodeURIComponent(have)}&want=${encodeURIComponent(want)}&amount=${amount}`,
      { headers: getNinjaHeaders() }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('convertCurrency error:', e);
  }

  return {
    success: true,
    isLive: false,
    have,
    want,
    old_amount: amount,
    new_amount: amount,
    rate: 1,
    source: 'Default fallback',
  };
}

export interface TradeHolidayItem {
  name: string;
  date: string;
  type?: string;
  impact?: string;
  daysOff?: number;
  country?: string;
  day?: string;
}

export async function fetchCountryHolidays(countryCode: string, year?: number): Promise<{
  success: boolean;
  isLive: boolean;
  country: string;
  year: number;
  count: number;
  holidays: TradeHolidayItem[];
  source?: string;
}> {
  const currentYear = year || new Date().getFullYear();
  const cacheKey = `holidays_${countryCode}_${currentYear}`;
  const cached = ninjaClientCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `/api/ninjas/holidays?country=${encodeURIComponent(countryCode)}&year=${currentYear}`,
      { headers: getNinjaHeaders() }
    );
    if (res.ok) {
      const data = await res.json();
      ninjaClientCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
  } catch (e) {
    console.warn('fetchCountryHolidays error:', e);
  }

  return {
    success: false,
    isLive: false,
    country: countryCode,
    year: currentYear,
    count: 0,
    holidays: [],
  };
}

export interface CountryMacroProfile {
  name: string;
  capital?: string;
  currency?: string;
  currencyName?: string;
  gdp?: number;
  gdpPerCapita?: number;
  population?: number;
  surfaceArea?: number;
  importsUSD?: number;
  exportsUSD?: number;
  region?: string;
  inflation?: number;
  yearlyInflation?: number;
}

export async function fetchCountryMacro(countryNameOrCode: string): Promise<{
  success: boolean;
  isLive: boolean;
  country: CountryMacroProfile;
  source?: string;
}> {
  const cacheKey = `macro_${countryNameOrCode}`;
  const cached = ninjaClientCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `/api/ninjas/country-macro?country=${encodeURIComponent(countryNameOrCode)}`,
      { headers: getNinjaHeaders() }
    );
    if (res.ok) {
      const data = await res.json();
      ninjaClientCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
  } catch (e) {
    console.warn('fetchCountryMacro error:', e);
  }

  return {
    success: false,
    isLive: false,
    country: { name: countryNameOrCode },
  };
}

export interface IbanValidationResult {
  valid: boolean;
  isLive?: boolean;
  iban: string;
  country?: string;
  country_code?: string;
  bank_code?: string;
  bank_name?: string;
  account_number?: string;
  check_digits?: string;
  checksum_passed?: boolean;
  source?: string;
  message?: string;
}

export async function validateIban(iban: string): Promise<IbanValidationResult> {
  try {
    const res = await fetch(`/api/ninjas/iban?iban=${encodeURIComponent(iban)}`, {
      headers: getNinjaHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('validateIban error:', e);
  }
  return { valid: false, iban, message: 'خطا در اعتبارسنجی' };
}

export interface SwiftValidationResult {
  valid: boolean;
  isLive?: boolean;
  swift_code: string;
  institution_code?: string;
  country_code?: string;
  location_code?: string;
  branch_code?: string;
  bank_name?: string;
  city?: string;
  country?: string;
  message?: string;
  source?: string;
}

export async function validateSwift(swift: string): Promise<SwiftValidationResult> {
  try {
    const res = await fetch(`/api/ninjas/swift?swift=${encodeURIComponent(swift)}`, {
      headers: getNinjaHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('validateSwift error:', e);
  }
  return { valid: false, swift_code: swift, message: 'خطا در استعلام سوئیفت' };
}

export interface CommodityItem {
  name: string;
  code: string;
  category: string;
  price: number;
  unit: string;
  change24h: string;
  comtradeHsMatch: string;
}

export async function fetchCommodityPrices(): Promise<{
  success: boolean;
  isLive: boolean;
  commodities: CommodityItem[];
  source: string;
}> {
  const cacheKey = 'commodities_list';
  const cached = ninjaClientCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch('/api/ninjas/commodities', {
      headers: getNinjaHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      ninjaClientCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
  } catch (e) {
    console.warn('fetchCommodityPrices error:', e);
  }

  return {
    success: false,
    isLive: false,
    commodities: [],
    source: 'Error loading',
  };
}

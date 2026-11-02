import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

const STORAGE_URL_KEY = 'DIGINORON_SUPABASE_URL';
const STORAGE_KEY_KEY = 'DIGINORON_SUPABASE_ANON_KEY';

/**
 * Computes a deterministic storage key for Supabase auth tokens in localStorage
 * matching standard Supabase convention (sb-<projectRef>-auth-token).
 */
export function getSupabaseStorageKey(upstreamUrl: string): string {
  try {
    if (upstreamUrl) {
      const parsed = new URL(upstreamUrl);
      const parts = parsed.hostname.split('.');
      if (parts[0] && parts[0] !== 'localhost' && parts[0] !== '127') {
        return `sb-${parts[0]}-auth-token`;
      }
    }
  } catch {}
  return 'sb-diginoron-auth-token';
}

/**
 * Get stored credentials from localStorage or Vite environment variables
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  let storedUrl = '';
  let storedKey = '';

  try {
    storedUrl = (localStorage.getItem(STORAGE_URL_KEY) || '').trim();
    storedKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();
  } catch {
    // ignore localstorage errors in restricted contexts
  }

  return {
    url: envUrl || storedUrl,
    anonKey: envKey || storedKey,
  };
}

/**
 * Retrieves the raw upstream Supabase target URL (e.g. https://xyz.supabase.co)
 */
export function getTargetUpstreamUrl(): string {
  const { url } = getSupabaseCredentials();
  const clean = (url || '').trim().replace(/\/+$/, '');
  if (clean && !clean.includes('/api/supabase') && !clean.includes('/supabase')) {
    return clean;
  }
  return '';
}

/**
 * Resolves the client URL (using the reverse proxy when running in the browser)
 * and the upstream target URL (which is passed in headers to the proxy).
 */
export function resolveSupabaseUrl(rawUrl: string): { clientUrl: string; upstreamUrl: string } {
  const isBrowser = typeof window !== 'undefined' && Boolean(window.location?.origin);
  const clean = (rawUrl || '').trim().replace(/\/+$/, '');

  // If in browser, default to reverse proxy /api/supabase
  if (isBrowser) {
    const proxyUrl = `${window.location.origin}/api/supabase`;
    return {
      clientUrl: proxyUrl,
      upstreamUrl: clean.includes('/api/supabase') || clean.includes('/supabase') ? '' : clean,
    };
  }

  return {
    clientUrl: clean,
    upstreamUrl: clean,
  };
}

/**
 * Returns whether the active Supabase client is routing through the built-in reverse proxy
 */
export function isUsingSupabaseProxy(): boolean {
  return typeof window !== 'undefined' && Boolean(window.location?.origin);
}

/**
 * Safe fetch wrapper that intercepts non-JSON/HTML error responses (e.g. "The page could not be found")
 * and automatically retries directly against upstream Supabase.
 * Guarantees that Supabase SDK never crashes with SyntaxError: Unexpected token 'T' / not valid JSON.
 */
function createSafeProxyFetch(upstreamTargetUrl: string): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    try {
      const res = await fetch(input, init);
      const contentType = res.headers.get('content-type') || '';
      const isHtmlOrText = !contentType.includes('application/json') && !contentType.includes('octet-stream');

      // If the proxy endpoint returned an HTML error page (e.g. 404 "The page could not be found" or 502/503),
      // automatically failover directly to the upstream Supabase URL!
      if ((!res.ok || isHtmlOrText) && url.includes('/api/supabase')) {
        const directBase = upstreamTargetUrl || getTargetUpstreamUrl();
        if (directBase && !directBase.includes('/api/supabase')) {
          const directUrl = url.replace(/https?:\/\/[^/]+\/api\/supabase/, directBase);
          console.warn(`[Supabase Proxy Failover] Proxy returned ${res.status} (${contentType}). Retrying direct URL: ${directUrl}`);
          try {
            const directRes = await fetch(directUrl, init);
            return directRes;
          } catch (failoverErr) {
            console.warn('[Supabase Direct Failover error]', failoverErr);
          }
        }
      }

      // If response is still HTML/text and not successful, return a sanitized JSON response
      // so @supabase/auth-js res.json() will NEVER crash with "Unexpected token 'T', The page c... is not valid JSON"
      if (isHtmlOrText && !res.ok) {
        const rawText = await res.text().catch(() => '');
        const cleanMsg = rawText.includes('The page') || rawText.includes('<!doctype')
          ? 'خطا در ارتباط با سرور احراز هویت. در حال بازیابی اتصال...'
          : rawText.substring(0, 160);

        const syntheticErrorJson = {
          error: res.statusText || 'Auth Gateway Error',
          message: cleanMsg,
          error_description: cleanMsg,
          statusCode: res.status,
        };

        return new Response(JSON.stringify(syntheticErrorJson), {
          status: res.status,
          headers: {
            'content-type': 'application/json',
          },
        });
      }

      return res;
    } catch (networkErr: any) {
      // If network failed on proxy, attempt direct upstream
      if (url.includes('/api/supabase')) {
        const directBase = upstreamTargetUrl || getTargetUpstreamUrl();
        if (directBase && !directBase.includes('/api/supabase')) {
          const directUrl = url.replace(/https?:\/\/[^/]+\/api\/supabase/, directBase);
          try {
            return await fetch(directUrl, init);
          } catch {}
        }
      }

      // Return synthetic JSON response on network drop
      const syntheticNetworkError = {
        error: 'NetworkError',
        message: 'خطا در برقراری ارتباط با سامانه ورود و ثبت‌نام. لطفاً مجدداً تلاش فرمایید.',
        error_description: networkErr.message || 'Network connection failed',
      };
      return new Response(JSON.stringify(syntheticNetworkError), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    }
  };
}

/**
 * Initializes and caches the Supabase Client with built-in reverse proxy routing
 * and automatic failover protection.
 */
export function initSupabaseClient(url: string, anonKey: string, persist = true): SupabaseClient | null {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    return null;
  }

  try {
    const { clientUrl, upstreamUrl } = resolveSupabaseUrl(cleanUrl);
    const targetUpstream = upstreamUrl || cleanUrl;
    const storageKey = getSupabaseStorageKey(targetUpstream);

    // Prepare global headers to pass upstream target URL to Express proxy
    const globalHeaders: Record<string, string> = {
      'x-client-info': 'diginoron-trade-platform/1.0',
    };
    if (targetUpstream && !targetUpstream.includes('/api/supabase')) {
      globalHeaders['x-supabase-upstream-url'] = targetUpstream;
    }

    supabaseClient = createClient(clientUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey,
      },
      global: {
        headers: globalHeaders,
        fetch: createSafeProxyFetch(targetUpstream),
      },
    });

    if (persist) {
      try {
        localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
        localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
      } catch {
        // ignore
      }
    }

    return supabaseClient;
  } catch (error) {
    console.warn('[Supabase] Failed to initialize client:', error);
    return null;
  }
}

/**
 * Lazy initialization of the Supabase client for browser/client-side usage.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { url, anonKey } = getSupabaseCredentials();

  if (url && anonKey) {
    return initSupabaseClient(url, anonKey, false);
  }

  return null;
}

/**
 * Checks whether Supabase is configured on the client side
 */
export function isSupabaseConfigured(): boolean {
  if (supabaseClient) return true;
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey);
}

/**
 * Safely discovers Supabase config from the backend /api/supabase/config
 * with content-type verification to prevent SyntaxError on non-JSON HTML error pages.
 */
export async function autoDiscoverSupabaseConfig(): Promise<SupabaseClient | null> {
  const current = getSupabaseClient();
  if (current) {
    return current;
  }

  try {
    const res = await fetch('/api/supabase/config');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.supabaseUrl && data.supabaseAnonKey) {
        return initSupabaseClient(data.supabaseUrl, data.supabaseAnonKey, true);
      }
    }
  } catch (e) {
    console.debug('[Supabase auto-discovery] Backend route /api/supabase/config not reachable.');
  }

  try {
    const res = await fetch('/supabase/config');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.supabaseUrl && data.supabaseAnonKey) {
        return initSupabaseClient(data.supabaseUrl, data.supabaseAnonKey, true);
      }
    }
  } catch {
    // fallback
  }

  return getSupabaseClient();
}

/**
 * Clear stored client credentials (useful for reset)
 */
export function clearSupabaseCredentials() {
  supabaseClient = null;
  try {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
  } catch {
    // ignore
  }
}

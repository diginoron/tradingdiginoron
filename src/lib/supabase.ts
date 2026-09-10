import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

const STORAGE_URL_KEY = 'DIGINORON_SUPABASE_URL';
const STORAGE_KEY_KEY = 'DIGINORON_SUPABASE_ANON_KEY';

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
 * Initializes and caches the Supabase Client
 */
export function initSupabaseClient(url: string, anonKey: string, persist = true): SupabaseClient | null {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    return null;
  }

  try {
    supabaseClient = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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
 * Automatically tries to discover Supabase config from the backend /api/supabase/config
 */
export async function autoDiscoverSupabaseConfig(): Promise<SupabaseClient | null> {
  const current = getSupabaseClient();
  if (current) {
    return current;
  }

  try {
    const res = await fetch('/api/supabase/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        return initSupabaseClient(data.supabaseUrl, data.supabaseAnonKey, true);
      }
    }
  } catch (e) {
    console.debug('[Supabase auto-discovery] Backend route not reachable, checking fallback...');
  }

  try {
    const res = await fetch('/supabase/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
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

/**
 * Production API client configuration for Janta +2 High School - Khalari
 * 
 * Ensures seamless, persistent connectivity across:
 * 1. AI Studio Local Builder Preview
 * 2. Public Cloud Run deployed URL
 * 3. Public GitHub Pages deployed URL
 * 4. External mobile devices & computers on different internet networks
 */

import { UserProfile } from './types';

// Default production deployed backend URL for this applet
export const DEFAULT_PRODUCTION_BACKEND =
  'https://ais-dev-wlf64tug2tdgfzlwqwnakm-952150739875.asia-southeast1.run.app';

/**
 * Returns the effective backend root URL for API requests.
 */
export function getBackendOrigin(): string {
  // If running server-side (Node.js runtime)
  if (typeof window === 'undefined') {
    return (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      DEFAULT_PRODUCTION_BACKEND
    ).replace(/\/$/, '');
  }

  // If running client-side in the browser:
  const configured = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ''
  ).trim().replace(/\/$/, '');

  const hostname = window.location.hostname.toLowerCase();

  // If hosted on GitHub Pages or file: protocol, we MUST target the real deployed Cloud Run backend
  if (hostname.endsWith('github.io') || window.location.protocol === 'file:') {
    return configured || DEFAULT_PRODUCTION_BACKEND;
  }

  // If on local preview or fullstack server (Cloud Run / custom domain), use relative origin
  return '';
}

/**
 * Resolves a full API URL given a relative path like '/api/auth/login'
 */
export function resolveApiUrl(path: string, forceAbsoluteBackend = false): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

  if (forceAbsoluteBackend) {
    const backend =
      (process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        DEFAULT_PRODUCTION_BACKEND).replace(/\/$/, '');
    return `${backend}${cleanPath}`;
  }

  const backendOrigin = getBackendOrigin();
  if (backendOrigin) {
    return `${backendOrigin}${cleanPath}`;
  }

  // Same origin: append basePath if configured
  return `${basePath}${cleanPath}`;
}

/**
 * Storage helpers for persistent cross-device session
 */
export const AUTH_KEYS = {
  USER: 'janta_school_user',
  TOKEN: 'janta_school_token',
  CLASS: 'janta_school_class',
  LANG: 'janta_school_lang',
  ADMIN: 'janta_school_admin',
};

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(AUTH_KEYS.TOKEN);
  } catch {
    return null;
  }
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(user: UserProfile, token?: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    if (token) {
      localStorage.setItem(AUTH_KEYS.TOKEN, token);
    }
    if (user.selectedClass) {
      localStorage.setItem(AUTH_KEYS.CLASS, user.selectedClass);
    }
  } catch {
    // ignore localStorage storage error
  }
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_KEYS.USER);
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.ADMIN);
  } catch {}
}

/**
 * Safe, robust API fetch wrapper with:
 * - Credentials & CORS inclusion
 * - Authorization Bearer token header
 * - X-User-Id header
 * - Automatic fallback from relative to absolute production backend if 404 occurs
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ res: Response; data: any }> {
  const token = getStoredAuthToken();
  const storedUser = getStoredUser();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (storedUser?.id) {
    headers['X-User-Id'] = storedUser.id;
  }

  const primaryUrl = resolveApiUrl(path, false);

  let res: Response;
  let triedFallback = false;

  try {
    res = await fetch(primaryUrl, {
      ...options,
      headers,
      credentials: 'include',
    });

    // If relative endpoint gave 404 and we didn't use absolute backend yet, try absolute backend
    if (res.status === 404 && !primaryUrl.startsWith('http')) {
      const fallbackUrl = resolveApiUrl(path, true);
      triedFallback = true;
      res = await fetch(fallbackUrl, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  } catch (err: any) {
    // If primary network fetch failed (e.g., CORS or unreachable relative path)
    if (!primaryUrl.startsWith('http')) {
      const fallbackUrl = resolveApiUrl(path, true);
      try {
        res = await fetch(fallbackUrl, {
          ...options,
          headers,
          credentials: 'include',
        });
        triedFallback = true;
      } catch (fallbackErr: any) {
        throw new Error(formatNetworkError(fallbackErr, fallbackUrl));
      }
    } else {
      throw new Error(formatNetworkError(err, primaryUrl));
    }
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response
  }

  return { res, data };
}

function formatNetworkError(err: any, url: string): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Internet connection problem. Please check your connection and try again.';
  }

  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    return `Production API unreachable (${parsed.host}). Please verify internet connection or backend server status.`;
  } catch {
    return 'Production API unreachable. Please verify network connection or backend server status.';
  }
}

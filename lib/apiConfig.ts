/**
 * Production API client configuration for Janta +2 High School - Khalari
 * 
 * Ensures seamless, persistent connectivity across:
 * 1. AI Studio Fullstack Server / Cloud Run
 * 2. Production published custom domains
 * 3. Mobile devices and desktop browsers across all networks
 */

import { UserProfile } from './types';

/**
 * Returns the effective backend root URL for API requests.
 * Uses relative origin ('') by default so requests stay on the same server,
 * avoiding CORS, redirect loops, and hardcoded development URLs.
 */
export function getBackendOrigin(): string {
  // If running client-side in the browser:
  if (typeof window !== 'undefined') {
    const configured = (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      ''
    )
      .trim()
      .replace(/\/$/, '');

    // Disallow preview-only, development, and loopback URLs in production
    const isPreviewOrDev =
      configured.includes('localhost') ||
      configured.includes('127.0.0.1') ||
      configured.includes('ais-dev-');

    if (configured && !isPreviewOrDev) {
      return configured;
    }

    // Default to relative origin (same server where Next.js runs)
    return '';
  }

  // Server-side (Node.js runtime)
  const serverConfigured = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''
  )
    .trim()
    .replace(/\/$/, '');

  if (
    serverConfigured &&
    !serverConfigured.includes('localhost') &&
    !serverConfigured.includes('127.0.0.1') &&
    !serverConfigured.includes('ais-dev-')
  ) {
    return serverConfigured;
  }

  return '';
}

/**
 * Resolves a full API URL given a relative path like '/api/auth/login'
 */
export function resolveApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

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
    // ignore storage error
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
 * - Unified error reporting without leaking development URLs
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ res: Response; data: any }> {
  const token = getStoredAuthToken();
  const storedUser = getStoredUser();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
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

  const primaryUrl = resolveApiUrl(path);

  let res: Response;
  try {
    res = await fetch(primaryUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (err: any) {
    throw new Error(formatNetworkError(err, primaryUrl));
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

  return 'Unable to reach the school login server. Please verify your connection or try again in a few moments.';
}

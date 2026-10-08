import { NextRequest, NextResponse } from 'next/server';

/**
 * Production CORS Configuration for Janta +2 High School - Khalari
 * Supports:
 * - Preview environment inside Google AI Studio / Cloud Run
 * - Production published domains (Cloud Run, custom school domains, GitHub Pages)
 * - Mobile devices accessing via public URLs
 */

export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return true; // Same-origin, direct server-to-server, or native app requests
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    // 1. Check custom configured allowed origins from environment
    const allowedEnv = (
      process.env.ALLOWED_ORIGINS ||
      process.env.CORS_ALLOWED_ORIGINS ||
      ''
    )
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (allowedEnv.includes(origin.toLowerCase()) || allowedEnv.includes(hostname)) {
      return true;
    }

    // 2. Production APP_URL from Cloud Run environment
    if (process.env.APP_URL) {
      try {
        const appUrl = new URL(process.env.APP_URL);
        if (
          appUrl.origin.toLowerCase() === origin.toLowerCase() ||
          appUrl.hostname.toLowerCase() === hostname
        ) {
          return true;
        }
      } catch {}
    }

    // 3. Google AI Studio & preview frame origins
    if (
      hostname.endsWith('.google.com') ||
      hostname.endsWith('.google.dev') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    ) {
      return true;
    }

    // 4. Cloud Run deployed service domains (*.run.app)
    if (hostname.endsWith('.run.app')) {
      return true;
    }

    // 5. GitHub Pages deployed public domains (*.github.io)
    if (hostname.endsWith('.github.io')) {
      return true;
    }

    // 6. Firebase Hosting domains
    if (hostname.endsWith('.web.app') || hostname.endsWith('.firebaseapp.com')) {
      return true;
    }

    // 7. Any HTTPS origin accessing the public school portal
    if (url.protocol === 'https:') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function getCorsHeaders(origin: string | null | undefined): Record<string, string> {
  const allowed = isAllowedOrigin(origin);
  // In CORS with credentials, wildcard '*' is rejected by browsers.
  // We must return the exact allowed origin or fall back to APP_URL.
  const allowOrigin =
    allowed && origin
      ? origin
      : process.env.APP_URL || '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With, X-User-Id, Cookie, Accept, Range, x-forwarded-proto',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function handleCorsOptions(req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

export function applyCors<T extends NextResponse>(res: T, req?: NextRequest): T {
  const origin = req?.headers.get('origin') || null;
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}

import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, isAllowedOrigin } from './lib/cors';

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');

  // Handle CORS OPTIONS preflight request immediately
  if (req.method === 'OPTIONS') {
    const headers = getCorsHeaders(origin);
    return new NextResponse(null, { status: 204, headers });
  }

  // Allow standard requests and attach CORS headers to the response
  const response = NextResponse.next();

  if (origin && isAllowedOrigin(origin)) {
    const corsHeaders = getCorsHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, val]) => {
      response.headers.set(key, val);
    });
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};

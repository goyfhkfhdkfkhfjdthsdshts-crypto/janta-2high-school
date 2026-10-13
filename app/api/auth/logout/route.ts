import { NextRequest, NextResponse } from 'next/server';
import { applyCors, handleCorsOptions } from '@/lib/cors';
import { ADMIN_PANEL_COOKIE } from '@/lib/session';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Session securely terminated.' });
  response.cookies.delete('school_session_token');
  response.cookies.delete('school_user_id');
  response.cookies.delete('school_user_email');
  // Also drop elevated management-panel access on sign out.
  response.cookies.delete(ADMIN_PANEL_COOKIE);
  return applyCors(response, req);
}

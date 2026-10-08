import { NextRequest, NextResponse } from 'next/server';
import { applyCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Session securely terminated.' });
  response.cookies.delete('school_session_token');
  response.cookies.delete('school_user_id');
  response.cookies.delete('school_user_email');
  return applyCors(response, req);
}

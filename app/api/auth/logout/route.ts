import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Session securely terminated.' });
  response.cookies.delete('school_session_token');
  response.cookies.delete('school_user_id');
  response.cookies.delete('school_user_email');
  return response;
}

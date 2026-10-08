import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applyCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      const errRes = NextResponse.json(
        { success: false, message: 'Invalid request payload.' },
        { status: 400 }
      );
      return applyCors(errRes, req);
    }

    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      const errRes = NextResponse.json(
        { success: false, message: 'All fields (User ID, Current Password, New Password) are required.' },
        { status: 400 }
      );
      return applyCors(errRes, req);
    }

    if (newPassword.length < 4) {
      const errRes = NextResponse.json(
        { success: false, message: 'New password must be at least 4 characters long.' },
        { status: 400 }
      );
      return applyCors(errRes, req);
    }

    const result = db.changeUserPassword(userId, currentPassword, newPassword);

    if (!result.success) {
      const errRes = NextResponse.json({ success: false, message: result.message }, { status: 400 });
      return applyCors(errRes, req);
    }

    const okRes = NextResponse.json({ success: true, message: result.message });
    return applyCors(okRes, req);
  } catch (error) {
    console.error('Password change error:', error);
    const errRes = NextResponse.json(
      { success: false, message: 'Unable to change password. Please try again.' },
      { status: 500 }
    );
    return applyCors(errRes, req);
  }
}

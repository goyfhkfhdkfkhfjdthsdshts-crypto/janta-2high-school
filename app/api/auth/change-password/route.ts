import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields (User ID, Current Password, New Password) are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    const result = db.changeUserPassword(userId, currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to change password. Please try again.' },
      { status: 500 }
    );
  }
}

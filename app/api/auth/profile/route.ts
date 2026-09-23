import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || req.cookies.get('school_user_email')?.value;

    if (!email) {
      return NextResponse.json({ success: false, message: 'No active session' }, { status: 401 });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, selectedClass, rollNo, stream, phone } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
    }

    const existing = db.findUserByEmail(email);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const updated = db.upsertUser({
      ...existing,
      selectedClass: selectedClass || existing.selectedClass,
      rollNo: rollNo !== undefined ? rollNo : existing.rollNo,
      stream: stream !== undefined ? stream : existing.stream,
      phone: phone !== undefined ? phone : existing.phone,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

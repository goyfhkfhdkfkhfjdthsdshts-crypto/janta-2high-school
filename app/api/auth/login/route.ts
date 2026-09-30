import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = (body.role || 'student') as UserRole;
    const loginId = (body.loginId || body.studentId || body.rollNo || body.email || '').trim();
    const password = (body.password || '').trim();
    const selectedClass = body.selectedClass;

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, message: 'Please enter both Login ID and Password.' },
        { status: 400 }
      );
    }

    const authResult = db.authenticateUser(role, loginId, password, selectedClass);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.message || 'Invalid Login ID or Password.' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const response = NextResponse.json({
      success: true,
      user,
      message: `Welcome ${user.name}! Login successful.`,
    });

    // Set secure persistent session token (30 days)
    const sessionToken = Buffer.from(
      JSON.stringify({ id: user.id, role: user.role, time: Date.now() })
    ).toString('base64');

    response.cookies.set('school_session_token', sessionToken, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    response.cookies.set('school_user_id', user.id, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    if (user.email) {
      response.cookies.set('school_user_email', user.email, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'School server is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

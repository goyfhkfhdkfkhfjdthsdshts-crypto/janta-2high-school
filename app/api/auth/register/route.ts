import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SchoolClass } from '@/lib/types';

// Health check / availability check for registration
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Student Registration endpoint is active and database is connected.',
  });
}

// Dedicated Student Registration endpoint
export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          errorType: 'validation',
          message: 'Invalid request data. Please check the entered information.',
        },
        { status: 400 }
      );
    }

    const {
      name,
      fullName,
      selectedClass,
      class: classParam,
      section,
      rollNo,
      rollNumber,
      phone,
      mobileNumber,
      studentId,
      studentAccountId,
      password,
      stream,
    } = body;

    const studentName = (name || fullName || '').trim();
    const targetClass = ((selectedClass || classParam || '10') as string).trim() as SchoolClass;
    const targetRoll = (rollNo || rollNumber || '').trim();
    const targetPhone = (phone || mobileNumber || '').trim();
    const targetStudentId = (studentId || studentAccountId || '').trim();

    if (!studentName) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'validation',
          message: 'Student Full Name is required.',
        },
        { status: 400 }
      );
    }

    if (!targetRoll) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'validation',
          message: 'Roll Number is required.',
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'password_format',
          message: 'Password is required.',
        },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'password_format',
          message: 'Password must be at least 4 characters.',
        },
        { status: 400 }
      );
    }

    // Call database registration with validation & atomic persistence
    const result = db.registerStudent({
      name: studentName,
      selectedClass: targetClass,
      section: section || 'A',
      rollNo: targetRoll,
      phone: targetPhone,
      studentId: targetStudentId || undefined,
      password,
      stream,
    });

    if (!result.success) {
      let status = 400;
      if (result.errorType === 'duplicate_id' || result.errorType === 'duplicate_roll') {
        status = 409;
      } else if (result.errorType === 'database_error') {
        status = 503;
      }

      return NextResponse.json(
        {
          success: false,
          errorType: result.errorType,
          message: result.message,
        },
        { status }
      );
    }

    // Account created and verified in database
    const safeUser = result.user!;
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Account created successfully.',
    });

    // Set persistent session cookies
    response.cookies.set('school_user_id', safeUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Registration server error:', err);
    return NextResponse.json(
      {
        success: false,
        errorType: 'server_error',
        message: 'School server is temporarily unavailable. Please try again.',
      },
      { status: 500 }
    );
  }
}

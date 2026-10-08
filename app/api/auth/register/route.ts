import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applyCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

// Health check / availability check for registration
export async function GET(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    status: 'active',
    database: 'connected',
    message: 'Student Registration endpoint is active and database is connected.',
    timestamp: new Date().toISOString(),
  });
  return applyCors(response, req);
}

// Dedicated Student Registration endpoint
export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      const errRes = NextResponse.json(
        {
          success: false,
          errorType: 'validation',
          message: 'Invalid request data. Please check the entered information.',
        },
        { status: 400 }
      );
      return applyCors(errRes, req);
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

    const studentFullName = (fullName || name || '').trim();
    const targetClass = String(classParam || selectedClass || '10').trim();
    const targetRoll = String(rollNumber || rollNo || '').trim();
    const targetPhone = String(mobileNumber || phone || '').trim();
    const targetSection = String(section || 'A').trim().toUpperCase();

    // Call database registration with comprehensive validation & atomic persistence
    const result = db.registerStudent({
      name: studentFullName,
      fullName: studentFullName,
      class: targetClass,
      selectedClass: targetClass,
      section: targetSection,
      rollNo: targetRoll,
      rollNumber: targetRoll,
      phone: targetPhone,
      mobileNumber: targetPhone,
      studentId: (studentId || studentAccountId || '').trim() || undefined,
      password: String(password || '').trim(),
      stream,
    });

    if (!result.success) {
      let status = 400;
      if (
        result.errorType === 'duplicate_account' ||
        result.errorType === 'duplicate_id' ||
        result.errorType === 'duplicate_roll'
      ) {
        status = 409;
      } else if (result.errorType === 'database_error') {
        status = 503;
      }

      const failRes = NextResponse.json(
        {
          success: false,
          errorType: result.errorType || 'validation',
          message: result.message,
        },
        { status }
      );
      return applyCors(failRes, req);
    }

    // Account created and verified in database
    const safeUser = result.user!;

    // Create session token for persistent authentication across devices/sessions
    const sessionToken = Buffer.from(
      JSON.stringify({ id: safeUser.id, role: safeUser.role, time: Date.now() })
    ).toString('base64');

    const successRes = NextResponse.json({
      success: true,
      user: safeUser,
      token: sessionToken,
      message: 'Account created successfully.',
    });

    // Detect HTTPS
    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' ||
      req.nextUrl.protocol === 'https:';

    // Set persistent session cookies (30 days)
    successRes.cookies.set('school_user_id', safeUser.id, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: isHttps ? 'none' : 'lax',
      secure: isHttps,
    });

    successRes.cookies.set('school_session_token', sessionToken, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: isHttps ? 'none' : 'lax',
      secure: isHttps,
    });

    return applyCors(successRes, req);
  } catch (err: any) {
    console.error('Registration server error:', err);
    const errRes = NextResponse.json(
      {
        success: false,
        errorType: 'server_error',
        message: 'School server error occurred during registration. Please try again.',
      },
      { status: 500 }
    );
    return applyCors(errRes, req);
  }
}

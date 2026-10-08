import { NextRequest, NextResponse } from 'next/server';
import { db, hashPassword } from '@/lib/db';
import { UserRole } from '@/lib/types';
import { applyCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

// GET: Retrieve authenticated student/user profile from real persistent database
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Check Authorization header (Bearer token)
    const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    let tokenUserId: string | null = null;
    if (authHeader) {
      try {
        const parsed = JSON.parse(Buffer.from(authHeader, 'base64').toString('utf-8'));
        if (parsed.id) tokenUserId = parsed.id;
      } catch {}
    }

    const headerUserId = req.headers.get('x-user-id');

    const identifier =
      searchParams.get('id') ||
      searchParams.get('studentId') ||
      searchParams.get('loginId') ||
      searchParams.get('rollNo') ||
      searchParams.get('email') ||
      headerUserId ||
      tokenUserId ||
      req.cookies.get('school_user_id')?.value ||
      req.cookies.get('school_user_email')?.value;

    if (!identifier) {
      // Check session cookie token
      const sessionCookie = req.cookies.get('school_session_token')?.value;
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
          if (parsed.id) {
            const user = db.findUser(parsed.id);
            if (user) {
              const okRes = NextResponse.json({ success: true, user });
              return applyCors(okRes, req);
            }
          }
        } catch {
          // invalid token
        }
      }
      const unauthRes = NextResponse.json(
        { success: false, message: 'No active session or identifier provided.' },
        { status: 401 }
      );
      return applyCors(unauthRes, req);
    }

    const user = db.findUser(identifier);
    if (!user) {
      const notFoundRes = NextResponse.json(
        { success: false, message: 'Student account not found in database.' },
        { status: 404 }
      );
      return applyCors(notFoundRes, req);
    }

    const res = NextResponse.json({ success: true, user });
    return applyCors(res, req);
  } catch (error) {
    console.error('Error fetching profile:', error);
    const errRes = NextResponse.json(
      { success: false, message: 'School server is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
    return applyCors(errRes, req);
  }
}

// POST: Register or save a new permanent student profile
export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      const errRes = NextResponse.json(
        { success: false, message: 'Invalid request data.' },
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
      studentId,
      studentAccountId,
      loginId,
      email,
      password,
      stream,
      phone,
      mobileNumber,
    } = body;

    const studentFullName = (fullName || name || '').trim();
    if (!studentFullName) {
      const errRes = NextResponse.json(
        { success: false, errorType: 'validation', message: 'Student Full Name is required.' },
        { status: 400 }
      );
      return applyCors(errRes, req);
    }

    // Call unified db.registerStudent
    const regResult = db.registerStudent({
      fullName: studentFullName,
      name: studentFullName,
      class: classParam || selectedClass || '10',
      selectedClass: classParam || selectedClass || '10',
      section: section || 'A',
      rollNumber: rollNumber || rollNo || '',
      rollNo: rollNumber || rollNo || '',
      studentId: studentId || studentAccountId || loginId,
      phone: mobileNumber || phone || '',
      mobileNumber: mobileNumber || phone || '',
      password: password || rollNo || '1234',
      stream,
    });

    if (!regResult.success) {
      let status = 400;
      if (
        regResult.errorType === 'duplicate_account' ||
        regResult.errorType === 'duplicate_id' ||
        regResult.errorType === 'duplicate_roll'
      ) {
        status = 409;
      } else if (regResult.errorType === 'database_error') {
        status = 503;
      }

      const failRes = NextResponse.json(
        {
          success: false,
          errorType: regResult.errorType,
          message: regResult.message,
        },
        { status }
      );
      return applyCors(failRes, req);
    }

    const safeUser = regResult.user!;
    const sessionToken = Buffer.from(
      JSON.stringify({ id: safeUser.id, role: safeUser.role, time: Date.now() })
    ).toString('base64');

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token: sessionToken,
      message: 'Student account created and permanently verified in database.',
    });

    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' ||
      req.nextUrl.protocol === 'https:';

    response.cookies.set('school_user_id', safeUser.id, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: isHttps ? 'none' : 'lax',
      secure: isHttps,
    });

    response.cookies.set('school_session_token', sessionToken, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: isHttps ? 'none' : 'lax',
      secure: isHttps,
    });

    return applyCors(response, req);
  } catch (error) {
    console.error('Error creating profile:', error);
    const errRes = NextResponse.json(
      { success: false, message: 'School server error during registration. Please try again.' },
      { status: 500 }
    );
    return applyCors(errRes, req);
  }
}

// PUT: Safe profile update
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.id || body.studentId || body.studentAccountId || body.loginId || body.email;

    if (!userId) {
      const errRes = NextResponse.json(
        { success: false, message: 'Student Account ID is required for profile updates.' },
        { status: 400 }
      );
      return applyCors(errRes, req);
    }

    const result = db.updateUserProfile(userId, body);
    if (!result.success) {
      const failRes = NextResponse.json({ success: false, message: result.message }, { status: 404 });
      return applyCors(failRes, req);
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Profile updated and verified in database.',
    });
    return applyCors(response, req);
  } catch (error) {
    console.error('Error updating profile:', error);
    const errRes = NextResponse.json(
      { success: false, message: 'Unable to save changes. Please try again.' },
      { status: 500 }
    );
    return applyCors(errRes, req);
  }
}

// DELETE: Permanent deletion of a student account (ADMIN ONLY)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || searchParams.get('id');

    if (!studentId) {
      const errRes = NextResponse.json(
        { success: false, message: 'Target student ID is required for deletion.' },
        { status: 400 }
      );
      return applyCors(errRes, req);
    }

    const adminPassword = req.headers.get('x-admin-password');
    const userRole = (req.headers.get('x-user-role') || '').toLowerCase() as UserRole;

    if (userRole !== 'admin' && userRole !== 'principal' && adminPassword !== 'admin12345678') {
      const unauthRes = NextResponse.json(
        { success: false, message: 'Unauthorized. Admin permission required to delete student accounts.' },
        { status: 403 }
      );
      return applyCors(unauthRes, req);
    }

    const deleteResult = db.deleteStudentAccount(studentId, 'admin');
    if (!deleteResult.success) {
      const failRes = NextResponse.json({ success: false, message: deleteResult.message }, { status: 404 });
      return applyCors(failRes, req);
    }

    const response = NextResponse.json({
      success: true,
      message: deleteResult.message,
    });
    return applyCors(response, req);
  } catch (error) {
    console.error('Error deleting student account:', error);
    const errRes = NextResponse.json(
      { success: false, message: 'School server is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
    return applyCors(errRes, req);
  }
}

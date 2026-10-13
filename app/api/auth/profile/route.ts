import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applyCors, handleCorsOptions } from '@/lib/cors';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  getActor,
  hasAdminPanelAccess,
  isStaffRole,
  sessionCookieOptions,
} from '@/lib/session';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

/** Never send password material back to the browser. */
function withoutPassword<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _hash, ...safeUser } = user;
  return safeUser;
}

// GET: Retrieve a profile. The caller must be signed in, and may only read their
// own record unless they are staff.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const actor = getActor(req);

    if (!actor) {
      const unauthRes = NextResponse.json(
        { success: false, message: 'Please sign in to view profile records.' },
        { status: 401 }
      );
      return applyCors(unauthRes, req);
    }

    const identifier =
      searchParams.get('id') ||
      searchParams.get('studentId') ||
      searchParams.get('loginId') ||
      searchParams.get('rollNo') ||
      searchParams.get('email') ||
      req.headers.get('x-user-id') ||
      req.cookies.get('school_user_id')?.value ||
      req.cookies.get('school_user_email')?.value ||
      actor.id;

    const user = db.findUser(identifier);
    if (!user) {
      const notFoundRes = NextResponse.json(
        { success: false, message: 'Student account not found in database.' },
        { status: 404 }
      );
      return applyCors(notFoundRes, req);
    }

    if (user.id !== actor.id && !isStaffRole(actor.role)) {
      const forbiddenRes = NextResponse.json(
        { success: false, message: 'You can only view your own profile.' },
        { status: 403 }
      );
      return applyCors(forbiddenRes, req);
    }

    const res = NextResponse.json({ success: true, user: withoutPassword(user) });
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

// POST: Register or save a new permanent student profile (public sign-up).
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

    const safeUser = withoutPassword(regResult.user!);
    const sessionToken = createSessionToken(safeUser.id, safeUser.role);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token: sessionToken,
      message: 'Student account created and permanently verified in database.',
    });

    const options = sessionCookieOptions(req, SESSION_MAX_AGE_SECONDS);
    response.cookies.set('school_user_id', safeUser.id, options);
    response.cookies.set(SESSION_COOKIE, sessionToken, options);

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

// PUT: Safe profile update. Callers may update their own profile; staff may
// update any profile.
export async function PUT(req: NextRequest) {
  try {
    const actor = getActor(req);
    if (!actor) {
      const unauthRes = NextResponse.json(
        { success: false, message: 'Please sign in to update profile records.' },
        { status: 401 }
      );
      return applyCors(unauthRes, req);
    }

    const body = await req.json();
    const userId = body.id || body.studentId || body.studentAccountId || body.loginId || body.email;

    if (!userId) {
      const errRes = NextResponse.json(
        { success: false, message: 'Student Account ID is required for profile updates.' },
        { status: 400 }
      );
      return applyCors(errRes, req);
    }

    const target = db.findUser(userId);
    if (!target) {
      const failRes = NextResponse.json(
        { success: false, message: 'Student account not found in database.' },
        { status: 404 }
      );
      return applyCors(failRes, req);
    }

    if (target.id !== actor.id && !isStaffRole(actor.role)) {
      const forbiddenRes = NextResponse.json(
        { success: false, message: 'You can only update your own profile.' },
        { status: 403 }
      );
      return applyCors(forbiddenRes, req);
    }

    const result = db.updateUserProfile(userId, body);
    if (!result.success) {
      const failRes = NextResponse.json({ success: false, message: result.message }, { status: 404 });
      return applyCors(failRes, req);
    }

    const response = NextResponse.json({
      success: true,
      user: withoutPassword(result.user!),
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

// DELETE: Permanent deletion of a student account (school management panel only).
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

    // Authority comes from a signed-in Principal/Admin session or from the school
    // management password verified server-side - never from a request header.
    if (!hasAdminPanelAccess(req)) {
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

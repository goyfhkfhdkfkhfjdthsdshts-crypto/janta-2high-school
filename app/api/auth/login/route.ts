import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';
import { applyCors, handleCorsOptions } from '@/lib/cors';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  sessionCookieOptions,
} from '@/lib/session';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

/**
 * Attaches the signed session cookie (and the non-sensitive identity cookies the
 * server-side profile lookup reads) to a successful login response.
 */
function createLoginResponse(req: NextRequest, safeUser: any, message: string) {
  const sessionToken = createSessionToken(safeUser.id, safeUser.role);

  const response = NextResponse.json({
    success: true,
    user: safeUser,
    token: sessionToken,
    message,
  });

  const options = sessionCookieOptions(req, SESSION_MAX_AGE_SECONDS);
  response.cookies.set(SESSION_COOKIE, sessionToken, options);
  response.cookies.set('school_user_id', safeUser.id, options);
  if (safeUser.email) {
    response.cookies.set('school_user_email', safeUser.email, options);
  }

  return response;
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

    const role = (body.role || 'student') as UserRole;
    const loginId = (
      body.rollNo ||
      body.rollNumber ||
      body.studentId ||
      body.loginId ||
      body.email ||
      ''
    ).trim();
    const password = (body.password || '').trim();
    const selectedClass = (body.selectedClass || body.class || '').toString().trim();

    // Student Authentication: Requires Roll Number + Class
    if (role === 'student') {
      if (!loginId || !selectedClass) {
        const errRes = NextResponse.json(
          { success: false, message: 'Please enter Roll Number and select Class.' },
          { status: 400 }
        );
        return applyCors(errRes, req);
      }

      const authResult = db.authenticateUser('student', loginId, undefined, selectedClass);

      if (!authResult.success || !authResult.user) {
        const errRes = NextResponse.json(
          { success: false, message: 'Roll Number or Class is incorrect.' },
          { status: 401 }
        );
        return applyCors(errRes, req);
      }

      const { passwordHash: _hash, ...safeUser } = authResult.user;

      return applyCors(
        createLoginResponse(req, safeUser, `Welcome ${safeUser.name}! Login successful.`),
        req
      );
    }

    // Staff Authentication: Teacher, Principal, Admin (ID + Password)
    if (!loginId || !password) {
      const roleName = role.charAt(0).toUpperCase() + role.slice(1);
      const errRes = NextResponse.json(
        { success: false, message: `Please enter ${roleName} ID and Password.` },
        { status: 400 }
      );
      return applyCors(errRes, req);
    }

    const authResult = db.authenticateUser(role, loginId, password, selectedClass);

    if (!authResult.success || !authResult.user) {
      const roleName = role.charAt(0).toUpperCase() + role.slice(1);
      const errRes = NextResponse.json(
        { success: false, message: authResult.message || `Invalid ${roleName} ID or Password.` },
        { status: 401 }
      );
      return applyCors(errRes, req);
    }

    const { passwordHash: _hash, ...safeUser } = authResult.user;

    return applyCors(
      createLoginResponse(req, safeUser, `Welcome ${safeUser.name}! Login successful.`),
      req
    );
  } catch (error) {
    console.error('Login error:', error);
    const errRes = NextResponse.json(
      { success: false, message: 'School server error during login. Please try again.' },
      { status: 500 }
    );
    return applyCors(errRes, req);
  }
}

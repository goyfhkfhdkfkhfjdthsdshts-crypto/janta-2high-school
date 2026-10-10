import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';
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

      // Set secure persistent session token (30 days)
      const sessionToken = Buffer.from(
        JSON.stringify({ id: safeUser.id, role: safeUser.role, time: Date.now() })
      ).toString('base64');

      const response = NextResponse.json({
        success: true,
        user: safeUser,
        token: sessionToken,
        message: `Welcome ${safeUser.name}! Login successful.`,
      });

      const isHttps =
        req.headers.get('x-forwarded-proto') === 'https' ||
        req.nextUrl.protocol === 'https:';

      response.cookies.set('school_session_token', sessionToken, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: isHttps ? 'none' : 'lax',
        secure: isHttps,
      });

      response.cookies.set('school_user_id', safeUser.id, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: isHttps ? 'none' : 'lax',
        secure: isHttps,
      });

      if (safeUser.email) {
        response.cookies.set('school_user_email', safeUser.email, {
          path: '/',
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 30,
          sameSite: isHttps ? 'none' : 'lax',
          secure: isHttps,
        });
      }

      return applyCors(response, req);
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

    // Set secure persistent session token (30 days)
    const sessionToken = Buffer.from(
      JSON.stringify({ id: safeUser.id, role: safeUser.role, time: Date.now() })
    ).toString('base64');

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token: sessionToken,
      message: `Welcome ${safeUser.name}! Login successful.`,
    });

    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' ||
      req.nextUrl.protocol === 'https:';

    response.cookies.set('school_session_token', sessionToken, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: isHttps ? 'none' : 'lax',
      secure: isHttps,
    });

    response.cookies.set('school_user_id', safeUser.id, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: isHttps ? 'none' : 'lax',
      secure: isHttps,
    });

    if (safeUser.email) {
      response.cookies.set('school_user_email', safeUser.email, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: isHttps ? 'none' : 'lax',
        secure: isHttps,
      });
    }

    return applyCors(response, req);
  } catch (error) {
    console.error('Login error:', error);
    const errRes = NextResponse.json(
      { success: false, message: 'School server error during login. Please try again.' },
      { status: 500 }
    );
    return applyCors(errRes, req);
  }
}

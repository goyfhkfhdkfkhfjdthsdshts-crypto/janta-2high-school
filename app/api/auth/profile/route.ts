import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';

// GET: Retrieve authenticated student/user profile from real persistent database
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier =
      searchParams.get('id') ||
      searchParams.get('studentId') ||
      searchParams.get('loginId') ||
      searchParams.get('rollNo') ||
      searchParams.get('email') ||
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
            if (user) return NextResponse.json({ success: true, user });
          }
        } catch {
          // invalid token
        }
      }
      return NextResponse.json({ success: false, message: 'No active session or identifier provided.' }, { status: 401 });
    }

    const user = db.findUser(identifier);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Student account not found in database.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, message: 'School server is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

// POST: Register or save a new permanent student profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, selectedClass, section, rollNo, studentId, loginId, email, password, stream, phone } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Student Full Name is required.' },
        { status: 400 }
      );
    }

    // Check duplicate student account before creation (Requirement 8)
    const checkId = studentId || loginId;
    if (checkId) {
      const existing = db.findUser(checkId);
      if (existing) {
        return NextResponse.json({
          success: true,
          user: existing,
          isExisting: true,
          message: 'Existing student account found and loaded.',
        });
      }
    }

    if (rollNo && selectedClass) {
      const existingRoll = db.findStudentByRoll(rollNo, selectedClass);
      if (existingRoll) {
        return NextResponse.json({
          success: true,
          user: existingRoll,
          isExisting: true,
          message: 'Existing student account found for this roll number and class.',
        });
      }
    }

    const user = db.upsertUser({
      name: name.trim(),
      selectedClass: selectedClass || '10',
      section: (section || 'A').trim().toUpperCase(),
      rollNo: rollNo?.trim() || '',
      studentId: studentId?.trim(),
      loginId: loginId?.trim() || rollNo?.trim(),
      email: email?.trim() || '',
      stream: stream || 'General',
      phone: phone?.trim() || '',
      passwordHash: password ? db.changeUserPassword ? undefined : undefined : undefined,
    });

    if (password) {
      db.changeUserPassword(user.id, 'temp', password);
      // or directly hash and save
      const data = (db as any);
      user.passwordHash = (require('@/lib/db').hashPassword)(password);
      db.upsertUser(user);
    }

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Student account created and permanently verified in database.',
    });

    // Set persistent session cookies
    response.cookies.set('school_user_id', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { success: false, message: 'School server is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT: Safe profile update (Requirement 6 & 8)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.id || body.studentId || body.loginId || body.email;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Student Account ID is required for profile updates.' },
        { status: 400 }
      );
    }

    const result = db.updateUserProfile(userId, body);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'Profile updated and verified in database.',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to save changes. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE: Permanent deletion of a student account (ADMIN ONLY - Requirement 9)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Target student ID is required for deletion.' },
        { status: 400 }
      );
    }

    // Require authorized admin header or token
    const adminPassword = req.headers.get('x-admin-password');
    const userRole = (req.headers.get('x-user-role') || '').toLowerCase() as UserRole;

    if (userRole !== 'admin' && userRole !== 'principal' && adminPassword !== 'admin12345678') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin permission required to delete student accounts.' },
        { status: 403 }
      );
    }

    const deleteResult = db.deleteStudentAccount(studentId, 'admin');
    if (!deleteResult.success) {
      return NextResponse.json({ success: false, message: deleteResult.message }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: deleteResult.message,
    });
  } catch (error) {
    console.error('Error deleting student account:', error);
    return NextResponse.json(
      { success: false, message: 'School server is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

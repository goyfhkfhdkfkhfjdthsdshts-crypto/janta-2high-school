import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let email = body.email;
    let name = body.name;
    let picture = body.picture || '';

    // If Google credential JWT is provided from Google Identity Services button
    if (body.credential && (!email || !name)) {
      try {
        const parts = body.credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          email = payload.email || email;
          name = payload.name || payload.given_name || name;
          picture = payload.picture || picture;
        }
      } catch (err) {
        console.error('Error decoding Google JWT credential:', err);
      }
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Google email is required. Please retry.' },
        { status: 400 }
      );
    }

    // Default name fallback if only email is supplied
    if (!name) {
      name = email.split('@')[0].replace(/[._]/g, ' ');
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Upsert user in persistent database (returning users retrieve existing account)
    const user = db.upsertUser({
      email,
      name,
      picture,
      selectedClass: body.selectedClass || '10',
      role: 'student',
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Successfully logged in with Google Account',
    });

    // Set cookie for session persistence
    response.cookies.set('school_user_email', email, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error in Google Auth:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed. Please retry.' },
      { status: 500 }
    );
  }
}

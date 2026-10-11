import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    // The admin password is a platform secret (ADMIN_PASSWORD). No default password
    // is hardcoded here, so an unset secret can never be guessed or bypassed.
    const expectedPassword = process.env.ADMIN_PASSWORD || '';

    if (
      !expectedPassword ||
      !password ||
      typeof password !== 'string' ||
      password.trim() !== expectedPassword
    ) {
      // STRICT REQUIREMENT: Wrong password message must ONLY say: "Incorrect password. Please try again."
      return NextResponse.json(
        {
          success: false,
          message: 'Incorrect password. Please try again.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Access granted',
      role: 'admin',
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Incorrect password. Please try again.',
      },
      { status: 401 }
    );
  }
}

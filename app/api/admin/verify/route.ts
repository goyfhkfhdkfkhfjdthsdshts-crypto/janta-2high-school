import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.ADMIN_PASSWORD || 'JantaAdmin@2026';

    if (!password || typeof password !== 'string' || password.trim() !== expectedPassword) {
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

import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_PANEL_COOKIE,
  ADMIN_PANEL_MAX_AGE_SECONDS,
  createAdminPanelToken,
  safeEqual,
  sessionCookieOptions,
} from '@/lib/session';

/**
 * Verifies the school's management (admin panel) password, configured only
 * through the deployment secret ADMIN_PASSWORD. There is deliberately no
 * built-in fallback password: with no secret configured the panel stays locked.
 */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Administrator access is not configured on this server.',
        },
        { status: 503 }
      );
    }

    if (!password || typeof password !== 'string' || !safeEqual(password.trim(), expectedPassword)) {
      // STRICT REQUIREMENT: Wrong password message must ONLY say: "Incorrect password. Please try again."
      return NextResponse.json(
        {
          success: false,
          message: 'Incorrect password. Please try again.',
        },
        { status: 401 }
      );
    }

    // Grant server-verified management-panel access for this browser session.
    const response = NextResponse.json({
      success: true,
      message: 'Access granted',
      role: 'admin',
    });
    response.cookies.set(
      ADMIN_PANEL_COOKIE,
      createAdminPanelToken(),
      sessionCookieOptions(req, ADMIN_PANEL_MAX_AGE_SECONDS)
    );
    return response;
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

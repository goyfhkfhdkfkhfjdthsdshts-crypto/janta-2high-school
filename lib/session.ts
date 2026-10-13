/**
 * Server-side session & role verification for Janta +2 High School - Khalari.
 *
 * Session tokens are HMAC-SHA256 signed, so a browser cannot fabricate one or
 * edit the role inside it. Every helper here resolves the caller's role from the
 * database - never from a request header or anything else the client controls.
 *
 * Signing key resolution (in order):
 *   1. SESSION_SECRET   - explicit key for deployments that want one.
 *   2. ADMIN_PASSWORD   - already-required deployment secret, never in the repo.
 *   3. a local-development constant so the app still boots with no secrets set.
 * The constant is a signing key, not a login credential: it is only reached when
 * neither real secret is configured.
 */
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { db } from './db';
import { UserRole } from './types';

export const SESSION_COOKIE = 'school_session_token';
export const ADMIN_PANEL_COOKIE = 'school_admin_gate';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const ADMIN_PANEL_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export interface Actor {
  id: string;
  role: UserRole;
  name: string;
}

function signingSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'janta-local-development-session-key'
  );
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', signingSecret()).update(payload).digest('base64url');
}

function issueToken(claims: Record<string, unknown>): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readToken<T>(token: string | null | undefined, maxAgeMs: number): T | null {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);

  // Constant-time comparison, and length check first (timingSafeEqual throws on
  // differing lengths).
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!claims || typeof claims.time !== 'number') return null;
    if (Date.now() - claims.time > maxAgeMs) return null;
    return claims as T;
  } catch {
    return null;
  }
}

/** Signed session token handed to the client on login/registration. */
export function createSessionToken(userId: string, role: UserRole): string {
  return issueToken({ id: userId, role, time: Date.now() });
}

/** Signed token proving the caller entered the school's admin panel password. */
export function createAdminPanelToken(): string {
  return issueToken({ scope: 'admin-panel', time: Date.now() });
}

/** Cookie options matching the request's transport (HTTP in dev, HTTPS in prod). */
export function sessionCookieOptions(req: NextRequest, maxAgeSeconds: number) {
  const isHttps =
    req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:';
  return {
    path: '/',
    // The client keeps its own copy of the token in storage; the cookie is only
    // read server-side, so it stays out of reach of page scripts.
    httpOnly: true,
    maxAge: maxAgeSeconds,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    secure: isHttps,
  };
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
export const ADMIN_PANEL_MAX_AGE_SECONDS = ADMIN_PANEL_TTL_MS / 1000;

/**
 * The verified caller, or null. The role always comes from the stored account,
 * so an edited or forged token can never upgrade a caller's permissions.
 */
export function getActor(req: NextRequest): Actor | null {
  const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const claims =
    readToken<{ id?: string }>(bearer, SESSION_TTL_MS) ||
    readToken<{ id?: string }>(req.cookies.get(SESSION_COOKIE)?.value, SESSION_TTL_MS);

  if (!claims?.id) return null;

  const user = db.findUser(claims.id);
  if (!user) return null;

  return { id: user.id, role: user.role, name: user.name };
}

export function isStaffRole(role: UserRole): boolean {
  return role === 'teacher' || role === 'principal' || role === 'admin';
}

/**
 * Access to the school's management panel: a signed-in Principal/Admin account,
 * or a staff member who proved knowledge of the school's ADMIN_PASSWORD.
 */
export function hasAdminPanelAccess(req: NextRequest): boolean {
  const actor = getActor(req);
  if (!actor) return false;
  if (actor.role === 'admin' || actor.role === 'principal') return true;

  const gate = readToken<{ scope?: string }>(
    req.cookies.get(ADMIN_PANEL_COOKIE)?.value,
    ADMIN_PANEL_TTL_MS
  );
  return gate?.scope === 'admin-panel';
}

/** Constant-time string comparison for server-side password checks. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

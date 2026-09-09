import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

const COOKIE_NAME = "sawera_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

type SessionPayload = { id: string; role: string; expiresAt: number };

function secret() {
  // DATABASE_URL is server-only and already required by this application. It
  // provides a secure continuity fallback for existing deployments while a
  // dedicated ADMIN_SESSION_SECRET can be added independently.
  const value = process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL;
  if (!value) throw new Error("A server session secret is not configured.");
  return value;
}

function encode(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createAdminSession(user: { id: string; role: string }) {
  const payload = encode({ id: user.id, role: user.role, expiresAt: Date.now() + MAX_AGE_SECONDS * 1000 });
  return `${payload}.${sign(payload)}`;
}

export function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: MAX_AGE_SECONDS };
}

export function requireAdminSession(request: NextRequest) {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    return decoded.role === "admin" && decoded.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export const adminSessionCookieName = COOKIE_NAME;

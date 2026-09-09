import { NextResponse } from "next/server";
import { adminSessionCookieName, sessionCookieOptions } from "@/lib/admin-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookieName, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}

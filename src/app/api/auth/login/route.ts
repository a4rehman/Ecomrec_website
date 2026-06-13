import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { isValidEmail, normalizeEmail } from "@/lib/auth-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiResponse, AuthUser } from "@/types/auth";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rateLimit = checkRateLimit(`login:${ip}`, 20, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json<ApiResponse>(
      { ok: false, message: `Too many login attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));
    const password = String(body.password || "");

    if (!isValidEmail(email) || !password) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Email and password are required." }, { status: 400 });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Invalid email or password." }, { status: 401 });
    }

    return NextResponse.json<ApiResponse<AuthUser>>({
      ok: true,
      message: "Logged in successfully.",
      data: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json<ApiResponse>({ ok: false, message: "Login failed. Please try again." }, { status: 500 });
  }
}

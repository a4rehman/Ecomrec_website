import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { isValidEmail, normalizeEmail, validatePassword } from "@/lib/auth-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiResponse, AuthUser } from "@/types/auth";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rateLimit = checkRateLimit(`register:${ip}`, 10, 60 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json<ApiResponse>(
      { ok: false, message: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const password = String(body.password || "");

    if (!firstName || !lastName) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "First and last name are required." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json<ApiResponse>({ ok: false, message: passwordError }, { status: 400 });
    }

    const users = await getUsersCollection();
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "An account with this email already exists." }, { status: 409 });
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await users.insertOne({
      email,
      name: `${firstName} ${lastName}`,
      passwordHash,
      role: "user",
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json<ApiResponse<AuthUser>>({
      ok: true,
      message: "Account created successfully.",
      data: {
        id: String(result.insertedId),
        email,
        name: `${firstName} ${lastName}`,
        role: "user"
      }
    });
  } catch (error) {
    console.error("Register failed:", error);
    return NextResponse.json<ApiResponse>({ ok: false, message: "Registration failed. Please try again." }, { status: 500 });
  }
}

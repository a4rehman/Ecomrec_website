import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail, normalizeEmail, validatePassword, generateSixDigitOtp } from "@/lib/auth-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiResponse } from "@/types/auth";
import { sendRegistrationOtpEmail } from "@/lib/auth-email";

const OTP_EXPIRES_IN_MS = 10 * 60 * 1000;

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
    const phone = String(body.phone || "").trim() || null;

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

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        passwordHash,
        role: "user",
        phone,
        emailVerified: false
      }
    });

    const otp = generateSixDigitOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const now = new Date();

    await prisma.passwordResetOtp.updateMany({
      where: {
        email,
        purpose: "register",
        consumedAt: null
      },
      data: {
        consumedAt: now
      }
    });

    await prisma.passwordResetOtp.create({
      data: {
        email,
        otpHash,
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + OTP_EXPIRES_IN_MS),
        purpose: "register"
      }
    });

    await sendRegistrationOtpEmail(email, otp);

    return NextResponse.json<ApiResponse>({
      ok: true,
      message: "Account created. A 6 digit verification code has been sent to your email. Please verify your account to activate it."
    });
  } catch (error) {
    console.error("Register failed:", error);
    return NextResponse.json<ApiResponse>({ ok: false, message: "Registration failed. Please try again." }, { status: 500 });
  }
}

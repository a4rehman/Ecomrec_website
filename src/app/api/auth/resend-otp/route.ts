import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSixDigitOtp, isValidEmail, normalizeEmail } from "@/lib/auth-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiResponse } from "@/types/auth";
import { sendRegistrationOtpEmail } from "@/lib/auth-email";

const OTP_EXPIRES_IN_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rateLimit = checkRateLimit(`resend-otp:${ip}`, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json<ApiResponse>(
      { ok: false, message: `Too many OTP requests. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "No account found with this email." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "This account is already verified." }, { status: 400 });
    }

    const otp = generateSixDigitOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const now = new Date();

    await prisma.emailVerificationOtp.updateMany({
      where: {
        email,
        consumedAt: null
      },
      data: {
        consumedAt: now
      }
    });

    await prisma.emailVerificationOtp.create({
      data: {
        email,
        otpHash,
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + OTP_EXPIRES_IN_MS)
      }
    });

    await sendRegistrationOtpEmail(email, otp);

    return NextResponse.json<ApiResponse>({
      ok: true,
      message: "A new verification code has been sent to your email."
    });
  } catch (error) {
    console.error("Resend OTP failed:", error);
    return NextResponse.json<ApiResponse>({ ok: false, message: "Could not resend OTP. Please try again." }, { status: 500 });
  }
}

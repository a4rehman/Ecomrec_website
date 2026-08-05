import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, isValidOtp, normalizeEmail } from "@/lib/auth-validation";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiResponse, AuthUser } from "@/types/auth";

const RESET_TOKEN_EXPIRES_IN_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rateLimit = checkRateLimit(`verify-otp:${ip}`, 10, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json<ApiResponse>(
      { ok: false, message: `Too many OTP attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));
    const otp = String(body.otp || "").trim();
    const purpose = body.purpose === "register" ? "register" : "password_reset";

    if (!isValidEmail(email) || !isValidOtp(otp)) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Enter a valid email and 6 digit OTP." }, { status: 400 });
    }

    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!otpRecord) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "OTP is invalid or expired." }, { status: 400 });
    }

    if (otpRecord.attempts >= 5) {
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { consumedAt: new Date() }
      });
      return NextResponse.json<ApiResponse>({ ok: false, message: "Too many invalid OTP attempts. Request a new OTP." }, { status: 429 });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } }
      });
      return NextResponse.json<ApiResponse>({ ok: false, message: "OTP is invalid or expired." }, { status: 400 });
    }

    // Mark the OTP as consumed so it cannot be reused
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() }
    });

    if (purpose === "register") {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return NextResponse.json<ApiResponse>({ ok: false, message: "Account not found. Please register again." }, { status: 404 });
      }

      await prisma.user.update({
        where: { email },
        data: { emailVerified: true }
      });

      return NextResponse.json<ApiResponse<AuthUser>>({
        ok: true,
        message: "Account verified successfully.",
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as any
        }
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 12);

    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: {
        resetTokenHash,
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRES_IN_MS)
      }
    });

    return NextResponse.json<ApiResponse<{ resetToken: string }>>({
      ok: true,
      message: "OTP verified.",
      data: { resetToken }
    });
  } catch (error) {
    console.error("Verify OTP failed:", error);
    return NextResponse.json<ApiResponse>({ ok: false, message: "OTP verification failed. Please try again." }, { status: 500 });
  }
}

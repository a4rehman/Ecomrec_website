import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, isValidOtp, normalizeEmail } from "@/lib/auth-validation";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiResponse } from "@/types/auth";

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

    if (!isValidEmail(email) || !isValidOtp(otp)) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Enter a valid email and 6 digit OTP." }, { status: 400 });
    }

    const resetRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!resetRecord) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "OTP is invalid or expired." }, { status: 400 });
    }

    if (resetRecord.attempts >= 5) {
      await prisma.passwordResetOtp.update({
        where: { id: resetRecord.id },
        data: { consumedAt: new Date() }
      });
      return NextResponse.json<ApiResponse>({ ok: false, message: "Too many invalid OTP attempts. Request a new OTP." }, { status: 429 });
    }

    const isValid = await bcrypt.compare(otp, resetRecord.otpHash);
    if (!isValid) {
      await prisma.passwordResetOtp.update({
        where: { id: resetRecord.id },
        data: { attempts: { increment: 1 } }
      });
      return NextResponse.json<ApiResponse>({ ok: false, message: "OTP is invalid or expired." }, { status: 400 });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 12);

    await prisma.passwordResetOtp.update({
      where: { id: resetRecord.id },
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

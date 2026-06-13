import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetOtpEmail } from "@/lib/auth-email";
import { generateSixDigitOtp, isValidEmail, normalizeEmail } from "@/lib/auth-validation";
import { getPasswordResetOtpsCollection, getUsersCollection } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiResponse } from "@/types/auth";

const OTP_EXPIRES_IN_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rateLimit = checkRateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json<ApiResponse>(
      { ok: false, message: `Too many reset requests. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ email });
    const genericMessage = "If this email is registered, a 6 digit OTP has been sent.";

    if (!user) {
      return NextResponse.json<ApiResponse>({ ok: true, message: genericMessage });
    }

    const otp = generateSixDigitOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const now = new Date();
    const otps = await getPasswordResetOtpsCollection();

    await otps.updateMany(
      { email, consumedAt: { $exists: false } },
      { $set: { consumedAt: now } }
    );

    await otps.insertOne({
      email,
      otpHash,
      attempts: 0,
      createdAt: now,
      expiresAt: new Date(now.getTime() + OTP_EXPIRES_IN_MS)
    });

    await sendPasswordResetOtpEmail(email, otp);

    return NextResponse.json<ApiResponse>({ ok: true, message: genericMessage });
  } catch (error) {
    console.error("Forgot password failed:", error);
    return NextResponse.json<ApiResponse>({ ok: false, message: "Could not send reset OTP. Please try again." }, { status: 500 });
  }
}

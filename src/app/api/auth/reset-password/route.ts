import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, validatePassword } from "@/lib/auth-validation";
import { getPasswordResetOtpsCollection, getUsersCollection } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rateLimit = checkRateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json<ApiResponse>(
      { ok: false, message: `Too many reset attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));
    const resetToken = String(body.resetToken || "");
    const password = String(body.password || "");

    if (!isValidEmail(email) || !resetToken) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Reset session is invalid." }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json<ApiResponse>({ ok: false, message: passwordError }, { status: 400 });
    }

    const otps = await getPasswordResetOtpsCollection();
    const resetRecord = await otps.findOne({
      email,
      resetTokenHash: { $exists: true },
      resetTokenExpiresAt: { $gt: new Date() },
      consumedAt: { $exists: false }
    }, { sort: { createdAt: -1 } });

    if (!resetRecord?.resetTokenHash || !(await bcrypt.compare(resetToken, resetRecord.resetTokenHash))) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Reset session is invalid or expired." }, { status: 400 });
    }

    const users = await getUsersCollection();
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await users.updateOne(
      { email },
      { $set: { passwordHash, updatedAt: new Date() } }
    );

    if (!result.matchedCount) {
      return NextResponse.json<ApiResponse>({ ok: false, message: "Reset session is invalid." }, { status: 400 });
    }

    await otps.updateOne({ _id: resetRecord._id }, { $set: { consumedAt: new Date() } });

    return NextResponse.json<ApiResponse>({ ok: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password failed:", error);
    return NextResponse.json<ApiResponse>({ ok: false, message: "Password reset failed. Please try again." }, { status: 500 });
  }
}

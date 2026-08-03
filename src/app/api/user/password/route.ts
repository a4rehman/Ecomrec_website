import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validatePassword } from "@/lib/auth-validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ ok: false, message: "All fields are required" }, { status: 400 });
    }

    const passwordErr = validatePassword(newPassword);
    if (passwordErr) {
      return NextResponse.json({ ok: false, message: passwordErr }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return NextResponse.json({ ok: false, message: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash: newHash }
    });

    return NextResponse.json({ ok: true, message: "Password changed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

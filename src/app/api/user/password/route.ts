import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validatePassword, normalizeEmail } from "@/lib/auth-validation";

const DEFAULT_ADMIN_EMAIL = "admin@saweracollection.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));
    const { currentPassword, newPassword } = body;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ ok: false, message: "All fields are required" }, { status: 400 });
    }

    const passwordErr = validatePassword(newPassword);
    if (passwordErr) {
      return NextResponse.json({ ok: false, message: passwordErr }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    // If default admin user is not in DB yet, auto-provision admin user upon initial password change
    if (!user && email === DEFAULT_ADMIN_EMAIL) {
      if (currentPassword !== "admin") {
        return NextResponse.json({ ok: false, message: "Current password is incorrect" }, { status: 400 });
      }

      const initialAdminHash = await bcrypt.hash(newPassword, 12);
      user = await prisma.user.create({
        data: {
          email: DEFAULT_ADMIN_EMAIL,
          name: "Administrator",
          passwordHash: initialAdminHash,
          role: "admin",
          emailVerified: true
        }
      });

      return NextResponse.json({ ok: true, message: "Admin password updated and saved in DB successfully!" }, { status: 200 });
    }

    if (!user) {
      return NextResponse.json({ ok: false, message: "User account not found in database." }, { status: 404 });
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

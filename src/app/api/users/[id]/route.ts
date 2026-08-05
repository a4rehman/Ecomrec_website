import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    if (user.role === "admin") {
      return NextResponse.json({ ok: false, message: "Cannot delete an administrator account." }, { status: 400 });
    }

    await prisma.passwordResetOtp.deleteMany({ where: { email: user.email } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("User delete error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

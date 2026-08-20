import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        emailVerified: true,
        createdAt: true
      }
    });

    return NextResponse.json({ ok: true, users }, { status: 200 });
  } catch (error: any) {
    console.error("User fetch API error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

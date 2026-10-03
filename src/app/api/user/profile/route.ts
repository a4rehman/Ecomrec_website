import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/auth-validation";

const DEFAULT_ADMIN_EMAIL = "admin@saweracollection.com";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = normalizeEmail(searchParams.get("email") || "");

    if (!email) {
      return NextResponse.json({ ok: false, message: "Email parameter required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        zip: true,
        createdAt: true
      }
    });

    // The initial admin can sign in with the local fallback before their first
    // password update provisions the database account. Keep the security view
    // usable in that first-run state instead of showing a misleading error.
    if (!user && email === DEFAULT_ADMIN_EMAIL) {
      return NextResponse.json({
        ok: true,
        user: {
          id: "admin-pending-setup",
          name: "Administrator",
          email: DEFAULT_ADMIN_EMAIL,
          phone: null,
          address: null,
          city: null,
          zip: null,
          createdAt: null,
          needsPasswordSetup: true
        }
      });
    }

    if (!user) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, address, city, zip } = body;

    if (!email) {
      return NextResponse.json({ ok: false, message: "Email required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(zip !== undefined && { zip })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        zip: true
      }
    });

    return NextResponse.json({ ok: true, user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

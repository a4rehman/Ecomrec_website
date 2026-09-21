import { NextResponse } from "next/server";
import { generateGoogleShoppingXml } from "@/lib/google-merchant-feed";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const xml = await generateGoogleShoppingXml();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600"
      }
    });
  } catch (error) {
    console.error("Failed to generate Google Shopping XML feed:", error);
    return new NextResponse(
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?><error>Failed to generate Google Shopping Feed</error>",
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=utf-8" }
      }
    );
  }
}

import { NextResponse } from "next/server";
import { generateGoogleShoppingTsv } from "@/lib/google-merchant-feed";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const tsv = await generateGoogleShoppingTsv();
    return new NextResponse(tsv, {
      status: 200,
      headers: {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600"
      }
    });
  } catch (error) {
    console.error("Failed to generate Google Shopping TSV feed:", error);
    return new NextResponse("Error: Failed to generate Google Shopping Feed", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

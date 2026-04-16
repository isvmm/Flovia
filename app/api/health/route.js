import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    url: process.env.NEXT_PUBLIC_API_URL || "https://flovia.vercel.app"
  });
}

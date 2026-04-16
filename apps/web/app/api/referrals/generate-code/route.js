import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

/**
 * Generate a unique referral code for a user
 * POST /api/referrals/generate-code
 * Body: { userId: string }
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user already has a referral code
    const user = await sql`SELECT referral_code FROM users WHERE id = ${userId}`;

    if (user.length > 0 && user[0].referral_code) {
      return NextResponse.json({ referral_code: user[0].referral_code });
    }

    // Generate a unique referral code (user's first 4 chars + random 6 chars)
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length: 10 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    };

    let referralCode = generateCode();
    let attempts = 0;

    // Ensure uniqueness
    while (attempts < 10) {
      const existing = await sql`
        SELECT id FROM users WHERE referral_code = ${referralCode}
      `;
      if (existing.length === 0) break;
      referralCode = generateCode();
      attempts++;
    }

    // Update user with referral code
    await sql`
      UPDATE users 
      SET referral_code = ${referralCode}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      referral_code: referralCode,
      referral_url: `${process.env.NEXT_PUBLIC_SITE_URL}?ref=${referralCode}`
    });
  } catch (error) {
    console.error("Generate referral code error:", error);
    return NextResponse.json(
      { error: "Failed to generate referral code" },
      { status: 500 }
    );
  }
}

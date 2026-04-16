import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

/**
 * Track a referral when a new user signs up with a referral code
 * Only pending until email/phone verification is confirmed
 * POST /api/referrals/track-signup
 * Body: { referralCode: string, newUserId: string }
 */
export async function POST(request) {
  try {
    const { referralCode, newUserId } = await request.json();

    if (!referralCode || !newUserId) {
      return NextResponse.json(
        { error: "Referral code and new user ID are required" },
        { status: 400 }
      );
    }

    // Find the referrer by referral code
    const referrer = await sql`
      SELECT id FROM users WHERE referral_code = ${referralCode}
    `;

    if (referrer.length === 0) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }

    const referrerId = referrer[0].id;

    // Prevent self-referrals
    if (referrerId === newUserId) {
      return NextResponse.json(
        { error: "Cannot refer yourself" },
        { status: 400 }
      );
    }

    // Check if this referral already exists
    const existingReferral = await sql`
      SELECT id FROM referrals 
      WHERE referrer_id = ${referrerId} AND referred_user_id = ${newUserId}
    `;

    if (existingReferral.length > 0) {
      return NextResponse.json(
        { error: "This referral already exists" },
        { status: 400 }
      );
    }

    // Update referred user with referrer ID
    await sql`
      UPDATE users 
      SET referred_by_id = ${referrerId}
      WHERE id = ${newUserId}
    `;

    // Create referral record with 'pending' status
    await sql`
      INSERT INTO referrals (
        referrer_id,
        referred_user_id,
        referral_code,
        status
      ) VALUES (
        ${referrerId},
        ${newUserId},
        ${referralCode},
        'pending'
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Referral tracked. Reward will be awarded after email verification."
    });
  } catch (error) {
    console.error("Track signup error:", error);
    return NextResponse.json(
      { error: "Failed to track referral signup" },
      { status: 500 }
    );
  }
}

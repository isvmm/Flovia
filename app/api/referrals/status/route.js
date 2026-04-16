import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

/**
 * Get referral status for a user
 * GET /api/referrals/status?userId={userId}
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's referral code and stats
    const user = await sql`
      SELECT 
        referral_code,
        referral_credits_earned
      FROM users 
      WHERE id = ${userId}
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get all referrals made by this user
    const referrals = await sql`
      SELECT 
        id,
        referred_user_id,
        status,
        verification_type,
        reward_claimed,
        referred_user_verified_at,
        created_at
      FROM referrals 
      WHERE referrer_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Count by status
    const stats = {
      total_referrals: referrals.length,
      pending: referrals.filter(r => r.status === 'pending').length,
      verified: referrals.filter(r => r.status === 'verified').length,
      claimed: referrals.filter(r => r.reward_claimed).length
    };

    return NextResponse.json({
      referral_code: user[0].referral_code,
      referral_credits_earned: user[0].referral_credits_earned,
      referrals: referrals,
      stats: stats,
      referral_url: user[0].referral_code 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}?ref=${user[0].referral_code}`
        : null
    });
  } catch (error) {
    console.error("Get referral status error:", error);
    return NextResponse.json(
      { error: "Failed to get referral status" },
      { status: 500 }
    );
  }
}

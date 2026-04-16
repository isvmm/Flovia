import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

/**
 * Claim referral reward ONLY after referred user verifies email or phone
 * This is a fraud prevention check - must be called by backend webhook
 * when user's email_verified or phone_verified status changes in Supabase
 * POST /api/referrals/claim-reward
 * Body: { referredUserId: string, verificationType: 'email' | 'phone' }
 */
export async function POST(request) {
  try {
    const { referredUserId, verificationType } = await request.json();

    if (!referredUserId || !verificationType) {
      return NextResponse.json(
        { error: "Referred user ID and verification type are required" },
        { status: 400 }
      );
    }

    if (!['email', 'phone'].includes(verificationType)) {
      return NextResponse.json(
        { error: "Verification type must be 'email' or 'phone'" },
        { status: 400 }
      );
    }

    // Find the pending referral for this user
    const referral = await sql`
      SELECT * FROM referrals 
      WHERE referred_user_id = ${referredUserId} AND status = 'pending'
      LIMIT 1
    `;

    if (referral.length === 0) {
      return NextResponse.json(
        { error: "No pending referral found for this user" },
        { status: 404 }
      );
    }

    const referrerId = referral[0].referrer_id;

    // Begin transaction-like operation
    // 1. Update referral status to 'verified'
    await sql`
      UPDATE referrals 
      SET 
        status = 'verified',
        verification_type = ${verificationType},
        referred_user_verified_at = NOW()
      WHERE id = ${referral[0].id}
    `;

    // 2. Award 10 credits to the referrer
    const referralCredits = 10;
    
    await sql`
      UPDATE users 
      SET 
        total_credits = total_credits + ${referralCredits},
        referral_credits_earned = referral_credits_earned + ${referralCredits}
      WHERE id = ${referrerId}
    `;

    // 3. Log the credit transaction
    const reason = `Referral reward: User verified via ` + verificationType;
    await sql`
      INSERT INTO credit_transactions (
        user_id,
        amount,
        reason
      ) VALUES (
        ${referrerId},
        ${referralCredits},
        ${reason}
      )
    `;

    // 4. Mark reward as claimed
    await sql`
      UPDATE referrals 
      SET 
        reward_claimed = TRUE,
        claimed_at = NOW()
      WHERE id = ${referral[0].id}
    `;

    // 5. Create notification for referrer
    await sql`
      INSERT INTO notifications (
        user_id,
        type,
        category,
        title,
        message,
        created_at
      ) VALUES (
        ${referrerId},
        'referral_reward',
        'rewards',
        '🎁 Referral Bonus!',
        'Your friend verified their account. You earned 10 AI Credits!',
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Referral reward claimed successfully",
      referralCreditsAwarded: referralCredits,
      referrerId: referrerId
    });
  } catch (error) {
    console.error("Claim reward error:", error);
    return NextResponse.json(
      { error: "Failed to claim referral reward" },
      { status: 500 }
    );
  }
}

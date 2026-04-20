import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

/**
 * Webhook endpoint for Supabase Auth events
 * Called when user verifies their email or phone
 * 
 * Setup in Supabase Auth:
 * 1. Go to Supabase Dashboard → Project → Auth → Email templates
 * 2. Setup webhook in Auth → Webhooks
 * 3. Trigger event: "Auth" > "User updated"
 * 4. HTTP endpoint: https://your-app.vercel.app/api/webhooks/user-verified
 * 5. Headers: Add "Authorization: Bearer YOUR_WEBHOOK_SECRET"
 * 
 * The webhook will only claim referral reward if:
 * - User has email_confirmed_at or phone_confirmed_at
 * - User was referred by another user (referred_by_id != null)
 * - Referral is still in 'pending' status
 */
export async function POST(request) {
  try {
    // Verify webhook signature (implement if using Supabase webhooks)
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    // Basic security check (replace with actual signature verification)
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    // Only process user verification events
    if (type !== "user.updated") {
      return NextResponse.json({ message: "Event type not handled" });
    }

    const userId = data.id;
    const emailVerified = data.email_confirmed_at;
    const phoneVerified = data.phone_confirmed_at;

    if (!userId || (!emailVerified && !phoneVerified)) {
      return NextResponse.json({ message: "No verification detected" });
    }

    // Determine verification type
    const verificationType = emailVerified ? "email" : "phone";

    // Claim the referral reward via the existing endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const claimResponse = await fetch(
      `${baseUrl}/api/referrals/claim-reward`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referredUserId: userId,
          verificationType: verificationType
        })
      }
    );

    const claimResult = await claimResponse.json();

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      reward_claimed: claimResult.success,
      referrer_id: claimResult.referrerId,
      credits_awarded: claimResult.referralCreditsAwarded
    });
  } catch (error) {
    console.error("Webhook error:", error);
    // Return 200 to prevent webhook retry, but log the error
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 200 } // Return 200 to stop retries
    );
  }
}

/**
 * Alternative: Manual verification trigger
 * Call this from the client after email verification
 * POST /api/webhooks/user-verified
 * Body: { userId: string, verificationType: 'email' | 'phone' }
 */
export async function PUT(request) {
  try {
    const { userId, verificationType } = await request.json();

    if (!userId || !verificationType) {
      return NextResponse.json(
        { error: "User ID and verification type required" },
        { status: 400 }
      );
    }

    // Call claim reward endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/referrals/claim-reward`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referredUserId: userId,
          verificationType: verificationType
        })
      }
    );

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Manual verification error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

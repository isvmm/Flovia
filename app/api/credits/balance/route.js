import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

const DAILY_FREE_CREDITS = 5;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId required" },
        { status: 400 }
      );
    }

    // Get user credits
    const users = await sql`
      SELECT total_credits, lifetime_gift_credits, is_premium FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    const lifetimeGifts = user.lifetime_gift_credits || 0;
    const paidCredits = user.total_credits - lifetimeGifts;

    // Get daily free credit usage
    const dailyCredits = await sql`
      SELECT credits_used, last_reset FROM daily_free_credits WHERE user_id = ${userId}
    `;

    let dailyCreditsRemaining = DAILY_FREE_CREDITS;
    let lastReset = null;

    if (dailyCredits.length > 0) {
      const today = new Date().toDateString();
      const lastResetDate = new Date(dailyCredits[0].last_reset).toDateString();

      if (today === lastResetDate) {
        dailyCreditsRemaining = DAILY_FREE_CREDITS - dailyCredits[0].credits_used;
      } else {
        // Reset daily credits
        await sql`
          UPDATE daily_free_credits SET credits_used = 0, last_reset = NOW() WHERE user_id = ${userId}
        `;
        dailyCreditsRemaining = DAILY_FREE_CREDITS;
      }
      lastReset = dailyCredits[0].last_reset;
    } else {
      // Create daily credit tracking for new user
      await sql`
        INSERT INTO daily_free_credits (user_id, credits_used, last_reset)
        VALUES (${userId}, 0, NOW())
      `;
    }

    return NextResponse.json({
      totalCredits: user.total_credits,
      lifetimeGiftCredits: user.lifetime_gift_credits || 0,
      paidCredits: (user.total_credits || 0) - (user.lifetime_gift_credits || 0),
      isPremium: user.is_premium,
      dailyCreditsRemaining,
      lastReset,
      subscriptionTiers: [
        { name: "Flovia Plus", credits: 500, period: "per month", price: 10 },
        { name: "Flovia Pro", credits: 2000, period: "6 months", price: 33 },
        { name: "Flovia Elite", credits: 5000, period: "1 year", price: 70 },
      ],
    });
  } catch (error) {
    console.error("Balance check error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

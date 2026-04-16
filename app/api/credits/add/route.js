import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

const SUBSCRIPTION_TIERS = {
  plus: { credits: 500, name: "Flovia Plus" },
  pro: { credits: 2000, name: "Flovia Pro" },
  elite: { credits: 5000, name: "Flovia Elite" },
};

export async function POST(request) {
  try {
    const { userId, tierName } = await request.json();

    if (!userId || !tierName || !SUBSCRIPTION_TIERS[tierName]) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const tier = SUBSCRIPTION_TIERS[tierName];

    // Get current user balance
    const users = await sql`SELECT total_credits FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add credits
    const newBalance = users[0].total_credits + tier.credits;
    await sql`UPDATE users SET total_credits = ${newBalance} WHERE id = ${userId}`;

    // Log transaction
    await sql`
      INSERT INTO credit_transactions (user_id, amount, reason)
      VALUES (${userId}, ${tier.credits}, ${`${tier.name} Subscription`})
    `;

    return NextResponse.json({
      success: true,
      newBalance,
      added: tier.credits,
      tier: tier.name,
      message: `${tier.credits} credits added from ${tier.name}`,
    });
  } catch (error) {
    console.error("Add credits error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId required" },
        { status: 400 }
      );
    }

    // Check if user already claimed welcome pack
    const users = await sql`
      SELECT welcome_pack_claimed, lifetime_gift_credits, total_credits 
      FROM users 
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // If already claimed, return current balance
    if (user.welcome_pack_claimed) {
      return NextResponse.json({
        success: true,
        message: "Welcome pack already claimed",
        lifetimeGiftCredits: user.lifetime_gift_credits || 0,
        totalCredits: user.total_credits || 0,
        alreadyClaimed: true,
      });
    }

    // Grant 10 lifetime gift credits if not already done
    const newBalance = (user.total_credits || 0) + 10;
    const newLifetimeGifts = (user.lifetime_gift_credits || 0) + 10;

    await sql`
      UPDATE users 
      SET 
        total_credits = ${newBalance},
        lifetime_gift_credits = ${newLifetimeGifts},
        welcome_pack_claimed = true
      WHERE id = ${userId}
    `;

    // Log transaction
    await sql`
      INSERT INTO credit_transactions (user_id, amount, reason)
      VALUES (${userId}, 10, 'Welcome Pack - Lifetime Gift Credits')
    `;

    return NextResponse.json({
      success: true,
      message: "Welcome pack claimed! You received 10 lifetime gift credits.",
      lifetimeGiftCredits: newLifetimeGifts,
      totalCredits: newBalance,
      alreadyClaimed: false,
    });
  } catch (error) {
    console.error("Welcome pack claim error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

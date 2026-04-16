import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

const CREDIT_COSTS = {
  image: 1,
  video: 15,
  remix: 1,
};

export async function POST(request) {
  try {
    const { userId, contentType } = await request.json();

    if (!userId || !contentType || !CREDIT_COSTS[contentType]) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const requiredCredits = CREDIT_COSTS[contentType];

    // Get user
    const users = await sql`SELECT total_credits FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Check if user has enough credits
    if (user.total_credits < requiredCredits) {
      return NextResponse.json(
        { error: "Insufficient credits", available: user.total_credits, required: requiredCredits },
        { status: 402 }
      );
    }

    // Deduct credits
    const newBalance = user.total_credits - requiredCredits;
    await sql`UPDATE users SET total_credits = ${newBalance} WHERE id = ${userId}`;

    // Log transaction
    const reasonMap = {
      image: "AI Image Generation",
      video: "AI Video Generation",
      remix: "Prompt Remix",
    };

    await sql`
      INSERT INTO credit_transactions (user_id, amount, reason)
      VALUES (${userId}, ${-requiredCredits}, ${reasonMap[contentType]})
    `;

    return NextResponse.json({
      success: true,
      newBalance,
      deducted: requiredCredits,
      message: `${requiredCredits} credits deducted for ${reasonMap[contentType]}`,
    });
  } catch (error) {
    console.error("Credit deduction error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

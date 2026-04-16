import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

const CREDIT_COSTS = {
  image: 1,
  video: 15,
  remix: 1,
};

const DAILY_FREE_CREDITS = 5;

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
    const users = await sql`SELECT total_credits, is_premium FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    const hasEnoughCredits = user.total_credits >= requiredCredits;

    return NextResponse.json({
      hasEnoughCredits,
      currentCredits: user.total_credits,
      requiredCredits,
      isPremium: user.is_premium,
      creditDifference: user.total_credits - requiredCredits,
    });
  } catch (error) {
    console.error("Credit check error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

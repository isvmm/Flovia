import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const followerId = searchParams.get("followerId");
    const followingId = searchParams.get("followingId");

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: "followerId and followingId are required" },
        { status: 400 }
      );
    }

    const follow = await sql`
      SELECT * FROM follows 
      WHERE follower_id = ${followerId} 
      AND following_id = ${followingId}
      LIMIT 1
    `;

    return NextResponse.json({
      isFollowing: follow.length > 0,
    });
  } catch (error) {
    console.error("Check follow error:", error);
    return NextResponse.json(
      { error: error.message, isFollowing: false },
      { status: 500 }
    );
  }
}

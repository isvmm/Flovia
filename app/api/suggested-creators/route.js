import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "8");

    let suggestedCreators = [];

    if (userId) {
      // Get creators the user is not following and exclude themselves
      suggestedCreators = await sql`
        SELECT 
          u.id,
          u.username,
          u.display_name,
          u.bio,
          u.profile_image_url,
          u.followers_count,
          COUNT(p.id) as post_count
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id AND p.is_published = true
        WHERE 
          u.id != ${userId}
          AND u.username != ${'aura'}
          AND u.id NOT IN (
            SELECT following_id FROM follows WHERE follower_id = ${userId}
          )
        GROUP BY u.id
        ORDER BY u.followers_count DESC, COUNT(p.id) DESC
        LIMIT ${limit}
      `;
    } else {
      // No user logged in, show top creators
      suggestedCreators = await sql`
        SELECT 
          u.id,
          u.username,
          u.display_name,
          u.bio,
          u.profile_image_url,
          u.followers_count,
          COUNT(p.id) as post_count
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id AND p.is_published = true
        WHERE u.username != ${'aura'}
        GROUP BY u.id
        ORDER BY u.followers_count DESC, COUNT(p.id) DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({
      creators: suggestedCreators || [],
    });
  } catch (error) {
    console.error("Suggested creators error:", error);
    return NextResponse.json(
      { error: error.message, creators: [] },
      { status: 500 }
    );
  }
}

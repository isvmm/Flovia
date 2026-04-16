import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { followerId, followingId } = await request.json();

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: "followerId and followingId are required" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await sql`
      SELECT * FROM follows 
      WHERE follower_id = ${followerId} 
      AND following_id = ${followingId}
      LIMIT 1
    `;

    if (existingFollow.length > 0) {
      // Unfollow
      await sql`
        DELETE FROM follows 
        WHERE follower_id = ${followerId} 
        AND following_id = ${followingId}
      `;

      // Decrement followers count
      await sql`
        UPDATE users 
        SET followers_count = followers_count - 1
        WHERE id = ${followingId}
      `;

      return NextResponse.json({
        success: true,
        following: false,
      });
    } else {
      // Follow
      await sql`
        INSERT INTO follows (follower_id, following_id)
        VALUES (${followerId}, ${followingId})
      `;

      // Increment followers count
      await sql`
        UPDATE users 
        SET followers_count = followers_count + 1
        WHERE id = ${followingId}
      `;

      // Create notification for the followed user
      await sql`
        INSERT INTO notifications (
          user_id,
          from_user_id,
          type,
          category,
          title,
          message,
          is_read
        ) VALUES (
          ${followingId},
          ${followerId},
          ${'follow'},
          ${'social'},
          ${'New Follower'},
          ${`Someone followed you`},
          ${false}
        )
      `;

      return NextResponse.json({
        success: true,
        following: true,
      });
    }
  } catch (error) {
    console.error("Follow toggle error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

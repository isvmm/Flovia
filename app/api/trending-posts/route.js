import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Get trending posts (user-generated content) sorted by engagement
    const trendingPosts = await sql`
      SELECT 
        p.id,
        p.caption,
        p.media_url,
        p.media_type,
        p.content_type,
        p.prompt,
        p.likes_count,
        p.comments_count,
        p.saves_count,
        p.created_at,
        u.id as user_id,
        u.username,
        u.display_name,
        u.profile_image_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE 
        p.is_published = true
        AND u.username != ${'aura'}
      ORDER BY 
        (p.likes_count * 2 + p.comments_count + p.saves_count) DESC,
        p.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_published = true AND u.username != ${'aura'}
    `;

    return NextResponse.json({
      posts: trendingPosts || [],
      total: countResult[0]?.total || 0,
      hasMore: (offset + limit) < (countResult[0]?.total || 0),
      offset,
      limit,
    });
  } catch (error) {
    console.error("Trending posts error:", error);
    return NextResponse.json(
      { error: error.message, posts: [], total: 0, hasMore: false },
      { status: 500 }
    );
  }
}

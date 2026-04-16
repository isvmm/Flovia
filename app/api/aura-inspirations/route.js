import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get ghost posts from @FloviaOfficial (system account)
    // These are AI-generated inspiration posts
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // First, ensure @FloviaOfficial user exists
    const floviaOfficial = await sql`
      SELECT * FROM users WHERE username = ${`flovia`}
      LIMIT 1
    `;

    if (floviaOfficial.length === 0) {
      // Create @FloviaOfficial if it doesn't exist
      await sql`
        INSERT INTO users (
          email,
          username,
          display_name,
          bio,
          profile_image_url,
          followers_count,
          is_premium
        ) VALUES (
          ${`flovia@floviaapp.com`},
          ${`flovia`},
          ${`Flovia`},
          ${`✨ AI Inspirations & Creative Prompts`},
          ${`https://api.dicebear.com/7.x/avataaars/svg?seed=flovia`},
          ${999999},
          ${true}
        )
      `;
    }

    // Get AI-generated ghost posts from Flovia
    const ghostPosts = await sql`
      SELECT 
        p.id,
        p.caption,
        p.media_url,
        p.media_type,
        p.content_type,
        p.prompt,
        p.likes_count,
        p.created_at,
        u.username,
        u.display_name,
        u.profile_image_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE 
        u.username = ${`flovia`}
        AND p.content_type = ${`pure-ai`}
        AND p.is_published = true
        AND p.prompt IS NOT NULL
      ORDER BY p.created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      ghostPosts: ghostPosts || [],
    });
  } catch (error) {
    console.error("Flovia Inspirations error:", error);
    return NextResponse.json(
      { error: error.message, ghostPosts: [] },
      { status: 500 }
    );
  }
}

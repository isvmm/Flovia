import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    // If no query, return trending searches
    if (!query || query.length === 0) {
      return NextResponse.json({
        trendingSearches: [
          { id: 1, text: "AI music generation", category: "trending", count: 2540 },
          { id: 2, text: "Cyberpunk aesthetics", category: "trending", count: 1840 },
          { id: 3, text: "Digital art tutorials", category: "trending", count: 1205 },
          { id: 4, text: "Synthwave vibes", category: "trending", count: 980 },
          { id: 5, text: "Image to video", category: "trending", count: 750 },
        ],
      });
    }

    // Search query length validation
    if (query.length < 2) {
      return NextResponse.json({
        users: [],
        content: [],
        aiAssets: [],
      });
    }

    const searchPattern = `%${query}%`;

    // Search users by username or display name
    const users = await sql`
      SELECT 
        id, 
        username, 
        display_name, 
        profile_image_url,
        followers_count,
        bio
      FROM users 
      WHERE 
        username ILIKE ${searchPattern}
        OR display_name ILIKE ${searchPattern}
      LIMIT 10
    `;

    // Search posts/content by caption
    const content = await sql`
      SELECT 
        p.id,
        p.caption,
        p.media_url,
        p.media_type,
        p.content_type,
        p.likes_count,
        p.comments_count,
        u.username,
        u.display_name,
        u.profile_image_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE 
        p.caption ILIKE ${searchPattern}
        AND p.is_published = true
      ORDER BY p.likes_count DESC
      LIMIT 10
    `;

    // Search AI assets by title or tags
    const aiAssets = await sql`
      SELECT 
        id,
        asset_type,
        title,
        prompt,
        tags,
        thumbnail_url,
        downloads_count,
        likes_count,
        description
      FROM ai_assets 
      WHERE 
        (title ILIKE ${searchPattern}
        OR prompt ILIKE ${searchPattern}
        OR tags::text ILIKE ${searchPattern})
        AND is_public = true
      ORDER BY downloads_count DESC
      LIMIT 10
    `;

    return NextResponse.json({
      users: users || [],
      content: content || [],
      aiAssets: aiAssets || [],
      query,
      totalResults: (users?.length || 0) + (content?.length || 0) + (aiAssets?.length || 0),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message, users: [], content: [], aiAssets: [] },
      { status: 500 }
    );
  }
}

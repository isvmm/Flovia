import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const tab = searchParams.get("tab") || "all";
    const landing = searchParams.get("landing") === "true";

    // Landing view: fetch trending prompts and suggested creators
    if (landing) {
      // Trending Prompts - AI content with high engagement
      const trendingPrompts = await sql`
        SELECT 
          p.id,
          p.caption,
          p.media_url,
          p.media_type,
          p.content_type,
          p.prompt,
          p.likes_count,
          p.comments_count,
          p.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 
          (p.content_type = 'pure-ai' OR p.content_type = 'ai-enhanced')
          AND p.is_published = true
          AND p.prompt IS NOT NULL
        ORDER BY p.likes_count DESC, p.created_at DESC
        LIMIT 10
      `;

      // Suggested Creators - users with most followers and recent activity
      const suggestedCreators = await sql`
        SELECT DISTINCT ON (u.id)
          u.id,
          u.username,
          u.display_name,
          u.profile_image_url,
          u.followers_count,
          u.bio,
          COUNT(p.id) as post_count
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id AND p.is_published = true
        WHERE u.id IS NOT NULL
        GROUP BY u.id
        ORDER BY u.followers_count DESC, MAX(p.created_at) DESC NULLS LAST
        LIMIT 10
      `;

      return NextResponse.json({
        trendingPrompts: trendingPrompts || [],
        suggestedCreators: suggestedCreators || [],
      });
    }

    if (!query || query.length < 2) {
      return NextResponse.json({
        posts: [],
        tab,
        query,
      });
    }

    const searchPattern = `%${query}%`;

    let posts = [];

    if (tab === "all") {
      // Search all content
      posts = await sql`
        SELECT 
          p.id,
          p.caption,
          p.media_url,
          p.media_type,
          p.content_type,
          p.prompt,
          p.likes_count,
          p.comments_count,
          p.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 
          (p.caption ILIKE ${searchPattern}
          OR p.prompt ILIKE ${searchPattern}
          OR u.username ILIKE ${searchPattern}
          OR u.display_name ILIKE ${searchPattern})
          AND p.is_published = true
        ORDER BY p.likes_count DESC
        LIMIT 50
      `;
    } else if (tab === "ai-videos") {
      // AI Videos (pure-ai or ai-enhanced + video)
      posts = await sql`
        SELECT 
          p.id,
          p.caption,
          p.media_url,
          p.media_type,
          p.content_type,
          p.prompt,
          p.likes_count,
          p.comments_count,
          p.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 
          (p.content_type = 'pure-ai' OR p.content_type = 'ai-enhanced')
          AND p.media_type = 'video'
          AND (p.caption ILIKE ${searchPattern}
          OR p.prompt ILIKE ${searchPattern}
          OR u.username ILIKE ${searchPattern}
          OR u.display_name ILIKE ${searchPattern})
          AND p.is_published = true
        ORDER BY p.likes_count DESC
        LIMIT 50
      `;
    } else if (tab === "ai-images") {
      // AI Images (pure-ai or ai-enhanced + image)
      posts = await sql`
        SELECT 
          p.id,
          p.caption,
          p.media_url,
          p.media_type,
          p.content_type,
          p.prompt,
          p.likes_count,
          p.comments_count,
          p.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 
          (p.content_type = 'pure-ai' OR p.content_type = 'ai-enhanced')
          AND p.media_type = 'image'
          AND (p.caption ILIKE ${searchPattern}
          OR p.prompt ILIKE ${searchPattern}
          OR u.username ILIKE ${searchPattern}
          OR u.display_name ILIKE ${searchPattern})
          AND p.is_published = true
        ORDER BY p.likes_count DESC
        LIMIT 50
      `;
    } else if (tab === "real-clips") {
      // Real Clips (pure-real + video)
      posts = await sql`
        SELECT 
          p.id,
          p.caption,
          p.media_url,
          p.media_type,
          p.content_type,
          p.prompt,
          p.likes_count,
          p.comments_count,
          p.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 
          p.content_type = 'pure-real'
          AND p.media_type = 'video'
          AND (p.caption ILIKE ${searchPattern}
          OR u.username ILIKE ${searchPattern}
          OR u.display_name ILIKE ${searchPattern})
          AND p.is_published = true
        ORDER BY p.likes_count DESC
        LIMIT 50
      `;
    } else if (tab === "real-moments") {
      // Real Moments (pure-real + image)
      posts = await sql`
        SELECT 
          p.id,
          p.caption,
          p.media_url,
          p.media_type,
          p.content_type,
          p.prompt,
          p.likes_count,
          p.comments_count,
          p.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 
          p.content_type = 'pure-real'
          AND p.media_type = 'image'
          AND (p.caption ILIKE ${searchPattern}
          OR u.username ILIKE ${searchPattern}
          OR u.display_name ILIKE ${searchPattern})
          AND p.is_published = true
        ORDER BY p.likes_count DESC
        LIMIT 50
      `;
    }

    return NextResponse.json({
      posts: posts || [],
      tab,
      query,
      totalResults: posts?.length || 0,
    });
  } catch (error) {
    console.error("Discover error:", error);
    return NextResponse.json(
      { error: error.message, posts: [] },
      { status: 500 }
    );
  }
}

import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let posts = [];
    try {
      if (userId) {
        // Fetch posts for a specific user
        posts = await sql`
          SELECT 
            p.id,
            p.user_id,
            p.content_type,
            p.caption,
            p.media_url,
            p.media_type,
            p.video_duration,
            p.prompt,
            p.likes_count,
            p.comments_count,
            p.saves_count,
            p.shares_count,
            p.created_at,
            u.username,
            u.display_name,
            u.profile_image_url
          FROM posts p
          JOIN users u ON p.user_id = u.id
          WHERE p.user_id = ${userId} AND p.is_published = TRUE
          ORDER BY p.created_at DESC
          LIMIT 100
        `;
      } else {
        // Fetch all posts with author details, ordered by creation time
        posts = await sql`
          SELECT 
            p.id,
            p.user_id,
            p.content_type,
            p.caption,
            p.media_url,
            p.media_type,
            p.video_duration,
            p.prompt,
            p.likes_count,
            p.comments_count,
            p.saves_count,
            p.shares_count,
            p.created_at,
            u.username,
            u.display_name,
            u.profile_image_url
          FROM posts p
          JOIN users u ON p.user_id = u.id
          WHERE p.is_published = TRUE
          ORDER BY p.created_at DESC
          LIMIT 50
        `;
      }
    } catch (dbError) {
      // If table doesn't exist, return empty posts array
      if (dbError.code === '42P01') {
        console.warn("Posts table not initialized yet");
        posts = [];
      } else {
        throw dbError;
      }
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, mediaUrl, mediaType, contentType, caption, prompt } = await request.json();

    if (!userId || !mediaUrl || !mediaType || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: userId, mediaUrl, mediaType, contentType" },
        { status: 400 }
      );
    }

    // 1. ENSURE USER EXISTS (Sync with database)
    try {
      const userExists = await sql`SELECT id FROM users WHERE id = ${userId}`;
      if (userExists.length === 0) {
        console.log(`[Sync] Creating missing user record for ${userId}...`);
        await sql`
          INSERT INTO users (id, email, username, display_name)
          VALUES (${userId}, 'user@placeholder.com', 'user_' || substr(${userId}::text, 1, 8), 'User')
          ON CONFLICT (id) DO NOTHING
        `;
      }
    } catch (userError) {
      console.warn("[Sync] User sync failed (might be table missing):", userError.message);
      // If table is missing, the next query will trigger the catch block below
    }

    // 2. CREATE THE POST
    let result;
    try {
      result = await sql`
        INSERT INTO posts (user_id, media_url, media_type, content_type, caption, prompt, is_published)
        VALUES (${userId}, ${mediaUrl}, ${mediaType}, ${contentType}, ${caption || null}, ${prompt || null}, true)
        RETURNING *
      `;
    } catch (insertError) {
      if (insertError.code === '42P01') {
        throw new Error("Database tables not initialized. Please visit http://localhost:3000/setup and click 'Create Tables'");
      }
      throw insertError;
    }

    return NextResponse.json({ success: true, post: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

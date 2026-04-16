import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Fetch post with author details
    const posts = await sql`
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
        u.id as author_id,
        u.email,
        u.username,
        u.display_name,
        u.bio,
        u.profile_image_url,
        u.location,
        u.website,
        u.followers_count,
        u.following_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${id}
    `;

    if (posts.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const post = posts[0];
    const author = {
      id: post.author_id,
      email: post.email,
      username: post.username,
      display_name: post.display_name,
      bio: post.bio,
      profile_image_url: post.profile_image_url,
      location: post.location,
      website: post.website,
      followers_count: post.followers_count,
      following_count: post.following_count,
    };

    return NextResponse.json({
      post: {
        id: post.id,
        user_id: post.user_id,
        content_type: post.content_type,
        caption: post.caption,
        media_url: post.media_url,
        media_type: post.media_type,
        video_duration: post.video_duration,
        prompt: post.prompt,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        saves_count: post.saves_count,
        shares_count: post.shares_count,
        created_at: post.created_at,
      },
      author,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

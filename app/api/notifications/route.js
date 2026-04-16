export const dynamic = 'force-static';
import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    let notifications;

    if (category && category !== "All") {
      notifications = await sql`
        SELECT 
          n.id,
          n.receiver_id,
          n.sender_id,
          n.type,
          n.category,
          n.title,
          n.message,
          n.image_url,
          n.remix_image_url,
          n.action_url,
          n.is_read,
          n.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM notifications n
        LEFT JOIN users u ON n.sender_id = u.id
        WHERE n.receiver_id = ${userId} AND n.category = ${category}
        ORDER BY n.created_at DESC LIMIT 50
      `;
    } else {
      notifications = await sql`
        SELECT 
          n.id,
          n.receiver_id,
          n.sender_id,
          n.type,
          n.category,
          n.title,
          n.message,
          n.image_url,
          n.remix_image_url,
          n.action_url,
          n.is_read,
          n.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM notifications n
        LEFT JOIN users u ON n.sender_id = u.id
        WHERE n.receiver_id = ${userId}
        ORDER BY n.created_at DESC LIMIT 50
      `;
    }

    return NextResponse.json(notifications || []);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request) {
  try {
    const { notificationId, isRead } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE notifications
      SET is_read = ${isRead}
      WHERE id = ${notificationId}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

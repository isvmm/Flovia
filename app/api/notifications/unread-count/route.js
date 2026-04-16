import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { unreadCount: 0, error: "userId is required" },
        { status: 400 }
      );
    }

    let unreadCount = 0;
    try {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = ${userId} AND is_read = false
      `;
      unreadCount = parseInt(result[0]?.count || 0, 10);
    } catch (dbError) {
      // If table doesn't exist, just return 0
      if (dbError.code === '42P01') {
        console.warn("Notifications table not initialized yet");
        unreadCount = 0;
      } else {
        throw dbError;
      }
    }
    
    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}

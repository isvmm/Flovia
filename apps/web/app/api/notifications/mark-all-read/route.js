import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE receiver_id = ${userId} AND is_read = false
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

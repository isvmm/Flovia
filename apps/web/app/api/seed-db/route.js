import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ 
      success: true, 
      message: "Seed route disabled - no data to insert",
      stats: {
        users: 0,
        posts: 0,
        comments: 0
      }
    });
  } catch (error) {
    console.error("Database seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

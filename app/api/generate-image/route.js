import { NextResponse } from "next/server";
import { generateImage } from "@/lib/ai/generate-image";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const result = await generateImage(prompt);

    return NextResponse.json({
      success: true,
      imageData: result.imageData,
      mimeType: result.mimeType,
      text: result.text,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}

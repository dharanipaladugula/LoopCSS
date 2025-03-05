import { NextResponse } from "next/server"
import { moderateContent } from "@/lib/ml/content-moderation"

export async function POST(request: Request) {
  try {
    const { text, imageUrl } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const result = await moderateContent(text, imageUrl)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Content moderation error:", error)
    return NextResponse.json({ error: "Failed to moderate content" }, { status: 500 })
  }
}


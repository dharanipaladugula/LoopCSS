import { NextResponse } from "next/server"
import { detectHateSpeech } from "@/lib/ml/hate-speech"

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const result = await detectHateSpeech(text)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Hate speech detection error:", error)
    return NextResponse.json({ error: "Failed to detect hate speech" }, { status: 500 })
  }
}


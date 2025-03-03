import { NextResponse } from "next/server"

// Simple content moderation function
// In a real app, you would use a more sophisticated content moderation service
function moderateContent(text: string) {
  // List of potentially harmful words (very simplified for demo)
  const harmfulWords = [
    "hate",
    "kill",
    "violent",
    "attack",
    "threat",
    "racist",
    "sexist",
    "offensive",
    "abuse",
    "harass",
  ]

  const words = text.toLowerCase().match(/\b(\w+)\b/g) || []
  const flaggedWords = words.filter((word) => harmfulWords.includes(word))

  const safetyScore = Math.max(100 - flaggedWords.length * 20, 0)

  let action: "none" | "warn" | "remove" = "none"
  if (safetyScore < 40) {
    action = "remove"
  } else if (safetyScore < 70) {
    action = "warn"
  }

  return {
    safetyScore,
    flags: flaggedWords,
    action,
  }
}

export async function POST(request: Request) {
  try {
    const { text, postId } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    const moderationResult = moderateContent(text)

    // In a real app, you would store this result in a database
    // and potentially take automated actions based on the result

    return NextResponse.json({
      postId,
      ...moderationResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Content moderation error:", error)
    return NextResponse.json({ error: "Failed to moderate content" }, { status: 500 })
  }
}


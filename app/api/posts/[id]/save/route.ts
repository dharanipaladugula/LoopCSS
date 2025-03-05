import { NextResponse } from "next/server"
import { savePost } from "@/lib/db"
import { auth } from "@/lib/firebase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const saved = await savePost(user.uid, postId)

    return NextResponse.json({ saved })
  } catch (error) {
    console.error("Error saving post:", error)
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 })
  }
}


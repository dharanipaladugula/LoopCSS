import { NextResponse } from "next/server"
import { sharePost } from "@/lib/db"
import { auth } from "@/lib/firebase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const { content } = await request.json()

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await sharePost(user.uid, postId, content)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sharing post:", error)
    return NextResponse.json({ error: "Failed to share post" }, { status: 500 })
  }
}


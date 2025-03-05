import { NextResponse } from "next/server"
import { likePost } from "@/lib/db"
import { auth } from "@/lib/firebase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const liked = await likePost(user.uid, postId)

    return NextResponse.json({ liked })
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}


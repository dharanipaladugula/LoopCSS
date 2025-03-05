import { NextResponse } from "next/server"
import { addComment } from "@/lib/db"
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

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const comment = await addComment(user.uid, postId, content)

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}


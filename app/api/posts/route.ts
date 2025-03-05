import { NextResponse } from "next/server"
import { createPost, getFeedPosts } from "@/lib/db"
import { auth } from "@/lib/firebase"

// GET handler to fetch posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const posts = await getFeedPosts(user.uid, limit)

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

// POST handler to create a new post
export async function POST(request: Request) {
  try {
    const { content, imageUrl } = await request.json()

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const post = await createPost(user.uid, content, imageUrl)

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}


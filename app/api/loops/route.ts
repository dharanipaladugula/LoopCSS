import { NextResponse } from "next/server"
import { createLoop, getUserLoops, getLoopDetails } from "@/lib/loops"
import { auth } from "@/lib/firebase"

// GET handler to fetch loops
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const loopId = searchParams.get("id")

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (loopId) {
      // Get details for a specific loop
      const loop = await getLoopDetails(loopId)
      return NextResponse.json(loop)
    } else {
      // Get all loops for the user
      const loops = await getUserLoops(user.uid)
      return NextResponse.json(loops)
    }
  } catch (error) {
    console.error("Error fetching loops:", error)
    return NextResponse.json({ error: "Failed to fetch loops" }, { status: 500 })
  }
}

// POST handler to create a new loop
export async function POST(request: Request) {
  try {
    const { name, description, privacy } = await request.json()

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!name) {
      return NextResponse.json({ error: "Loop name is required" }, { status: 400 })
    }

    const loop = await createLoop(user.uid, name, description || "", privacy)

    return NextResponse.json(loop)
  } catch (error) {
    console.error("Error creating loop:", error)
    return NextResponse.json({ error: "Failed to create loop" }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import { joinLoop } from "@/lib/loops"
import { auth } from "@/lib/firebase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const loopId = params.id

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await joinLoop(user.uid, loopId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining loop:", error)
    return NextResponse.json({ error: "Failed to join loop" }, { status: 500 })
  }
}


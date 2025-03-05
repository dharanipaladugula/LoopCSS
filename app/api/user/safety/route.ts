import { NextResponse } from "next/server"
import { doc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"

// GET handler to fetch user safety score
export async function GET() {
  try {
    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user data
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    return NextResponse.json({
      safetyScore: userData.safetyScore || 100,
      warningCount: userData.warningCount || 0,
      suspensionCount: userData.suspensionCount || 0,
      isSuspended: userData.isSuspended || false,
      suspensionEndDate: userData.suspensionEndDate?.toDate(),
      isTerminated: userData.isTerminated || false,
    })
  } catch (error) {
    console.error("Error fetching safety score:", error)
    return NextResponse.json({ error: "Failed to fetch safety score" }, { status: 500 })
  }
}


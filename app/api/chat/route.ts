import { NextResponse } from "next/server"
import { sendMessage, getConversations, getMessages, markMessagesAsRead } from "@/lib/chat"
import { auth } from "@/lib/firebase"

// GET handler to fetch conversations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (conversationId) {
      // Get messages for a specific conversation
      const messages = await getMessages(conversationId)

      // Mark messages as read
      await markMessagesAsRead(conversationId, user.uid)

      return NextResponse.json(messages)
    } else {
      // Get all conversations
      const conversations = await getConversations(user.uid)
      return NextResponse.json(conversations)
    }
  } catch (error) {
    console.error("Error fetching chat data:", error)
    return NextResponse.json({ error: "Failed to fetch chat data" }, { status: 500 })
  }
}

// POST handler to send a message
export async function POST(request: Request) {
  try {
    const { receiverId, content, imageUrl } = await request.json()

    // Get current user
    const user = auth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!receiverId) {
      return NextResponse.json({ error: "Receiver ID is required" }, { status: 400 })
    }

    if (!content && !imageUrl) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const message = await sendMessage(user.uid, receiverId, content || "", imageUrl)

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}


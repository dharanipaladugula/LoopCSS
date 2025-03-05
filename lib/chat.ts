import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { analyzeSentiment } from "./ml/sentiment"
import { detectHateSpeech } from "./ml/hate-speech"

// Message type
export type Message = {
  id?: string
  conversationId: string
  senderId: string
  receiverId?: string
  content: string
  imageUrl?: string
  sentiment?: {
    score: number
    label: "positive" | "neutral" | "negative"
  }
  isRead: boolean
  createdAt: any
}

// Conversation type
export type Conversation = {
  id: string
  participants: string[]
  lastMessage?: string
  lastMessageTime?: any
  unreadCount?: number
}

// Send a message
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  imageUrl?: string,
): Promise<Message> {
  try {
    // Check for hate speech
    const hateSpeechResult = await detectHateSpeech(content)

    if (hateSpeechResult.isHateSpeech && hateSpeechResult.confidence > 80) {
      throw new Error("Message contains hate speech and cannot be sent.")
    }

    // Analyze sentiment
    const sentiment = await analyzeSentiment(content)

    // Find or create conversation
    const conversationId = await getOrCreateConversation(senderId, receiverId)

    // Create message
    const message: Omit<Message, "id"> = {
      conversationId,
      senderId,
      receiverId,
      content,
      imageUrl,
      sentiment,
      isRead: false,
      createdAt: serverTimestamp(),
    }

    // Add message to database
    const docRef = await addDoc(collection(db, "messages"), message)

    // Update conversation with last message
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
      [`unreadCount.${receiverId}`]: increment(1),
    })

    return { ...message, id: docRef.id, createdAt: new Date() }
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

// Get or create a conversation between two users
async function getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
  try {
    // Sort user IDs to ensure consistent conversation ID
    const participants = [userId1, userId2].sort()

    // Check if conversation exists
    const conversationsQuery = query(collection(db, "conversations"), where("participants", "==", participants))

    const conversationsSnapshot = await getDocs(conversationsQuery)

    if (!conversationsSnapshot.empty) {
      // Return existing conversation ID
      return conversationsSnapshot.docs[0].id
    }

    // Create new conversation
    const conversationData = {
      participants,
      createdAt: serverTimestamp(),
      lastMessageTime: null,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
    }

    const docRef = await addDoc(collection(db, "conversations"), conversationData)
    return docRef.id
  } catch (error) {
    console.error("Error getting or creating conversation:", error)
    throw error
  }
}

// Get conversations for a user
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    // Query conversations where user is a participant
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc"),
    )

    const conversationsSnapshot = await getDocs(conversationsQuery)

    // Format conversations
    return await Promise.all(
      conversationsSnapshot.docs.map(async (doc) => {
        const data = doc.data()

        // Get other participant
        const otherUserId = data.participants.find((id: string) => id !== userId)

        // Get other user's data
        const otherUserDoc = await getDoc(doc(db, "users", otherUserId))
        const otherUserData = otherUserDoc.data()

        return {
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate(),
          unreadCount: data.unreadCount?.[userId] || 0,
          otherUser: {
            id: otherUserId,
            name: otherUserData.displayName,
            avatar: otherUserData.photoURL,
          },
        }
      }),
    )
  } catch (error) {
    console.error("Error getting conversations:", error)
    throw error
  }
}

// Get messages for a conversation
export async function getMessages(conversationId: string, limit = 50): Promise<Message[]> {
  try {
    // Query messages
    const messagesQuery = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "desc"),
      limit(limit),
    )

    const messagesSnapshot = await getDocs(messagesQuery)

    // Format messages
    return messagesSnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          imageUrl: data.imageUrl,
          sentiment: data.sentiment,
          isRead: data.isRead,
          createdAt: data.createdAt?.toDate(),
        }
      })
      .reverse() // Reverse to get chronological order
  } catch (error) {
    console.error("Error getting messages:", error)
    throw error
  }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  try {
    // Query unread messages sent to this user
    const messagesQuery = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      where("receiverId", "==", userId),
      where("isRead", "==", false),
    )

    const messagesSnapshot = await getDocs(messagesQuery)

    // Update each message
    const updatePromises = messagesSnapshot.docs.map((doc) => {
      return updateDoc(doc.ref, { isRead: true })
    })

    await Promise.all(updatePromises)

    // Reset unread count in conversation
    await updateDoc(doc(db, "conversations", conversationId), {
      [`unreadCount.${userId}`]: 0,
    })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    throw error
  }
}

// Subscribe to messages in a conversation
export function subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
  // Query messages
  const messagesQuery = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc"),
  )

  // Create subscription
  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        imageUrl: data.imageUrl,
        sentiment: data.sentiment,
        isRead: data.isRead,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      }
    })

    callback(messages)
  })

  return unsubscribe
}

// Helper function for incrementing values
function increment(amount: number) {
  return {
    __op: "increment",
    amount,
  }
}


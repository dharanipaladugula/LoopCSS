import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore"
import { db } from "./firebase"

// Loop types
export type Loop = {
  id?: string
  name: string
  description: string
  creatorId: string
  privacy: "public" | "private"
  members: number
  activity: number
  color?: string
  createdAt: any
  updatedAt: any
  sentiment?: {
    positive: number
    neutral: number
    negative: number
  }
}

// Create a new loop
export async function createLoop(
  userId: string,
  name: string,
  description: string,
  privacy: "public" | "private" = "public",
): Promise<Loop> {
  try {
    // Generate a random color
    const colors = ["#FF6B6B", "#4ECDC4", "#87C159", "#FFD166", "#F78C6B"]
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Create loop
    const loop: Omit<Loop, "id"> = {
      name,
      description,
      creatorId: userId,
      privacy,
      members: 1, // Creator is first member
      activity: 0,
      color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      sentiment: {
        positive: 70,
        neutral: 20,
        negative: 10,
      },
    }

    // Add to database
    const docRef = await addDoc(collection(db, "loops"), loop)

    // Add creator as member
    await addDoc(collection(db, "loopMembers"), {
      loopId: docRef.id,
      userId,
      role: "admin",
      joinedAt: serverTimestamp(),
    })

    return { ...loop, id: docRef.id }
  } catch (error) {
    console.error("Error creating loop:", error)
    throw error
  }
}

// Get loops for a user
export async function getUserLoops(userId: string): Promise<Loop[]> {
  try {
    // Get loop memberships
    const membershipQuery = query(collection(db, "loopMembers"), where("userId", "==", userId))

    const membershipSnapshot = await getDocs(membershipQuery)
    const loopIds = membershipSnapshot.docs.map((doc) => doc.data().loopId)

    if (loopIds.length === 0) {
      return []
    }

    // Get loops
    const loops: Loop[] = []

    // Firebase doesn't support "in" queries with more than 10 items
    // So we need to batch the queries
    const batchSize = 10
    for (let i = 0; i < loopIds.length; i += batchSize) {
      const batch = loopIds.slice(i, i + batchSize)

      const loopsQuery = query(collection(db, "loops"), where("__name__", "in", batch))

      const loopsSnapshot = await getDocs(loopsQuery)

      loopsSnapshot.forEach((doc) => {
        loops.push({ id: doc.id, ...doc.data() } as Loop)
      })
    }

    return loops
  } catch (error) {
    console.error("Error getting user loops:", error)
    throw error
  }
}

// Join a loop
export async function joinLoop(userId: string, loopId: string): Promise<void> {
  try {
    // Check if already a member
    const membershipQuery = query(
      collection(db, "loopMembers"),
      where("loopId", "==", loopId),
      where("userId", "==", userId),
    )

    const membershipSnapshot = await getDocs(membershipQuery)

    if (!membershipSnapshot.empty) {
      throw new Error("Already a member of this loop")
    }

    // Check if loop exists
    const loopDoc = await getDoc(doc(db, "loops", loopId))

    if (!loopDoc.exists()) {
      throw new Error("Loop not found")
    }

    // Check if private loop
    const loopData = loopDoc.data()

    if (loopData.privacy === "private") {
      // For private loops, create a join request
      await addDoc(collection(db, "loopJoinRequests"), {
        loopId,
        userId,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      return
    }

    // Add member
    await addDoc(collection(db, "loopMembers"), {
      loopId,
      userId,
      role: "member",
      joinedAt: serverTimestamp(),
    })

    // Increment member count
    await updateDoc(doc(db, "loops", loopId), {
      members: increment(1),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error joining loop:", error)
    throw error
  }
}

// Leave a loop
export async function leaveLoop(userId: string, loopId: string): Promise<void> {
  try {
    // Find membership
    const membershipQuery = query(
      collection(db, "loopMembers"),
      where("loopId", "==", loopId),
      where("userId", "==", userId),
    )

    const membershipSnapshot = await getDocs(membershipQuery)

    if (membershipSnapshot.empty) {
      throw new Error("Not a member of this loop")
    }

    // Delete membership
    await deleteDoc(membershipSnapshot.docs[0].ref)

    // Decrement member count
    await updateDoc(doc(db, "loops", loopId), {
      members: increment(-1),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error leaving loop:", error)
    throw error
  }
}

// Get loop details
export async function getLoopDetails(loopId: string): Promise<Loop & { members: any[] }> {
  try {
    // Get loop data
    const loopDoc = await getDoc(doc(db, "loops", loopId))

    if (!loopDoc.exists()) {
      throw new Error("Loop not found")
    }

    const loopData = loopDoc.data() as Loop

    // Get members (limit to 10 for performance)
    const membersQuery = query(collection(db, "loopMembers"), where("loopId", "==", loopId), limit(10))

    const membersSnapshot = await getDocs(membersQuery)

    const members = await Promise.all(
      membersSnapshot.docs.map(async (doc) => {
        const memberData = doc.data()
        const userDoc = await getDoc(doc(db, "users", memberData.userId))
        const userData = userDoc.data()

        return {
          id: memberData.userId,
          role: memberData.role,
          joinedAt: memberData.joinedAt?.toDate(),
          name: userData.displayName,
          avatar: userData.photoURL,
        }
      }),
    )

    return {
      id: loopId,
      ...loopData,
      members,
    }
  } catch (error) {
    console.error("Error getting loop details:", error)
    throw error
  }
}

// Update loop sentiment
export async function updateLoopSentiment(
  loopId: string,
  sentiment: { positive: number; neutral: number; negative: number },
): Promise<void> {
  try {
    await updateDoc(doc(db, "loops", loopId), {
      sentiment,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating loop sentiment:", error)
    throw error
  }
}

// Update loop activity
export async function updateLoopActivity(loopId: string, activityPercentage: number): Promise<void> {
  try {
    await updateDoc(doc(db, "loops", loopId), {
      activity: activityPercentage,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating loop activity:", error)
    throw error
  }
}


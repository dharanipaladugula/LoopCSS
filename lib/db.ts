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
  orderBy,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"
import { analyzeSentiment } from "./ml/sentiment"
import { detectHateSpeech } from "./ml/hate-speech"
import { moderateContent } from "./ml/content-moderation"

// Post types
export type Post = {
  id?: string
  userId: string
  content: string
  imageUrl?: string
  videoUrl?: string
  likes: number
  comments: number
  shares: number
  sentiment: {
    score: number
    label: "positive" | "neutral" | "negative"
    keywords: string[]
  }
  hateSpeechDetected: boolean
  moderationStatus: "approved" | "flagged" | "removed"
  moderationReason?: string
  createdAt: any
  updatedAt: any
}

// Create a new post with content moderation
export async function createPost(userId: string, content: string, imageFile?: File) {
  try {
    // Upload image if provided
    let imageUrl
    if (imageFile) {
      const imageRef = ref(storage, `posts/${userId}/${Date.now()}_${imageFile.name}`)
      await uploadBytes(imageRef, imageFile)
      imageUrl = await getDownloadURL(imageRef)
    }

    // Analyze sentiment
    const sentiment = await analyzeSentiment(content)

    // Detect hate speech
    const hateSpeechResult = await detectHateSpeech(content)

    // Moderate content
    const moderationResult = await moderateContent(content, imageUrl)

    // Create post object
    const post: Omit<Post, "id"> = {
      userId,
      content,
      imageUrl,
      likes: 0,
      comments: 0,
      shares: 0,
      sentiment,
      hateSpeechDetected: hateSpeechResult.isHateSpeech,
      moderationStatus: moderationResult.status,
      moderationReason: moderationResult.reason,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // If hate speech is detected, handle according to policy
    if (hateSpeechResult.isHateSpeech) {
      await handleHateSpeechViolation(userId, content, hateSpeechResult.language)
    }

    // Only add to database if it passes moderation
    if (moderationResult.status === "approved") {
      const docRef = await addDoc(collection(db, "posts"), post)
      return { ...post, id: docRef.id }
    } else if (moderationResult.status === "flagged") {
      // Store flagged content for review
      const docRef = await addDoc(collection(db, "flaggedContent"), {
        ...post,
        reviewStatus: "pending",
      })
      return { ...post, id: docRef.id, flagged: true }
    } else {
      // Content was removed - notify user but don't store
      throw new Error("Content violates community guidelines and has been removed.")
    }
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

// Handle hate speech violations
async function handleHateSpeechViolation(userId: string, content: string, language: string) {
  try {
    // Get user data
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()

    // Log the violation
    await addDoc(collection(db, "violations"), {
      userId,
      content,
      type: "hate_speech",
      language,
      timestamp: serverTimestamp(),
    })

    // Update user's safety score
    await updateDoc(userRef, {
      safetyScore: Math.max(0, (userData.safetyScore || 100) - 15),
      warningCount: increment(1),
    })

    // Apply punishment based on violation count
    const newWarningCount = (userData.warningCount || 0) + 1

    if (newWarningCount === 1) {
      // First violation: Warning
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "warning",
        message:
          "Your recent post contained hate speech, which violates our community guidelines. This is your first warning.",
        read: false,
        createdAt: serverTimestamp(),
      })
    } else if (newWarningCount === 2) {
      // Second violation: 4-day suspension
      const suspensionEndDate = new Date()
      suspensionEndDate.setDate(suspensionEndDate.getDate() + 4)

      await updateDoc(userRef, {
        isSuspended: true,
        suspensionEndDate: Timestamp.fromDate(suspensionEndDate),
        suspensionCount: increment(1),
      })

      await addDoc(collection(db, "notifications"), {
        userId,
        type: "suspension",
        message: "Your account has been suspended for 4 days due to repeated hate speech violations.",
        read: false,
        createdAt: serverTimestamp(),
      })
    } else if (newWarningCount >= 3) {
      // Third violation: Termination
      await updateDoc(userRef, {
        isTerminated: true,
        terminationDate: serverTimestamp(),
      })

      await addDoc(collection(db, "notifications"), {
        userId,
        type: "termination",
        message: "Your account has been permanently terminated due to repeated hate speech violations.",
        read: false,
        createdAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error handling hate speech violation:", error)
    throw error
  }
}

// Get posts for feed
export async function getFeedPosts(userId: string, limit = 20) {
  try {
    // Get user's loops (communities)
    const userLoopsSnapshot = await getDocs(query(collection(db, "loopMembers"), where("userId", "==", userId)))

    const loopIds = userLoopsSnapshot.docs.map((doc) => doc.data().loopId)

    // Get posts from user's loops and followed users
    const postsQuery = query(
      collection(db, "posts"),
      where("loopId", "in", [...loopIds, "public"]),
      orderBy("createdAt", "desc"),
      limit(limit),
    )

    const postsSnapshot = await getDocs(postsQuery)

    // Format posts with user data
    const posts = await Promise.all(
      postsSnapshot.docs.map(async (doc) => {
        const postData = doc.data() as Post
        const userDoc = await getDoc(doc(db, "users", postData.userId))
        const userData = userDoc.data()

        return {
          id: doc.id,
          ...postData,
          user: {
            id: userData.uid,
            username: userData.displayName,
            avatar: userData.photoURL,
          },
          liked: false, // Will be updated below
          saved: false, // Will be updated below
        }
      }),
    )

    // Check which posts are liked/saved by the current user
    const likedPostsSnapshot = await getDocs(query(collection(db, "likes"), where("userId", "==", userId)))
    const likedPostIds = new Set(likedPostsSnapshot.docs.map((doc) => doc.data().postId))

    const savedPostsSnapshot = await getDocs(query(collection(db, "savedPosts"), where("userId", "==", userId)))
    const savedPostIds = new Set(savedPostsSnapshot.docs.map((doc) => doc.data().postId))

    // Update liked/saved status
    return posts.map((post) => ({
      ...post,
      liked: likedPostIds.has(post.id),
      saved: savedPostIds.has(post.id),
    }))
  } catch (error) {
    console.error("Error getting feed posts:", error)
    throw error
  }
}

// Like a post
export async function likePost(userId: string, postId: string) {
  try {
    // Check if already liked
    const likeQuery = query(collection(db, "likes"), where("userId", "==", userId), where("postId", "==", postId))

    const likeSnapshot = await getDocs(likeQuery)

    if (likeSnapshot.empty) {
      // Add like
      await addDoc(collection(db, "likes"), {
        userId,
        postId,
        createdAt: serverTimestamp(),
      })

      // Increment post like count
      await updateDoc(doc(db, "posts", postId), {
        likes: increment(1),
      })

      return true // Liked
    } else {
      // Remove like
      await deleteDoc(doc(db, "likes", likeSnapshot.docs[0].id))

      // Decrement post like count
      await updateDoc(doc(db, "posts", postId), {
        likes: increment(-1),
      })

      return false // Unliked
    }
  } catch (error) {
    console.error("Error liking post:", error)
    throw error
  }
}

// Save a post
export async function savePost(userId: string, postId: string) {
  try {
    // Check if already saved
    const saveQuery = query(collection(db, "savedPosts"), where("userId", "==", userId), where("postId", "==", postId))

    const saveSnapshot = await getDocs(saveQuery)

    if (saveSnapshot.empty) {
      // Save post
      await addDoc(collection(db, "savedPosts"), {
        userId,
        postId,
        createdAt: serverTimestamp(),
      })

      return true // Saved
    } else {
      // Unsave post
      await deleteDoc(doc(db, "savedPosts", saveSnapshot.docs[0].id))

      return false // Unsaved
    }
  } catch (error) {
    console.error("Error saving post:", error)
    throw error
  }
}

// Comment on a post
export async function addComment(userId: string, postId: string, content: string) {
  try {
    // Analyze sentiment and check for hate speech
    const sentiment = await analyzeSentiment(content)
    const hateSpeechResult = await detectHateSpeech(content)

    // If hate speech is detected, handle according to policy
    if (hateSpeechResult.isHateSpeech) {
      await handleHateSpeechViolation(userId, content, hateSpeechResult.language)
      throw new Error("Your comment contains hate speech and has been removed.")
    }

    // Add comment
    const commentRef = await addDoc(collection(db, "comments"), {
      userId,
      postId,
      content,
      sentiment,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Increment post comment count
    await updateDoc(doc(db, "posts", postId), {
      comments: increment(1),
    })

    // Get user data for response
    const userDoc = await getDoc(doc(db, "users", userId))
    const userData = userDoc.data()

    return {
      id: commentRef.id,
      content,
      sentiment,
      likes: 0,
      createdAt: new Date(),
      user: {
        id: userId,
        username: userData.displayName,
        avatar: userData.photoURL,
      },
    }
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Get comments for a post
export async function getComments(postId: string) {
  try {
    const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"))

    const commentsSnapshot = await getDocs(commentsQuery)

    // Format comments with user data
    return await Promise.all(
      commentsSnapshot.docs.map(async (doc) => {
        const commentData = doc.data()
        const userDoc = await getDoc(doc(db, "users", commentData.userId))
        const userData = userDoc.data()

        return {
          id: doc.id,
          content: commentData.content,
          sentiment: commentData.sentiment,
          likes: commentData.likes,
          createdAt: commentData.createdAt.toDate(),
          user: {
            id: userData.uid,
            username: userData.displayName,
            avatar: userData.photoURL,
          },
        }
      }),
    )
  } catch (error) {
    console.error("Error getting comments:", error)
    throw error
  }
}

// Share a post
export async function sharePost(userId: string, postId: string, content?: string) {
  try {
    // Get original post
    const postDoc = await getDoc(doc(db, "posts", postId))

    if (!postDoc.exists()) {
      throw new Error("Post not found")
    }

    const postData = postDoc.data() as Post

    // Create share record
    await addDoc(collection(db, "shares"), {
      userId,
      postId,
      content,
      createdAt: serverTimestamp(),
    })

    // Increment original post share count
    await updateDoc(doc(db, "posts", postId), {
      shares: increment(1),
    })

    // If content is provided, create a new post (repost with comment)
    if (content) {
      // Analyze sentiment
      const sentiment = await analyzeSentiment(content)

      // Detect hate speech
      const hateSpeechResult = await detectHateSpeech(content)

      // If hate speech is detected, handle according to policy
      if (hateSpeechResult.isHateSpeech) {
        await handleHateSpeechViolation(userId, content, hateSpeechResult.language)
        throw new Error("Your share contains hate speech and has been removed.")
      }

      // Create new post with reference to original
      await addDoc(collection(db, "posts"), {
        userId,
        content,
        originalPostId: postId,
        originalUserId: postData.userId,
        imageUrl: postData.imageUrl,
        videoUrl: postData.videoUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        sentiment,
        hateSpeechDetected: false,
        moderationStatus: "approved",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return true
  } catch (error) {
    console.error("Error sharing post:", error)
    throw error
  }
}


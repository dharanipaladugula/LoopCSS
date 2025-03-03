import { NextResponse } from "next/server"

// In a real app, this would connect to a database
// For this demo, we'll use an in-memory store
let posts = [
  {
    id: "1",
    userId: "user1",
    content:
      "Just launched our new eco-friendly product line! So excited to share this with the Loop community. #GreenTech #Sustainability",
    image: "/placeholder.svg?height=400&width=600",
    likes: 243,
    comments: 42,
    shares: 18,
    sentiment: {
      score: 92,
      label: "positive",
      keywords: ["eco-friendly", "excited", "community", "sustainability"],
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: "2",
    userId: "user2",
    content:
      "Working on a new AI project that helps detect hate speech in multiple languages. Looking for beta testers who speak Telugu!",
    image: null,
    likes: 156,
    comments: 37,
    shares: 12,
    sentiment: {
      score: 85,
      label: "positive",
      keywords: ["AI", "project", "beta testers", "languages"],
    },
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
  },
]

// Mock user data
const users = {
  user1: { id: "user1", username: "alex_chen", avatar: "/placeholder.svg?height=40&width=40" },
  user2: { id: "user2", username: "priya_sharma", avatar: "/placeholder.svg?height=40&width=40" },
  current_user: { id: "current_user", username: "you", avatar: "/placeholder.svg?height=40&width=40" },
}

// GET handler to fetch posts
export async function GET() {
  try {
    // Format posts with user data
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      user: users[post.userId as keyof typeof users],
      content: post.content,
      image: post.image,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      sentiment: post.sentiment,
      time: formatTime(new Date(post.createdAt)),
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

// POST handler to create a new post
export async function POST(request: Request) {
  try {
    const { content, image } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Analyze sentiment (in a real app, call the sentiment API)
    const sentiment = await analyzeSentiment(content)

    // Create new post
    const newPost = {
      id: Date.now().toString(),
      userId: "current_user",
      content,
      image: image || null,
      likes: 0,
      comments: 0,
      shares: 0,
      sentiment,
      createdAt: new Date().toISOString(),
    }

    // Add to posts (in a real app, save to database)
    posts = [newPost, ...posts]

    // Format post with user data for response
    const formattedPost = {
      id: newPost.id,
      user: users["current_user"],
      content: newPost.content,
      image: newPost.image,
      likes: newPost.likes,
      comments: newPost.comments,
      shares: newPost.shares,
      sentiment: newPost.sentiment,
      time: "Just now",
    }

    return NextResponse.json(formattedPost)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

// Helper function to format time
function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleDateString()
}

// Simple sentiment analysis function
// In a real app, you would call the sentiment analysis API
async function analyzeSentiment(text: string) {
  // Call the sentiment API
  const response = await fetch("http://localhost:3000/api/sentiment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    // Fallback to a simple implementation if API fails
    const positiveWords = ["good", "great", "awesome", "happy", "love", "excellent"]
    const negativeWords = ["bad", "terrible", "awful", "sad", "hate", "poor"]

    const words = text.toLowerCase().match(/\b(\w+)\b/g) || []
    const positiveCount = words.filter((word) => positiveWords.includes(word)).length
    const negativeCount = words.filter((word) => negativeWords.includes(word)).length

    const keywords = words
      .filter((word) => word.length > 3)
      .filter((word, index, self) => self.indexOf(word) === index)
      .slice(0, 4)

    if (positiveCount > negativeCount) {
      return { score: 75, label: "positive", keywords }
    } else if (negativeCount > positiveCount) {
      return { score: 25, label: "negative", keywords }
    } else {
      return { score: 50, label: "neutral", keywords }
    }
  }

  return await response.json()
}


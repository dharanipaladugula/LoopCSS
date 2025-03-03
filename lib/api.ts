import type { PostType } from "@/components/instagram-feed"

// Mock API functions for frontend demonstration
// In a real app, these would make actual API calls to your backend

export async function fetchPosts(): Promise<PostType[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock data
  return [
    {
      id: "1",
      user: {
        id: "user1",
        username: "alex_chen",
        avatar: "/placeholder.svg?height=40&width=40",
      },
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
      time: "2h ago",
    },
    {
      id: "2",
      user: {
        id: "user2",
        username: "priya_sharma",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Working on a new AI project that helps detect hate speech in multiple languages. Looking for beta testers who speak Telugu!",
      likes: 156,
      comments: 37,
      shares: 12,
      sentiment: {
        score: 85,
        label: "positive",
        keywords: ["AI", "project", "beta testers", "languages"],
      },
      time: "4h ago",
    },
    {
      id: "3",
      user: {
        id: "user3",
        username: "jordan_taylor",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Check out this amazing sunset from my hike yesterday! Nature is truly healing. #OutdoorLife",
      image: "/placeholder.svg?height=400&width=600",
      likes: 389,
      comments: 56,
      shares: 27,
      sentiment: {
        score: 97,
        label: "positive",
        keywords: ["amazing", "sunset", "nature", "healing"],
      },
      time: "6h ago",
    },
    {
      id: "4",
      user: {
        id: "user4",
        username: "tech_critic",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "This new phone is terrible. Worst purchase I've made this year. The battery life is awful and it overheats constantly. #Disappointed",
      image: "/placeholder.svg?height=400&width=600",
      likes: 78,
      comments: 43,
      shares: 12,
      sentiment: {
        score: 15,
        label: "negative",
        keywords: ["terrible", "worst", "awful", "disappointed"],
      },
      time: "12h ago",
    },
    {
      id: "5",
      user: {
        id: "user5",
        username: "neutral_observer",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Just finished reading the latest report on climate change. It contains a lot of data and some interesting projections for the next decade.",
      likes: 45,
      comments: 12,
      shares: 8,
      sentiment: {
        score: 50,
        label: "neutral",
        keywords: ["report", "data", "projections", "climate"],
      },
      time: "1d ago",
    },
  ]
}

export async function createPost(data: { content: string; image?: string }): Promise<PostType> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // In a real app, this would send the data to your backend
  // and return the created post

  // Perform sentiment analysis
  const sentiment = await analyzeSentiment(data.content)

  // Return mock created post
  return {
    id: Date.now().toString(),
    user: {
      id: "current_user",
      username: "you",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: data.content,
    image: data.image,
    likes: 0,
    comments: 0,
    shares: 0,
    sentiment,
    time: "Just now",
  }
}

// Mock sentiment analysis function
export async function analyzeSentiment(text: string): Promise<{
  score: number
  label: "positive" | "neutral" | "negative"
  keywords: string[]
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, this would call your backend sentiment analysis service

  // Simple mock sentiment analysis
  const positiveWords = ["good", "great", "awesome", "happy", "love", "excellent", "amazing", "wonderful", "beautiful"]
  const negativeWords = ["bad", "terrible", "awful", "sad", "hate", "poor", "horrible", "worst", "disappointed"]

  const words = text.toLowerCase().match(/\b(\w+)\b/g) || []
  const positiveCount = words.filter((word) => positiveWords.includes(word)).length
  const negativeCount = words.filter((word) => negativeWords.includes(word)).length

  // Extract keywords (just a simple implementation for demo)
  const keywords = words
    .filter((word) => word.length > 3)
    .filter((word, index, self) => self.indexOf(word) === index)
    .slice(0, 4)

  if (positiveCount > negativeCount) {
    const score = Math.min(60 + positiveCount * 10, 98)
    return { score, label: "positive", keywords }
  } else if (negativeCount > positiveCount) {
    const score = Math.max(40 - negativeCount * 10, 5)
    return { score, label: "negative", keywords }
  } else {
    return { score: 50, label: "neutral", keywords }
  }
}

// Backend API for monitoring posts
export async function monitorPost(postId: string): Promise<{
  safetyScore: number
  flags: string[]
  action: "none" | "warn" | "remove"
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // In a real app, this would call your backend monitoring service

  // Mock response
  return {
    safetyScore: Math.floor(Math.random() * 40) + 60, // 60-100
    flags: [],
    action: "none",
  }
}


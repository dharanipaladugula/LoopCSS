"use client"

import { useState, useEffect } from "react"
import { Stories } from "@/components/stories"
import { Post } from "@/components/post"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { fetchPosts } from "@/lib/api"

export type PostType = {
  id: string
  user: {
    id: string
    username: string
    avatar: string
  }
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  sentiment: {
    score: number
    label: "positive" | "neutral" | "negative"
    keywords: string[]
  }
  time: string
  liked?: boolean
  saved?: boolean
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts()
        setPosts(data)
      } catch (error) {
        toast({
          title: "Error loading posts",
          description: "Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [toast])

  const handleLike = (id: string) => {
    setPosts(
      posts.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleSave = (id: string) => {
    setPosts(posts.map((post) => (post.id === id ? { ...post, saved: !post.saved } : post)))
  }

  return (
    <div className="max-w-lg mx-auto pb-16">
      {/* Stories */}
      <div className="py-4 px-2">
        <Stories />
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading
          ? // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b pb-4">
                <div className="flex items-center gap-2 p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-96 w-full" />
                <div className="p-3 space-y-2">
                  <div className="flex gap-4">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          : posts.map((post) => <Post key={post.id} post={post} onLike={handleLike} onSave={handleSave} />)}
      </div>
    </div>
  )
}


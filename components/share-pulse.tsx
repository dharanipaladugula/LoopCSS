"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Image, Smile, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Post = {
  id: string
  user: {
    name: string
    avatar: string
  }
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  sentiment: number
  time: string
  liked?: boolean
  saved?: boolean
}

export function SharePulse() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      user: { name: "Alex Chen", avatar: "/placeholder.svg?height=40&width=40" },
      content:
        "Just launched our new eco-friendly product line! So excited to share this with the Loop community. #GreenTech #Sustainability",
      image: "/placeholder.svg?height=400&width=600",
      likes: 243,
      comments: 42,
      shares: 18,
      sentiment: 92,
      time: "2h ago",
    },
    {
      id: "2",
      user: { name: "Priya Sharma", avatar: "/placeholder.svg?height=40&width=40" },
      content:
        "Working on a new AI project that helps detect hate speech in multiple languages. Looking for beta testers who speak Telugu!",
      likes: 156,
      comments: 37,
      shares: 12,
      sentiment: 85,
      time: "4h ago",
    },
    {
      id: "3",
      user: { name: "Jordan Taylor", avatar: "/placeholder.svg?height=40&width=40" },
      content: "Check out this amazing sunset from my hike yesterday! Nature is truly healing. #OutdoorLife",
      image: "/placeholder.svg?height=400&width=600",
      likes: 389,
      comments: 56,
      shares: 27,
      sentiment: 97,
      time: "6h ago",
    },
  ])

  const [newPost, setNewPost] = useState("")
  const { toast } = useToast()
  const dragX = useMotionValue(0)
  const dragXInput = [-200, 0, 200]
  const dragXOutput = [0, 1, 0]
  const opacity = useTransform(dragX, dragXInput, dragXOutput)

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

  const handleSubmitPost = () => {
    if (!newPost.trim()) return

    const newPostObj: Post = {
      id: Date.now().toString(),
      user: { name: "You", avatar: "/placeholder.svg?height=40&width=40" },
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
      sentiment: 80,
      time: "Just now",
    }

    setPosts([newPostObj, ...posts])
    setNewPost("")

    toast({
      title: "Post shared!",
      description: "Your thought has been shared with your Loops.",
    })
  }

  const handleSwipe = (id: string) => {
    setPosts(posts.filter((post) => post.id !== id))
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold text-secondary mb-4">SharePulse</h2>

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <div className="bg-secondary text-white flex items-center justify-center h-full w-full">Y</div>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts..."
                className="resize-none border-none focus-visible:ring-0 p-0 h-20"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Image size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Smile size={16} />
                  </Button>
                </div>
                <Button size="sm" className="bg-secondary hover:bg-secondary/90" onClick={handleSubmitPost}>
                  <Send size={14} className="mr-2" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              className="bg-card rounded-lg shadow-sm overflow-hidden"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              style={{ x: dragX, opacity }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 100) {
                  handleSwipe(post.id)
                }
              }}
            >
              <div className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <img src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                    </Avatar>
                    <div>
                      <div className="font-medium">{post.user.name}</div>
                      <div className="text-xs text-muted-foreground">{post.time}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>

                <div className="mt-3">
                  <p>{post.content}</p>
                </div>

                {post.image && (
                  <div className="mt-3 rounded-md overflow-hidden">
                    <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-auto" />
                  </div>
                )}

                {post.sentiment && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                      VibeBoost: {post.sentiment}% Positive
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 ${post.liked ? "text-primary" : ""}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart size={16} className={post.liked ? "fill-primary" : ""} /> {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <MessageCircle size={16} /> {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Share2 size={16} /> {post.shares}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={post.saved ? "text-secondary" : ""}
                    onClick={() => handleSave(post.id)}
                  >
                    <Bookmark size={16} className={post.saved ? "fill-secondary" : ""} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="bg-secondary/10 p-3 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white share-pulse">
            <MessageCircle size={16} />
          </div>
          <div>
            <div className="text-sm font-medium">Daily Thoughts</div>
            <div className="text-xs text-muted-foreground">Share ephemeral notes that disappear in 24h</div>
          </div>
          <Button size="sm" className="ml-auto bg-secondary hover:bg-secondary/90 text-xs">
            Create
          </Button>
        </div>
      </div>
    </div>
  )
}


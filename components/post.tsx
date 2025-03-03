"use client"

import type React from "react"

import { useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PostType } from "./instagram-feed"

interface PostProps {
  post: PostType
  onLike: (id: string) => void
  onSave: (id: string) => void
}

export function Post({ post, onLike, onSave }: PostProps) {
  const [comment, setComment] = useState("")
  const [showSentiment, setShowSentiment] = useState(false)

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    // In a real app, this would send the comment to the server
    setComment("")
  }

  const getSentimentColor = () => {
    if (post.sentiment.label === "positive") return "bg-accent text-accent-foreground"
    if (post.sentiment.label === "negative") return "bg-destructive text-destructive-foreground"
    return "bg-secondary text-secondary-foreground"
  }

  return (
    <div className="border-b pb-2">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <img src={post.user.avatar || "/placeholder.svg"} alt={post.user.username} />
          </Avatar>
          <span className="font-medium text-sm">{post.user.username}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowSentiment(true)}>View Sentiment Analysis</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Unfollow</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative">
          <img
            src={post.image || "/placeholder.svg"}
            alt="Post content"
            className="w-full aspect-square object-cover"
          />

          {/* Sentiment Badge */}
          <Badge className={`absolute bottom-3 left-3 ${getSentimentColor()}`} onClick={() => setShowSentiment(true)}>
            {post.sentiment.label.charAt(0).toUpperCase() + post.sentiment.label.slice(1)} {post.sentiment.score}%
          </Badge>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex justify-between p-3">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={post.liked ? "text-red-500" : ""}
            onClick={() => onLike(post.id)}
          >
            <Heart size={24} className={post.liked ? "fill-red-500" : ""} />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle size={24} />
          </Button>
          <Button variant="ghost" size="icon">
            <Send size={24} />
          </Button>
        </div>

        <Button variant="ghost" size="icon" onClick={() => onSave(post.id)}>
          <Bookmark size={24} className={post.saved ? "fill-black" : ""} />
        </Button>
      </div>

      {/* Likes */}
      <div className="px-3 font-medium text-sm">{post.likes} likes</div>

      {/* Caption */}
      <div className="px-3 py-1 text-sm">
        <span className="font-medium">{post.user.username}</span> {post.content}
      </div>

      {/* Comments */}
      <div className="px-3 py-1 text-sm text-muted-foreground">View all {post.comments} comments</div>

      {/* Timestamp */}
      <div className="px-3 text-xs text-muted-foreground uppercase">{post.time}</div>

      {/* Add Comment */}
      <form onSubmit={handleSubmitComment} className="flex items-center px-3 pt-2 border-t mt-2">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Smile size={20} />
        </Button>
        <Input
          placeholder="Add a comment..."
          className="flex-1 border-0 focus-visible:ring-0"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button type="submit" variant="ghost" className="text-primary font-medium" disabled={!comment.trim()}>
          Post
        </Button>
      </form>

      {/* Sentiment Analysis Dialog */}
      <Dialog open={showSentiment} onOpenChange={setShowSentiment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sentiment Analysis</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Overall Sentiment</span>
                <span
                  className={`text-sm font-medium ${
                    post.sentiment.label === "positive"
                      ? "text-green-600"
                      : post.sentiment.label === "negative"
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}
                >
                  {post.sentiment.label.charAt(0).toUpperCase() + post.sentiment.label.slice(1)}
                </span>
              </div>
              <Progress value={post.sentiment.score} className="h-2" />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Key Phrases</span>
              <div className="flex flex-wrap gap-2">
                {post.sentiment.keywords.map((keyword, i) => (
                  <Badge key={i} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Safety Assessment</span>
              <div className="p-3 bg-muted rounded-md text-sm">
                This post has been analyzed and is considered safe for all audiences. No harmful content detected.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


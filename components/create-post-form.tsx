"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ToastProvider } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Image, Smile, X } from "lucide-react"
import { createPost } from "@/lib/api"

interface CreatePostFormProps {
  onSuccess: () => void
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewSentiment, setPreviewSentiment] = useState<{
    score: number
    label: "positive" | "neutral" | "negative"
  } | null>(null)
  const { toast } = useToast()

  const handleImageUpload = () => {
    // In a real app, this would open a file picker
    // For demo purposes, we'll just set a placeholder image
    setImage("/placeholder.svg?height=400&width=400")
  }

  const handleRemoveImage = () => {
    setImage(null)
  }

  const handleContentChange = async (value: string) => {
    setContent(value)

    // Only analyze sentiment if there's enough content
    if (value.length > 10) {
      try {
        // In a real app, this would call the sentiment analysis API
        const sentiment = await analyzeSentiment(value)
        setPreviewSentiment(sentiment)
      } catch (error) {
        console.error("Error analyzing sentiment:", error)
      }
    } else {
      setPreviewSentiment(null)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsLoading(true)

    try {
      await createPost({
        content,
        image: image || undefined,
      })

      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error creating post",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mock sentiment analysis function
  const analyzeSentiment = async (
    text: string,
  ): Promise<{
    score: number
    label: "positive" | "neutral" | "negative"
  }> => {
    // In a real app, this would call a backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple mock sentiment analysis
        const hasPositive = /good|great|awesome|happy|love|excellent/i.test(text)
        const hasNegative = /bad|terrible|awful|sad|hate|poor/i.test(text)

        if (hasPositive && !hasNegative) {
          resolve({ score: 85, label: "positive" })
        } else if (hasNegative && !hasPositive) {
          resolve({ score: 25, label: "negative" })
        } else {
          resolve({ score: 50, label: "neutral" })
        }
      }, 300)
    })
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="What's on your mind?"
        className="min-h-[100px] resize-none"
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
      />

      {image && (
        <div className="relative">
          <img src={image || "/placeholder.svg"} alt="Post preview" className="w-full rounded-md" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {previewSentiment && (
        <div
          className={`p-3 rounded-md text-sm ${
            previewSentiment.label === "positive"
              ? "bg-green-100 text-green-800"
              : previewSentiment.label === "negative"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          <div className="font-medium">
            Sentiment Preview: {previewSentiment.label.charAt(0).toUpperCase() + previewSentiment.label.slice(1)}
          </div>
          <div>
            Your post appears to have a {previewSentiment.label} tone with a score of {previewSentiment.score}%.
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleImageUpload} disabled={!!image}>
            <Image size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Smile size={20} />
          </Button>
        </div>

        <Button onClick={handleSubmit} disabled={!content.trim() || isLoading}>
          {isLoading ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  )
}


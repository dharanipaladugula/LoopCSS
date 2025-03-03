"use client"

import { useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

type Story = {
  id: string
  username: string
  avatar: string
  seen: boolean
}

export function Stories() {
  const [stories, setStories] = useState<Story[]>([
    { id: "1", username: "your_story", avatar: "/placeholder.svg?height=60&width=60", seen: false },
    { id: "2", username: "alex", avatar: "/placeholder.svg?height=60&width=60", seen: false },
    { id: "3", username: "priya", avatar: "/placeholder.svg?height=60&width=60", seen: false },
    { id: "4", username: "jordan", avatar: "/placeholder.svg?height=60&width=60", seen: true },
    { id: "5", username: "taylor", avatar: "/placeholder.svg?height=60&width=60", seen: true },
    { id: "6", username: "jamie", avatar: "/placeholder.svg?height=60&width=60", seen: false },
    { id: "7", username: "casey", avatar: "/placeholder.svg?height=60&width=60", seen: true },
    { id: "8", username: "morgan", avatar: "/placeholder.svg?height=60&width=60", seen: false },
  ])

  const [activeStory, setActiveStory] = useState<Story | null>(null)

  const viewStory = (story: Story) => {
    setActiveStory(story)

    // Mark as seen
    if (!story.seen) {
      setStories(stories.map((s) => (s.id === story.id ? { ...s, seen: true } : s)))
    }
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-1">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center">
              <button className={story.seen ? "story-ring-seen" : "story-ring"} onClick={() => viewStory(story)}>
                <Avatar className="h-16 w-16 border-2 border-white">
                  {story.username === "your_story" ? (
                    <div className="relative w-full h-full bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Plus size={24} className="text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <img src={story.avatar || "/placeholder.svg"} alt={story.username} />
                  )}
                </Avatar>
              </button>
              <span className="text-xs mt-1 truncate w-16 text-center">
                {story.username === "your_story" ? "Your story" : story.username}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Story Viewer */}
      <Dialog open={!!activeStory} onOpenChange={() => setActiveStory(null)}>
        <DialogContent className="max-w-md p-0 h-[80vh] overflow-hidden">
          {activeStory && (
            <div className="relative h-full">
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-black/20 hover:bg-black/40"
                  onClick={() => setActiveStory(null)}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <img src={activeStory.avatar || "/placeholder.svg"} alt={activeStory.username} />
                </Avatar>
                <span className="text-white font-medium">{activeStory.username}</span>
              </div>

              <div className="h-full bg-black flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=800&width=400"
                  alt="Story content"
                  className="max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}


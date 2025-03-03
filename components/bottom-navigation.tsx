"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, Search, PlusSquare, Heart, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreatePostForm } from "@/components/create-post-form"

export function BottomNavigation() {
  const [activeTab, setActiveTab] = useState("home")
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)

  return (
    <>
      <div className="border-t py-2 px-4 flex justify-between items-center bg-background md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className={activeTab === "home" ? "text-primary" : ""}
          onClick={() => setActiveTab("home")}
        >
          <Home size={24} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={activeTab === "search" ? "text-primary" : ""}
          onClick={() => setActiveTab("search")}
        >
          <Search size={24} />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setIsCreatePostOpen(true)}>
          <PlusSquare size={24} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={activeTab === "activity" ? "text-primary" : ""}
          onClick={() => setActiveTab("activity")}
        >
          <Heart size={24} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={activeTab === "profile" ? "text-primary" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <User size={24} />
        </Button>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <CreatePostForm onSuccess={() => setIsCreatePostOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Create Post Button (Desktop) */}
      <div className="hidden md:block fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsCreatePostOpen(true)}
          className="rounded-full p-3 h-14 w-14 bg-secondary hover:bg-secondary/90"
        >
          <PlusSquare size={24} />
        </Button>
      </div>
    </>
  )
}


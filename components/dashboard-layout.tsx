"use client"

import { useState, useEffect } from "react"
import { InstagramFeed } from "@/components/instagram-feed"
import { BottomNavigation } from "@/components/bottom-navigation"
import { TopNavigation } from "@/components/top-navigation"
import { SidePanel } from "@/components/side-panel"
import { ChatPanel } from "@/components/chat-panel"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"

export function DashboardLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeSidePanel, setActiveSidePanel] = useState<"none" | "loops" | "safe">("none")

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  const toggleSidePanel = (panel: "loops" | "safe") => {
    if (activeSidePanel === panel) {
      setActiveSidePanel("none")
    } else {
      setActiveSidePanel(panel)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation (Instagram-like) */}
      <TopNavigation onLoopsClick={() => toggleSidePanel("loops")} onSafeClick={() => toggleSidePanel("safe")} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel (visible on desktop or when toggled) */}
        {(!isMobile || activeSidePanel !== "none") && (
          <SidePanel type={activeSidePanel} onClose={() => setActiveSidePanel("none")} isMobile={isMobile} />
        )}

        {/* Instagram-like Feed */}
        <div className="flex-1 overflow-y-auto">
          <InstagramFeed />
        </div>
      </div>

      {/* Bottom Navigation (Instagram-like) */}
      <BottomNavigation />

      {/* Chat Button */}
      <div className="fixed bottom-20 right-6 z-50 md:bottom-6">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`rounded-full p-3 h-14 w-14 ${isChatOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </Button>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div
          className={`fixed z-40 overflow-hidden ${
            isMobile
              ? "inset-0 bg-background"
              : "bottom-24 right-6 w-96 h-[500px] bg-background border rounded-lg shadow-lg md:bottom-24"
          }`}
        >
          {isMobile && (
            <div className="absolute top-4 right-4">
              <Button onClick={() => setIsChatOpen(false)} variant="ghost" size="icon">
                <X size={24} />
              </Button>
            </div>
          )}
          <ChatPanel />
        </div>
      )}
    </div>
  )
}


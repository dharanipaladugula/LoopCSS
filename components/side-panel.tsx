"use client"

import { LoopLinks } from "@/components/loop-links"
import { SafeGuard } from "@/components/safe-guard"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SidePanelProps {
  type: "none" | "loops" | "safe"
  onClose: () => void
  isMobile: boolean
}

export function SidePanel({ type, onClose, isMobile }: SidePanelProps) {
  if (type === "none" && !isMobile) {
    return null
  }

  return (
    <div
      className={`
      ${isMobile ? "fixed inset-0 z-30 bg-background" : "w-80 border-r"}
      h-full overflow-hidden
    `}
    >
      {isMobile && (
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{type === "loops" ? "LoopLinks" : "SafeGuard"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      )}

      {type === "loops" && <LoopLinks />}
      {type === "safe" && <SafeGuard />}
    </div>
  )
}


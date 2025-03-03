"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Search, X, Users, Shield, Bell, MessageCircle, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface TopNavigationProps {
  onLoopsClick: () => void
  onSafeClick: () => void
}

export function TopNavigation({ onLoopsClick, onSafeClick }: TopNavigationProps) {
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Loop(CSS)</h1>
        </div>

        {/* Search (expandable on mobile) */}
        {isSearching ? (
          <div className="absolute inset-0 bg-background flex items-center px-4 z-20">
            <Input placeholder="Search..." className="flex-1" autoFocus />
            <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsSearching(false)}>
              <X size={20} />
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Search */}
            <div className="hidden md:flex relative max-w-xs w-full mx-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 bg-muted" />
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearching(true)}>
                <Search size={20} />
              </Button>

              <Button variant="ghost" size="icon" onClick={onLoopsClick}>
                <Users size={20} />
              </Button>

              <Button variant="ghost" size="icon" onClick={onSafeClick}>
                <Shield size={20} />
              </Button>

              <Button variant="ghost" size="icon">
                <Bell size={20} />
              </Button>

              <Button variant="ghost" size="icon" className="hidden md:flex">
                <MessageCircle size={20} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <div className="bg-primary text-white text-xs">U</div>
                    </Avatar>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Safety Score</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


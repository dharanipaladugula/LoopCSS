"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Plus, Search, Users, ChevronRight, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Loop = {
  id: string
  name: string
  members: number
  activity: number
  expanded?: boolean
  color?: string
  sentiment?: {
    positive: number
    neutral: number
    negative: number
  }
}

export function LoopLinks() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loops, setLoops] = useState<Loop[]>([
    {
      id: "1",
      name: "Tech Enthusiasts",
      members: 1243,
      activity: 85,
      color: "#FF6B6B",
      sentiment: { positive: 75, neutral: 20, negative: 5 },
    },
    {
      id: "2",
      name: "Green Living",
      members: 876,
      activity: 72,
      color: "#4ECDC4",
      sentiment: { positive: 82, neutral: 15, negative: 3 },
    },
    {
      id: "3",
      name: "Digital Art",
      members: 1567,
      activity: 93,
      color: "#87C159",
      sentiment: { positive: 68, neutral: 25, negative: 7 },
    },
    {
      id: "4",
      name: "Fitness Goals",
      members: 932,
      activity: 68,
      color: "#FF6B6B",
      sentiment: { positive: 80, neutral: 15, negative: 5 },
    },
    {
      id: "5",
      name: "Book Club",
      members: 456,
      activity: 45,
      color: "#4ECDC4",
      sentiment: { positive: 65, neutral: 30, negative: 5 },
    },
  ])
  const [selectedLoop, setSelectedLoop] = useState<Loop | null>(null)

  const toggleExpand = (id: string) => {
    setLoops(loops.map((loop) => (loop.id === id ? { ...loop, expanded: !loop.expanded } : loop)))
  }

  const filteredLoops = loops.filter((loop) => loop.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const viewSentiment = (loop: Loop) => {
    setSelectedLoop(loop)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Loops..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm text-muted-foreground">YOUR LOOPS</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Loop</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loop Name</label>
                  <Input placeholder="Enter loop name..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="What's this loop about?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Privacy</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">Create Loop</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filteredLoops.map((loop) => (
              <motion.div
                key={loop.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  className="p-3 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleExpand(loop.id)}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: loop.color }}
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          `0 0 0 rgba(${loop.color}, 0.4)`,
                          `0 0 10px rgba(${loop.color}, 0.6)`,
                          `0 0 0 rgba(${loop.color}, 0.4)`,
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: Math.random() * 2,
                      }}
                    >
                      <Users size={16} />
                    </motion.div>
                    <div>
                      <div className="font-medium">{loop.name}</div>
                      <div className="text-xs text-muted-foreground">{loop.members.toLocaleString()} members</div>
                    </div>
                  </div>
                  {loop.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <AnimatePresence>
                  {loop.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t px-3 py-2 bg-muted/30"
                    >
                      <div className="text-sm mb-2">Active Members</div>
                      <div className="flex flex-wrap gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Avatar key={i} className="h-8 w-8 bg-primary/20">
                            <div className="text-xs">{String.fromCharCode(65 + i)}</div>
                          </Avatar>
                        ))}
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                          +{loop.members - 5}
                        </div>
                      </div>

                      {loop.sentiment && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center">
                            <div className="text-xs">Sentiment Analysis</div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() => viewSentiment(loop)}
                            >
                              View
                            </Button>
                          </div>
                          <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden flex">
                            <div className="bg-green-500 h-full" style={{ width: `${loop.sentiment.positive}%` }} />
                            <div className="bg-blue-500 h-full" style={{ width: `${loop.sentiment.neutral}%` }} />
                            <div className="bg-red-500 h-full" style={{ width: `${loop.sentiment.negative}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs">
                          Activity: <span className="font-medium">{loop.activity}%</span>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          View Loop
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="text-sm text-muted-foreground mb-2">AI Suggestions</div>
        <div className="bg-primary/10 p-3 rounded-lg">
          <div className="text-sm font-medium">You're 85% aligned with:</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <Users size={14} />
            </div>
            <div className="text-sm">#GreenTechLoops</div>
          </div>
          <Button size="sm" className="w-full mt-2 bg-primary/80 hover:bg-primary text-xs h-7">
            Join Loop
          </Button>
        </div>
      </div>

      {/* Loop Sentiment Dialog */}
      <Dialog open={!!selectedLoop} onOpenChange={() => setSelectedLoop(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedLoop?.name} - Sentiment Analysis</DialogTitle>
          </DialogHeader>

          {selectedLoop && selectedLoop.sentiment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Overall Sentiment</span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500 h-full flex items-center justify-center text-xs text-white"
                    style={{ width: `${selectedLoop.sentiment.positive}%` }}
                  >
                    {selectedLoop.sentiment.positive}%
                  </div>
                  <div
                    className="bg-blue-500 h-full flex items-center justify-center text-xs text-white"
                    style={{ width: `${selectedLoop.sentiment.neutral}%` }}
                  >
                    {selectedLoop.sentiment.neutral}%
                  </div>
                  <div
                    className="bg-red-500 h-full flex items-center justify-center text-xs text-white"
                    style={{ width: `${selectedLoop.sentiment.negative}%` }}
                  >
                    {selectedLoop.sentiment.negative}%
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Positive</span>
                  <span>Neutral</span>
                  <span>Negative</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Trending Topics</span>
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">#sustainability</span>
                    <span className="text-xs text-green-600">+92%</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">#technology</span>
                    <span className="text-xs text-green-600">+87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">#innovation</span>
                    <span className="text-xs text-green-600">+78%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Safety Assessment</span>
                <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm">
                  This Loop has a high safety score of 95%. No harmful content detected.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


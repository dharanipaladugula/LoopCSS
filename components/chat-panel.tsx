"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Send, Smile, Paperclip } from "lucide-react"

type Message = {
  id: string
  sender: string
  content: string
  timestamp: Date
  isCurrentUser: boolean
  sentiment?: {
    score: number
    label: "positive" | "neutral" | "negative"
  }
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "System",
      content: "Welcome to Loop(CSS) Chat! Connect with your community in real-time.",
      timestamp: new Date(Date.now() - 3600000),
      isCurrentUser: false,
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, []) // Removed unnecessary dependency: messages

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    // Analyze sentiment (in a real app, call the sentiment API)
    const sentiment = await analyzeSentiment(newMessage)

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: newMessage,
      timestamp: new Date(),
      isCurrentUser: true,
      sentiment,
    }

    setMessages([...messages, userMessage])
    setNewMessage("")

    // Simulate response after a short delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "Loop Assistant",
        content: getResponseBasedOnSentiment(sentiment),
        timestamp: new Date(),
        isCurrentUser: false,
      }

      setMessages((prev) => [...prev, responseMessage])
    }, 1000)
  }

  const analyzeSentiment = async (text: string) => {
    // In a real app, call the sentiment API
    // For demo, use a simple implementation
    const positiveWords = ["good", "great", "awesome", "happy", "love", "excellent"]
    const negativeWords = ["bad", "terrible", "awful", "sad", "hate", "poor"]

    const words = text.toLowerCase().match(/\b(\w+)\b/g) || []
    const positiveCount = words.filter((word) => positiveWords.includes(word)).length
    const negativeCount = words.filter((word) => negativeWords.includes(word)).length

    if (positiveCount > negativeCount) {
      return { score: 85, label: "positive" as const }
    } else if (negativeCount > positiveCount) {
      return { score: 25, label: "negative" as const }
    } else {
      return { score: 50, label: "neutral" as const }
    }
  }

  const getResponseBasedOnSentiment = (sentiment?: { label: string }) => {
    if (!sentiment) return getRandomResponse()

    if (sentiment.label === "positive") {
      const responses = [
        "That's wonderful to hear! 😊",
        "I'm glad you're feeling positive!",
        "Great vibes! How can I help you today?",
        "Awesome! Let's keep that positive energy going!",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    } else if (sentiment.label === "negative") {
      const responses = [
        "I'm sorry to hear that. How can I help?",
        "That sounds challenging. Would you like to talk more about it?",
        "I understand your frustration. Let's see if we can find a solution.",
        "I'm here to listen if you want to share more.",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    } else {
      return getRandomResponse()
    }
  }

  const getRandomResponse = () => {
    const responses = [
      "Thanks for your message! How can I help you today?",
      "That's interesting! Tell me more about your Loop interests.",
      "I've shared this with the relevant Loop members.",
      "Have you checked out the new SharePulse features?",
      "Your SafeGuard score is looking great today!",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center gap-3">
        <Avatar className="h-8 w-8 bg-secondary">
          <div className="text-white">L</div>
        </Avatar>
        <div>
          <div className="font-medium text-sm">Loop Chat</div>
          <div className="text-xs text-muted-foreground">Online</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                } rounded-lg p-3`}
              >
                {!message.isCurrentUser && <div className="font-medium text-xs mb-1">{message.sender}</div>}
                <div className="text-sm">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Paperclip size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Smile size={18} />
          </Button>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage()
              }
            }}
          />
          <Button
            className="bg-secondary hover:bg-secondary/90 h-9 w-9 p-0"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}


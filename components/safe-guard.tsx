"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Alert = {
  id: string
  type: "warning" | "info" | "success"
  message: string
  time: string
  read: boolean
  details?: string
}

type SentimentData = {
  date: string
  positive: number
  neutral: number
  negative: number
}

export function SafeGuard() {
  const [safetyScore, setSafetyScore] = useState(87)
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "warning",
      message: "Potential hate speech detected in Tech Enthusiasts Loop",
      time: "2h ago",
      read: false,
      details: "A post containing potentially harmful language was detected. Our AI has flagged it for review.",
    },
    {
      id: "2",
      type: "info",
      message: "Your post received a high safety score of 98%",
      time: "4h ago",
      read: false,
      details: "Your recent post about sustainability was analyzed and received a high safety score.",
    },
    {
      id: "3",
      type: "success",
      message: "Your appeal was approved. Post has been restored.",
      time: "1d ago",
      read: true,
      details: "Your appeal regarding the removed post has been reviewed and approved. The post has been restored.",
    },
  ])

  const [sentimentData, setSentimentData] = useState<SentimentData[]>([
    { date: "Mon", positive: 65, neutral: 25, negative: 10 },
    { date: "Tue", positive: 70, neutral: 20, negative: 10 },
    { date: "Wed", positive: 60, neutral: 30, negative: 10 },
    { date: "Thu", positive: 75, neutral: 15, negative: 10 },
    { date: "Fri", positive: 80, neutral: 15, negative: 5 },
    { date: "Sat", positive: 85, neutral: 10, negative: 5 },
    { date: "Sun", positive: 75, neutral: 20, negative: 5 },
  ])

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const markAsRead = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const viewAlertDetails = (alert: Alert) => {
    markAsRead(alert.id)
    setSelectedAlert(alert)
  }

  const getBeaconColor = () => {
    if (safetyScore >= 80) return "#87C159"
    if (safetyScore >= 60) return "#FFD166"
    return "#EF476F"
  }

  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold text-accent">SafeGuard</h2>
        <motion.div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: getBeaconColor() }}
          animate={{
            boxShadow: [
              `0 0 0 rgba(${getBeaconColor()}, 0.4)`,
              `0 0 10px rgba(${getBeaconColor()}, 0.7)`,
              `0 0 0 rgba(${getBeaconColor()}, 0.4)`,
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Safety Score</div>
          <div className="text-sm font-bold">{safetyScore}%</div>
        </div>
        <Progress value={safetyScore} className="h-2" />

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-destructive/20 text-destructive">
            <div>High Risk</div>
            <div>0-59%</div>
          </div>
          <div className="p-2 rounded bg-yellow-100 text-yellow-700">
            <div>Moderate</div>
            <div>60-79%</div>
          </div>
          <div className="p-2 rounded bg-accent/20 text-accent">
            <div>Safe</div>
            <div>80-100%</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="flex-1 overflow-y-auto p-4 pt-2">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${alert.read ? "bg-background" : "bg-muted/30"}`}
                onClick={() => viewAlertDetails(alert)}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {alert.type === "warning" && <AlertTriangle size={16} className="text-yellow-500" />}
                    {alert.type === "info" && <Info size={16} className="text-blue-500" />}
                    {alert.type === "success" && <CheckCircle size={16} className="text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{alert.time}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="flex-1 overflow-y-auto p-4 pt-2">
          <div className="space-y-4">
            <div className="p-3 rounded-lg border">
              <div className="text-sm font-medium mb-2">Your Content Sentiment</div>
              <div className="h-32 relative">
                <div className="absolute inset-0 flex items-end">
                  <div className="w-1/3 bg-green-200 h-[65%] rounded-sm"></div>
                  <div className="w-1/3 bg-blue-200 h-[25%] rounded-sm"></div>
                  <div className="w-1/3 bg-red-200 h-[10%] rounded-sm"></div>
                </div>
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-muted-foreground pt-1">
                  <div>Positive</div>
                  <div>Neutral</div>
                  <div>Negative</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border">
              <div className="text-sm font-medium mb-2">Weekly Sentiment Trend</div>
              <div className="h-40 flex items-end gap-1">
                {sentimentData.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col-reverse h-32">
                      <div className="w-full bg-red-400" style={{ height: `${day.negative}%` }}></div>
                      <div className="w-full bg-blue-400" style={{ height: `${day.neutral}%` }}></div>
                      <div className="w-full bg-green-400" style={{ height: `${day.positive}%` }}></div>
                    </div>
                    <div className="text-xs mt-1">{day.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg border">
              <div className="text-sm font-medium mb-2">Community Health</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs">
                    <div>Tech Enthusiasts</div>
                    <div className="text-green-600">92%</div>
                  </div>
                  <Progress value={92} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <div>Green Living</div>
                    <div className="text-green-600">88%</div>
                  </div>
                  <Progress value={88} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <div>Digital Art</div>
                    <div className="text-yellow-600">76%</div>
                  </div>
                  <Progress value={76} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t">
        <div className="bg-accent/10 p-3 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white safe-glow">
            <Shield size={16} />
          </div>
          <div>
            <div className="text-sm font-medium">Moderation History</div>
            <div className="text-xs text-muted-foreground">0 strikes in the last 30 days</div>
          </div>
          <Button size="sm" className="ml-auto bg-accent hover:bg-accent/90 text-xs">
            View
          </Button>
        </div>
      </div>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAlert?.type === "warning" && "Warning Alert"}
              {selectedAlert?.type === "info" && "Information"}
              {selectedAlert?.type === "success" && "Success"}
            </DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4 py-4">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  {selectedAlert.type === "warning" && <AlertTriangle size={20} className="text-yellow-500" />}
                  {selectedAlert.type === "info" && <Info size={20} className="text-blue-500" />}
                  {selectedAlert.type === "success" && <CheckCircle size={20} className="text-green-500" />}
                </div>
                <div>
                  <div className="font-medium">{selectedAlert.message}</div>
                  <div className="text-sm text-muted-foreground">{selectedAlert.time}</div>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-md text-sm">{selectedAlert.details}</div>

              {selectedAlert.type === "warning" && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Ignore
                  </Button>
                  <Button className="flex-1 bg-accent hover:bg-accent/90">Review</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


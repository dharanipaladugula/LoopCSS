import { NextResponse } from "next/server"

// Simple sentiment analysis function
// In a real app, you would use a more sophisticated NLP library or service
function analyzeSentiment(text: string) {
  const positiveWords = ["good", "great", "awesome", "happy", "love", "excellent", "amazing", "wonderful", "beautiful"]
  const negativeWords = ["bad", "terrible", "awful", "sad", "hate", "poor", "horrible", "worst", "disappointed"]

  const words = text.toLowerCase().match(/\b(\w+)\b/g) || []
  const positiveCount = words.filter((word) => positiveWords.includes(word)).length
  const negativeCount = words.filter((word) => negativeWords.includes(word)).length

  // Extract keywords (just a simple implementation)
  const keywords = words
    .filter((word) => word.length > 3)
    .filter((word, index, self) => self.indexOf(word) === index)
    .slice(0, 4)

  if (positiveCount > negativeCount) {
    const score = Math.min(60 + positiveCount * 10, 98)
    return {
      score,
      label: "positive",
      keywords,
      metrics: {
        positiveWords: positiveCount,
        negativeWords: negativeCount,
        totalWords: words.length,
      },
    }
  } else if (negativeCount > positiveCount) {
    const score = Math.max(40 - negativeCount * 10, 5)
    return {
      score,
      label: "negative",
      keywords,
      metrics: {
        positiveWords: positiveCount,
        negativeWords: negativeCount,
        totalWords: words.length,
      },
    }
  } else {
    return {
      score: 50,
      label: "neutral",
      keywords,
      metrics: {
        positiveWords: positiveCount,
        negativeWords: negativeCount,
        totalWords: words.length,
      },
    }
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const sentiment = analyzeSentiment(text)

    return NextResponse.json(sentiment)
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}


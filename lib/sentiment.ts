import { createLanguageModel } from "@/lib/ml/model-loader"

// Types for sentiment analysis
export type SentimentResult = {
  score: number
  label: "positive" | "neutral" | "negative"
  keywords: string[]
}

// Analyze sentiment of text
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    // For production, you would use a proper ML model
    // Here we're using a simple approach with the language model
    const model = createLanguageModel()

    const prompt = `
      Analyze the sentiment of the following text and respond with a JSON object containing:
      1. score: A number from 0 to 100 representing the positivity (higher is more positive)
      2. label: One of "positive", "neutral", or "negative"
      3. keywords: An array of up to 5 key words or phrases that influenced the sentiment

      Text to analyze: "${text}"
      
      JSON response:
    `

    const response = await model.generate(prompt)

    try {
      // Parse the JSON response
      const result = JSON.parse(response.replace(/```json|```/g, "").trim())

      return {
        score: result.score,
        label: result.label,
        keywords: result.keywords || [],
      }
    } catch (parseError) {
      console.error("Error parsing sentiment result:", parseError)

      // Fallback to simple rule-based sentiment analysis
      return simpleRuleBasedSentiment(text)
    }
  } catch (error) {
    console.error("Error analyzing sentiment:", error)

    // Fallback to simple rule-based sentiment analysis
    return simpleRuleBasedSentiment(text)
  }
}

// Simple rule-based sentiment analysis as fallback
function simpleRuleBasedSentiment(text: string): SentimentResult {
  const lowercaseText = text.toLowerCase()

  // Define positive and negative word lists
  const positiveWords = [
    "good",
    "great",
    "awesome",
    "excellent",
    "amazing",
    "love",
    "happy",
    "wonderful",
    "fantastic",
    "beautiful",
    "best",
    "perfect",
    "joy",
    "excited",
    "glad",
    "positive",
    "nice",
    "thank",
    "thanks",
    "appreciate",
  ]

  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "hate",
    "sad",
    "worst",
    "poor",
    "disappointed",
    "negative",
    "angry",
    "upset",
    "annoyed",
    "frustrating",
    "useless",
    "waste",
    "problem",
    "fail",
    "failure",
    "wrong",
  ]

  // Count occurrences
  let positiveCount = 0
  let negativeCount = 0
  const foundKeywords: string[] = []

  // Check for positive words
  for (const word of positiveWords) {
    if (lowercaseText.includes(word)) {
      positiveCount++
      if (foundKeywords.length < 5 && !foundKeywords.includes(word)) {
        foundKeywords.push(word)
      }
    }
  }

  // Check for negative words
  for (const word of negativeWords) {
    if (lowercaseText.includes(word)) {
      negativeCount++
      if (foundKeywords.length < 5 && !foundKeywords.includes(word)) {
        foundKeywords.push(word)
      }
    }
  }

  // Calculate sentiment score (0-100)
  let score = 50 // Neutral baseline

  if (positiveCount > 0 || negativeCount > 0) {
    const total = positiveCount + negativeCount
    score = Math.round((positiveCount / total) * 100)
  }

  // Determine label
  let label: "positive" | "neutral" | "negative" = "neutral"
  if (score >= 60) label = "positive"
  else if (score <= 40) label = "negative"

  // Extract additional keywords if we don't have enough
  if (foundKeywords.length < 5) {
    const words = text.split(/\s+/)
    for (const word of words) {
      if (word.length > 4 && !foundKeywords.includes(word) && foundKeywords.length < 5) {
        foundKeywords.push(word)
      }
    }
  }

  return {
    score,
    label,
    keywords: foundKeywords,
  }
}


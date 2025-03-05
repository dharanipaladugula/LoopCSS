import { createLanguageModel } from "@/lib/ml/model-loader"
import { detectHateSpeech } from "./hate-speech"
import { analyzeSentiment } from "./sentiment"

// Types for content moderation
export type ModerationResult = {
  status: "approved" | "flagged" | "removed"
  reason?: string
  score: number
}

// Moderate content (text and optional image)
export async function moderateContent(text: string, imageUrl?: string): Promise<ModerationResult> {
  try {
    // Step 1: Check for hate speech
    const hateSpeechResult = await detectHateSpeech(text)

    if (hateSpeechResult.isHateSpeech && hateSpeechResult.confidence > 80) {
      return {
        status: "removed",
        reason: `Hate speech detected (${hateSpeechResult.category})`,
        score: 0,
      }
    }

    // Step 2: Analyze sentiment
    const sentimentResult = await analyzeSentiment(text)

    // Step 3: Check for other harmful content using the language model
    const model = createLanguageModel()

    const prompt = `
      Analyze the following content for harmful, inappropriate, or policy-violating material.
      Check for: violence, self-harm, sexual content, harassment, misinformation, spam, illegal activities.
      
      Respond with a JSON object containing:
      1. isHarmful: boolean (true if harmful content is detected)
      2. category: string describing the type of harmful content if detected
      3. severity: number from 1-10 (10 being most severe)
      
      Content to analyze: "${text}"
      
      JSON response:
    `

    const response = await model.generate(prompt)

    try {
      // Parse the JSON response
      const result = JSON.parse(response.replace(/```json|```/g, "").trim())

      if (result.isHarmful && result.severity >= 7) {
        return {
          status: "removed",
          reason: `Harmful content detected (${result.category})`,
          score: 0,
        }
      } else if (result.isHarmful && result.severity >= 4) {
        return {
          status: "flagged",
          reason: `Potentially harmful content (${result.category})`,
          score: 50,
        }
      }

      // Step 4: If image is provided, analyze it (in a real app, use a vision model)
      if (imageUrl) {
        // Placeholder for image moderation
        // In a real app, you would use a vision model or service like Google Cloud Vision API
        console.log("Image moderation would happen here for:", imageUrl)
      }

      // Calculate final moderation score
      let score = 100

      // Reduce score based on hate speech confidence
      if (hateSpeechResult.isHateSpeech) {
        score -= hateSpeechResult.confidence / 2
      }

      // Reduce score for very negative sentiment
      if (sentimentResult.label === "negative" && sentimentResult.score < 30) {
        score -= 30 - sentimentResult.score
      }

      // Reduce score based on harmful content severity
      if (result.isHarmful) {
        score -= result.severity * 5
      }

      // Determine final status
      if (score < 40) {
        return {
          status: "removed",
          reason: "Multiple policy violations detected",
          score,
        }
      } else if (score < 70) {
        return {
          status: "flagged",
          reason: "Potentially violates community guidelines",
          score,
        }
      } else {
        return {
          status: "approved",
          score,
        }
      }
    } catch (parseError) {
      console.error("Error parsing moderation result:", parseError)

      // Fallback to simple rule-based moderation
      return simpleRuleBasedModeration(text, hateSpeechResult, sentimentResult)
    }
  } catch (error) {
    console.error("Error moderating content:", error)

    // Get hate speech and sentiment results for fallback
    const hateSpeechResult = await detectHateSpeech(text)
    const sentimentResult = await analyzeSentiment(text)

    // Fallback to simple rule-based moderation
    return simpleRuleBasedModeration(text, hateSpeechResult, sentimentResult)
  }
}

// Simple rule-based moderation as fallback
function simpleRuleBasedModeration(
  text: string,
  hateSpeechResult: { isHateSpeech: boolean; confidence: number; category?: string },
  sentimentResult: { score: number; label: string },
): ModerationResult {
  const lowercaseText = text.toLowerCase()

  // Define harmful content patterns
  const violentContent = ["kill", "murder", "shoot", "attack", "bomb", "terrorist", "die", "death"]
  const sexualContent = ["porn", "sex", "nude", "naked", "xxx", "fuck", "cock", "pussy", "dick", "ass"]
  const selfHarmContent = ["suicide", "kill myself", "end my life", "cut myself", "self-harm"]
  const illegalContent = ["drugs", "cocaine", "heroin", "illegal", "steal", "robbery", "hack", "pirate"]

  // Check for explicit harmful content
  for (const term of selfHarmContent) {
    if (lowercaseText.includes(term)) {
      return {
        status: "removed",
        reason: "Content related to self-harm",
        score: 0,
      }
    }
  }

  // Count violations
  let violentCount = 0
  let sexualCount = 0
  let illegalCount = 0

  for (const term of violentContent) {
    if (lowercaseText.includes(term)) violentCount++
  }

  for (const term of sexualContent) {
    if (lowercaseText.includes(term)) sexualCount++
  }

  for (const term of illegalContent) {
    if (lowercaseText.includes(term)) illegalCount++
  }

  // Calculate score
  let score = 100

  // Reduce score based on hate speech
  if (hateSpeechResult.isHateSpeech) {
    score -= hateSpeechResult.confidence / 2
  }

  // Reduce score based on negative sentiment
  if (sentimentResult.label === "negative") {
    score -= (100 - sentimentResult.score) / 3
  }

  // Reduce score based on harmful content
  score -= violentCount * 10
  score -= sexualCount * 15
  score -= illegalCount * 12

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score))

  // Determine status
  if (score < 40) {
    let reason = "Content violates community guidelines"

    if (violentCount > 0) reason = "Violent content detected"
    else if (sexualCount > 0) reason = "Sexual content detected"
    else if (illegalCount > 0) reason = "Content related to illegal activities"
    else if (hateSpeechResult.isHateSpeech) reason = `Hate speech detected (${hateSpeechResult.category || "general"})`

    return {
      status: "removed",
      reason,
      score,
    }
  } else if (score < 70) {
    return {
      status: "flagged",
      reason: "Content may violate community guidelines",
      score,
    }
  } else {
    return {
      status: "approved",
      score,
    }
  }
}


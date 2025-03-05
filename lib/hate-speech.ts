import { createLanguageModel } from "@/lib/ml/model-loader"

// Types for hate speech detection
export type HateSpeechResult = {
  isHateSpeech: boolean
  confidence: number
  category?: string
  language: string
}

// Detect hate speech in text
export async function detectHateSpeech(text: string): Promise<HateSpeechResult> {
  try {
    // For production, you would use a proper ML model
    // Here we're using a simple approach with the language model
    const model = createLanguageModel()

    // Detect language first
    const language = await detectLanguage(text)

    const prompt = `
      Analyze the following text for hate speech, offensive content, or abusive language.
      Respond with a JSON object containing:
      1. isHateSpeech: boolean (true if hate speech is detected)
      2. confidence: number from 0 to 100 representing confidence in the detection
      3. category: string describing the type of hate speech if detected (e.g., "racism", "sexism", etc.)
      
      Text to analyze: "${text}"
      
      JSON response:
    `

    const response = await model.generate(prompt)

    try {
      // Parse the JSON response
      const result = JSON.parse(response.replace(/```json|```/g, "").trim())

      return {
        isHateSpeech: result.isHateSpeech,
        confidence: result.confidence,
        category: result.category,
        language,
      }
    } catch (parseError) {
      console.error("Error parsing hate speech result:", parseError)

      // Fallback to simple rule-based detection
      return simpleRuleBasedHateSpeechDetection(text, language)
    }
  } catch (error) {
    console.error("Error detecting hate speech:", error)

    // Fallback to simple rule-based detection
    const language = await detectLanguage(text)
    return simpleRuleBasedHateSpeechDetection(text, language)
  }
}

// Detect language of text
async function detectLanguage(text: string): Promise<string> {
  try {
    const model = createLanguageModel()

    const prompt = `
      Identify the language of the following text. Respond with just the language code (e.g., "en" for English, "te" for Telugu, etc.).
      
      Text: "${text}"
      
      Language code:
    `

    const response = await model.generate(prompt)
    return response.trim().toLowerCase()
  } catch (error) {
    console.error("Error detecting language:", error)
    return "en" // Default to English
  }
}

// Simple rule-based hate speech detection as fallback
function simpleRuleBasedHateSpeechDetection(text: string, language: string): HateSpeechResult {
  const lowercaseText = text.toLowerCase()

  // Define hate speech word lists for different languages
  const hateWordsByLanguage: Record<string, string[]> = {
    en: [
      "hate",
      "kill",
      "die",
      "murder",
      "racist",
      "sexist",
      "idiot",
      "stupid",
      "ugly",
      "fat",
      "retard",
      "cripple",
      "bitch",
      "whore",
      "slut",
      "faggot",
      "nigger",
      "chink",
      "spic",
      "kike",
      "terrorist",
    ],
    te: ["దుర్మార్గుడు", "నీచుడు", "పిచ్చి", "వెధవ", "లంజ", "దెంగ", "పూకు", "మొడ్డ", "లవడ", "గాడిద", "కుక్క", "పంది", "చచ్చిపో", "చంపేస్తా"],
    // Add more languages as needed
  }

  // Use English as fallback if language not supported
  const hateWords = hateWordsByLanguage[language] || hateWordsByLanguage.en

  // Count occurrences of hate words
  let hateWordCount = 0
  let foundCategory = ""

  for (const word of hateWords) {
    if (lowercaseText.includes(word)) {
      hateWordCount++

      // Simple category detection
      if (!foundCategory) {
        if (["racist", "nigger", "chink", "spic", "kike"].includes(word)) {
          foundCategory = "racism"
        } else if (["sexist", "bitch", "whore", "slut"].includes(word)) {
          foundCategory = "sexism"
        } else if (["faggot"].includes(word)) {
          foundCategory = "homophobia"
        } else if (["terrorist"].includes(word)) {
          foundCategory = "islamophobia"
        } else if (["retard", "cripple"].includes(word)) {
          foundCategory = "ableism"
        } else {
          foundCategory = "general_hate"
        }
      }
    }
  }

  // Calculate confidence score (0-100)
  const confidence = Math.min(hateWordCount * 25, 100)

  // Determine if it's hate speech
  const isHateSpeech = confidence >= 50

  return {
    isHateSpeech,
    confidence,
    category: isHateSpeech ? foundCategory : undefined,
    language,
  }
}


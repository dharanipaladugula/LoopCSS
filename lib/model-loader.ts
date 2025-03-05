import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Interface for language model
export interface LanguageModel {
  generate: (prompt: string) => Promise<string>
}

// Create a language model instance
export function createLanguageModel(): LanguageModel {
  return {
    generate: async (prompt: string) => {
      try {
        // Use the AI SDK to generate text
        const { text } = await generateText({
          model: openai("gpt-4o"),
          prompt,
          maxTokens: 1000,
        })

        return text
      } catch (error) {
        console.error("Error generating text with language model:", error)
        throw error
      }
    },
  }
}


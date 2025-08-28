import { client } from "./mistral";
import { getTryAgainPrompt } from "./prompts";

// Message interface
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * Function to create a new conversation with a system prompt
 * @param systemPrompt - Initial system message to set context
 * @returns ChatMessage[] - Initial message array with system prompt
 */
export function createConversation(systemPrompt?: string): ChatMessage[] {
  if (systemPrompt) {
    return [{ role: "system", content: systemPrompt }];
  }
  return [];
}

/**
 * Function to create a try-again conversation with enhanced system prompt
 * @param tones - Array of tone strings to apply (e.g., ["professional", "concise"])
 * @param previousAttempts - Array of previous rewrite attempts to avoid repeating
 * @param originalText - The original text that needs to be rewritten
 * @returns ChatMessage[] - Conversation array with system message containing try-again instructions
 */
export function createTryAgainConversation(
  tones: string[],
  previousAttempts: string[],
  originalText: string
): ChatMessage[] {
  return [
    {
      role: "system" as const,
      content: getTryAgainPrompt(tones, previousAttempts, originalText),
    },
  ];
}

/**
 * Function to add a message to conversation history
 * @param history - Current conversation history
 * @param role - The role of the message sender
 * @param content - The message content
 * @returns ChatMessage[] - Updated conversation history
 */
export function addMessage(
  history: ChatMessage[],
  role: "system" | "user" | "assistant",
  content: string
): ChatMessage[] {
  return [...history, { role, content }];
}

/**
 * Chat function that interacts with Mistral AI
 * @param model - The Mistral model to use
 * @param messageHistory - Array of previous messages in the conversation
 * @param newPrompt - The new user prompt to add to the conversation
 * @param chatOptions - Optional parameters for controlling the response
 * @returns Promise<string> - The assistant's response
 */
export async function chat(
  model: string,
  messageHistory: ChatMessage[],
  newPrompt: string,
  chatOptions: ChatOptions
): Promise<string> {
  try {
    // Create the full message array including history and new prompt
    const messages: ChatMessage[] = [
      ...messageHistory,
      { role: "user", content: newPrompt },
    ];

    // Prepare the request parameters with chat options
    const requestParams: any = {
      model: model,
      messages: messages,
    };

    // Apply chat options if provided
    if (chatOptions.maxTokens !== undefined) {
      requestParams.maxTokens = chatOptions.maxTokens;
    }
    if (chatOptions.temperature !== undefined) {
      requestParams.temperature = chatOptions.temperature;
    }
    if (chatOptions.topP !== undefined) {
      requestParams.topP = chatOptions.topP;
    }

    // Make the API call to Mistral
    const chatResponse = await client.chat.complete(requestParams);

    // Extract and return the response content
    const responseContent = chatResponse.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No response content received from Mistral");
    }

    // Handle both string and ContentChunk[] types
    if (typeof responseContent === "string") {
      return responseContent;
    } else {
      // If it's ContentChunk[], extract text content from text chunks
      return responseContent
        .filter((chunk) => chunk.type === "text")
        .map((chunk) => (chunk as any).text || "")
        .join("");
    }
  } catch (error) {
    console.error("Error in chat function:", error);
    throw new Error(
      `Failed to get response from Mistral: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

import { removeMarkdown } from "@excalidraw/markdown-to-text";
import { client } from "./mistral";
import {
  getSystemPrompt,
  getToneDescriptions,
  getTryAgainPrompt,
} from "./prompts";

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
 * Function to create a new conversation with a given tones
 * @param tones - Array of tone strings to apply (e.g., ["professional", "concise"])
 * @returns ChatMessage[] - Initial message array with a detailed system prompt
 */
export function createConversation(tones: string[]): ChatMessage[] {
  const systemPrompt = getSystemPrompt(tones);
  return [
    {
      role: "system",
      content: systemPrompt,
    },
  ];
}

/**
 * Function to create a try-again conversation with enhanced system prompt
 * @param tones - Array of tone strings to apply (e.g., ["professional", "concise"])
 * @param previousAttempts - Array of previous rewrite attempts to avoid repeating
 * @param originalText - The original text that needs to be rewritten
 * @returns ChatMessage[] - Conversation array with system + previous attempts + new try-again prompt
 */
export function createTryAgainConversation(
  tones: string[],
  previousAttempts: string[],
  originalText: string
): ChatMessage[] {
  const systemPrompt = getSystemPrompt(tones);
  // Step 1: System role with detailed instructions
  const conversation: ChatMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // Step 2: Add previous attempts as assistant messages
  previousAttempts.forEach((attempt, index) => {
    conversation.push({
      role: "assistant",
      content: `Previous attempt ${index + 1}: "${attempt}"`,
    });
  });

  // Step 3: Add user request to rewrite with JSON format
  const tonesDescriptions = getToneDescriptions(tones);
  conversation.push({
    role: "user",
    content: `
Rewrite the original text again in a ${tonesDescriptions} style,
avoiding words, phrases, or sentence structures from previous attempts.

Original text: "${originalText}"

STRICT RESPONSE FORMAT:
{
  "rewritten_text": ""
}

Rules:
- Place the rewritten version inside the "rewritten_text" field only.
- Do NOT include introductions, explanations, or commentary.
- Do NOT add extra keys or values.
- Escape quotes inside the text if necessary.
- Be creative and maintain the original meaning while following the tone instructions.
    `.trim(),
  });

  return conversation;
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

    // Handle both string and ContentChunk[] types and converts markdown to text
    if (typeof responseContent === "string") {
      return parseRewrittenText(removeMarkdown(responseContent));
    } else {
      // If it's ContentChunk[], extract text content from text chunks
      return parseRewrittenText(
        removeMarkdown(
          responseContent
            .filter((chunk) => chunk.type === "text")
            .map((chunk) => (chunk as any).text || "")
            .join("")
        )
      );
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

/**
 * Parses the model output and extracts the rewritten text
 * @param output - The raw output string from the model
 * @returns string - The extracted rewritten text
 * @throws Error if the output cannot be parsed or the field is missing
 */
export function parseRewrittenText(output: string): string {
  try {
    // Remove any leading/trailing whitespace
    const cleanedOutput = output.trim();

    // Attempt to parse JSON
    const parsed = JSON.parse(cleanedOutput);

    // Check for the key
    if (!parsed.rewritten_text || typeof parsed.rewritten_text !== "string") {
      throw new Error('Missing or invalid "rewritten_text" field in output');
    }

    return parsed.rewritten_text;
  } catch (err) {
    console.error("Failed to parse rewritten text:", err);
    throw new Error(
      "Unable to parse model output. Ensure the response is valid JSON with a 'rewritten_text' field."
    );
  }
}

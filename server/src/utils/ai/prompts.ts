// Tone prompts for 3x3 tone matrix combinations
// Matrix layout:
//     0        1       2
// 0  Con-Prof Prof   Exp-Prof
// 1  Concise Default Expanded
// 2  Cas-Con Casual  Cas-Exp
// Sorted Order for the keys
// (eg: "expanded-professional" instead of "professional-expaned")
export const TONE_PROMPTS = {
  // Single tone positions
  professional: `You are a professional tone assistant. Rewrite the given text to be more professional, formal, and business-appropriate. Use proper grammar, formal vocabulary, and maintain a respectful, authoritative tone. Remove casual expressions and slang.`,

  expanded: `You are an expansion assistant. Rewrite the given text to be more detailed, comprehensive, and elaborate. Add relevant context, explanations, and examples while maintaining the original meaning. Make the content richer and more informative.`,

  casual: `You are a casual tone assistant. Rewrite the given text to be more relaxed, friendly, and conversational. Use informal language, contractions, and a warm, approachable tone. Make it sound like a conversation between friends.`,

  concise: `You are a conciseness assistant. Rewrite the given text to be more brief, direct, and to-the-point. Remove unnecessary words, redundancies, and filler content while preserving the core message and meaning.`,

  center: `You are a balanced tone assistant. Rewrite the given text to have a neutral, balanced tone that is neither too formal nor too casual, neither too brief nor too verbose. Aim for clear, straightforward communication.`,

  // Two-tone combinations
  "expanded-professional": `You are a professional expansion assistant. Rewrite the given text to be both professional and more detailed. Use formal, business-appropriate language while adding comprehensive explanations, context, and relevant details. Maintain authority while being thorough.`,

  "concise-professional": `You are a professional brevity assistant. Rewrite the given text to be both professional and concise. Use formal, business-appropriate language while keeping it brief and direct. Remove casual elements and unnecessary words while maintaining professionalism.`,

  "casual-expanded": `You are a casual expansion assistant. Rewrite the given text to be both relaxed and more detailed. Use friendly, conversational language while adding explanations, examples, and context. Make it comprehensive but approachable and easy to read.`,

  "casual-concise": `You are a casual brevity assistant. Rewrite the given text to be both friendly and brief. Use informal, conversational language while keeping it short and to-the-point. Maintain a warm tone while removing unnecessary details.`,
};

/**
 * Function to create a try-again conversation with enhanced system prompt
 * @param tones - Array of tone strings to apply (e.g., ["professional", "concise"])
 * @param previousAttempts - Array of previous rewrite attempts to avoid repeating
 * @param originalText - The original text that needs to be rewritten
 * @returns ChatMessage[] - Conversation array with system message containing try-again instructions
 */
export function getTryAgainPrompt(
  tones: string[],
  previousAttempts: string[],
  originalText: string
): string {
  const baseTonePrompt = getTonePrompt(tones);
  const tonesDescription = tones.length > 1 ? tones.join(" and ") : tones[0];

  const tryAgainAddition = `

IMPORTANT: You have previously generated these versions, so please create a COMPLETELY DIFFERENT rewrite that avoids repeating the same words, phrases, or sentence structures:

Previous attempts to avoid:
${previousAttempts
  .map((attempt, index) => `${index + 1}. "${attempt}"`)
  .join("\n")}

Requirements for this new attempt:
- Use different vocabulary and word choices than the previous attempts
- Employ different sentence structures and lengths
- Approach the ${tonesDescription} tone from a fresh angle
- Maintain the same core meaning as the original text
- Be creative and find new ways to express the message
- If previous attempts were longer, try a different length approach
- If previous attempts used specific phrases, avoid those exact phrases

Original text to rewrite: "${originalText}"

Generate a fresh, creative rewrite that feels distinctly different from the previous attempts while still achieving the ${tonesDescription} tone.`;

  return baseTonePrompt + tryAgainAddition;
}

/**
 * Function to get system prompts for given set of tones
 * @param tones - Array of tone strings to apply (e.g., ["professional", "concise"])
 * @returns string - System prompt for the given combination of tones
 */
export function getTonePrompt(tones: string[]): string {
  const tonesKey = tones.join("-");
  return (
    TONE_PROMPTS[tonesKey as keyof typeof TONE_PROMPTS] || TONE_PROMPTS.center
  );
}

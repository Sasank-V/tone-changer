// Tone prompts for 3x3 tone matrix combinations
// Matrix layout:
//     0        1       2
// 0  Con-Prof Prof   Exp-Prof
// 1  Concise Default Expanded
// 2  Cas-Con Casual  Cas-Exp
// Sorted Order for the keys
// (eg: "expanded-professional" instead of "professional-expaned")

export const TONE_DESCRIPTIONS = {
  // Single tone positions
  professional:
    "Formal, business-appropriate, and authoritative. Polished language with a serious and respectful tone, suitable for corporate communication or professional documentation.",
  expanded:
    "Detailed, comprehensive, and informative. Adds depth and context, providing thorough explanations and supporting examples to make the content richer and more complete.",
  casual:
    "Relaxed, friendly, and conversational. Warm and approachable language that feels like a natural chat or casual conversation with a peer.",
  concise:
    "Brief, clear, and to-the-point. Focuses on essential information only, removing unnecessary words and redundancies for maximum clarity and efficiency.",
  center:
    "Balanced and neutral. Neither overly formal nor casual, combining clarity and readability while maintaining a professional yet approachable tone.",

  // Two-tone combinations
  "expanded-professional":
    "Detailed and formal. Provides thorough explanations and context while maintaining a polished, authoritative, and professional style.",
  "concise-professional":
    "Brief and formal. Communicates the essential information efficiently with professional, precise, and authoritative language.",
  "casual-expanded":
    "Friendly and detailed. Engaging and approachable style with additional context and examples, making the content informative yet easygoing.",
  "casual-concise":
    "Friendly and brief. Warm, approachable language that communicates key points quickly and clearly, without unnecessary elaboration.",
};

/**
 * Generates a detailed system prompt for rewriting text in specified tones
 * @param tones - Array of tone strings (e.g., ["professional", "concise"])
 * @returns string - System prompt for use as a system message
 */
export function getSystemPrompt(tones: string[]): string {
  const toneDescriptions = getToneDescriptions(tones);
  return `
You are a rephrasing professional. Your sole task is to rewrite any given text according to the following tone(s):

${toneDescriptions}

STRICT RULES:
- Respond ONLY in this JSON format:
{
  "rewritten_text": ""
}
- Place the rewritten version inside the "rewritten_text" field only.
- Do NOT add extra keys, values, explanations, greetings, or commentary.
- Do NOT prefix with phrases like "Here’s the rewrite" or "Sure".
- Use new vocabulary and sentence structures if multiple rewrites are requested.
- Maintain the original meaning while following the tone instructions.
- Output plain text only, no markdown or formatting outside the JSON.
  `.trim();
}

/**
 * Generates a user prompt instructing the model to rewrite text in specified tones
 * @param tones - Array of tone strings (e.g., ["professional", "concise"])
 * @param text - The original text to rewrite
 * @returns string - A detailed prompt for the model
 */
export function getToneRewritePrompt(tones: string[], text: string): string {
  const tonesList = tones.join(" and ");
  const toneDescriptions = getToneDescriptions(tones);

  return `
Rewrite the following text in a ${tonesList} style. Follow these STRICT instructions:

1. Maintain the original meaning and intent.  
2. Avoid copying phrases or sentence structures from the original text.  
3. Use fresh vocabulary, varied sentence lengths, and natural flow.  
4. Adhere to the target tone:
   - ${toneDescriptions}

STRICT RESPONSE FORMAT:
- Respond ONLY in JSON with the following structure:
{
  "rewritten_text": ""
}
- Place the rewritten text inside the "rewritten_text" field.  
- Do NOT add extra keys or values.  
- Do NOT include introductions, explanations, greetings, or meta-comments.  
- Provide a single plain text string, no markdown, no formatting.  

Original text: "${text}"
  `.trim();
}

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
  const baseToneDescription = getToneDescriptions(tones); // updated to use descriptions
  const tonesDescription = tones.length > 1 ? tones.join(" and ") : tones[0];

  const tryAgainAddition = `

IMPORTANT: You have previously generated these versions. Please create a COMPLETELY DIFFERENT rewrite that avoids repeating words, phrases, or sentence structures:

Previous attempts:
${previousAttempts
  .map((attempt, index) => `${index + 1}. "${attempt}"`)
  .join("\n")}

Requirements for this new attempt:
- Use different vocabulary and word choices than previous attempts
- Employ different sentence structures and lengths
- Approach the ${tonesDescription} tone from a fresh angle (${baseToneDescription})
- Maintain the same core meaning as the original text
- Be creative and find new ways to express the message
- If previous attempts were longer, try a different length
- If previous attempts used specific phrases, avoid them

Original text to rewrite: "${originalText}"

Return ONLY the rewritten text. Do NOT include introductions, explanations, or meta-comments.`;

  return tryAgainAddition;
}

/**
 * Function to get tone descriptions for given set of tones
 * @param tones - Array of tone strings to apply (e.g., ["professional", "concise"])
 * @returns string - tone description for the given combination of tones
 */
export function getToneDescriptions(tones: string[]): string {
  const tonesKey = tones.join("-");
  return (
    TONE_DESCRIPTIONS[tonesKey as keyof typeof TONE_DESCRIPTIONS] ||
    TONE_DESCRIPTIONS.center
  );
}

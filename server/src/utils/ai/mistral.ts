import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";
dotenv.config();

// Define Mistral Client
const apiKey = process.env.MISTRAL_API_KEY!;
export const model = process.env.MISTRAL_MODEL_NAME || "mistral-small-latest";
export const client = new Mistral({ apiKey: apiKey });

export function estimateTokens(text: string): number {
  return text.length / 4; // Rough estimation ( 1 token = 4 characters )
}

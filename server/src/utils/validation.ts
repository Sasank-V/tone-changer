import { z } from "zod";
export const ToneRequestSchema = z.object({
  text: z.string().min(1).max(1000),
  tones: z.string().array().min(1).max(3),
  tryAgain: z.boolean().optional(),
});

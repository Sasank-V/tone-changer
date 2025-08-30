import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { toneQueue } from "./utils/bullmq";
import { TONE_PROMPTS } from "./utils/ai/prompts";
import { z } from "zod";
import { ToneRequestSchema } from "./utils/validation";

//TODO:
// Implement Stats API Endpoints for Redis and BullMQ
// Implement Middlewares for security

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.MISTRAL_API_KEY) {
  console.error("Error: MISTRAL_API_KEY environment variable is required");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// POST /api/tone - Change tone of the text
app.post("/api/tone", async (req, res) => {
  const parseResult = ToneRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parseResult.error.errors,
    });
  }
  const { text, tones, tryAgain = false } = parseResult.data;
  try {
    const result = await toneQueue.addJob({
      text,
      tones,
      tryAgain,
    });
    res.json(result);
  } catch (error) {
    console.error("Error processing tone change: ", error);
    res.status(500).json({
      error: "Failed to process tone change",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

//Graceful Shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM Recieved, shutting down gracefully");
  await toneQueue.close();
  process.exit(0);
});
process.on("SIGINT", async () => {
  console.log("SIGINT Recieved, shutting down gracefully");
  await toneQueue.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Using Redis for caching and BullMQ for job processing");
});

import { Job, Queue, QueueEvents, Worker } from "bullmq";
import {
  chat,
  ChatMessage,
  ChatOptions,
  createConversation,
  createTryAgainConversation,
} from "./ai/chat";
import Redis from "ioredis";
import { redisCache } from "./redis";
import { estimateTokens, model } from "./ai/mistral";
import { getTonePrompt } from "./ai/prompts";

interface ToneJobData {
  text: string;
  tones: string[];
  messages?: ChatMessage[];
  tryAgain: boolean;
  cacheKey: string;
}

class ToneQueue {
  private queue: Queue;
  private worker: Worker;
  private queueEvents: QueueEvents;
  private redis: Redis;

  constructor() {
    // Redis Connection for BullMQ
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times: number) => {
        return Math.min(times * 100, 2000); // exponential backoff , maxDelay = 2s
      },
    });
    // Intialize queue
    this.queue = new Queue("tone-processing", {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 50, // Keep last 50 completed jobs
        removeOnFail: 100, // Keep last 100 failed jobs
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });
    //Initalise QueueEvents
    this.queueEvents = new QueueEvents("tone-processing", {
      connection: this.redis,
    });
    //Intialise worker
    this.worker = new Worker("tone-processing", this.processJob.bind(this), {
      connection: this.redis,
      concurrency: 3, // Process upto 3 jobs concurrently
    });

    //Event listeners
    this.worker.on("completed", (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });
    this.worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed: `, err);
    });
    this.queue.on("error", (err) => {
      console.error(`Queue error: `, err);
    });
  }
  /**
   * Add a job to the queue
   * @param data - Job data
   * @returns Promise<any>
   */
  async addJob(data: Omit<ToneJobData, "cacheKey">): Promise<any> {
    const sortedTones = data.tones.sort();
    const cacheKey = `${data.text}:${sortedTones.join("-")}`;
    const jobData: ToneJobData = {
      ...data,
      cacheKey,
    };

    //Check cache first (if not tryAgain)
    if (!data.tryAgain) {
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        const versions = await redisCache.getVersions(cacheKey);
        return {
          result: cached,
          attemptNumber: 1,
          hasMultipleAttempts: versions.length > 1,
          totalAttempts: versions.length,
          cacheKey,
          fromCache: true,
        };
      }
    }
    const job = await this.queue.add("process-tone", jobData, {
      priority: data.tryAgain ? 5 : 10, // Try again jobs has a lower priority
    });

    // Wait for job completion with timeout
    try {
      const result = await job.waitUntilFinished(this.queueEvents, 30000); // 30 second timeout
      return result;
    } catch (error) {
      console.error(`Job ${job.id} failed or timed out:`, error);
      throw new Error(
        `Job processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Process individual job
   * @param job - BullMQ job
   * @returns Promise<any>
   */
  private async processJob(job: Job<ToneJobData>): Promise<any> {
    const { text, tones, tryAgain, cacheKey } = job.data;

    // Chat Options for token control
    let maxTokens = 0;
    const tokens = estimateTokens(text);
    if (tones.includes("concise")) {
      maxTokens = tokens; // about the same as input length
    } else if (tones.includes("expanded")) {
      maxTokens = tokens * 3; // allow up to ~3x longer
    }

    const chatOptions: ChatOptions = {
      maxTokens,
      temperature: 0.7,
      topP: 1.0,
    };
    try {
      // Handle Try Again requests
      if (tryAgain) {
        // Get Previous versions
        const previousAttemps = await redisCache.getVersions(cacheKey);
        if (previousAttemps.length > 0) {
          // Create a try again conversation
          const conversation = createTryAgainConversation(
            tones,
            previousAttemps,
            text
          );

          //Generate a new version
          const result = await chat(model, conversation, "", chatOptions);

          //Cache new version
          await redisCache.addVersion(cacheKey, result);
          await redisCache.set(cacheKey, result);

          const allVersions = await redisCache.getVersions(cacheKey);
          return {
            result,
            attemptNumber: allVersions.length,
            hasMultipleAttempts: true,
            totalAttempts: allVersions.length,
            cacheKey,
            fromCache: false,
          };
        }
      }

      // First Attempt
      const systemPrompt = getTonePrompt(tones);
      const conversation = createConversation(systemPrompt);

      //Generate result
      const result = await chat(
        model,
        conversation,
        `Please rewrite the following text: ${text}`,
        chatOptions
      );

      // Cache the result
      await redisCache.set(cacheKey, result);
      await redisCache.addVersion(cacheKey, result);

      return {
        result,
        attemptNumber: 1,
        hasMultipleAttempts: false,
        totalAttempts: 1,
        cacheKey,
        fromCache: false,
      };
    } catch (error) {
      console.error("Job processing error:", error);
      throw error;
    }
  }
  /**
   * Get versions from cache
   * @param text - Original text
   * @param tones - Array of tones
   * @returns Promise<object>
   */
  async getVersions(text: string, tones: string[]): Promise<object> {
    const sortedTones = tones.sort();
    const cacheKey = `${text}:${sortedTones.join("-")}`;
    const versions = await redisCache.getVersions(cacheKey);

    return {
      versions,
      total: versions.length,
      cacheKey,
      hasVersions: versions.length > 0,
    };
  }
  async close(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
    await this.redis.quit();
    await redisCache.disconnect();
  }
}

export const toneQueue = new ToneQueue();

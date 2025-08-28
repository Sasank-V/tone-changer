import Redis from "ioredis";

// TODO:
// Optional - define function to return redis stats such as memory and keyspace

export class RedisCache {
  private redis: Redis;
  private defaultTTL = 3600; // 1 hour

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        return Math.min(times * 100, 2000); // exponential backoff , maxDelay = 2s
      },
    });
    this.redis.on("connect", () => {
      console.log("Connected to Redis");
    });
    this.redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  }

  /**
   * Get cached result
   * @param key - Cache key
   * @returns Promise<string | null>
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  /**
   * Set cached result with TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.setex(key, this.defaultTTL, value);
      }
    } catch (error) {
      console.error("Redis set error: ", error);
    }
  }

  /**
   * Get all versions for a text/tone combination
   * @param key - Base cache key
   * @returns Promise<string[]>
   */
  async getVersions(key: string): Promise<string[]> {
    try {
      const versionsKey = `versions:${key}`;
      const versions = await this.redis.lrange(versionsKey, 0, -1);
      return versions;
    } catch (error) {
      console.error("Redis getVersions error: ", error);
      return [];
    }
  }

  /**
   * Add a new version to the versions list
   * @param key - Base cache key
   * @param version - New version to add
   */
  async addVersion(key: string, version: string): Promise<void> {
    try {
      const versionKey = `versions:${key}`;
      await this.redis.lpush(versionKey, version);
      await this.redis.expire(versionKey, 2 * this.defaultTTL);
    } catch (error) {
      console.error("Redis addVersion error:", error);
    }
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns Promise<boolean>
   */

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.redis.exists(key)) == 1;
    } catch (error) {
      console.error("Redis exists error: ", error);
      return false;
    }
  }
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export const redisCache = new RedisCache();

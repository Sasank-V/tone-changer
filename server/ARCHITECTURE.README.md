# Server Architecture

This document describes the technical architecture of the Tone Changer server, including design decisions, state management, error handling, and integration with Redis, BullMQ, and Mistral AI.

---

## Overview

The server is built with **Node.js** and **Express**, using **TypeScript** for type safety. It exposes a REST API for tone-changing operations, leveraging Redis for caching and BullMQ for job queue management. AI-powered tone changes are handled via the Mistral API.

---

## Technical Architecture Decisions & Trade-offs

- **Job Queue with BullMQ**: All tone-changing requests are processed asynchronously using BullMQ. This allows for scalable, concurrent processing and retry logic, ensuring reliability even under load.
- **Redis Caching**: Results are cached in Redis to minimize redundant AI calls and improve response times. Multiple versions of results are stored for each text/tone combination, supporting the "try again" feature.
- **Separation of Concerns**: The codebase is modular, with dedicated files for queue management (`bullmq.ts`), caching (`redis.ts`), and AI logic (`ai/`). This improves maintainability and testability.
- **Trade-offs**:
  - Asynchronous job processing introduces complexity but enables scalability and robust error handling.
  - Caching results in Redis reduces API costs and latency but requires cache invalidation strategies for stale data.

---

## State Management & Job Processing

- **Request Flow**:
  1. The API receives a POST request to `/api/tone` with text and tones.
  2. The request is added to the BullMQ queue (`toneQueue.addJob`).
  3. The worker processes the job, checking Redis for cached results before invoking the AI model.
  4. Results are cached and returned to the client, with support for multiple attempts ("try again").
- **RedisCache**:
  - Provides methods for getting/setting cache entries, managing version lists, and checking key existence.
  - Handles connection errors and supports graceful shutdown.
- **BullMQ Worker**:
  - Processes jobs one at a time.(can't be more than one because of rate limits)
  - Implements retry and backoff strategies for failed jobs.
  - Emits events for job completion and failure, aiding monitoring and debugging.

---

## AI Integration

- **Mistral API**: The AI logic is encapsulated in the `ai/` folder, with functions for generating prompts and managing conversations.
- **Dynamic Token Control**: The number of output tokens is adjusted based on selected tones (e.g., "concise" or "expanded").
- **Versioning**: Each AI-generated result is stored as a new version in Redis, allowing users to retry and compare outputs.

---

## Error Handling & Edge Cases

- **Validation**: Incoming requests are validated for required fields and correct types. Invalid requests return a 400 error.
- **Graceful Fallbacks**: If a cache miss occurs, the job is processed by the AI. If the AI or queue fails, errors are logged and a 500 error is returned to the client.
- **Retry Logic**: BullMQ automatically retries failed jobs up to 3 times with exponential backoff.
- **Connection Handling**: Redis and BullMQ connections are monitored for errors, and the server supports graceful shutdown on SIGTERM/SIGINT.
- **Timeouts**: Jobs have a 30-second timeout to prevent hanging requests.

---

## Summary

The server architecture is designed for scalability, reliability, and maintainability. Asynchronous job processing, robust caching, and modular code organization ensure efficient handling of tone-changing requests. Error handling and edge case management are prioritized throughout, providing a resilient backend for the Tone Changer application.
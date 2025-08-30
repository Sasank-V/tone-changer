# Tone Changer - Server

This document explains how to set up and run the server portion of the project locally for development and production.

-----

## Prerequisites

To get the server up and running, you'll need the following:

  - **Node.js (18+ recommended)** and **npm** installed.
  - **Docker** and **Docker Compose** to run a local Redis container.
  - **AI Provider Credentials (Optional)**: If you plan to use the AI features, you'll need an API key for the configured provider (e.g., Mistral AI).

-----

## Quick Setup

1.  **Clone the Repository**: If you haven't already, clone the project to your local machine.

2.  **Navigate to the Server Directory**: `cd server`

3.  **Install Dependencies**: Run `npm install` to download all the necessary libraries.

4.  **Create an Environment File**: Copy the example file and update it with your configuration.

    ```powershell
    copy .env.example .env
    ```

    Open the new `.env` file and, at a minimum, ensure the Redis connection details are correct. If you're using AI features, set your `MISTRAL_API_KEY`.

    ```dotenv
    # Redis Configuration
    REDIS_HOST="localhost"
    REDIS_PORT=6379

    # AI API Configuration
    MISTRAL_API_KEY="your_mistral_api_key_here"
    MISTRAL_MODEL_NAME=mistral_model_name

    ```

5.  **Start Redis in Docker**: Open a new terminal in the project's root and start the Redis container using Docker Compose.

    ```powershell
    docker compose up -d
    ```

6.  **Run the Server**: Now that Redis is running, you can start the server in development mode.

    ```powershell
    npm run dev
    ```

-----

## Local Redis with Docker

The quickest and most reliable way to run a local Redis instance is with Docker. The project includes a `docker-compose.yml` file to make this process seamless.

### `docker-compose.yml`

This file defines the Redis service, ensuring its data is persistent and accessible from your server.

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    container_name: tone_changer_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Commands

  - To start the Redis container:

    ```sh
    docker compose up -d
    ```

  - To stop the Redis container:

    ```sh
    docker compose down
    ```

Your server will connect to Redis at `localhost:6379`, as configured in the `.env` file.

-----

## Useful Scripts

The `package.json` file contains several helpful scripts for building and running the server:

  - `npm run dev`: Compiles TypeScript and runs the server with live-reloading. This is ideal for local development.
  - `npm run build`: Compiles the TypeScript source files (`src/`) into production-ready JavaScript (`dist/`).
  - `npm start`: Runs the compiled server from the `dist/` directory. This is the command you'd use in a production environment.

-----

## Troubleshooting

  - **"module not found"**: If you encounter this error after running `npm run dev`, a dependency is likely missing. Run `npm install` to resolve it.
  - **Redis connection errors**: Verify that your Redis container is running by using the `docker ps` command. Ensure that the `REDIS_HOST` and `REDIS_PORT` in your `.env` file are correct.
  - **TypeScript build fails**: If the `npm run build` or `npm run dev` command fails, run `npx tsc -b` to view detailed TypeScript diagnostics. These errors will help you pinpoint and fix the problem in the source code.
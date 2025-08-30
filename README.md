# Tone Changer Project

This repository contains the **Tone Changer** project, which is divided into two main parts:

1. **Client**: A React-based frontend application built with TypeScript and Vite.
2. **Server**: A Node.js backend server using Express, TypeScript, and Redis for caching and AI integrations.

---

## Tech Stack

### Client

The client-side application is built using the following technologies:

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A statically typed superset of JavaScript.
- **Vite**: A fast build tool and development server.
- **Redux Toolkit**: For state management.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Radix UI**: Accessible and customizable UI components.
- **Framer Motion**: For animations.
- **Sonner**: For toast notifications.

#### Key Dependencies

- `react`, `react-dom`: Core React libraries.
- `@reduxjs/toolkit`, `react-redux`: State management.
- `tailwindcss`, `tailwind-merge`: Styling and utility classes.
- `framer-motion`: Animation library.
- `@radix-ui/react-*`: UI components for dialogs, tooltips, etc.

### Server

The server-side application is built using the following technologies:

- **Node.js**: A JavaScript runtime for building scalable network applications.
- **Express**: A fast, unopinionated web framework for Node.js.
- **TypeScript**: For type safety and better developer experience.
- **Redis**: An in-memory data structure store used for caching.
- **BullMQ**: A Node.js library for managing job queues.
- **Mistral AI**: For AI-based tone-changing features.

#### Key Dependencies

- `express`: Web framework.
- `redis`, `ioredis`: Redis client libraries.
- `bullmq`: Job queue management.
- `dotenv`: For environment variable management.
- `helmet`, `compression`, `cors`: Middleware for security and performance.
- `@mistralai/mistralai`: AI integration.

---

## Setup Instructions

### Client

1. **Navigate to the Client Directory**:
   ```bash
   cd client
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Copy the `.env.example` file to `.env` and configure the `VITE_API_BASE_URL`:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Preview the Production Build**:
   ```bash
   npm run preview
   ```

### Server

1. **Navigate to the Server Directory**:
   ```bash
   cd server
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Copy the `.env.example` file to `.env` and configure the Redis and AI settings:
   ```bash
   copy .env.example .env
   ```

4. **Start Redis Using Docker**:
   ```bash
   docker compose up -d
   ```

5. **Run the Server in Development Mode**:
   ```bash
   npm run dev
   ```

6. **Build for Production**:
   ```bash
   npm run build
   ```

7. **Start the Server in Production Mode**:
   ```bash
   npm start
   ```

---

## Project Structure

- **`client/`**: Contains the frontend application.
- **`server/`**: Contains the backend application.

---

For any issues or contributions, feel free to open a pull request or create an issue in the repository.
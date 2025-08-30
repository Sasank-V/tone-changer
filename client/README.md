
# Tone Changer - Client

This is the client-side application for the Tone Changer project, built using React, TypeScript, and Vite. It provides a modern and efficient development environment with hot module replacement (HMR) and strict type checking.

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (Node Package Manager) or **yarn**

## Setup Instructions

Follow these steps to set up and run the client application locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Sasank-V/tone-changer.git
   cd tone-changer/client
   ```

2. **Install Dependencies**
   Install the required dependencies using npm or yarn:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root of the `client` folder by copying the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and configure the environment variables as needed. The default `.env.example` file contains:
   ```bash
   VITE_API_BASE_URL="http://localhost:3000/api"
   ```
   - `VITE_API_BASE_URL`: The base URL for the API server. Update this to match your server's URL if it differs.

4. **Start the Development Server**
   Run the following command to start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:5173` by default.

5. **Build for Production**
   To create an optimized production build, run:
   ```bash
   npm run build
   # or
   yarn build
   ```
   The build output will be available in the `dist` folder.

6. **Preview the Production Build**
   To preview the production build locally, run:
   ```bash
   npm run preview
   # or
   yarn preview
   ```

## Project Structure

The `client` folder is organized as follows:

- **`public/`**: Static assets such as images and icons.
- **`src/`**: Source code for the application.
  - **`assets/`**: Additional assets used in the application.
  - **`components/`**: Reusable React components.
  - **`context/`**: Context providers for global state management.
  - **`hooks/`**: Custom React hooks.
  - **`lib/`**: Utility functions and libraries.
  - **`theme/`**: Theme-related files.
  - **`ui/`**: ShadCN UI components and design elements.
- **`tsconfig.json`**: TypeScript configuration file.
- **`vite.config.ts`**: Vite configuration file.

## Scripts

The following scripts are available in the `package.json`:

- `dev`: Starts the development server.
- `build`: Builds the application for production.
- `preview`: Previews the production build locally.
- `lint`: Runs ESLint to check for code quality issues.

## ESLint Configuration

The project uses ESLint for linting and code quality checks. The configuration can be expanded to include type-aware lint rules and React-specific rules. Refer to the comments in the `eslint.config.js` file for more details.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

For any issues or contributions, feel free to open a pull request or create an issue in the repository.

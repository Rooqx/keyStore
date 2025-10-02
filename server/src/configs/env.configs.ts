import { config as loadEnv } from "dotenv";
import { existsSync } from "fs";
import path from "path";

// Set the current environment (default to 'development')
const NODE_ENV = process.env.NODE_ENV || "development";

// Priority order: .env.[env].local → .env.local → .env
const envFiles = [`.env.${NODE_ENV}.local`, `.env.local`, `.env`];

for (const file of envFiles) {
  const fullPath = path.resolve(process.cwd(), file);
  if (existsSync(fullPath)) {
    loadEnv({ path: fullPath });
    console.log(`Loaded environment variables from ${file}`);
    break; // Stop after loading the first found file
  }
}

// Export all required environment variables
export const {
  PORT,
  NODE_ENV: ENV,
  MONGO_URI,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_MS,
  ARCJET_KEY,
  ARCJET_ENV,
} = process.env;

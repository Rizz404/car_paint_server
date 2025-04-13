import { z } from "zod";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().default("5000"),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),
  LOCAL_DATABASE_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_URL: z.string(),
  JWT_ACCESS_TOKEN: z.string(),
  XENDIT_SECRET_KEY: z.string(),
  XENDIT_CALLBACK_TOKEN: z.string(),
  IMAGEKIT_PUBLIC_KEY: z.string(),
  IMAGEKIT_PRIVATE_KEY: z.string(),
  IMAGEKIT_URL_ENDPOINT: z.string(),
  MIDTRANS_SERVER_KEY: z.string(),
  MIDTRANS_CLIENT_KEY: z.string(),
  SANDBOX_MIDTRANS_SERVER_KEY: z.string(),
  SANDBOX_MIDTRANS_CLIENT_KEY: z.string(),
  HASHED_API_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
});

type ValidatedEnv = z.infer<typeof envSchema>;

let cachedEnv: ValidatedEnv | null = null;

const loadEnvFile = (): void => {
  const envPath = path.resolve(process.cwd(), ".env");

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`[Environment] Loaded from ${envPath}`);
  } else {
    console.log("[Environment] No .env file found, using process.env only");
  }
};

const validateEnv = (env: NodeJS.ProcessEnv): ValidatedEnv => {
  try {
    const validatedEnv = envSchema.parse(env);
    console.log(
      "[Environment] Loaded configuration successfully from process.env"
    );
    return validatedEnv;
  } catch (error) {
    console.error("[Environment] Validation failed:", error);
    throw error;
  }
};

const loadEnvironment = (): ValidatedEnv => {
  loadEnvFile();
  const validatedEnv = validateEnv(process.env);
  cachedEnv = validatedEnv;
  return validatedEnv;
};

const getEnv = (): ValidatedEnv => {
  if (!cachedEnv) {
    return loadEnvironment();
  }
  return cachedEnv;
};

const getDatabaseUrl = (): string => {
  const env = getEnv();
  return env.DATABASE_URL;
};

const reloadEnv = (): ValidatedEnv => loadEnvironment();

const env = loadEnvironment();

const isDevelopment = env.NODE_ENV === "development";
const isProduction = env.NODE_ENV === "production";

export {
  loadEnvironment,
  getEnv,
  getDatabaseUrl,
  reloadEnv,
  isDevelopment,
  isProduction,
};

export default env;

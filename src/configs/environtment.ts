import { z } from "zod";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

class EnvironmentLoader {
  private static instance: EnvironmentLoader;
  private envSchema: z.ZodObject<any>;
  private currentEnv: any;

  private constructor() {
    this.envSchema = z.object({
      NODE_ENV: z.enum(["development", "production"]).default("development"),
      PORT: z.string().default("5000"),
      DATABASE_URL: z.string(),
      DIRECT_URL: z.string(),
      CLOUD_DATABASE_URL: z.string(),
      LOCAL_DATABASE_URL: z.string(),
      CLOUDINARY_CLOUD_NAME: z.string(),
      CLOUDINARY_API_KEY: z.string(),
      CLOUDINARY_API_SECRET: z.string(),
      CLOUDINARY_URL: z.string(),
      JWT_ACCESS_TOKEN: z.string(),
      XENDIT_SECRET_KEY: z.string(),
      XENDIT_CALLBACK_TOKEN: z.string(),
    });
  }

  public static getInstance(): EnvironmentLoader {
    if (!EnvironmentLoader.instance) {
      EnvironmentLoader.instance = new EnvironmentLoader();
    }
    return EnvironmentLoader.instance;
  }

  public loadEnvironment() {
    // Clear require cache
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(".env")) {
        delete require.cache[key];
      }
    });

    // Determine environment file
    const currentEnvFile =
      process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env.development";

    // Load primary environment file
    const envPath = path.resolve(process.cwd(), currentEnvFile);
    if (!fs.existsSync(envPath)) {
      throw new Error(`File ${currentEnvFile} tidak ditemukan!`);
    }

    dotenv.config({ path: envPath, override: true });

    // Load production environment for CLOUD_DATABASE_URL
    const productionEnvPath = path.resolve(process.cwd(), ".env.production");
    if (fs.existsSync(productionEnvPath)) {
      const productionConfig = dotenv.parse(fs.readFileSync(productionEnvPath));
      process.env.CLOUD_DATABASE_URL = productionConfig.DATABASE_URL;
    }

    // Load development environment for LOCAL_DATABASE_URL
    const developmentEnvPath = path.resolve(process.cwd(), ".env.development");
    if (fs.existsSync(developmentEnvPath)) {
      const developmentConfig = dotenv.parse(
        fs.readFileSync(developmentEnvPath)
      );
      process.env.LOCAL_DATABASE_URL = developmentConfig.DATABASE_URL;
    }

    // Validate environment
    try {
      this.currentEnv = this.envSchema.parse(process.env);
      console.log(
        `[Environment] Loaded ${process.env.NODE_ENV} configuration successfully`
      );
      return this.currentEnv;
    } catch (error) {
      console.error("[Environment] Validation failed:", error);
      throw error;
    }
  }

  public getEnv() {
    if (!this.currentEnv) {
      return this.loadEnvironment();
    }
    return this.currentEnv;
  }
}

// Create and export the environment instance
const environmentLoader = EnvironmentLoader.getInstance();
const env = environmentLoader.loadEnvironment();

export default env;
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";

// Add reload method for testing
export const reloadEnv = () => environmentLoader.loadEnvironment();

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
      DATABASE_URL: z.string().optional(),
      DIRECT_URL: z.string().optional(),
      CLOUD_DATABASE_URL: z.string().optional(),
      LOCAL_DATABASE_URL: z.string().optional(),
      CLOUDINARY_CLOUD_NAME: z.string().optional(),
      CLOUDINARY_API_KEY: z.string().optional(),
      CLOUDINARY_API_SECRET: z.string().optional(),
      CLOUDINARY_URL: z.string().optional(),
      JWT_ACCESS_TOKEN: z.string().optional(),
      XENDIT_SECRET_KEY: z.string().optional(),
      XENDIT_CALLBACK_TOKEN: z.string().optional(),
    });
  }

  public static getInstance(): EnvironmentLoader {
    if (!EnvironmentLoader.instance) {
      EnvironmentLoader.instance = new EnvironmentLoader();
    }
    return EnvironmentLoader.instance;
  }

  public loadEnvironment() {
    // * Tentukan lokasi file environment
    const productionEnvPath = path.resolve(process.cwd(), ".env.production");
    const developmentEnvPath = path.resolve(process.cwd(), ".env.development");
    const defaultEnvPath = path.resolve(process.cwd(), ".env");

    let envPath: string | null = null;

    if (process.env.NODE_ENV === "production") {
      envPath = fs.existsSync(productionEnvPath)
        ? productionEnvPath
        : fs.existsSync(defaultEnvPath)
          ? defaultEnvPath
          : null;
    } else {
      envPath = fs.existsSync(developmentEnvPath)
        ? developmentEnvPath
        : fs.existsSync(defaultEnvPath)
          ? defaultEnvPath
          : null;
    }

    if (envPath) {
      dotenv.config({ path: envPath, override: true });
      console.log(`[Environment] Loaded from ${envPath}`);
    } else {
      console.log("[Environment] No .env file found, using process.env only");
    }

    // * Validasi environment
    try {
      this.currentEnv = this.envSchema.parse(process.env);
      console.log(
        `[Environment] Loaded configuration successfully from process.env`
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

// * Buat instance environment
const environmentLoader = EnvironmentLoader.getInstance();
const env = environmentLoader.loadEnvironment();

export default env;
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";

// * Method untuk reload env jika diperlukan
export const reloadEnv = () => environmentLoader.loadEnvironment();

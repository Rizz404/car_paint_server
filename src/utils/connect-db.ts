import { prismaMetricsMiddleware } from "@/middlewares/prisma-metrics";
import prisma from "@/configs/database";
import logger from "./logger";
import env from "@/configs/environment";

const connectDb = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
    logger.info(`Connected to database ${env.DATABASE_URL}`);
    // * Start Prisma metrics collection
    prismaMetricsMiddleware();
  } catch (error) {
    logger.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDb;

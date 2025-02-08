import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import logger from "./utils/logger";
import prisma from "./configs/database";
import routes from "./routes";
import { metricsMiddleware } from "./middlewares/metrics";

const PORT = process.env.PORT || 5000;
const app = express();

// * Middleware
// ! urutannya harus bener
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors({ credentials: true }));
app.use(metricsMiddleware);
app.use(compression());
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// * Health
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// * API routes
app.use("/api/v1", routes);

// * Database
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection error:", error);
    process.exit(1);
  }
};

// * Server
const httpServer = http.createServer(app);

const startServer = () => {
  httpServer.listen(PORT, () => {
    logger.info(
      `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });
};

// * Graceful Shutdown
const gracefulShutdown = async () => {
  logger.info("Shutting down gracefully...");

  // * Tutup server terlebih dahulu
  httpServer.close(async () => {
    logger.info("HTTP server closed");

    // * Tutup koneksi database
    await prisma.$disconnect().catch((error) => {
      logger.error("Error disconnecting database:", error);
    });

    logger.info("All connections closed. Exiting process.");
    process.exit(0);
  });

  // * Force shutdown setelah 10 detik
  setTimeout(() => {
    logger.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// * Process Event Handlers
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// * Initialize Application
(async () => {
  // * Validasi environment variables
  if (!process.env.DATABASE_URL) {
    logger.error("DATABASE_URL environment variable is missing");
    process.exit(1);
  }

  await connectDatabase();
  startServer();
})();

export default app;

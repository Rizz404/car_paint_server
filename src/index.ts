import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import http from "http";
import logger from "./utils/logger";
import prisma from "./configs/database";
import routes from "./routes";

const PORT = process.env.port || 5000;
const app = express();
const httpServer = http.createServer(app);

app.use(compression());
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use("/api/v1", routes);

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// * Database
prisma.$connect();

// * Server
httpServer.listen(PORT, () => {
  logger.info(`Server run on port http://localhost:${PORT}`);
});

// * Graceful Shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Closing httpServer gracefully...");
  httpServer.close(() => {
    logger.info("All connections closed. Server shut down.");
  });
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received (Ctrl+C). Closing httpServer gracefully...");
  logger.info("Close database pool");
  httpServer.close(() => {
    logger.info("All connections closed. Server shut down.");
  });
});

export default app;

import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import responseTime from "response-time";
import logger from "./utils/logger";
import prisma from "./configs/database";
import routes from "./routes";
import {
  register,
  httpRequestDuration,
  httpRequestsTotal,
  databaseConnections,
  errorCounter,
  collectPrismaMetrics,
} from "./utils/metrics";
import { metricsMiddleware } from "./middlewares/metrics";
import connectDb from "./utils/connect-db";
import env, { isDevelopment, reloadEnv } from "./configs/environment";
import figlet from "figlet";
import apiKeyMiddleware from "./middlewares/api_key";
import webHookrouter from "./routes/webhook-routes";

const PORT = env.PORT || 5000;
const app = express();

// * MIDDLEWARE
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors({ credentials: true }));
app.use(metricsMiddleware);
app.use(
  responseTime((req: Request, res: Response, time: number) => {
    const route = req.route?.path || req.path;
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(time / 1000); // * Convert to seconds
  })
);
app.use(compression());
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());

// * Custom request tracking
app.use((req: Request, res: Response, next: NextFunction) => {
  const route = req.route?.path || req.path;
  httpRequestsTotal.inc({
    method: req.method,
    route,
    status: res.statusCode.toString(),
  });
  next();
});

// * Error tracking
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorCounter.inc({ type: err.name });
  next(err);
});

// * Logging
app.use(
  morgan(isDevelopment ? "combined" : "dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.get("/", async (req, res) => {
  figlet("Welcome to the API!", (err, data) => {
    if (err) {
      return res.status(500).send("Error generating ASCII art");
    }
    res.setHeader("Content-Type", "text/plain");
    res.send(
      `${data}\n\n🔥 This is the backend API. Please use the routes below:\n API: /api/v1`
    );
  });
});

app.use("/api/v1", (req, res, next) => {
  if (req.path === "/") {
    figlet("API v1", (err, data) => {
      if (err) {
        return res.status(500).send("Error generating ASCII art");
      }
      res.setHeader("Content-Type", "text/plain");
      res.send(
        `${data}\n\n📌 Available routes:\n/auth\n/users\n/car-brands\n/car-models\n/car-services\n/colors\n/car-model-years\n/car-model-year-colors\n/user-cars\n/workshops\n/payment-methods\n/orders\n/transactions\n/histories\n/e-tickets`
      );
    });
  } else {
    next();
  }
});

// * METRICS ENDPOINTS
app.get("/metrics", async (req: Request, res: Response) => {
  try {
    const prismaMetrics = await collectPrismaMetrics();
    res.set("Content-Type", register.contentType);
    res.end((await register.metrics()) + prismaMetrics);
  } catch (err) {
    logger.error("Metrics collection error:", err);
    res.status(500).end("Error collecting metrics");
  }
});

// * HEALTH CHECK
app.get("/health", async (req: Request, res: Response) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    database: {
      status: "OK",
      // * Use get() instead of values()
      connections: databaseConnections.get(),
    },
    metrics: await register.metrics().then((data) => data.split("\n").length),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.database.status = "OK";
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.database.status = "ERROR";
    healthCheck.message = "Database connection failed";
    logger.error("Database health check failed:", error);
    res.status(500).json(healthCheck);
  }
});

app.use("/webhooks", webHookrouter);

// * API key middleware
app.use(apiKeyMiddleware);

// * API ROUTES
app.use("/api/v1", routes);

// * SERVER CONFIG
const httpServer = http.createServer(app);

const startServer = () => {
  httpServer.listen(PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`Metrics available at http://localhost:${PORT}/metrics`);
  });
};

// * GRACEFUL SHUTDOWN
const gracefulShutdown = async () => {
  logger.info("Reloading environment...");
  reloadEnv();

  logger.info("Shutting down gracefully...");

  httpServer.close(async () => {
    logger.info("HTTP server closed");

    // * Reset metrics
    await register.clear();
    logger.info("Metrics reset");

    await prisma.$disconnect().catch((error) => {
      logger.error("Error disconnecting database:", error);
    });

    logger.info("All connections closed. Exiting process.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// * PROCESS HANDLERS
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// * INITIALIZATION
(async () => {
  await connectDb();
  startServer();
})();

export default app;

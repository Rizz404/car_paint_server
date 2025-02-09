import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";
import prisma from "@/configs/database";

export const register = new Registry();

collectDefaultMetrics({ register });

// Custom metrics dengan prefix untuk menghindari konflik
export const httpRequestDuration = new Histogram({
  name: "paint_project_http_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
  registers: [register], // Explicitly register to our registry
});

export const httpRequestsTotal = new Counter({
  name: "paint_project_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

export const databaseConnections = new Gauge({
  name: "paint_project_database_connections",
  help: "Number of active database connections",
  registers: [register],
});

export const errorCounter = new Counter({
  name: "paint_project_errors_total",
  help: "Total number of application errors",
  labelNames: ["type"],
  registers: [register],
});

export const collectPrismaMetrics = async () => {
  const metrics = await prisma.$metrics.prometheus();
  return metrics;
};

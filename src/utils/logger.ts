import { consoleTransport, fileTransport } from "@/configs/logger";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// * Buat logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [consoleTransport, fileTransport],
  exceptionHandlers: [
    consoleTransport,
    new DailyRotateFile({
      filename: path.join(__dirname, "..", "logs", "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
  rejectionHandlers: [
    consoleTransport,
    new DailyRotateFile({
      filename: path.join(__dirname, "..", "logs", "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export default logger;

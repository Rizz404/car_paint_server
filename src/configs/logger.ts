import path, { format } from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// * Konfigurasi format log
export const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} ${level}: ${message}\n${stack}`;
    }
    return `${timestamp} ${level}: ${message}`;
  })
);

// * Konfigurasi transport untuk console
export const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(winston.format.colorize(), logFormat),
});

// * Konfigurasi transport untuk file dengan rotasi harian
export const fileTransport = new DailyRotateFile({
  filename: path.join(__dirname, "..", "logs", "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: logFormat,
});

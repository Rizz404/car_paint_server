import { PrismaClient } from "@prisma/client";
import { isDevelopment } from "./environment";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    ...(isDevelopment && { log: ["info", "warn", "error"] }),
  });

global.prisma = prisma;

export default prisma;

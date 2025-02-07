import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["info", "query", "warn", "error"],
  });

global.prisma = prisma;

export default prisma;

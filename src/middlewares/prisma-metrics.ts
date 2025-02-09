import prisma from "../configs/database";
import { databaseConnections } from "../utils/metrics";

export const prismaMetricsMiddleware = () => {
  setInterval(async () => {
    try {
      const engine = (prisma as any)._engine;
      const pool = engine.child?.instance?.connectionPool;

      if (pool) {
        databaseConnections.set(
          pool.numIdleConnections + pool.numBusyConnections
        );
      }
    } catch (error) {
      console.error("Error collecting Prisma metrics:", error);
    }
  }, 5000); // Update setiap 5 detik
};

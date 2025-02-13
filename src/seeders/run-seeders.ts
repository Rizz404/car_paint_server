import { PrismaClient } from "@prisma/client";
import { seedWorkshops } from "./workshop-seeder";
import { seedCarBrands } from "./car-brand-seeder";
import { seedUsersWithProfiles } from "./user-seeder";
import { seedCarModels } from "./car-model-seeder";
import { seedCarServices } from "./car-service-seeder";
import { seedCarModelYears } from "./car-model-year-seeder";
import { seedUserCars } from "./user-car-seeder";
import { seedPaymentMethods } from "./payment-method-seeder";
import { seedOrders } from "./order-seeder";
import { seedTransactions } from "./transaction-seeder";
import { seedETickets } from "./e-ticket-seeder";
import { seedColors } from "./color-seeder";
import { seedCarModelYearColors } from "./car-model-year-color-seeder";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seeding...");

    await seedUsersWithProfiles(prisma);
    await seedCarBrands(prisma);
    await seedCarModels(prisma);
    await seedWorkshops(prisma);
    await seedCarServices(prisma);
    await seedColors(prisma);
    await seedCarModelYears(prisma);
    await seedCarModelYearColors(prisma);
    await seedUserCars(prisma);
    await seedPaymentMethods(prisma);
    await seedTransactions(prisma);
    await seedOrders(prisma);
    await seedETickets(prisma);

    console.log("✅ Database seeding completed");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

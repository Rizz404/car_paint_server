import { PrismaClient } from "@prisma/client";
import { seedWorkshops } from "./workshop-seeder";
import { seedCarBrands } from "./car-brand-seeder";
import { seedUsersWithProfiles } from "./user-seeder";
import { seedCarModels } from "./car-model-seeder";
import { seedCarServices } from "./car-service-seeder";
import { seedCarModelColors } from "./car-model-color-seeder";
import { seedCarModelYears } from "./car-model-year-seeder";
import { seedUserCars } from "./user-car-seeder";
import { seedPaymentMethods } from "./payment-method-seeder";
import { seedOrders } from "./order-seeder";
import { seedTransactions } from "./transaction-seeder";
import { seedETickets } from "./ticket-seeder";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seeding...");

    await seedUsersWithProfiles(prisma);
    await seedCarBrands(prisma);
    await seedWorkshops(prisma);
    await seedCarModels(prisma);
    await seedCarServices(prisma);
    await seedCarModelColors(prisma);
    await seedCarModelYears(prisma);
    await seedUserCars(prisma);
    await seedPaymentMethods(prisma);
    await seedOrders(prisma);
    await seedTransactions(prisma);
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

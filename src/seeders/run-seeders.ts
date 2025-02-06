import { PrismaClient } from "@prisma/client";
import { seedWorkshops } from "./workshop-seeder";
import { seedCarBrands } from "./car-brand-seeder";
import { seedUserCars } from "@/test/seeder";
import { seedUsersWithProfiles } from "./user-seeder";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seeding...");

    await seedCarBrands(prisma);
    await seedWorkshops(prisma);
    await seedUsersWithProfiles(prisma);

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

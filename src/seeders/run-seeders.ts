import { PrismaClient } from "@prisma/client";
import { seedBrands } from "./brand-seeder";
import { seedWorkshops } from "./workshop-seeder";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seeding...");

    await seedBrands(prisma);
    await seedWorkshops(prisma);

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

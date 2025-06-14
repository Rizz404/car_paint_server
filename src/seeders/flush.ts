import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function flushDatabase() {
  try {
    // Delete in order based on dependencies to avoid foreign key constraint errors
    console.log("🗑️ Starting database flush...");

    // Delete authentication and user related data
    await prisma.eTicket.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.order.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();

    // Delete car related data
    await prisma.carModelColorColor.deleteMany();
    await prisma.color.deleteMany();
    await prisma.carModelColor.deleteMany();
    await prisma.carModel.deleteMany();
    await prisma.carBrand.deleteMany();

    // Delete service related data
    await prisma.carService.deleteMany();
    await prisma.workshop.deleteMany();
    await prisma.paymentMethod.deleteMany();

    console.log("✅ Database successfully flushed!");
  } catch (error) {
    console.error("❌ Error flushing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

flushDatabase();

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

async function syncCloudToLocal() {
  const cloudDb = new PrismaClient({
    datasources: {
      db: { url: process.env.CLOUD_DATABASE_URL },
    },
  });

  const localDb = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  });

  try {
    console.info("Clearing local database...");
    await clearLocalDatabase(localDb);

    console.info("Fetching data from cloud...");
    const cloudData = await fetchCloudData(cloudDb);

    console.info("Inserting data to local database...");
    await insertLocalData(localDb, cloudData);

    console.info("Cloud to local sync completed successfully!");
  } catch (error) {
    console.error("Error syncing database:", error);
    throw error;
  } finally {
    await cloudDb.$disconnect();
    await localDb.$disconnect();
  }
}

async function clearLocalDatabase(localDb: PrismaClient) {
  await localDb.eTicket.deleteMany({});
  await localDb.transaction.deleteMany({});
  await localDb.order.deleteMany({});
  await localDb.userCar.deleteMany({});
  await localDb.carModelYearColor.deleteMany({});
  await localDb.carModelYear.deleteMany({});
  await localDb.carModel.deleteMany({});
  await localDb.carService.deleteMany({});
  await localDb.workshop.deleteMany({});
  await localDb.color.deleteMany({});
  await localDb.carBrand.deleteMany({});
  await localDb.userProfile.deleteMany({});
  await localDb.paymentMethod.deleteMany({});
  await localDb.user.deleteMany({});
}

async function fetchCloudData(cloudDb: PrismaClient) {
  return {
    users: await cloudDb.user.findMany(),
    userProfiles: await cloudDb.userProfile.findMany(),
    carBrands: await cloudDb.carBrand.findMany(),
    carModels: await cloudDb.carModel.findMany(),
    colors: await cloudDb.color.findMany(),
    workshops: await cloudDb.workshop.findMany(),
    carServices: await cloudDb.carService.findMany(),
    carModelYears: await cloudDb.carModelYear.findMany(),
    carModelYearColors: await cloudDb.carModelYearColor.findMany(),
    userCars: await cloudDb.userCar.findMany(),
    paymentMethods: await cloudDb.paymentMethod.findMany(),
    orders: await cloudDb.order.findMany(),
    transactions: await cloudDb.transaction.findMany(),
    eTickets: await cloudDb.eTicket.findMany(),
  };
}

async function insertLocalData(localDb: PrismaClient, data: any) {
  try {
    await localDb.user.createMany({ data: data.users, skipDuplicates: true });
    await localDb.userProfile.createMany({
      data: data.userProfiles,
      skipDuplicates: true,
    });
    await localDb.carBrand.createMany({
      data: data.carBrands,
      skipDuplicates: true,
    });
    await localDb.carModel.createMany({
      data: data.carModels,
      skipDuplicates: true,
    });
    await localDb.color.createMany({ data: data.colors, skipDuplicates: true });
    await localDb.workshop.createMany({
      data: data.workshops,
      skipDuplicates: true,
    });
    await localDb.carService.createMany({
      data: data.carServices,
      skipDuplicates: true,
    });
    await localDb.carModelYear.createMany({
      data: data.carModelYears,
      skipDuplicates: true,
    });
    await localDb.carModelYearColor.createMany({
      data: data.carModelYearColors,
      skipDuplicates: true,
    });
    await localDb.userCar.createMany({
      data: data.userCars,
      skipDuplicates: true,
    });
    await localDb.paymentMethod.createMany({
      data: data.paymentMethods,
      skipDuplicates: true,
    });
    await localDb.order.createMany({ data: data.orders, skipDuplicates: true });
    await localDb.transaction.createMany({
      data: data.transactions,
      skipDuplicates: true,
    });
    await localDb.eTicket.createMany({
      data: data.eTickets,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("Error during data insertion:", error);
    throw error;
  }
}

// Run the sync
syncCloudToLocal();

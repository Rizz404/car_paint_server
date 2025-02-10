import env from "@/configs/environtment";
import { PrismaClient } from "@prisma/client";

async function syncLocalToCloud() {
  const localDb = new PrismaClient({
    datasources: {
      db: { url: env.DATABASE_URL },
    },
  });

  const cloudDb = new PrismaClient({
    datasources: {
      db: { url: env.CLOUD_DATABASE_URL },
    },
  });

  try {
    // console.info("Clearing cloud database...");
    // await clearCloudDatabase(cloudDb);

    console.info("Fetching data from local database...");
    const localData = await fetchLocalData(localDb);

    console.info("Inserting data to cloud database...");
    await insertCloudData(cloudDb, localData);

    console.info("Local to cloud sync completed successfully!");
  } catch (error) {
    console.error("Error syncing database:", error);
    throw error;
  } finally {
    await localDb.$disconnect();
    await cloudDb.$disconnect();
  }
}

async function clearCloudDatabase(cloudDb: PrismaClient) {
  // Menghapus data di cloud secara berurutan
  await cloudDb.eTicket.deleteMany({});
  await cloudDb.transaction.deleteMany({});
  await cloudDb.order.deleteMany({});
  await cloudDb.userCar.deleteMany({});
  await cloudDb.carModelYearColor.deleteMany({});
  await cloudDb.carModelYear.deleteMany({});
  await cloudDb.carModel.deleteMany({});
  await cloudDb.carService.deleteMany({});
  await cloudDb.workshop.deleteMany({});
  await cloudDb.color.deleteMany({});
  await cloudDb.carBrand.deleteMany({});
  await cloudDb.userProfile.deleteMany({});
  await cloudDb.paymentMethod.deleteMany({});
  await cloudDb.user.deleteMany({});
}

async function fetchLocalData(localDb: PrismaClient) {
  // Mengambil data dari database lokal
  return {
    users: await localDb.user.findMany(),
    userProfiles: await localDb.userProfile.findMany(),
    carBrands: await localDb.carBrand.findMany(),
    carModels: await localDb.carModel.findMany(),
    colors: await localDb.color.findMany(),
    workshops: await localDb.workshop.findMany(),
    carServices: await localDb.carService.findMany(),
    carModelYears: await localDb.carModelYear.findMany(),
    carModelYearColors: await localDb.carModelYearColor.findMany(),
    userCars: await localDb.userCar.findMany(),
    paymentMethods: await localDb.paymentMethod.findMany(),
    orders: await localDb.order.findMany(),
    transactions: await localDb.transaction.findMany(),
    eTickets: await localDb.eTicket.findMany(),
  };
}

async function insertCloudData(cloudDb: PrismaClient, data: any) {
  try {
    // Memasukkan data ke cloud dengan skipDuplicates agar tidak terjadi duplikasi
    await cloudDb.user.createMany({ data: data.users, skipDuplicates: true });
    await cloudDb.userProfile.createMany({
      data: data.userProfiles,
      skipDuplicates: true,
    });
    await cloudDb.carBrand.createMany({
      data: data.carBrands,
      skipDuplicates: true,
    });
    await cloudDb.carModel.createMany({
      data: data.carModels,
      skipDuplicates: true,
    });
    await cloudDb.color.createMany({ data: data.colors, skipDuplicates: true });
    await cloudDb.workshop.createMany({
      data: data.workshops,
      skipDuplicates: true,
    });
    await cloudDb.carService.createMany({
      data: data.carServices,
      skipDuplicates: true,
    });
    await cloudDb.carModelYear.createMany({
      data: data.carModelYears,
      skipDuplicates: true,
    });
    await cloudDb.carModelYearColor.createMany({
      data: data.carModelYearColors,
      skipDuplicates: true,
    });
    await cloudDb.userCar.createMany({
      data: data.userCars,
      skipDuplicates: true,
    });
    await cloudDb.paymentMethod.createMany({
      data: data.paymentMethods,
      skipDuplicates: true,
    });
    await cloudDb.order.createMany({ data: data.orders, skipDuplicates: true });
    await cloudDb.transaction.createMany({
      data: data.transactions,
      skipDuplicates: true,
    });
    await cloudDb.eTicket.createMany({
      data: data.eTickets,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("Error during data insertion:", error);
    throw error;
  }
}

// Run the sync
syncLocalToCloud();

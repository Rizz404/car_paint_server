import { PrismaClient } from "@prisma/client";
import { EnvironmentLoader, isDevelopment } from "@/configs/environtment";

async function syncCloudToLocal() {
  const envLoader = EnvironmentLoader.getInstance();

  const localDbUrl = envLoader.getDatabaseUrl("local");
  const cloudDbUrl = envLoader.getDatabaseUrl("cloud");

  console.info("Database URLs:");
  console.info(`Cloud: ${cloudDbUrl}`);
  console.info(`Local: ${localDbUrl}`);

  const cloudDb = new PrismaClient({
    datasourceUrl: cloudDbUrl,
  });

  const localDb = new PrismaClient({
    datasourceUrl: localDbUrl,
  });

  try {
    console.info("Starting database sync...");
    console.info(
      `Source: ${isDevelopment ? "Development" : "Production"} environment`
    );

    console.info("Fetching data from cloud database...");
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
    // Level 1: Independent tables
    console.info("Inserting users...");
    await localDb.user.createMany({
      data: data.users,
      skipDuplicates: true,
    });

    console.info("Inserting car brands...");
    await localDb.carBrand.createMany({
      data: data.carBrands,
      skipDuplicates: true,
    });

    console.info("Inserting colors...");
    await localDb.color.createMany({
      data: data.colors,
      skipDuplicates: true,
    });

    console.info("Inserting workshops...");
    await localDb.workshop.createMany({
      data: data.workshops,
      skipDuplicates: true,
    });

    console.info("Inserting payment methods...");
    await localDb.paymentMethod.createMany({
      data: data.paymentMethods,
      skipDuplicates: true,
    });

    // Level 2: Tables with single foreign key dependencies
    // console.info("Inserting user profiles...");
    // await localDb.userProfile.createMany({
    //   data: data.userProfiles,
    //   skipDuplicates: true,
    // });

    console.info("Inserting car models...");
    await localDb.carModel.createMany({
      data: data.carModels,
      skipDuplicates: true,
    });

    console.info("Inserting car services...");
    await localDb.carService.createMany({
      data: data.carServices,
      skipDuplicates: true,
    });

    // Level 3: Tables with multiple foreign key dependencies
    console.info("Inserting car model years...");
    await localDb.carModelYear.createMany({
      data: data.carModelYears,
      skipDuplicates: true,
    });

    console.info("Inserting car model year colors...");
    await localDb.carModelYearColor.createMany({
      data: data.carModelYearColors,
      skipDuplicates: true,
    });

    // console.info("Inserting user cars...");
    // await localDb.userCar.createMany({
    //   data: data.userCars,
    //   skipDuplicates: true,
    // });

    // Level 4: Order related tables
    // console.info("Inserting orders...");
    // await localDb.order.createMany({
    //   data: data.orders,
    //   skipDuplicates: true,
    // });

    // console.info("Inserting transactions...");
    // await localDb.transaction.createMany({
    //   data: data.transactions,
    //   skipDuplicates: true,
    // });

    // console.info("Inserting e-tickets...");
    // await localDb.eTicket.createMany({
    //   data: data.eTickets,
    //   skipDuplicates: true,
    // });
  } catch (error) {
    console.error("Error during data insertion:", error);
    throw error;
  }
}

// Run the sync
syncCloudToLocal();

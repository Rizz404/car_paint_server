// import { PrismaClient } from "@prisma/client";
// import { EnvironmentLoader, isDevelopment } from "@/configs/environment";

// async function syncLocalToCloud() {
//   const envLoader = EnvironmentLoader.getInstance();

//   const localDbUrl = envLoader.getDatabaseUrl("local");
//   const cloudDbUrl = envLoader.getDatabaseUrl("cloud");

//   console.info("Database URLs:");
//   console.info(`Local: ${localDbUrl}`);
//   console.info(`Cloud: ${cloudDbUrl}`);

//   const localDb = new PrismaClient({
//     datasourceUrl: localDbUrl,
//   });

//   const cloudDb = new PrismaClient({
//     datasourceUrl: cloudDbUrl,
//   });

//   try {
//     console.info("Starting database sync...");
//     console.info(
//       `Source: ${isDevelopment ? "Development" : "Production"} environment`
//     );

//     console.info("Fetching data from local database...");
//     const localData = await fetchLocalData(localDb);

//     console.info("Inserting data to cloud database...");
//     await insertCloudData(cloudDb, localData);

//     console.info("Local to cloud sync completed successfully!");
//   } catch (error) {
//     console.error("Error syncing database:", error);
//     throw error;
//   } finally {
//     await localDb.$disconnect();
//     await cloudDb.$disconnect();
//   }
// }

// async function fetchLocalData(localDb: PrismaClient) {
//   return {
//     users: await localDb.user.findMany(),
//     userProfiles: await localDb.userProfile.findMany(),
//     carBrands: await localDb.carBrand.findMany(),
//     carModels: await localDb.carModel.findMany(),
//     colors: await localDb.color.findMany(),
//     workshops: await localDb.workshop.findMany(),
//     carServices: await localDb.carService.findMany(),
//     carModelYears: await localDb.carModelYear.findMany(),
//     carModelYearColors: await localDb.carModelYearColor.findMany(),
//     userCars: await localDb.userCar.findMany(),
//     paymentMethods: await localDb.paymentMethod.findMany(),
//     orders: await localDb.order.findMany(),
//     transactions: await localDb.transaction.findMany(),
//     eTickets: await localDb.eTicket.findMany(),
//   };
// }

// async function insertCloudData(cloudDb: PrismaClient, data: any) {
//   try {
//     // Level 1: Independent tables
//     console.info("Inserting users...");
//     await cloudDb.user.createMany({
//       data: data.users,
//       skipDuplicates: true,
//     });

//     console.info("Inserting car brands...");
//     await cloudDb.carBrand.createMany({
//       data: data.carBrands,
//       skipDuplicates: true,
//     });

//     console.info("Inserting colors...");
//     await cloudDb.color.createMany({
//       data: data.colors,
//       skipDuplicates: true,
//     });

//     console.info("Inserting workshops...");
//     await cloudDb.workshop.createMany({
//       data: data.workshops,
//       skipDuplicates: true,
//     });

//     console.info("Inserting payment methods...");
//     await cloudDb.paymentMethod.createMany({
//       data: data.paymentMethods,
//       skipDuplicates: true,
//     });

//     // Level 2: Tables with single foreign key dependencies
//     // console.info("Inserting user profiles...");
//     // await cloudDb.userProfile.createMany({
//     //   data: data.userProfiles,
//     //   skipDuplicates: true,
//     // });

//     console.info("Inserting car models...");
//     await cloudDb.carModel.createMany({
//       data: data.carModels,
//       skipDuplicates: true,
//     });

//     console.info("Inserting car services...");
//     await cloudDb.carService.createMany({
//       data: data.carServices,
//       skipDuplicates: true,
//     });

//     // Level 3: Tables with multiple foreign key dependencies
//     console.info("Inserting car model years...");
//     await cloudDb.carModelYear.createMany({
//       data: data.carModelYears,
//       skipDuplicates: true,
//     });

//     console.info("Inserting car model year colors...");
//     await cloudDb.carModelYearColor.createMany({
//       data: data.carModelYearColors,
//       skipDuplicates: true,
//     });

//     // console.info("Inserting user cars...");
//     // await cloudDb.userCar.createMany({
//     //   data: data.userCars,
//     //   skipDuplicates: true,
//     // });

//     // // Level 4: Order related tables
//     // console.info("Inserting orders...");
//     // await cloudDb.order.createMany({
//     //   data: data.orders,
//     //   skipDuplicates: true,
//     // });

//     // console.info("Inserting transactions...");
//     // await cloudDb.transaction.createMany({
//     //   data: data.transactions,
//     //   skipDuplicates: true,
//     // });

//     // console.info("Inserting e-tickets...");
//     // await cloudDb.eTicket.createMany({
//     //   data: data.eTickets,
//     //   skipDuplicates: true,
//     // });
//   } catch (error) {
//     console.error("Error during data insertion:", error);
//     throw error;
//   }
// }

// // Run the sync
// syncLocalToCloud();

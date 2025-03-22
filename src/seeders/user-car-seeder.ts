// import { faker } from "@faker-js/faker";
// import { Prisma, PrismaClient } from "@prisma/client";

// const generateUserCar = (
//   userId: string,
//   carModelYearColorId: string
// ): Prisma.UserCarCreateManyInput => ({
//   userId,
//   carModelYearColorId,
//   licensePlate: faker.vehicle.vrm(),
//   carImages: [faker.image.urlLoremFlickr({ category: "transport" })],
// });

// export const seedUserCars = async (
//   prisma: PrismaClient,
//   count = 25,
//   deleteFirst = true
// ) => {
//   console.log("🌱 Seeding UserCars...");
//   if (deleteFirst) {
//     await prisma.userCar.deleteMany();
//   }
//   const users = await prisma.user.findMany({ select: { id: true } });
//   const carModelYearColors = await prisma.carModelYearColor.findMany({
//     select: { id: true },
//   });

//   if (!users.length || !carModelYearColors.length) {
//     console.warn("⚠️ Missing dependencies for UserCars. Skipping seeding.");
//     return;
//   }

//   const data: Prisma.UserCarCreateManyInput[] = [];
//   for (let i = 0; i < count; i++) {
//     data.push(
//       generateUserCar(
//         users[Math.floor(Math.random() * users.length)].id,
//         carModelYearColors[
//           Math.floor(Math.random() * carModelYearColors.length)
//         ].id
//       )
//     );
//   }
//   const result = await prisma.userCar.createMany({
//     data,
//     skipDuplicates: true,
//   });
//   console.log(`✅ Seeded ${result.count} UserCars`);
// };

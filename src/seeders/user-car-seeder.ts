import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateUserCar = (
  userId: string,
  carBrandId: string,
  carModelId: string,
  carModelColorId: string,
  carModelYearId: string
): Prisma.UserCarCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  userId,
  carBrandId,
  carModelId,
  carModelColorId,
  carModelYearId,
  licensePlate: faker.vehicle.vrm(),
  imageUrls: [faker.image.urlLoremFlickr({ category: "transport" })],
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedUserCars = async (prisma: PrismaClient, count = 10) => {
  console.log("🌱 Seeding UserCars...");
  await prisma.userCar.deleteMany();
  const users = await prisma.user.findMany({ select: { id: true } });
  const carBrands = await prisma.carBrand.findMany({ select: { id: true } });
  const carModels = await prisma.carModel.findMany({ select: { id: true } });
  const carModelColors = await prisma.carModelColor.findMany({
    select: { id: true },
  });
  const carModelYears = await prisma.carModelYear.findMany({
    select: { id: true },
  });

  if (
    !users.length ||
    !carBrands.length ||
    !carModels.length ||
    !carModelColors.length ||
    !carModelYears.length
  ) {
    console.warn("⚠️ Missing dependencies for UserCars. Skipping seeding.");
    return;
  }

  const data: Prisma.UserCarCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    data.push(
      generateUserCar(
        users[Math.floor(Math.random() * users.length)].id,
        carBrands[Math.floor(Math.random() * carBrands.length)].id,
        carModels[Math.floor(Math.random() * carModels.length)].id,
        carModelColors[Math.floor(Math.random() * carModelColors.length)].id,
        carModelYears[Math.floor(Math.random() * carModelYears.length)].id
      )
    );
  }
  const result = await prisma.userCar.createMany({ data });
  console.log(`✅ Seeded ${result.count} UserCars`);
};

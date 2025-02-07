import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarService = (): Prisma.CarServiceCreateManyInput => ({
  name: faker.word.noun().slice(0, 50),
});

export const seedCarServices = async (prisma: PrismaClient, count = 100) => {
  console.log("🌱 Seeding CarServices...");
  await prisma.carService.deleteMany();

  const data = Array.from({ length: count }, () => generateCarService());

  const result = await prisma.carService.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} CarServices`);
};

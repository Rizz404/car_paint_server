import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarService = (): Prisma.CarServiceCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  name: faker.word.noun().slice(0, 50),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
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

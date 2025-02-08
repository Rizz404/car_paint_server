import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarService = (): Prisma.CarServiceCreateManyInput => ({
  name: faker.word.noun().slice(0, 50),
  price: new Prisma.Decimal(faker.number.float({ min: 50, max: 1000 })),
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

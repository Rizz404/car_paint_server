import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarServicePrice = (): Prisma.Decimal => {
  const priceRanges = [
    { min: 50_000, max: 500_000 },
    { min: 500_000, max: 2_000_000 },
    { min: 2_000_000, max: 5_000_000 },
  ];

  // * Pilih random berdasarkan array
  const range = faker.helpers.arrayElement(priceRanges);

  const rawPrice = faker.number.float({
    min: range.min,
    max: range.max,
  });

  const roundedPrice = Math.round(rawPrice / 1000) * 1000;

  return new Prisma.Decimal(roundedPrice);
};

const generateCarService = (): Prisma.CarServiceCreateManyInput => ({
  name: faker.word.noun().slice(0, 50),
  price: generateCarServicePrice(),
});

export const seedCarServices = async (prisma: PrismaClient, count = 25) => {
  console.log("🌱 Seeding CarServices...");
  await prisma.carService.deleteMany();

  const data = Array.from({ length: count }, () => generateCarService());

  const result = await prisma.carService.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} CarServices`);
};

import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarModelYear = (
  carModelId: string
): Prisma.CarModelYearCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  carModelId,
  year: faker.number.int({ min: 1990, max: new Date().getFullYear() }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedCarModelYears = async (
  prisma: PrismaClient,
  yearsPerModel = 1
) => {
  console.log("🌱 Seeding CarModelYears...");
  await prisma.carModelYear.deleteMany();
  const carModels = await prisma.carModel.findMany({ select: { id: true } });
  if (!carModels.length) {
    console.warn("⚠️ No CarModels found. Skipping CarModelYears seeding.");
    return;
  }
  let data: Prisma.CarModelYearCreateManyInput[] = [];
  for (const model of carModels) {
    for (let i = 0; i < yearsPerModel; i++) {
      data.push(generateCarModelYear(model.id));
    }
  }
  const result = await prisma.carModelYear.createMany({ data });
  console.log(`✅ Seeded ${result.count} CarModelYears`);
};

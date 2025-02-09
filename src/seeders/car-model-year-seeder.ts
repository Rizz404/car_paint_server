import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarModelYear = (
  carModelId: string
): Prisma.CarModelYearCreateManyInput => ({
  carModelId,
  year: faker.number.int({ min: 1990, max: new Date().getFullYear() }),
});

export const seedCarModelYears = async (
  prisma: PrismaClient,
  yearsPerModel = 2
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
  const result = await prisma.carModelYear.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} CarModelYears`);
};

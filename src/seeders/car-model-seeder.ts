import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarModel = (
  carBrandId: string
): Prisma.CarModelCreateManyInput => ({
  carBrandId,
  name: faker.vehicle.model().slice(0, 50),
});

export const seedCarModels = async (
  prisma: PrismaClient,
  modelsPerBrand = 2
) => {
  console.log("🌱 Seeding CarModels...");
  await prisma.carModel.deleteMany();
  const carBrands = await prisma.carBrand.findMany({ select: { id: true } });
  if (!carBrands.length) {
    console.warn("⚠️ No CarBrands found. Skipping CarModels seeding.");
    return;
  }
  let data: Prisma.CarModelCreateManyInput[] = [];
  for (const brand of carBrands) {
    for (let i = 0; i < modelsPerBrand; i++) {
      data.push(generateCarModel(brand.id));
    }
  }
  const result = await prisma.carModel.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} CarModels`);
};

import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarModelColor = (
  carModelId: string
): Prisma.CarModelColorCreateManyInput => ({
  carModelId,
  year: faker.number.int({ min: 1990, max: new Date().getFullYear() }),
});

export const seedCarModelColors = async (
  prisma: PrismaClient,
  yearsPerModel = 2,
  deleteFirst = true
) => {
  console.log("🌱 Seeding CarModelColors...");
  if (deleteFirst) {
    await prisma.carModelColor.deleteMany();
  }
  const carModels = await prisma.carModel.findMany({ select: { id: true } });
  if (!carModels.length) {
    console.warn("⚠️ No CarModels found. Skipping CarModelColors seeding.");
    return;
  }
  let data: Prisma.CarModelColorCreateManyInput[] = [];
  for (const model of carModels) {
    for (let i = 0; i < yearsPerModel; i++) {
      data.push(generateCarModelColor(model.id));
    }
  }
  const result = await prisma.carModelColor.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} CarModelColors`);
};

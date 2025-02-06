import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarModelColor = (
  carModelId: string
): Prisma.CarModelColorCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  carModelId,
  name: faker.color.human(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedCarModelColors = async (
  prisma: PrismaClient,
  colorsPerModel = 2
) => {
  console.log("🌱 Seeding CarModelColors...");
  await prisma.carModelColor.deleteMany();
  const carModels = await prisma.carModel.findMany({ select: { id: true } });
  if (!carModels.length) {
    console.warn("⚠️ No CarModels found. Skipping CarModelColors seeding.");
    return;
  }
  let data: Prisma.CarModelColorCreateManyInput[] = [];
  for (const model of carModels) {
    for (let i = 0; i < colorsPerModel; i++) {
      data.push(generateCarModelColor(model.id));
    }
  }
  const result = await prisma.carModelColor.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} CarModelColors`);
};

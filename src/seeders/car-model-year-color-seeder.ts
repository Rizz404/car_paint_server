import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarModelYearColor = (
  carModelYearId: string,
  colorId: string
): Prisma.CarModelYearColorCreateManyInput => ({
  carModelYearId,
  colorId,
});

export const seedCarModelYearColors = async (
  prisma: PrismaClient,
  yearColorsPerModel = 2,
  deleteFirst = true
) => {
  console.log("🌱 Seeding CarModelYearColors...");

  if (deleteFirst) {
    await prisma.carModelYearColor.deleteMany();
  }

  const carModelYears = await prisma.carModelYear.findMany({
    select: { id: true },
  });
  const colors = await prisma.color.findMany({ select: { id: true } });

  if (!carModelYears.length) {
    console.warn(
      "⚠️ No CarModelYears found. Skipping CarModelYearColors seeding."
    );
    return;
  }

  if (!colors.length) {
    console.warn("⚠️ No Colors found. Skipping CarModelYearColors seeding.");
    return;
  }

  let data: Prisma.CarModelYearColorCreateManyInput[] = [];

  for (const model of carModelYears) {
    for (let i = 0; i < yearColorsPerModel; i++) {
      const color = colors[i % colors.length];
      if (color) {
        data.push(generateCarModelYearColor(model.id, color.id));
      }
    }
  }

  const result = await prisma.carModelYearColor.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${result.count} CarModelYearColors`);
};

import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const generateCarBrand = (): Prisma.CarBrandCreateManyInput => ({
  name: faker.company.name().slice(0, 50),
  logo: faker.image.urlLoremFlickr({ category: "transport" }),
  country: faker.location.country(),
});

export const seedCarBrands = async (prisma: PrismaClient, count = 50) => {
  console.log("🌱 Seeding CarBrands...");
  await prisma.carBrand.deleteMany();
  const data = Array.from({ length: count }, generateCarBrand);
  const result = await prisma.carBrand.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} CarBrands`);
};

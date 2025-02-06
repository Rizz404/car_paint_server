import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const generateCarBrand = (): Prisma.CarBrandCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  name: faker.company.name().slice(0, 50),
  imageUrl: faker.image.urlLoremFlickr({ category: "transport" }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedCarBrands = async (prisma: PrismaClient, count = 5) => {
  console.log("🌱 Seeding CarBrands...");
  await prisma.carBrand.deleteMany();
  const data = Array.from({ length: count }, generateCarBrand);
  const result = await prisma.carBrand.createMany({ data });
  console.log(`✅ Seeded ${result.count} CarBrands`);
};

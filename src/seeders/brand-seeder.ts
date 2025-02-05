import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

export const seedBrands = async (prisma: PrismaClient) => {
  try {
    console.log("🌱 Seeding brands...");

    // await prisma.brand.deleteMany();
    console.log("Deleted existing brands");

    const brands = await prisma.brand.createMany({
      data: generateBrands(10),
    });

    console.log(`✅ Seeded ${brands.count} brands`);
  } catch (error) {
    console.error("❌ Error seeding brands:", error);
  }
};

const generateBrand = () => ({
  id: faker.string.alphanumeric({ length: 25 }),
  name: faker.company.name(),
  imageUrl: faker.image.url(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

const generateBrands = (count: number) =>
  Array.from({ length: count }, () => generateBrand());

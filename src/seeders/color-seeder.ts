import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const generateColor = (): Prisma.ColorCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  name: faker.company.name().slice(0, 50),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedColors = async (prisma: PrismaClient, count = 50) => {
  console.log("🌱 Seeding Colors...");
  await prisma.color.deleteMany();
  const data = Array.from({ length: count }, generateColor);
  const result = await prisma.color.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} Colors`);
};

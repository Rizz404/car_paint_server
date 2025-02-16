import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const generateColor = (): Prisma.ColorCreateManyInput => ({
  name: faker.color.human(),
});

export const seedColors = async (
  prisma: PrismaClient,
  count = 25,
  deleteFirst = true
) => {
  console.log("🌱 Seeding Colors...");
  if (deleteFirst) {
    await prisma.color.deleteMany();
  }
  const data = Array.from({ length: count }, generateColor);
  const result = await prisma.color.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} Colors`);
};

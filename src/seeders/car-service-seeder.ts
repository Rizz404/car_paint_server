import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateCarService = (
  workshopId: string
): Prisma.CarServiceCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  workshopId,
  name: faker.word.noun().slice(0, 50),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedCarServices = async (
  prisma: PrismaClient,
  servicesPerWorkshop = 2
) => {
  console.log("🌱 Seeding CarServices...");
  await prisma.carService.deleteMany();
  const workshops = await prisma.workshop.findMany({ select: { id: true } });
  if (!workshops.length) {
    console.warn("⚠️ No Workshops found. Skipping CarServices seeding.");
    return;
  }
  let data: Prisma.CarServiceCreateManyInput[] = [];
  for (const workshop of workshops) {
    for (let i = 0; i < servicesPerWorkshop; i++) {
      data.push(generateCarService(workshop.id));
    }
  }
  const result = await prisma.carService.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} CarServices`);
};

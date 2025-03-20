import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateWorkshop = (userId: string): Prisma.WorkshopCreateManyInput => ({
  userId,
  name: faker.company.name().slice(0, 100),
  email: faker.internet.email(),
  phoneNumber: faker.phone.number().slice(0, 15),
  address: faker.location.streetAddress(),
  latitude: new Prisma.Decimal(faker.location.latitude({ min: -90, max: 90 })),
  longitude: new Prisma.Decimal(
    faker.location.longitude({ min: -180, max: 180 })
  ),
});

export const seedWorkshops = async (
  prisma: PrismaClient,
  workshopsPerUser = 2,
  deleteFirst = true
) => {
  console.log("🌱 Seeding Workshops...");
  if (deleteFirst) {
    await prisma.workshop.deleteMany();
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  if (!users.length) {
    console.warn("⚠️ No Users found. Skipping Workshops seeding.");
    return;
  }

  let data: Prisma.WorkshopCreateManyInput[] = [];
  for (const user of users) {
    for (let i = 0; i < workshopsPerUser; i++) {
      data.push(generateWorkshop(user.id));
    }
  }

  const result = await prisma.workshop.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${result.count} Workshops`);
};

import { Prisma, PrismaClient, Workshop } from "@prisma/client";
import { faker } from "@faker-js/faker";

const generateWorkshop = (): Prisma.WorkshopCreateManyInput => ({
  name: faker.company.name().slice(0, 100),
  email: faker.internet.email(),
  phoneNumber: faker.phone.number().slice(0, 15),
  address: faker.location.streetAddress(),
  latitude: new Prisma.Decimal(faker.location.latitude({ min: -90, max: 90 })),
  longitude: new Prisma.Decimal(
    faker.location.longitude({ min: -180, max: 180 })
  ),
});

export const seedWorkshops = async (prisma: PrismaClient, count = 40) => {
  console.log("🌱 Seeding Workshops...");
  await prisma.workshop.deleteMany();

  const data = Array.from({ length: count }, () => generateWorkshop());
  const result = await prisma.workshop.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} Workshops`);
};

import { Prisma, PrismaClient, Workshop } from "@prisma/client";
import { faker } from "@faker-js/faker";

const generateWorkshop = (
  carBrandId: string
): Prisma.WorkshopCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  name: faker.company.name().slice(0, 100),
  email: faker.internet.email(),
  phoneNumber: faker.phone.number().slice(0, 15),
  address: faker.location.streetAddress(),
  latitude: new Prisma.Decimal(faker.location.latitude({ min: -90, max: 90 })),
  longitude: new Prisma.Decimal(
    faker.location.longitude({ min: -180, max: 180 })
  ),
  carBrandId,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedWorkshops = async (prisma: PrismaClient, count = 10) => {
  console.log("🌱 Seeding Workshops...");
  await prisma.workshop.deleteMany();
  const carBrands = await prisma.carBrand.findMany({ select: { id: true } });
  if (!carBrands.length) {
    console.warn("⚠️ No CarBrands found. Skipping Workshops seeding.");
    return;
  }
  const data = Array.from({ length: count }, () =>
    generateWorkshop(carBrands[Math.floor(Math.random() * carBrands.length)].id)
  );
  const result = await prisma.workshop.createMany({ data });
  console.log(`✅ Seeded ${result.count} Workshops`);
};

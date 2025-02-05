import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

export const seedWorkshops = async (prisma: PrismaClient) => {
  try {
    console.log("🌱 Seeding workshops...");

    // Menghapus data workshop lama (opsional)
    // await prisma.workshop.deleteMany();
    console.log("Deleted existing workshops");

    // Ambil daftar brand yang sudah ada
    const brands = await prisma.brand.findMany({ select: { id: true } });

    if (brands.length === 0) {
      console.warn("⚠️ No brands found, skipping workshop seeding.");
      return;
    }

    const workshops = await prisma.workshop.createMany({
      data: generateWorkshops(10, brands),
    });

    console.log(`✅ Seeded ${workshops.count} workshops`);
  } catch (error) {
    console.error("❌ Error seeding workshops:", error);
  }
};

const generateWorkshop = (brandId: string) => ({
  id: faker.string.alphanumeric(25),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  latitude: faker.location.latitude({ min: -90, max: 90 }),
  longitude: faker.location.longitude({ min: -180, max: 180 }),
  brandId,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

const generateWorkshops = (count: number, brands: { id: string }[]) =>
  Array.from({ length: count }, () =>
    generateWorkshop(brands[Math.floor(Math.random() * brands.length)].id)
  );

import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateOrderTotalPrice = (): Prisma.Decimal => {
  const totalPriceRanges = [{ min: 500_000, max: 12_000_000 }];

  // * Pilih random berdasarkan array
  const range = faker.helpers.arrayElement(totalPriceRanges);

  const rawTotalPrice = faker.number.float({
    min: range.min,
    max: range.max,
  });

  const roundedTotalPrice = Math.round(rawTotalPrice / 1000) * 1000;

  return new Prisma.Decimal(roundedTotalPrice);
};

const generateOrder = (
  userId: string,
  userCarId: string,
  workshopId: string
): Prisma.OrderCreateManyInput => ({
  userId,
  userCarId,
  workshopId,
  workStatus: faker.helpers.arrayElement([
    "INSPECTION",
    "PUTTY",
    "SURFACER",
    "APPLICATION_COLOR_BASE",
    "APPLICATION_CLEAR_COAT",
    "POLISHING",
    "FINALQC",
    "DONE",
  ]) as Prisma.OrderCreateInput["workStatus"],
  orderStatus: "PENDING",
  note: faker.lorem.sentence(),
  totalPrice: generateOrderTotalPrice(),
});

export const seedOrders = async (prisma: PrismaClient, count = 40) => {
  console.log("🌱 Seeding Orders...");
  await prisma.order.deleteMany();
  const users = await prisma.user.findMany({ select: { id: true } });
  const userCars = await prisma.userCar.findMany({ select: { id: true } });
  const workshops = await prisma.workshop.findMany({ select: { id: true } });

  if (!users.length || !userCars.length || !workshops.length) {
    console.warn("⚠️ Missing dependencies for Orders. Skipping seeding.");
    return;
  }

  const data: Prisma.OrderCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    data.push(
      generateOrder(
        users[Math.floor(Math.random() * users.length)].id,
        userCars[Math.floor(Math.random() * userCars.length)].id,
        workshops[Math.floor(Math.random() * workshops.length)].id
      )
    );
  }
  const result = await prisma.order.createMany({ data, skipDuplicates: true });
  console.log(`✅ Seeded ${result.count} Orders`);
};

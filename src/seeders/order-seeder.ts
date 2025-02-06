import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateOrder = (
  userId: string,
  userCarId: string,
  workshopId: string
): Prisma.OrderCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  userId,
  userCarId,
  workshopId,
  workStatus: faker.helpers.arrayElement([
    "INSPECTION",
    "PUTTY",
    "SURFACER",
    "APPLICATIONCOLORBASE",
    "APPLICATIONCLEARCOAT",
    "POLISHING",
    "FINALQC",
    "DONE",
  ]) as Prisma.OrderCreateInput["workStatus"],
  orderStatus: "PENDING",
  note: faker.lorem.sentence(),
  totalPrice: new Prisma.Decimal(faker.number.float({ min: 50, max: 1000 })),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedOrders = async (prisma: PrismaClient, count = 100) => {
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

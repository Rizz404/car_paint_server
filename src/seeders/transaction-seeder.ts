import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateTransaction = (
  userId: string,
  paymentMethodId: string,
  orderId: string
): Prisma.TransactionCreateManyInput => ({
  userId,
  paymentMethodId,
  orderId,
  adminFee: new Prisma.Decimal(faker.number.float({ min: 1, max: 20 })),
  paymentMethodFee: new Prisma.Decimal(faker.number.float({ min: 1, max: 20 })),
  totalPrice: new Prisma.Decimal(faker.number.float({ min: 50, max: 1000 })),
  paymentStatus: "PENDING",
});

export const seedTransactions = async (prisma: PrismaClient, count = 100) => {
  console.log("🌱 Seeding Transactions...");
  await prisma.transaction.deleteMany();
  const users = await prisma.user.findMany({ select: { id: true } });
  const paymentMethods = await prisma.paymentMethod.findMany({
    select: { id: true },
  });
  const orders = await prisma.order.findMany({ select: { id: true } });

  if (!users.length || !paymentMethods.length || !orders.length) {
    console.warn("⚠️ Missing dependencies for Transactions. Skipping seeding.");
    return;
  }

  const data: Prisma.TransactionCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    data.push(
      generateTransaction(
        users[Math.floor(Math.random() * users.length)].id,
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)].id,
        orders[Math.floor(Math.random() * orders.length)].id
      )
    );
  }
  const result = await prisma.transaction.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} Transactions`);
};

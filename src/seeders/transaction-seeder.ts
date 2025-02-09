import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateFee = (): Prisma.Decimal => {
  const feeRanges = [{ min: 1000, max: 10_000 }];

  // * Pilih random berdasarkan array
  const range = faker.helpers.arrayElement(feeRanges);

  const rawFee = faker.number.float({
    min: range.min,
    max: range.max,
  });

  const roundedFee = Math.round(rawFee / 1000) * 1000;

  return new Prisma.Decimal(roundedFee);
};

const generateTransactionTotalPrice = (): Prisma.Decimal => {
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

const generateTransaction = (
  userId: string,
  paymentMethodId: string,
  orderId: string
): Prisma.TransactionCreateManyInput => ({
  userId,
  paymentMethodId,
  orderId,
  adminFee: generateFee(),
  paymentMethodFee: generateFee(),
  totalPrice: generateTransactionTotalPrice(),
  paymentStatus: "PENDING",
  paymentInvoiceUrl: "",
});

export const seedTransactions = async (prisma: PrismaClient, count = 40) => {
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

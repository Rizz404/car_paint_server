import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generatePaymentMethodFee = (): Prisma.Decimal => {
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

const generatePaymentMethod = (): Prisma.PaymentMethodCreateManyInput => ({
  name: faker.finance.accountName().slice(0, 100),
  fee: generatePaymentMethodFee(),
});

export const seedPaymentMethods = async (prisma: PrismaClient, count = 25) => {
  console.log("🌱 Seeding PaymentMethods...");
  await prisma.paymentMethod.deleteMany();
  const data = Array.from({ length: count }, generatePaymentMethod);
  const result = await prisma.paymentMethod.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} PaymentMethods`);
};

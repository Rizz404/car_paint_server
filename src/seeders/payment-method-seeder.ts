import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generatePaymentMethod = (): Prisma.PaymentMethodCreateManyInput => ({
  name: faker.finance.accountName().slice(0, 100),
  fee: new Prisma.Decimal(faker.number.float({ min: 0, max: 10 })),
});

export const seedPaymentMethods = async (prisma: PrismaClient, count = 100) => {
  console.log("🌱 Seeding PaymentMethods...");
  await prisma.paymentMethod.deleteMany();
  const data = Array.from({ length: count }, generatePaymentMethod);
  const result = await prisma.paymentMethod.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} PaymentMethods`);
};

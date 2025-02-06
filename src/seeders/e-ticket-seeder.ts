import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const generateETicket = (
  userId: string,
  orderId: string
): Prisma.ETicketCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  userId,
  orderId,
  ticketNumber: faker.number.int({ min: 1000, max: 9999 }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedETickets = async (prisma: PrismaClient, count = 100) => {
  console.log("🌱 Seeding ETickets...");
  await prisma.eTicket.deleteMany();
  const users = await prisma.user.findMany({ select: { id: true } });
  const orders = await prisma.order.findMany({ select: { id: true } });
  if (!users.length || !orders.length) {
    console.warn("⚠️ Missing dependencies for ETickets. Skipping seeding.");
    return;
  }
  const data: Prisma.ETicketCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    data.push(
      generateETicket(
        users[Math.floor(Math.random() * users.length)].id,
        orders[Math.floor(Math.random() * orders.length)].id
      )
    );
  }
  const result = await prisma.eTicket.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${result.count} ETickets`);
};

import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const generateUserWithProfile = (): Prisma.UserCreateInput => ({
  username: faker.internet.username(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 8 }),
  profileImage: faker.image.avatar(),
  userProfile: {
    create: {
      fullname: faker.person.fullName(),
      phoneNumber: faker.phone.number().slice(0, 20),
      address: faker.location.streetAddress(),
      latitude: new Prisma.Decimal(
        faker.location.latitude({ min: -90, max: 90 })
      ),
      longitude: new Prisma.Decimal(
        faker.location.longitude({ min: -180, max: 180 })
      ),
    },
  },
});

export const seedUsersWithProfiles = async (
  prisma: PrismaClient,
  count = 10
) => {
  console.log("🌱 Seeding Users with UserProfiles...");
  await prisma.user.deleteMany();

  for (let i = 0; i < count; i++) {
    const data = generateUserWithProfile();
    await prisma.user.create({ data });
  }

  const users = await prisma.user.findMany({
    include: { userProfile: true },
  });
  console.log(`✅ Seeded ${users.length} Users with their UserProfiles`);
};

import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const generateUser = (): Prisma.UserCreateManyInput => ({
  username: faker.internet.username(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 8 }),
  profileImage: faker.image.avatar(),
});

const generateUserProfile = (
  userId: string
): Prisma.UserProfileCreateManyInput => ({
  userId: userId,
  fullname: faker.person.fullName(),
  phoneNumber: faker.phone.number().slice(0, 20),
  address: faker.location.streetAddress(),
  latitude: new Prisma.Decimal(faker.location.latitude({ min: -90, max: 90 })),
  longitude: new Prisma.Decimal(
    faker.location.longitude({ min: -180, max: 180 })
  ),
});

export const seedUsersWithProfiles = async (
  prisma: PrismaClient,
  count = 100
) => {
  console.log("🌱 Seeding Users with UserProfiles using createMany...");
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const userDataArray: Prisma.UserCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    userDataArray.push(generateUser());
  }

  const createdUsers = await prisma.user.createMany({
    data: userDataArray,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${createdUsers.count} Users`);

  const users = await prisma.user.findMany({
    select: { id: true },
  });

  const userProfileDataArray: Prisma.UserProfileCreateManyInput[] = [];
  for (const user of users) {
    userProfileDataArray.push(generateUserProfile(user.id));
  }

  const createdUserProfiles = await prisma.userProfile.createMany({
    data: userProfileDataArray,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${createdUserProfiles.count} UserProfiles`);

  console.log(
    `✅ Seeded ${users.length} Users with their UserProfiles using createMany`
  );
};

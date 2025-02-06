import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// ============================================================
// SEED CAR BRAND
// ============================================================

// ============================================================
// SEED CAR MODEL
// ============================================================

// ============================================================
// SEED CAR MODEL COLOR
// ============================================================
const generateCarModelColor = (
  carModelId: string
): Prisma.CarModelColorCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  carModelId,
  name: faker.color.human(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedCarModelColors = async (colorsPerModel = 2) => {
  console.log("🌱 Seeding CarModelColors...");
  await prisma.carModelColor.deleteMany();
  const carModels = await prisma.carModel.findMany({ select: { id: true } });
  if (!carModels.length) {
    console.warn("⚠️ No CarModels found. Skipping CarModelColors seeding.");
    return;
  }
  let data: Prisma.CarModelColorCreateManyInput[] = [];
  for (const model of carModels) {
    for (let i = 0; i < colorsPerModel; i++) {
      data.push(generateCarModelColor(model.id));
    }
  }
  const result = await prisma.carModelColor.createMany({ data });
  console.log(`✅ Seeded ${result.count} CarModelColors`);
};

// ============================================================
// SEED CAR MODEL YEAR
// ============================================================
const generateCarModelYear = (
  carModelId: string
): Prisma.CarModelYearCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  carModelId,
  year: faker.number.int({ min: 1990, max: new Date().getFullYear() }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedCarModelYears = async (yearsPerModel = 1) => {
  console.log("🌱 Seeding CarModelYears...");
  await prisma.carModelYear.deleteMany();
  const carModels = await prisma.carModel.findMany({ select: { id: true } });
  if (!carModels.length) {
    console.warn("⚠️ No CarModels found. Skipping CarModelYears seeding.");
    return;
  }
  let data: Prisma.CarModelYearCreateManyInput[] = [];
  for (const model of carModels) {
    for (let i = 0; i < yearsPerModel; i++) {
      data.push(generateCarModelYear(model.id));
    }
  }
  const result = await prisma.carModelYear.createMany({ data });
  console.log(`✅ Seeded ${result.count} CarModelYears`);
};

// ============================================================
// SEED WORKSHOP
// ============================================================

// ============================================================
// SEED CAR SERVICE
// ============================================================
const generateCarService = (
  workshopId: string
): Prisma.CarServiceCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  workshopId,
  name: faker.word.noun().slice(0, 50),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedCarServices = async (servicesPerWorkshop = 2) => {
  console.log("🌱 Seeding CarServices...");
  await prisma.carService.deleteMany();
  const workshops = await prisma.workshop.findMany({ select: { id: true } });
  if (!workshops.length) {
    console.warn("⚠️ No Workshops found. Skipping CarServices seeding.");
    return;
  }
  let data: Prisma.CarServiceCreateManyInput[] = [];
  for (const workshop of workshops) {
    for (let i = 0; i < servicesPerWorkshop; i++) {
      data.push(generateCarService(workshop.id));
    }
  }
  const result = await prisma.carService.createMany({ data });
  console.log(`✅ Seeded ${result.count} CarServices`);
};

// ============================================================
// SEED PAYMENT METHOD
// ============================================================
const generatePaymentMethod = (): Prisma.PaymentMethodCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  name: faker.finance.accountName().slice(0, 100),
  fee: new Prisma.Decimal(
    faker.number.float({ min: 0, max: 10, precision: 2 })
  ),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedPaymentMethods = async (prisma: PrismaClient, count = 3) => {
  console.log("🌱 Seeding PaymentMethods...");
  await prisma.paymentMethod.deleteMany();
  const data = Array.from({ length: count }, generatePaymentMethod);
  const result = await prisma.paymentMethod.createMany({ data });
  console.log(`✅ Seeded ${result.count} PaymentMethods`);
};

// ============================================================
// SEED USER
// ============================================================

// ============================================================
// SEED USER PROFILE
// ============================================================
const generateUserProfile = (
  userId: string
): Prisma.UserProfileCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  userId,
  fullname: faker.person.fullName(),
  phoneNumber: faker.phone.number(),
  address: faker.location.streetAddress(),
  latitude: new Prisma.Decimal(faker.location.latitude({ min: -90, max: 90 })),
  longitude: new Prisma.Decimal(
    faker.location.longitude({ min: -180, max: 180 })
  ),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedUserProfiles = async () => {
  console.log("🌱 Seeding UserProfiles...");
  await prisma.userProfile.deleteMany();
  const users = await prisma.user.findMany({ select: { id: true } });
  if (!users.length) {
    console.warn("⚠️ No Users found. Skipping UserProfiles seeding.");
    return;
  }
  const data = users.map((user) => generateUserProfile(user.id));
  const result = await prisma.userProfile.createMany({ data });
  console.log(`✅ Seeded ${result.count} UserProfiles`);
};

// ============================================================
// SEED USER CAR
// ============================================================
const generateUserCar = (
  userId: string,
  carBrandId: string,
  carModelId: string,
  carModelColorId: string,
  carModelYearId: string
): Prisma.UserCarCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  userId,
  carBrandId,
  carModelId,
  carModelColorId,
  carModelYearId,
  licensePlate: faker.vehicle.vrm(),
  imageUrls: [faker.image.urlLoremFlickr({ category: "transport" })],
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedUserCars = async (prisma: PrismaClient, count = 10) => {
  console.log("🌱 Seeding UserCars...");
  await prisma.userCar.deleteMany();
  const users = await prisma.user.findMany({ select: { id: true } });
  const carBrands = await prisma.carBrand.findMany({ select: { id: true } });
  const carModels = await prisma.carModel.findMany({ select: { id: true } });
  const carModelColors = await prisma.carModelColor.findMany({
    select: { id: true },
  });
  const carModelYears = await prisma.carModelYear.findMany({
    select: { id: true },
  });

  if (
    !users.length ||
    !carBrands.length ||
    !carModels.length ||
    !carModelColors.length ||
    !carModelYears.length
  ) {
    console.warn("⚠️ Missing dependencies for UserCars. Skipping seeding.");
    return;
  }

  const data: Prisma.UserCarCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    data.push(
      generateUserCar(
        users[Math.floor(Math.random() * users.length)].id,
        carBrands[Math.floor(Math.random() * carBrands.length)].id,
        carModels[Math.floor(Math.random() * carModels.length)].id,
        carModelColors[Math.floor(Math.random() * carModelColors.length)].id,
        carModelYears[Math.floor(Math.random() * carModelYears.length)].id
      )
    );
  }
  const result = await prisma.userCar.createMany({ data });
  console.log(`✅ Seeded ${result.count} UserCars`);
};

// ============================================================
// SEED ORDER
// ============================================================
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
  totalPrice: new Prisma.Decimal(
    faker.number.float({ min: 50, max: 1000, precision: 2 })
  ),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedOrders = async (prisma: PrismaClient, count = 10) => {
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
  const result = await prisma.order.createMany({ data });
  console.log(`✅ Seeded ${result.count} Orders`);
};

// ============================================================
// SEED TRANSACTION
// ============================================================
const generateTransaction = (
  userId: string,
  paymentMethodId: string,
  orderId: string
): Prisma.TransactionCreateManyInput => ({
  id: faker.string.alphanumeric(25),
  userId,
  paymentMethodId,
  orderId,
  adminFee: new Prisma.Decimal(
    faker.number.float({ min: 1, max: 20, precision: 2 })
  ),
  paymentMethodFee: new Prisma.Decimal(
    faker.number.float({ min: 1, max: 20, precision: 2 })
  ),
  totalPrice: new Prisma.Decimal(
    faker.number.float({ min: 50, max: 1000, precision: 2 })
  ),
  paymentStatus: "PENDING",
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const seedTransactions = async (prisma: PrismaClient, count = 10) => {
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
  const result = await prisma.transaction.createMany({ data });
  console.log(`✅ Seeded ${result.count} Transactions`);
};

// ============================================================
// SEED E-TICKET
// ============================================================
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

export const seedETickets = async (prisma: PrismaClient, count = 10) => {
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
  const result = await prisma.eTicket.createMany({ data });
  console.log(`✅ Seeded ${result.count} ETickets`);
};

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
const main = async () => {
  try {
    // Pastikan urutan seed sesuai dengan dependency antar tabel
    await seedCarBrands();
    await seedCarModels();
    await seedCarModelColors();
    await seedCarModelYears();
    await seedWorkshops();
    await seedCarServices();
    await seedPaymentMethods();
    await seedUsers();
    await seedUserProfiles();
    await seedUserCars();
    await seedOrders();
    await seedTransactions();
    await seedETickets();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

main();

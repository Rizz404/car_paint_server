import {
  PrismaClient,
  Prisma,
  PaymentMethodType,
  PaymentReusability,
} from "@prisma/client";

export const seedPaymentMethods = async (
  prisma: PrismaClient,
  deleteFirst = true
) => {
  console.log("🌱 Seeding PaymentMethods...");

  if (deleteFirst) {
    // Delete in order to respect foreign key constraints
    await prisma.eWalletPaymentConfig.deleteMany();
    await prisma.virtualAccountConfig.deleteMany();
    await prisma.paymentMethod.deleteMany();
  }

  // Process data from the defined payment methods
  for (const item of paymentMethodsData) {
    // Create the payment method
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        // Let Prisma handle id, createdAt, and updatedAt
        name: item.name,
        type: item.type as PaymentMethodType,
        reusability: item.reusability as PaymentReusability,
        fee: new Prisma.Decimal(item.fee),
        description: item.description,
        logoUrl: item.logo_url,
        isActive: item.is_active,
      },
    });

    // If it's an EWALLET type and has ewallet config data
    if (item.type === "EWALLET" && item["id'"]) {
      await prisma.eWalletPaymentConfig.create({
        data: {
          paymentMethodId: paymentMethod.id,
          channelCode: item["channel_code'"],
          successReturnUrl: item.success_return_url,
          failureReturnUrl: item.failure_return_url,
        },
      });
    }

    // If it's a VIRTUAL_ACCOUNT type and has VA config data
    if (item.type === "VIRTUAL_ACCOUNT" && item["id''"]) {
      await prisma.virtualAccountConfig.create({
        data: {
          paymentMethodId: paymentMethod.id,
          bankCode: item.bank_code,
          bankName: item.bank_name,
          accountPattern: item.account_pattern,
        },
      });
    }
  }

  const count = await prisma.paymentMethod.count();
  console.log(`✅ Seeded ${count} PaymentMethods with their configurations`);
};

// Payment method data extracted from your JSON
const paymentMethodsData = [
  {
    name: "DANA",
    fee: 0.0,
    description: "Dompet digital DANA, cepat dan aman.",
    is_active: true,
    logo_url: null,
    type: "EWALLET",
    channel_code: "DANA",
    reusability: "ONE_TIME_USE",
    "id'": "cm7htdkd10001vbekr2z3uxyq",
    "channel_code'": "DANA",
    success_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
    failure_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
  },
  {
    name: "OVO",
    fee: 0.0,
    description: "Dompet digital OVO untuk transaksi tanpa ribet.",
    is_active: true,
    logo_url: null,
    type: "EWALLET",
    channel_code: "OVO",
    reusability: "ONE_TIME_USE",
    "id'": "cm7htgdcf0004vbeki57bun3k",
    "channel_code'": "OVO",
    success_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
    failure_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
  },
  {
    name: "SHOPEEPAY",
    fee: 0.0,
    description: "ShopeePay, solusi pembayaran online yang efisien.",
    is_active: true,
    logo_url: null,
    type: "EWALLET",
    channel_code: "SHOPEEPAY",
    reusability: "ONE_TIME_USE",
    "id'": "cm7iowue50004vbswtbgt1l8p",
    "channel_code'": "SHOPEEPAY",
    success_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
    failure_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
  },
  {
    name: "ID_AKULAKU",
    fee: 0.0,
    description:
      "Pembayaran digital dengan Akulaku, solusi cicilan tanpa ribet.",
    is_active: true,
    logo_url: null,
    type: "EWALLET",
    channel_code: "ID_AKULAKU",
    reusability: "ONE_TIME_USE",
    "id'": "cm7j0001",
    "channel_code'": "ID_AKULAKU",
    success_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
    failure_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
  },
  {
    name: "ID_ATOME",
    fee: 0.0,
    description: "Pembayaran digital dengan Atome, cicilan yang praktis.",
    is_active: true,
    logo_url: null,
    type: "EWALLET",
    channel_code: "ID_ATOME",
    reusability: "ONE_TIME_USE",
    "id'": "cm7j0002",
    "channel_code'": "ID_ATOME",
    success_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
    failure_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
  },
  {
    name: "ID_KREDIVO",
    fee: 0.0,
    description: "Pembayaran digital dengan KREDIVO, fleksibel dan mudah.",
    is_active: true,
    logo_url: null,
    type: "EWALLET",
    channel_code: "ID_KREDIVO",
    reusability: "ONE_TIME_USE",
    "id'": "cm7j0003",
    "channel_code'": "ID_KREDIVO",
    success_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
    failure_return_url:
      "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
  },
  {
    name: "CIMB",
    fee: 0.0,
    description: "Virtual account CIMB, solusi perbankan yang inovatif.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "CIMB",
    reusability: "ONE_TIME_USE",
    "id''": "cm7j0004",
    bank_code: "CIMB",
    bank_name: "CIMB Niaga",
    account_pattern: "0987654321",
  },
  {
    name: "BCA",
    fee: 0.0,
    description: "Virtual account BCA untuk kemudahan transaksi.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "BCA",
    reusability: "ONE_TIME_USE",
    "id''": "cm7htbahn0000vbek87da2au4",
    bank_code: "BCA",
    bank_name: "Bank Central Asia",
    account_pattern: "0987654321",
  },
  {
    name: "BNC",
    fee: 0.0,
    description: "Virtual account BNC: solusi transaksi digital yang handal.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "BNC",
    reusability: "ONE_TIME_USE",
    "id''": "cm7j0005",
    bank_code: "BNC",
    bank_name: "Bank Neo Commerce",
    account_pattern: "0987654321",
  },
  {
    name: "DD_BCA_KLIKPAY",
    fee: 0.0,
    description: "Direct debit BCA melalui KlikPay untuk transaksi cepat.",
    is_active: true,
    logo_url: null,
    type: "DIRECT_DEBIT",
    channel_code: "DD_BCA_KLIKPAY",
    reusability: "ONE_TIME_USE",
  },
  {
    name: "BSI",
    fee: 0.0,
    description: "Virtual account BSI mendukung kemudahan transaksi.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "BSI",
    reusability: "ONE_TIME_USE",
    "id''": "cm7j0006",
    bank_code: "BSI",
    bank_name: "Bank Syariah Indonesia",
    account_pattern: "0987654321",
  },
  {
    name: "MANDIRI",
    fee: 0.0,
    description: "Virtual account Mandiri untuk pembayaran yang efisien.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "MANDIRI",
    reusability: "ONE_TIME_USE",
    "id''": "cm7j0007",
    bank_code: "MANDIRI",
    bank_name: "Bank Mandiri",
    account_pattern: "0987654321",
  },
  {
    name: "DD_MANDIRI",
    fee: 0.0,
    description: "Direct debit Mandiri memudahkan pembayaran otomatis.",
    is_active: true,
    logo_url: null,
    type: "DIRECT_DEBIT",
    channel_code: "DD_MANDIRI",
    reusability: "ONE_TIME_USE",
  },
  {
    name: "BRI",
    fee: 0.0,
    description: "Virtual account BRI, solusi perbankan digital terkini.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "BRI",
    reusability: "ONE_TIME_USE",
    "id''": "cm7j0008",
    bank_code: "BRI",
    bank_name: "Bank Rakyat Indonesia",
    account_pattern: "0987654321",
  },
  {
    name: "BNI",
    fee: 0.0,
    description: "Virtual account BNI untuk pembayaran yang aman.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "BNI",
    reusability: "ONE_TIME_USE",
    "id''": "cm7j0009",
    bank_code: "BNI",
    bank_name: "Bank Negara Indonesia",
    account_pattern: "0987654321",
  },
  {
    name: "BSS",
    fee: 0.0,
    description: "Virtual account BSS untuk layanan transaksi digital.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "BSS",
    reusability: "ONE_TIME_USE",
    "id''": "cm7j0010",
    bank_code: "BSS",
    bank_name: "Bank Syariah Sinarmas",
    account_pattern: "0987654321",
  },
  {
    name: "BJB",
    fee: 0.0,
    description: "Virtual account BJB, andalan transaksi digital.",
    is_active: true,
    logo_url: null,
    type: "VIRTUAL_ACCOUNT",
    channel_code: "BJB",
    reusability: "ONE_TIME_USE",
    "id''": "cm7j0011",
    bank_code: "BJB",
    bank_name: "Bank Jabar Banten",
    account_pattern: "0987654321",
  },
  {
    name: "DD_BRI",
    fee: 0.0,
    description: "Direct debit BRI: penarikan otomatis yang praktis.",
    is_active: true,
    logo_url: null,
    type: "DIRECT_DEBIT",
    channel_code: "DD_BRI",
    reusability: "ONE_TIME_USE",
  },
];

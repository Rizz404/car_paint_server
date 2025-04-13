import { MidtransFraudStatus, MidtransTransactionStatus } from "@prisma/client";

// * Fungsi untuk mengkonversi nilai status transaksi Midtrans ke format enum Prisma
export function mapToMidtransTransactionStatus(
  status: string | undefined
): MidtransTransactionStatus | undefined {
  if (!status) return undefined;

  // * Mengubah string ke uppercase untuk mencocokkan dengan enum Prisma
  const uppercaseStatus = status.toUpperCase();

  // * Pastikan nilai adalah enum yang valid
  switch (uppercaseStatus) {
    case "PENDING":
      return "PENDING" as MidtransTransactionStatus;
    case "CAPTURE":
      return "CAPTURE" as MidtransTransactionStatus;
    case "SETTLEMENT":
      return "SETTLEMENT" as MidtransTransactionStatus;
    case "DENY":
      return "DENY" as MidtransTransactionStatus;
    case "CANCEL":
      return "CANCEL" as MidtransTransactionStatus;
    case "EXPIRE":
      return "EXPIRE" as MidtransTransactionStatus;
    case "FAILURE":
      return "FAILURE" as MidtransTransactionStatus;
    case "AUTHORIZE":
      return "AUTHORIZE" as MidtransTransactionStatus;
    default:
      return undefined;
  }
}

// * Fungsi serupa untuk fraud status
export function mapToMidtransFraudStatus(
  status: string | undefined
): MidtransFraudStatus | undefined {
  if (!status) return undefined;

  const uppercaseStatus = status.toUpperCase();

  switch (uppercaseStatus) {
    case "ACCEPT":
      return "ACCEPT" as MidtransFraudStatus;
    case "CHALLENGE":
      return "CHALLENGE" as MidtransFraudStatus;
    case "DENY":
      return "DENY" as MidtransFraudStatus;
    default:
      return undefined;
  }
}

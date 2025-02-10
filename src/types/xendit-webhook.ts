export enum XenditPaymentStatus {
  UNPAID = "UNPAID", // Tautan pembayaran sudah dibuat dan dapat dibayarkan
  PAID = "PAID", // Pembayaran berhasil dilakukan
  SETTLED = "SETTLED", // Dana sudah masuk ke saldo dan bisa ditarik
  EXPIRED = "EXPIRED", // Tautan pembayaran kedaluwarsa sebelum dibayar
  ACTIVE = "ACTIVE", // Untuk tautan pembayaran ganda yang masih dikirimkan
  STOPPED = "STOPPED", // Untuk tautan pembayaran ganda yang tidak bisa dibuat ulang
}

type paymentMethod =
  | "UNPAID" // Tautan pembayaran sudah dibuat dan dapat dibayarkan
  | "PAID" // Pembayaran berhasil dilakukan
  | "SETTLED" // Dana sudah masuk ke saldo dan bisa ditarik
  | "EXPIRED" // Tautan pembayaran kedaluwarsa sebelum dibayar
  | "ACTIVE" // Untuk tautan pembayaran ganda yang masih dikirimkan
  | "STOPPED"; // Untuk tautan pembayaran ganda yang tidak bisa dibuat ulang

export interface XenditWebhookPayload {
  id: string;
  external_id: string;
  user_id: string;
  is_high: boolean;
  payment_method: string;
  status: paymentMethod;
  merchant_name: string;
  amount: number;
  paid_amount: number;
  bank_code: string;
  paid_at: Date;
  payer_email: string;
  description: string;
  adjusted_received_amount: number;
  fees_paid_amount: number;
  updated: Date;
  created: Date;
  currency: string;
  payment_channel: string;
  payment_destination: string;
}

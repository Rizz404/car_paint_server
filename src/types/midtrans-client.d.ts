/**
 * Type definitions for midtrans-client v1.3.x
 * Project: https://github.com/midtrans/midtrans-nodejs-client
 * Definitions by: User Input <updated and refined by Gemini>
 * Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
 *
 * Catatan: Tipe ini didasarkan pada penggunaan umum dan dokumentasi API Midtrans (v2).
 * Ini telah disempurnakan untuk mencakup kasus penggunaan Snap API yang lebih spesifik
 * dan menyelaraskan beberapa tipe respons agar lebih akurat.
 * Referensi utama: https://api-docs.midtrans.com/
 */

declare module "midtrans-client" {
  // --- Interface Umum ---

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface Address {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country_code?: string; // Biasanya 'IDN'
  }

  export interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email: string; // Wajib ada email atau phone
    phone: string; // Wajib ada email atau phone
    billing_address?: Address;
    shipping_address?: Address;
  }

  export interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
    merchant_name?: string;
    url?: string;
  }

  // --- START: Penyempurnaan Parameter Inti ---

  /** Pengaturan expiry untuk transaksi. */
  export interface Expiry {
    /** Waktu mulai transaksi. Format: "YYYY-MM-DD HH:mm:ss ZZZ". */
    start_time?: string;
    /** Satuan durasi expiry. */
    unit: "minute" | "hour" | "day";
    /** Nilai durasi. */
    duration: number;
  }

  /** Interface dasar untuk semua parameter transaksi (baik Core API maupun Snap). */
  export interface BaseTransactionParameter {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: ItemDetails[];
    custom_field1?: string;
    custom_field2?: string;
    custom_field3?: string;
    expiry?: Expiry;
    merchant?: { mid: string };
  }

  // --- END: Penyempurnaan Parameter Inti ---

  // --- Interface Parameter Spesifik Pembayaran (Untuk Core API & Snap) ---

  export interface CreditCardDetails {
    token_id: string;
    authentication?: boolean;
    bank?:
      | "bca"
      | "mandiri"
      | "cimb"
      | "bni"
      | "bri"
      | "maybank"
      | "mega"
      | string;
    installment?: {
      required: boolean;
      terms: { [bank: string]: number[] };
    };
    whitelist_bins?: string[];
    dynamic_descriptor?: {
      merchant_name: string;
      city_name: string;
      country_code: string;
    };
    type?: "authorize";
    saved_token_id?: string;
    save_token_id?: boolean;
  }

  export interface BankTransferDetails {
    bank: "bca" | "bni" | "bri" | "permata" | "cimb" | "mandiri" | string; // Tambah cimb & mandiri
    va_number?: string;
    free_text?: {
      inquiry?: { id?: string; en?: string }[];
      payment?: { id?: string; en?: string }[];
    };
  }

  export interface EchannelDetails {
    bill_info1: string;
    bill_info2: string;
    // ... bill_info lainnya
    bill_key?: string;
  }

  export interface GopayDetails {
    enable_callback?: boolean;
    callback_url?: string;
    account_id?: string;
    payment_option_token?: string;
    pre_auth?: boolean;
  }

  export interface ShopeePayDetails {
    callback_url: string;
  }

  export interface CStoreDetails {
    store: "alfamart" | "indomaret";
    message?: string;
    alfamart_free_text_1?: string;
    // ... free text lainnya
  }

  export interface QrisDetails {
    enable_callback?: boolean;
    callback_url?: string;
    acquirer?: "gopay" | "airpay shopee" | string;
  }

  export interface DanaDetails {
    callback_url?: string;
  }

  // --- Parameter Charge Core API ---

  export type ChargeRequestCreditCard = BaseTransactionParameter & {
    payment_type: "credit_card";
    credit_card: CreditCardDetails;
  };
  export type ChargeRequestBankTransfer = BaseTransactionParameter & {
    payment_type: "bank_transfer";
    bank_transfer: BankTransferDetails;
  };
  export type ChargeRequestEchannel = BaseTransactionParameter & {
    payment_type: "echannel";
    echannel: EchannelDetails;
  };
  export type ChargeRequestGopay = BaseTransactionParameter & {
    payment_type: "gopay";
    gopay?: GopayDetails;
  };
  export type ChargeRequestShopeePay = BaseTransactionParameter & {
    payment_type: "shopeepay";
    shopeepay: ShopeePayDetails;
  };
  export type ChargeRequestCStore = BaseTransactionParameter & {
    payment_type: "cstore";
    cstore: CStoreDetails;
  };
  export type ChargeRequestQris = BaseTransactionParameter & {
    payment_type: "qris";
    qris?: QrisDetails;
  };
  export type ChargeRequestDana = BaseTransactionParameter & {
    payment_type: "dana";
    dana?: DanaDetails;
  };
  export type ChargeRequestAkulaku = BaseTransactionParameter & {
    payment_type: "akulaku";
  };
  export type ChargeRequestKredivo = BaseTransactionParameter & {
    payment_type: "kredivo";
  };

  export type CoreApiChargeParameter =
    | ChargeRequestCreditCard
    | ChargeRequestBankTransfer
    | ChargeRequestEchannel
    | ChargeRequestGopay
    | ChargeRequestShopeePay
    | ChargeRequestCStore
    | ChargeRequestQris
    | ChargeRequestDana
    | ChargeRequestAkulaku
    | ChargeRequestKredivo;

  // --- Parameter Create Transaction Snap API ---

  /** Tipe untuk mengontrol metode pembayaran yang tampil di halaman Snap. */
  export type PaymentType =
    | "credit_card"
    | "bca_va"
    | "bni_va"
    | "bri_va"
    | "echannel"
    | "permata_va"
    | "other_va"
    | "gopay"
    | "shopeepay"
    | "indomaret"
    | "alfamart"
    | "dana"
    | "qris"
    | "akulaku"
    | "kredivo";

  /** * Parameter untuk Snap.createTransaction. Mirip dengan Core API,
   * namun dengan tambahan opsi untuk mengontrol UI Snap.
   */
  export interface SnapTransaction extends BaseTransactionParameter {
    /** Tentukan metode pembayaran yang ingin ditampilkan. Jika kosong, semua yang aktif akan tampil. */
    enabled_payments?: PaymentType[];
    /** Tentukan metode pembayaran yang ingin disembunyikan. */
    disabled_payments?: PaymentType[];
    /** URL callbacks untuk meng-handle redirect dari halaman Snap. */
    callbacks?: {
      /** URL tujuan setelah pembayaran selesai (baik sukses maupun gagal/pending). */
      finish: string;
      /** URL tujuan jika pembayaran belum selesai dan user menekan tombol 'back'. (Opsional) */
      pending?: string;
      /** URL tujuan jika terjadi error. (Opsional) */
      error?: string;
    };
    // Untuk Snap, detail pembayaran spesifik seperti `credit_card` atau `gopay` bersifat opsional
    // karena pengguna memilihnya di halaman Snap.
    credit_card?: CreditCardDetails;
    gopay?: GopayDetails;
    shopeepay?: ShopeePayDetails;
    // ... detail lain bisa ditambahkan jika ingin mengirimkan data spesifik ke Snap
  }

  export type SnapCreateTransactionParameter = SnapTransaction;

  // --- Interface Respons API Midtrans ---

  export interface MidtransApiResponse {
    status_code: string;
    status_message: string;
    transaction_id?: string;
    order_id?: string;
    merchant_id?: string;
    gross_amount?: string;
    currency?: "IDR" | string;
    payment_type?: string;
    transaction_time?: string;
    transaction_status?:
      | "authorize"
      | "capture"
      | "settlement"
      | "pending"
      | "deny"
      | "cancel"
      | "expire"
      | "failure"
      | string;
    fraud_status?: "accept" | "challenge" | "deny";
    validation_messages?: string[];
    error_messages?: string[];
    signature_key?: string;
    settlement_time?: string;
    expiry_time?: string;
  }

  export interface VaInfo {
    bank: string;
    va_number: string;
  }

  export interface Action {
    name: string;
    method: "GET" | "POST" | string;
    url: string;
  }

  // Detail Respons Spesifik
  export interface ResponseCreditCardDetails {
    masked_card?: string;
    approval_code?: string;
    bank?: string;
    card_type?: "credit" | "debit";
    redirect_url?: string;
    eci?: string;
  }
  export interface ResponseBankTransferDetails {
    va_numbers?: VaInfo[];
    permata_va_number?: string;
    bca_va_number?: string;
    bni_va_number?: string;
    bri_va_number?: string;
  }
  export interface ResponseEchannelDetails {
    bill_key?: string;
    biller_code?: string;
  }
  export interface ResponseActionDetails {
    actions?: Action[];
    qr_string?: string;
    acquirer?: string;
  } // Tambah qr_string dan acquirer
  export interface ResponseCStoreDetails {
    payment_code?: string;
    store?: "alfamart" | "indomaret";
  }

  // Tipe Respons Method Core API
  export type CoreApiChargeResponse = MidtransApiResponse &
    Partial<ResponseCreditCardDetails> &
    Partial<ResponseBankTransferDetails> &
    Partial<ResponseEchannelDetails> &
    Partial<ResponseActionDetails> &
    Partial<ResponseCStoreDetails>;

  export type CoreApiTransactionResponse = MidtransApiResponse &
    Partial<ResponseCreditCardDetails> &
    Partial<ResponseBankTransferDetails> &
    Partial<ResponseEchannelDetails> &
    Partial<ResponseActionDetails> &
    Partial<ResponseCStoreDetails>;

  // --- Tipe Respons Method Snap API ---

  /** Respons sukses dari Snap.createTransaction. Berisi token ATAU redirect_url. */
  export interface SnapCreateTransactionSuccessResponse {
    /** Token untuk digunakan dengan Snap.js (Popup). */
    token?: string;
    /** URL untuk me-redirect pengguna ke halaman pembayaran Snap. */
    redirect_url?: string;
  }

  /** Tipe union untuk respons Snap.createTransaction. */
  export type SnapCreateTransactionResponse =
    SnapCreateTransactionSuccessResponse;
  // | MidtransApiResponse;

  // --- Kelas & Method ---

  export interface MidtransClientOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export class Snap {
    constructor(options: MidtransClientOptions);
    createTransaction(
      parameter: SnapCreateTransactionParameter
    ): Promise<SnapCreateTransactionResponse>;
  }

  export class CoreApi {
    constructor(options: MidtransClientOptions);
    charge(parameter: CoreApiChargeParameter): Promise<CoreApiChargeResponse>;
    cancel(transactionIdOrOrderId: string): Promise<CoreApiTransactionResponse>;
    expire(transactionIdOrOrderId: string): Promise<CoreApiTransactionResponse>;
    status(transactionIdOrOrderId: string): Promise<CoreApiTransactionResponse>;
    capture(parameter: {
      transaction_id: string;
      gross_amount?: number;
    }): Promise<CoreApiChargeResponse>;
    approve(
      transactionIdOrOrderId: string
    ): Promise<CoreApiTransactionResponse>;
    deny(transactionIdOrOrderId: string): Promise<CoreApiTransactionResponse>;
    refund(
      transactionIdOrOrderId: string,
      parameter: { amount?: number; reason: string; refund_key?: string }
    ): Promise<MidtransApiResponse>;
    // ... other methods
  }

  // --- Notifikasi / Webhook ---

  export interface MidtransNotificationPayload {
    transaction_time: string;
    transaction_status:
      | "capture"
      | "settlement"
      | "pending"
      | "deny"
      | "cancel"
      | "expire"
      | "failure"
      | "refund"
      | "partial_refund"
      | "authorize"
      | string;
    transaction_id: string;
    status_message: string;
    status_code: string;
    signature_key: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status: "accept" | "challenge" | "deny";
    currency: string;
    masked_card?: string;
    approval_code?: string;
    permata_va_number?: string;
    va_numbers?: VaInfo[];
    payment_code?: string;
    bill_key?: string;
    biller_code?: string;
    acquirer?: string; // Sering ada di notif QRIS
  }

  export type MidtransWebhookPayload = MidtransNotificationPayload;
}

/**
 * Type definitions for midtrans-client v1.3.x
 * Project: https://github.com/midtrans/midtrans-nodejs-client
 * Definitions by: [Your Name/GitHub Handle] <updated by AI>
 * Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
 *
 * Catatan: Tipe ini didasarkan pada penggunaan umum dan dokumentasi API Midtrans (v2).
 * Mungkin tidak mencakup semua kasus tepi atau parameter spesifik untuk setiap metode pembayaran.
 * Disarankan untuk merujuk ke dokumentasi API Midtrans resmi untuk detail paling akurat.
 * https://api-docs.midtrans.com/
 */

declare module "midtrans-client" {
  // --- Interface Umum ---

  /** Merepresentasikan detail transaksi seperti order ID dan jumlah. */
  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  /** Merepresentasikan alamat fisik. */
  interface Address {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country_code?: string; // Biasanya 'IDN'
  }

  /** Merepresentasikan detail pelanggan. */
  interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email: string; // Wajib ada email atau phone
    phone: string; // Wajib ada email atau phone
    billing_address?: Address;
    shipping_address?: Address;
  }

  /** Merepresentasikan item dalam transaksi. */
  interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
    merchant_name?: string;
    url?: string;
  }

  // --- Interface Parameter Spesifik Pembayaran ---

  /** Detail Kartu Kredit untuk Core API charge (menggunakan token_id). */
  interface CreditCardDetails {
    /** token_id yang didapatkan dari tokenisasi kartu di frontend (Midtrans JS/SDK). Wajib. */
    token_id: string;
    /** Set true untuk mengaktifkan otentikasi 3D Secure jika diperlukan. Default false. */
    authentication?: boolean;
    /** Tentukan bank acquirer (misal 'bca', 'mandiri'). Opsional. */
    bank?:
      | "bca"
      | "mandiri"
      | "cimb"
      | "bni"
      | "bri"
      | "maybank"
      | "mega"
      | string;
    /** Tentukan opsi cicilan. */
    installment?: {
      required: boolean;
      terms: {
        /** Key adalah identifier bank (misal 'bni', 'mandiri'), value adalah array bulan cicilan yg diizinkan. */
        [bank: string]: number[];
      };
    };
    /** Array BIN kartu yang diizinkan. */
    whitelist_bins?: string[];
    /** Informasi dynamic descriptor yang muncul di laporan bank pelanggan. */
    dynamic_descriptor?: {
      merchant_name: string;
      city_name: string;
      /** Kode negara ISO 3166-1 alpha-3 (misal 'IDN'). */
      country_code: string;
    };
    /** Tipe transaksi ('authorize' untuk pre-auth). Opsional. */
    type?: "authorize";
    /** Jika `save_token_id=true`, ini ID untuk menyimpan token kartu. Membutuhkan persetujuan Midtrans. */
    saved_token_id?: string;
    /** Set true untuk menyimpan token kartu untuk penggunaan di masa depan. Membutuhkan `saved_token_id`. Membutuhkan persetujuan Midtrans. */
    save_token_id?: boolean;
  }

  /** Detail Bank Transfer (Virtual Account). */
  interface BankTransferDetails {
    /** Bank tujuan VA (misal 'bca', 'bni', 'bri', 'permata'). Wajib. */
    bank: "bca" | "bni" | "bri" | "permata" | string; // izinkan bank lain sebagai string
    /** Nomor VA spesifik. Biasanya dibuat Midtrans, tapi bisa diberikan dalam skenario tertentu. */
    va_number?: string;
    /** Teks bebas untuk ditampilkan di instruksi pembayaran VA (bank tertentu seperti Permata). */
    free_text?: {
      inquiry?: { id?: string; en?: string }[];
      payment?: { id?: string; en?: string }[];
    };
  }

  /** Detail Echannel untuk Mandiri Bill Payment. */
  interface EchannelDetails {
    /** Deskripsi tagihan baris 1. */
    bill_info1: string;
    /** Deskripsi tagihan baris 2. */
    bill_info2: string;
    bill_info3?: string;
    bill_info4?: string;
    bill_info5?: string;
    bill_info6?: string;
    bill_info7?: string;
    bill_info8?: string;
    /** Bill key, seringkali sama dengan order_id atau turunan darinya. Opsional menurut docs, tapi sering ada di contoh. */
    bill_key?: string;
  }

  /** Detail spesifik GoPay. */
  interface GopayDetails {
    /** Set true jika ingin menerima update status via callback deeplink. */
    enable_callback?: boolean;
    /** URL deeplink aplikasi Anda untuk menerima callback. Wajib jika enable_callback true. */
    callback_url?: string;
    /** ID akun GoPay untuk linking/tokenization (fitur lanjutan). */
    account_id?: string;
    /** Payment option token untuk GoPay linking (fitur lanjutan). */
    payment_option_token?: string;
    /** Set true jika ingin bisa melakukan refund via API (membutuhkan RRN). */
    pre_auth?: boolean;
  }

  /** Detail spesifik ShopeePay. */
  interface ShopeePayDetails {
    /** URL deeplink aplikasi atau web Anda tujuan redirect setelah pembayaran di Shopee. Wajib. */
    callback_url: string;
  }

  /** Detail spesifik Convenience Store (Alfamart / Indomaret). */
  interface CStoreDetails {
    /** Jaringan convenience store. */
    store: "alfamart" | "indomaret";
    /** Pesan untuk ditampilkan ke kasir. */
    message?: string;
    /** Teks bebas custom untuk struk Alfamart. */
    alfamart_free_text_1?: string;
    alfamart_free_text_2?: string;
    alfamart_free_text_3?: string;
  }

  /** Detail spesifik QRIS. */
  interface QrisDetails {
    /** Set true jika ingin menerima update status via callback deeplink (jika didukung acquirer). */
    enable_callback?: boolean;
    /** URL deeplink aplikasi Anda untuk menerima callback. Wajib jika enable_callback true. */
    callback_url?: string;
    /** Tentukan acquirer QRIS jika perlu (misal 'gopay'). */
    acquirer?: "gopay" | string;
  }

  // --- START: Detail Spesifik Metode Baru ---
  /** Detail spesifik Dana (opsional). */
  interface DanaDetails {
    /** URL deeplink aplikasi Anda untuk menerima callback. Opsional. */
    callback_url?: string;
  }
  // Tidak ada interface detail spesifik untuk Akulaku atau Kredivo di request (biasanya)
  // --- END: Detail Spesifik Metode Baru ---

  // --- Parameter Charge Core API ---

  /** Interface dasar untuk parameter charge Core API. */
  interface BaseChargeRequest {
    /** Detail transaksi (order_id, gross_amount). Wajib. */
    transaction_details: TransactionDetails;
    /** Detail pelanggan. Direkomendasikan. */
    customer_details?: CustomerDetails;
    /** Daftar item yang dibeli. Direkomendasikan. */
    item_details?: ItemDetails[];
    /** Field custom untuk data tambahan. */
    custom_field1?: string;
    custom_field2?: string;
    custom_field3?: string;
    /** Pengaturan expiry transaksi opsional. */
    expiry?: {
      /** Waktu mulai transaksi. Format: "YYYY-MM-DD HH:mm:ss ZZZ" (misal "2025-04-10 21:00:00 +0700"). Default waktu sekarang jika tidak diset. */
      start_time?: string;
      /** Satuan durasi expiry ('minute', 'hour', 'day'). Wajib jika expiry diset. */
      unit: "minute" | "hour" | "day";
      /** Nilai durasi berdasarkan unit. Wajib jika expiry diset. */
      duration: number;
    };
    /** Payload JSON custom untuk kebutuhan spesifik. */
    custom_payload?: Record<string, any>;
    /** Merchant ID (MID). Opsional, biasanya terkonfigurasi via API keys. */
    merchant?: {
      mid: string;
    };
  }

  /** Parameter Charge Core API untuk Kartu Kredit. */
  type ChargeRequestCreditCard = BaseChargeRequest & {
    payment_type: "credit_card";
    credit_card: CreditCardDetails;
  };
  /** Parameter Charge Core API untuk Bank Transfer (Virtual Account). */
  type ChargeRequestBankTransfer = BaseChargeRequest & {
    payment_type: "bank_transfer";
    bank_transfer: BankTransferDetails;
  };
  /** Parameter Charge Core API untuk Mandiri Bill Payment. */
  type ChargeRequestEchannel = BaseChargeRequest & {
    payment_type: "echannel";
    echannel: EchannelDetails;
  };
  /** Parameter Charge Core API untuk GoPay. */
  type ChargeRequestGopay = BaseChargeRequest & {
    payment_type: "gopay";
    gopay?: GopayDetails;
  }; // Object gopay opsional
  /** Parameter Charge Core API untuk ShopeePay. */
  type ChargeRequestShopeePay = BaseChargeRequest & {
    payment_type: "shopeepay";
    shopeepay: ShopeePayDetails;
  };
  /** Parameter Charge Core API untuk Convenience Store (Alfamart/Indomaret). */
  type ChargeRequestCStore = BaseChargeRequest & {
    payment_type: "cstore";
    cstore: CStoreDetails;
  };
  /** Parameter Charge Core API untuk QRIS. */
  type ChargeRequestQris = BaseChargeRequest & {
    payment_type: "qris";
    qris?: QrisDetails;
  }; // Object qris opsional

  // --- START: Tipe Charge Metode Baru ---
  /** Parameter Charge Core API untuk Dana. */
  type ChargeRequestDana = BaseChargeRequest & {
    payment_type: "dana";
    dana?: DanaDetails; // Object dana opsional
  };
  /** Parameter Charge Core API untuk Akulaku PayLater. */
  type ChargeRequestAkulaku = BaseChargeRequest & {
    payment_type: "akulaku";
    // akulaku?: {}; // Biasanya tidak ada objek spesifik yang diperlukan
  };
  /** Parameter Charge Core API untuk Kredivo PayLater. */
  type ChargeRequestKredivo = BaseChargeRequest & {
    payment_type: "kredivo";
    // kredivo?: {}; // Biasanya tidak ada objek spesifik yang diperlukan
  };
  // --- END: Tipe Charge Metode Baru ---

  /** Tipe union yang merepresentasikan semua kemungkinan parameter charge Core API. */
  type CoreApiChargeParameter =
    | ChargeRequestCreditCard
    | ChargeRequestBankTransfer
    | ChargeRequestEchannel
    | ChargeRequestGopay
    | ChargeRequestShopeePay
    | ChargeRequestCStore
    | ChargeRequestQris
    // --- START: Penambahan Tipe Baru ke Union ---
    | ChargeRequestDana
    | ChargeRequestAkulaku
    | ChargeRequestKredivo;
  // --- END: Penambahan Tipe Baru ke Union ---

  // --- Interface Respons API Midtrans ---

  /** Interface dasar untuk semua respons API Midtrans. */
  interface MidtransApiResponse {
    /** Kode status HTTP yang dikembalikan oleh API Midtrans. */
    status_code: string;
    /** Pesan status yang bisa dibaca manusia. */
    status_message: string;
    /** ID unik Midtrans untuk percobaan transaksi. Biasanya ada pada sukses/pending. */
    transaction_id?: string;
    /** Order ID Anda untuk transaksi. Biasanya ada pada sukses/pending. */
    order_id?: string;
    /** Merchant ID (MID) yang terkait dengan transaksi. */
    merchant_id?: string;
    /** Jumlah kotor transaksi sebagai string. */
    gross_amount?: string;
    /** Kode mata uang ('IDR'). */
    currency?: "IDR" | string;
    /** Tipe pembayaran yang digunakan untuk transaksi. */
    payment_type?: string;
    /** Timestamp saat transaksi terjadi ("YYYY-MM-DD HH:mm:ss"). */
    transaction_time?: string;
    /** Status transaksi saat ini. */
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
    /** Status deteksi fraud. */
    fraud_status?: "accept" | "challenge" | "deny";
    /** Pesan error validasi jika request tidak valid. */
    validation_messages?: string[];
    /** Pesan error jika request gagal. */
    error_messages?: string[];
    /** Signature key untuk verifikasi notifikasi webhook (sering ada di respons status). */
    signature_key?: string;
    /** Timestamp saat pembayaran lunas ("YYYY-MM-DD HH:mm:ss"). Hanya ada setelah settlement. */
    settlement_time?: string;
    /** Timestamp saat transaksi akan kadaluarsa ("YYYY-MM-DD HH:mm:ss"). Ada untuk metode dengan expiry. */
    expiry_time?: string;
  }

  /** Merepresentasikan informasi Virtual Account. */
  interface VaInfo {
    bank: "bca" | "bni" | "bri" | "permata" | string;
    va_number: string;
  }

  /** Merepresentasikan URL aksi yang disediakan Midtrans (misal untuk QR code, deeplink). */
  interface Action {
    name: string; // misal 'generate-qr-code', 'deeplink-redirect', 'get-status'
    method: "GET" | "POST" | string;
    url: string;
  }

  // --- Detail Respons Spesifik (sering digabung dalam cek status) ---

  /** Field spesifik Kartu Kredit dalam respons API. */
  interface ResponseCreditCardDetails {
    masked_card?: string; // Nomor kartu tersamarkan
    approval_code?: string; // Kode approval dari bank
    bank?: string; // Bank penerbit/acquirer
    card_type?: "credit" | "debit"; // Tipe kartu
    redirect_url?: string; // Untuk 3DS / Redirect Paylater (Akulaku/Kredivo)
    eci?: string; // Indikator hasil 3DS
    channel_response_code?: string; // Kode respons dari channel bank
    channel_response_message?: string; // Pesan respons dari channel bank
    three_d_secure_version?: string; // Versi 3DS (misal '1', '2')
    challenge_completion_url?: string; // URL penyelesaian challenge 3DS v2 frictionless
  }

  /** Field spesifik Bank Transfer (VA) dalam respons API. */
  interface ResponseBankTransferDetails {
    va_numbers?: VaInfo[]; // Daftar VA (jika > 1)
    permata_va_number?: string; // Field spesifik Permata VA
    bca_va_number?: string; // Field spesifik BCA VA
    bni_va_number?: string; // Field spesifik BNI VA
    bri_va_number?: string; // Field spesifik BRI VA
    // ... field spesifik bank lain mungkin muncul
  }

  /** Field spesifik Echannel (Mandiri Bill) dalam respons API. */
  interface ResponseEchannelDetails {
    bill_key?: string; // Sering ada walau opsional di request
    biller_code?: string;
  }

  /** Field spesifik GoPay/QRIS/ShopeePay/Dana (Actions) dalam respons API. */
  interface ResponseActionDetails {
    actions?: Action[];
    acquirer?: string; // Untuk QRIS
  }

  /** Field spesifik CStore dalam respons API. */
  interface ResponseCStoreDetails {
    payment_code?: string; // Kode pembayaran untuk kasir
    store?: "alfamart" | "indomaret";
  }
  // Tidak ada interface respons spesifik untuk Akulaku/Kredivo karena umumnya menggunakan redirect_url atau actions

  // --- Tipe Respons Method Core API ---

  /** Tipe respons untuk method `charge` Core API. Termasuk field dasar dan spesifik pembayaran. */
  type CoreApiChargeResponse = MidtransApiResponse &
    Partial<ResponseCreditCardDetails> & // Mencakup redirect_url
    Partial<ResponseBankTransferDetails> &
    Partial<ResponseEchannelDetails> &
    Partial<ResponseActionDetails> & // Mencakup actions (QR/Deeplink)
    Partial<ResponseCStoreDetails>;
  // Tidak perlu menambahkan Partial<> baru karena field yang relevan sudah tercakup

  /** Tipe respons untuk method `cancel` dan `expire` Core API. Biasanya mencerminkan status final. */
  type CoreApiCancelExpireResponse = MidtransApiResponse &
    Partial<ResponseCreditCardDetails> &
    Partial<ResponseBankTransferDetails> &
    Partial<ResponseEchannelDetails> &
    Partial<ResponseActionDetails> &
    Partial<ResponseCStoreDetails>;

  /** Tipe respons untuk method `status` Core API. Termasuk field dasar dan potensial semua field spesifik pembayaran. */
  type CoreApiStatusResponse = MidtransApiResponse &
    Partial<ResponseCreditCardDetails> &
    Partial<ResponseBankTransferDetails> &
    Partial<ResponseEchannelDetails> &
    Partial<ResponseActionDetails> &
    Partial<ResponseCStoreDetails>;

  // --- Kelas Snap ---

  /** Opsi konfigurasi untuk constructor Snap dan CoreApi. */
  interface MidtransClientOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  /**
   * Client Midtrans Snap untuk membuat transaksi yang menghasilkan token Snap atau URL redirect.
   * Digunakan untuk alur pembayaran Snap Pop-up dan Snap Redirect.
   */
  export class Snap {
    /**
     * @param options Opsi konfigurasi termasuk environment, Server Key, dan Client Key.
     */
    constructor(options: MidtransClientOptions);

    /**
     * Membuat transaksi Snap.
     * @param parameter Parameter detail transaksi, mirip dengan CoreApi.charge.
     * @returns Promise yang resolve ke objek berisi `token` (untuk Snap Pop-up) atau `redirect_url` (untuk Snap Redirect), atau respons error.
     */
    createTransaction(
      parameter: SnapCreateTransactionParameter
    ): Promise<SnapCreateTransactionResponse>;

    // Catatan: Kelas Snap fokus utama pada createTransaction. Operasi lain biasanya via CoreApi atau webhook.
  }

  /** Tipe parameter untuk Snap.createTransaction (seringkali sama dengan CoreApi charge). */
  type SnapCreateTransactionParameter = CoreApiChargeParameter; // Otomatis mencakup tipe baru

  /** Respons berisi token Snap untuk integrasi pop-up. */
  interface SnapCreateTransactionResponseToken {
    // Tidak extend MidtransApiResponse agar tidak duplikat field
    token: string;
    // Mungkin ada field lain, perlu dicek dokumentasi Snap create response
  }
  /** Respons berisi URL redirect untuk alur Snap Redirect. */
  interface SnapCreateTransactionResponseRedirect {
    // Tidak extend MidtransApiResponse
    redirect_url: string;
    // Mungkin ada field lain
  }
  // Midtrans docs suggest the response is JUST { token: "..." } or { redirect_url: "..." } on success
  // Error response might follow MidtransApiResponse structure

  /** Tipe union untuk respons Snap.createTransaction. */
  type SnapCreateTransactionResponse =
    | SnapCreateTransactionResponseToken
    | SnapCreateTransactionResponseRedirect
    | MidtransApiResponse; // Tipe dasar untuk kasus error

  // --- Kelas Core API ---

  /**
   * Client Midtrans Core API untuk interaksi langsung backend-ke-backend.
   * Memberikan kontrol lebih besar atas alur pembayaran dan UI.
   */
  export class CoreApi {
    /**
     * @param options Opsi konfigurasi termasuk environment, Server Key, dan Client Key.
     */
    constructor(options: MidtransClientOptions);

    /**
     * Melakukan request charge ke Midtrans Core API.
     * @param parameter Detail transaksi dan parameter spesifik pembayaran.
     * @returns Promise yang resolve ke respons charge dari Midtrans, berisi status transaksi dan detail/aksi pembayaran.
     */
    charge(parameter: CoreApiChargeParameter): Promise<CoreApiChargeResponse>; // Otomatis mencakup tipe baru

    /**
     * Membatalkan transaksi yang masih pending.
     * @param transactionIdOrOrderId `transaction_id` Midtrans atau `order_id` Anda dari transaksi yang akan dibatalkan.
     * @returns Promise yang resolve ke respons API, mengindikasikan hasil percobaan pembatalan.
     */
    cancel(
      transactionIdOrOrderId: string
    ): Promise<CoreApiCancelExpireResponse>;

    /**
     * Membuat transaksi yang pending menjadi kadaluarsa.
     * @param transactionIdOrOrderId `transaction_id` Midtrans atau `order_id` Anda dari transaksi yang akan diexpire.
     * @returns Promise yang resolve ke respons API, mengindikasikan hasil percobaan expire.
     */
    expire(
      transactionIdOrOrderId: string
    ): Promise<CoreApiCancelExpireResponse>;

    /**
     * Memeriksa status sebuah transaksi.
     * @param transactionIdOrOrderId `transaction_id` Midtrans atau `order_id` Anda dari transaksi yang akan diperiksa.
     * @returns Promise yang resolve ke respons API berisi status dan detail terbaru transaksi.
     */
    status(transactionIdOrOrderId: string): Promise<CoreApiStatusResponse>;

    /**
     * Melakukan capture pada transaksi kartu kredit yang sudah di-preauthorize.
     * @param parameter Objek berisi `transaction_id` dan opsional `gross_amount` (jika berbeda dari amount authorize).
     * @returns Promise yang resolve ke respons API yang mengindikasikan hasil capture.
     */
    capture(parameter: {
      transaction_id: string;
      gross_amount?: number;
    }): Promise<CoreApiChargeResponse>; // Respons mirip charge

    /**
     * Menyetujui (approve) transaksi yang di-challenge oleh sistem deteksi fraud.
     * @param transactionIdOrOrderId `transaction_id` Midtrans atau `order_id` Anda.
     * @returns Promise yang resolve ke respons API yang mengindikasikan hasil approval.
     */
    approve(transactionIdOrOrderId: string): Promise<CoreApiStatusResponse>; // Respons mirip status

    /**
     * Menolak (deny) transaksi yang di-challenge oleh sistem deteksi fraud.
     * @param transactionIdOrOrderId `transaction_id` Midtrans atau `order_id` Anda.
     * @returns Promise yang resolve ke respons API yang mengindikasikan hasil denial.
     */
    deny(transactionIdOrOrderId: string): Promise<CoreApiStatusResponse>; // Respons mirip status

    /**
     * Menginisiasi refund untuk transaksi yang sudah settled.
     * @param transactionIdOrOrderId `transaction_id` Midtrans atau `order_id` Anda.
     * @param parameter Objek berisi `amount` (opsional, default full amount), `reason` (wajib), dan opsional `refund_key` (ID unik refund Anda).
     * @returns Promise yang resolve ke respons API yang mengindikasikan hasil refund.
     */
    refund(
      transactionIdOrOrderId: string,
      parameter: { amount?: number; reason: string; refund_key?: string }
    ): Promise<
      MidtransApiResponse & {
        refund_chargeback_id?: string;
        refund_amount?: string;
        // Mungkin ada field refund status/detail lain
      }
    >;

    /**
     * Menginisiasi direct refund untuk transaksi yang sudah settled (kasus penggunaan spesifik).
     * @param transactionIdOrOrderId `transaction_id` Midtrans atau `order_id` Anda.
     * @param parameter Objek berisi `amount` (opsional), `reason` (wajib), dan opsional `refund_key`.
     * @returns Promise yang resolve ke respons API yang mengindikasikan hasil refund.
     */
    refundDirect(
      transactionIdOrOrderId: string,
      parameter: { amount?: number; reason: string; refund_key?: string }
    ): Promise<
      MidtransApiResponse & {
        refund_chargeback_id?: string;
        refund_amount?: string;
        // Mungkin ada field refund status/detail lain
      }
    >;

    /**
     * Menonaktifkan token kartu kredit tersimpan (Pay Account / Tokenization). Membutuhkan persetujuan Midtrans.
     * @param savedTokenId `saved_token_id` yang akan dinonaktifkan.
     * @returns Promise yang resolve ke respons API.
     */
    disablePayAccount(savedTokenId: string): Promise<MidtransApiResponse>;

    /**
     * Mengaktifkan token kartu kredit tersimpan (Pay Account / Tokenization). Membutuhkan persetujuan Midtrans.
     * @param savedTokenId `saved_token_id` yang akan diaktifkan.
     * @returns Promise yang resolve ke respons API.
     */
    enablePayAccount(savedTokenId: string): Promise<MidtransApiResponse>;

    /**
     * Mendapatkan detail token kartu kredit tersimpan (Pay Account / Tokenization). Membutuhkan persetujuan Midtrans.
     * @param savedTokenId `saved_token_id` yang akan dicari.
     * @returns Promise yang resolve ke respons API berisi detail token.
     */
    getPayAccount(savedTokenId: string): Promise<
      MidtransApiResponse & {
        saved_token_id?: string;
        masked_card?: string;
        card_type?: string;
        token_status?: "active" | "inactive"; // Contoh field status
        // ... other details
      }
    >;

    // --- Method Tidak Direkomendasikan/Jarang Dipakai dari Backend ---
    // cardToken(parameter: any): Promise<any>; // Sebaiknya dari frontend
    // cardRegister(parameter: any): Promise<any>; // Sebaiknya dari frontend
    // cardPointInquiry(tokenId: string): Promise<any>; // Fitur inquiry poin spesifik

    // Tambahkan method Core API lain jika perlu (misal API payout jika menggunakan Iris)
  }

  /** Payload Notifikasi HTTP / Webhook dari Midtrans. */
  export interface MidtransNotificationPayload {
    transaction_time: string;
    transaction_status:
      | "capture"
      | "settlement"
      | "pending"
      | "deny"
      | "cancel"
      | "expire"
      | "failure" // Ditambahkan failure
      | "refund"
      | "partial_refund"
      | "authorize" // Status pre-auth
      | string; // Allow string for future statuses
    transaction_id: string;
    status_message: string;
    status_code: string; // Usually present
    signature_key: string; // Wajib diverifikasi
    payment_type: string;
    order_id: string; // ID order/transaksi dari sisi merchant
    merchant_id: string;
    gross_amount: string;
    fraud_status: "accept" | "challenge" | "deny";
    currency: string;
    // Field spesifik pembayaran mungkin ada juga di notifikasi, contoh:
    masked_card?: string; // CC
    approval_code?: string; // CC
    permata_va_number?: string; // Permata VA
    va_numbers?: VaInfo[]; // Bank VA lain
    payment_code?: string; // CStore
    bill_key?: string; // Mandiri Bill
    biller_code?: string; // Mandiri Bill
    payment_amounts?: { paid_at: string; amount: string }[]; // CStore installment payment
    shopeepay_reference_number?: string; // ShopeePay
    gopay_reference_id?: string; // GoPay (tergantung flow)
    // tambahkan field lain sesuai kebutuhan berdasarkan contoh notifikasi
  }

  // Export beberapa interface utama jika berguna untuk diimpor di tempat lain
  export {
    TransactionDetails,
    CustomerDetails,
    ItemDetails,
    CoreApiChargeParameter,
    CoreApiChargeResponse,
    MidtransClientOptions,
    MidtransNotificationPayload as MidtransWebhookPayload, // Alias lama
  };
}

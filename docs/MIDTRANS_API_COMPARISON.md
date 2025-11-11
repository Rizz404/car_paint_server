# Perbandingan Midtrans Core API vs Snap API

## Overview

Proyek ini mengimplementasikan dua metode pembayaran Midtrans:
1. **Core API** (`createOrderWithMidtrans`) - Direct API dengan kontrol penuh
2. **Snap API** (`createOrderWithSnap`) - Hosted payment page dengan UI Midtrans

## Core API (`createOrderWithMidtrans`)

### Karakteristik
- **Kontrol Penuh**: Developer menangani UI pembayaran sendiri
- **Payment Type Specific**: Harus menentukan jenis pembayaran secara spesifik
- **Multi-Step Process**: Perlu handle berbagai response untuk setiap payment method
- **Customizable**: Fleksibilitas tinggi dalam UI/UX

### Use Case
- Aplikasi yang membutuhkan custom payment UI
- Integrasi payment yang seamless dengan aplikasi
- Satu metode pembayaran spesifik per transaksi

### Request Parameter
```typescript
const paymentParameter: CoreApiChargeParameter = {
  payment_type: "gopay" | "credit_card" | "bank_transfer" | ...,
  transaction_details: {
    order_id: string,
    gross_amount: number
  },
  customer_details: {...},
  item_details: [...],
  // Payment method specific fields
  gopay?: {...},
  credit_card?: {...},
  bank_transfer?: {...},
  ...
};
```

### Response
```typescript
{
  orderId: string,
  transactionId: string,
  midtransTransactionId: string,
  paymentStatus: "PENDING" | ...,
  midtransInitialStatus: string,
  totalAmount: Decimal,
  paymentDetails: {
    paymentType: string,
    vaNumber?: string,           // untuk VA
    paymentCode?: string,         // untuk Alfamart/Indomaret
    billKey?: string,             // untuk Mandiri Bill
    billerCode?: string,          // untuk Mandiri Bill
    qrCodeUrl?: string,           // untuk QRIS
    deeplinkUrl?: string,         // untuk e-wallet
    redirectUrl?: string,         // untuk redirect-based payment
    expiryTime?: string
  }
}
```

### Frontend Flow
1. User memilih metode pembayaran spesifik
2. Backend creates transaction dengan Core API
3. Backend mengembalikan payment details
4. Frontend menampilkan payment instruction sesuai metode:
   - VA: Tampilkan nomor VA
   - QRIS: Tampilkan QR code
   - E-wallet: Redirect ke deeplink/web URL
   - Credit Card: Custom form menggunakan Snap.js token

## Snap API (`createOrderWithSnap`)

### Karakteristik
- **Hosted Payment Page**: Midtrans menyediakan UI pembayaran
- **Multi-Payment Options**: User bisa pilih berbagai metode di halaman Snap
- **Simpler Integration**: Hanya perlu redirect atau popup
- **Managed UI/UX**: Midtrans handle tampilan dan flow pembayaran

### Use Case
- Quick integration tanpa custom UI
- Ingin memberikan banyak pilihan pembayaran
- Lebih sedikit maintenance di sisi frontend

### Request Parameter
```typescript
const snapParameter: SnapCreateTransactionParameter = {
  transaction_details: {
    order_id: string,
    gross_amount: number
  },
  customer_details: {...},
  item_details: [...],
  expiry: {
    unit: "day" | "hour" | "minute",
    duration: number
  },
  callbacks: {
    finish: string,     // URL after payment (success/pending/failed)
    pending?: string,   // URL if user clicks back
    error?: string      // URL on error
  },
  // Optional: Enable/disable specific payment methods
  enabled_payments?: ["credit_card", "gopay", "bca_va", ...],
  disabled_payments?: [...]
};
```

### Response
```typescript
{
  orderId: string,
  transactionId: string,
  paymentStatus: "PENDING",
  totalAmount: Decimal,
  snapToken: string,          // Token untuk Snap.js (popup)
  redirectUrl: string         // URL untuk redirect
}
```

### Frontend Flow

#### Option 1: Redirect
```typescript
// Langsung redirect ke Snap page
window.location.href = response.redirectUrl;
```

#### Option 2: Popup (Recommended)
```html
<!-- Load Snap.js -->
<script src="https://app.midtrans.com/snap/snap.js"
        data-client-key="YOUR_CLIENT_KEY"></script>

<script>
// Trigger popup
snap.pay(response.snapToken, {
  onSuccess: function(result) {
    console.log('success', result);
    window.location.href = '/payment/success';
  },
  onPending: function(result) {
    console.log('pending', result);
    window.location.href = '/payment/pending';
  },
  onError: function(result) {
    console.log('error', result);
    window.location.href = '/payment/error';
  },
  onClose: function() {
    console.log('customer closed the popup');
  }
});
</script>
```

## Webhook Handler

Kedua metode menggunakan webhook handler yang sama untuk update status pembayaran:

```typescript
// webhook-controller.ts
export const handleMidtransNotification = async (notification) => {
  // Update transaction status berdasarkan webhook
  // Berlaku untuk Core API maupun Snap API
};
```

## Perbandingan Fitur

| Fitur                      | Core API                 | Snap API              |
| -------------------------- | ------------------------ | --------------------- |
| **UI/UX Control**          | Full control             | Midtrans managed      |
| **Payment Methods**        | One per transaction      | Multiple choices      |
| **Integration Complexity** | Higher                   | Lower                 |
| **Customization**          | Very flexible            | Limited               |
| **Frontend Code**          | More complex             | Simpler               |
| **Maintenance**            | Higher                   | Lower                 |
| **Best for**               | Mobile apps, Custom flow | Web apps, Quick setup |
| **Mobile App Experience**  | ⭐⭐⭐ Excellent (Native)   | ⚠️ Poor (WebView)      |
| **Web App Experience**     | ✅ Good                   | ⭐⭐⭐ Excellent         |
| **Deeplink Support**       | ✅ Yes (E-wallet)         | ❌ Limited             |
| **Native Mobile Feel**     | ✅ Yes                    | ❌ No (browser-based)  |

> **📱 PENTING UNTUK MOBILE APP:**
> - **Core API = Native experience** (user tetap di dalam app, langsung ke e-wallet app)
> - **Snap API = Browser experience** (user keluar dari app ke WebView - BAD UX)
> - Untuk mobile app, **SELALU gunakan Core API** untuk UX terbaik!

## Rekomendasi

### ⭐ **MOBILE APP - GUNAKAN CORE API** (HIGHLY RECOMMENDED)
- ✅ Native mobile experience
- ✅ Direct deeplink ke e-wallet apps (GoPay, DANA, ShopeePay)
- ✅ Tidak perlu buka browser/WebView
- ✅ Faster & more responsive
- ✅ Better user experience
- ✅ Full UI/UX control
- ✅ Seamless integration dengan mobile app flow

**Contoh Mobile Flow dengan Core API:**
```
User tap "Bayar dengan GoPay"
→ Backend create payment via Core API
→ Return deeplink "gojek://gopay/..."
→ Mobile app open GoPay app via deeplink
→ User confirm payment di GoPay app
→ Kembali ke app otomatis
→ Push notification update status
```

### 🌐 **WEB APP - BISA GUNAKAN SNAP API**
- ✅ Quick integration dengan hosted payment page
- ✅ Banyak pilihan pembayaran dalam satu page
- ✅ UI/UX dikelola Midtrans
- ✅ Less maintenance
- ✅ Responsive design dari Midtrans
- ✅ Support popup atau redirect method

**Contoh Web Flow dengan Snap API:**
```
User klik "Bayar"
→ Backend create Snap transaction
→ Return snapToken
→ Frontend trigger snap.pay(snapToken)
→ Popup Midtrans muncul
→ User pilih payment method & bayar
→ Callback ke finish URL
```

### Gunakan **Core API** jika:
- ✅ **MOBILE APP (STRONGLY RECOMMENDED)** ⭐⭐⭐
- ✅ Membutuhkan custom payment UI yang match dengan brand
- ✅ Ingin control penuh atas flow pembayaran
- ✅ Ingin native mobile experience dengan deeplink
- ✅ Sudah pasti metode pembayaran yang akan digunakan
- ✅ Memiliki resource untuk develop & maintain custom UI

### Gunakan **Snap API** jika:
- ✅ **WEB APPLICATION**
- ✅ Ingin integrasi cepat
- ✅ Ingin memberikan banyak pilihan pembayaran
- ✅ Resource development terbatas
- ✅ Tidak perlu custom branding untuk payment page
- ✅ Lebih prefer managed solution
- ❌ **JANGAN untuk mobile app** (bad UX with WebView)

## Environment Variables

Kedua implementasi menggunakan konfigurasi yang sama:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=your_production_server_key
MIDTRANS_CLIENT_KEY=your_production_client_key
SANDBOX_MIDTRANS_SERVER_KEY=your_sandbox_server_key
SANDBOX_MIDTRANS_CLIENT_KEY=your_sandbox_client_key

# Frontend URL for callbacks
FRONTEND_URL=https://yourdomain.com
CALLBACK_URL=https://yourdomain.com/payment/callback
```

## Testing

### Sandbox Mode
Set `USE_SANDBOX = true` di `src/configs/midtrans.ts` untuk testing.

### Test Cards (Core API - Credit Card)
- Success: 4811 1111 1111 1114
- Challenge: 4911 1111 1111 1113
- Deny: 4511 1111 1111 1117

### Test Payment (Snap API)
Gunakan email dan nomor yang berbeda untuk different scenarios:
- Success: `success@example.com`
- Pending: `pending@example.com`
- Failed: `failed@example.com`

## Migration Path

Jika ingin migrasi dari Core API ke Snap API:
1. Update frontend untuk handle `snapToken` dan `redirectUrl`
2. Ganti endpoint dari `/orders/create` ke `/orders/create-snap`
3. Update payment instruction page untuk redirect/popup
4. Webhook handler tetap sama, tidak perlu perubahan

## Security Notes

- ✅ Selalu validasi signature di webhook handler
- ✅ Jangan expose server key di frontend
- ✅ Gunakan HTTPS untuk production
- ✅ Validasi amount di backend sebelum create transaction
- ✅ Implement rate limiting untuk endpoint payment

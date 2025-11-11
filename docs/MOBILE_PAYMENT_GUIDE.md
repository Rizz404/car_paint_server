# 📱 Mobile Payment - UI Guide

> Apa yang harus ditampilkan untuk setiap metode pembayaran

## 1. **GoPay** (E-Wallet)

**Response:**
```json
{
  "paymentType": "gopay",
  "deeplinkUrl": "https://gopay.co.id/...",
  "qrCodeUrl": "https://api.midtrans.com/.../qr-code",
  "expiryTime": "2025-11-11 11:03:11"
}
```

**Yang Ditampilkan:**
- Tombol "Bayar dengan Gojek" → buka `deeplinkUrl`
- QR Code (fallback jika app tidak terinstall)
- Countdown timer
- Instruksi: "Selesaikan pembayaran di Gojek"
- **Polling status setiap 5 detik**

---

## 2. **QRIS** (Universal QR)

**Response:**
```json
{
  "paymentType": "qris",
  "qrCodeUrl": "https://api.midtrans.com/.../qr-code",
  "expiryTime": "2025-11-11 11:00:59"
}
```

**Yang Ditampilkan:**
- Gambar QR Code
- Countdown timer
- Instruksi: "Scan dengan e-wallet favorit (GoPay, OVO, DANA, ShopeePay, dll)"
- **Polling status setiap 5 detik**

---

## 3. **ShopeePay** (E-Wallet) **Belum Diaktifkan**

**Response:**
```json
{
  "paymentType": "shopeepay",
  "deeplinkUrl": "https://wsa.wallet.airpay.co.id/...",
  "expiryTime": "2025-11-11 11:05:30"
}
```

**Yang Ditampilkan:**
- Tombol "Bayar dengan ShopeePay" → buka `deeplinkUrl`
- Countdown timer
- Instruksi: "Selesaikan pembayaran di Shopee"
- Alert jika app tidak terinstall
- **Polling status setiap 5 detik**

---

## 4. **DANA** (E-Wallet) **Tidak Support Core API**

**Tidak Support**

⚠️ **Note:** Jika DANA pakai snap api, jika mobile maka  disarankan pakai **QRIS**

---

## 5. **Virtual Account** (BCA, BNI, BRI, Permata, CIMB)

**Response:**
```json
{
  "paymentType": "bank_transfer",
  "vaNumber": "8578388716553820",
  "expiryTime": "2025-11-12 10:50:59"
}
```

**Yang Ditampilkan:**
- Logo Bank
- Nomor VA + **tombol Salin**
- Total pembayaran
- Countdown timer
- Instruksi transfer:
  ```
  1. Buka m-banking [Bank Name]
  2. Pilih Transfer → Virtual Account
  3. Input VA: [vaNumber]
  4. Konfirmasi pembayaran
  ```
- ❌ **TIDAK perlu polling**

---

## 6. **Mandiri VA** (Khusus - Bill Payment)

**Response:**
```json
{
  "paymentType": "echannel",
  "billKey": "714020398145",
  "billerCode": "70012",
  "expiryTime": "2025-11-12 10:49:51"
}
```

**Yang Ditampilkan:**
- Logo Bank Mandiri
- **Company Code: 70012** + tombol Salin
- **Bill Key: [billKey]** + tombol Salin
- Total pembayaran
- Countdown timer
- **Instruksi ATM:**
  ```
  1. Bayar/Beli
  2. Multipayment
  3. Input Company Code: 70012
  4. Input Bill Key: [billKey]
  5. Konfirmasi
  ```
- **Instruksi Mandiri Mobile:**
  ```
  1. Bayar → Buat Pembayaran Baru
  2. Multipayment
  3. Input Company Code & Bill Key
  4. Konfirmasi
  ```
- ❌ **TIDAK perlu polling**

---

## 📱 Tombol Salin

Untuk: VA, Bill Key, Payment Code
**Behavior:** Klik → copy ke clipboard → toast "Tersalin!"

---

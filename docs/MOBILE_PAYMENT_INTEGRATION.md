# Mobile Payment Integration Guide

## Untuk Mobile App - GUNAKAN CORE API ✅

### Mengapa Core API Lebih Baik untuk Mobile?

1. **Native Experience**
   - Tidak perlu buka browser eksternal
   - Langsung dapat deeplink untuk e-wallet
   - UI/UX fully controlled oleh app

2. **Better Performance**
   - Tidak ada overhead WebView
   - Lebih cepat dan responsive

3. **Direct Integration**
   - Langsung ke payment provider (GoPay app, DANA app, dll)
   - Seamless user journey

## Payment Methods Support

### Supported by Core API (Semua yang Anda butuhkan) ✅

| Payment Method        | Core API | Deeplink/Native | Recommended for Mobile  |
| --------------------- | -------- | --------------- | ----------------------- |
| **E-Wallets**         |          |                 |                         |
| GoPay                 | ✅        | ✅ Yes           | ✅ **BEST**              |
| ShopeePay             | ✅        | ✅ Yes           | ✅ **BEST**              |
| DANA                  | ✅        | ✅ Yes           | ✅ **BEST**              |
| **Bank Transfer**     |          |                 |                         |
| BCA VA                | ✅        | ❌ Copy VA       | ✅ Good                  |
| BNI VA                | ✅        | ❌ Copy VA       | ✅ Good                  |
| BRI VA                | ✅        | ❌ Copy VA       | ✅ Good                  |
| Permata VA            | ✅        | ❌ Copy VA       | ✅ Good                  |
| Mandiri Bill          | ✅        | ❌ Copy Code     | ✅ Good                  |
| **QR Code**           |          |                 |                         |
| QRIS                  | ✅        | ❌ Show QR       | ✅ Good                  |
| **Convenience Store** |          |                 |                         |
| Alfamart              | ✅        | ❌ Payment Code  | ✅ Good                  |
| Indomaret             | ✅        | ❌ Payment Code  | ✅ Good                  |
| **Credit Card**       |          |                 |                         |
| Credit Card           | ✅        | ❌ Form          | ⚠️ Need special handling |
| **Buy Now Pay Later** |          |                 |                         |
| Akulaku               | ✅        | ✅ Yes           | ✅ Good                  |
| Kredivo               | ✅        | ✅ Yes           | ✅ Good                  |

### ❌ JANGAN Gunakan Snap API untuk Mobile

**Masalah dengan Snap API di Mobile:**
- 🔴 Harus buka browser/WebView
- 🔴 User keluar dari app experience
- 🔴 Perlu handle deep linking kembali ke app
- 🔴 Lebih lambat (load web page)
- 🔴 Tidak native feeling

**Snap API hanya cocok untuk:**
- ✅ Web application
- ✅ Quick testing/demo
- ⚠️ Jika ada payment method yang BELUM support di Core API (sangat jarang)

## Mobile Implementation Guide

### 1. E-Wallet (GoPay, DANA, ShopeePay) - RECOMMENDED ⭐

**Backend Response (dari Core API):**
```json
{
  "paymentDetails": {
    "paymentType": "gopay",
    "deeplinkUrl": "gojek://gopay/merchanttransfer?tref=...",
    "redirectUrl": "https://api.midtrans.com/gopay/...", // fallback web
    "expiryTime": "2024-11-10 15:30:00"
  }
}
```

**Mobile Implementation (React Native):**
```typescript
import { Linking, Platform } from 'react-native';

async function handleEWalletPayment(paymentDetails) {
  const { deeplinkUrl, redirectUrl } = paymentDetails;

  try {
    // Try to open e-wallet app directly
    const canOpen = await Linking.canOpenURL(deeplinkUrl);

    if (canOpen) {
      // Open e-wallet app (BEST UX)
      await Linking.openURL(deeplinkUrl);
    } else {
      // Fallback: Open in browser
      await Linking.openURL(redirectUrl);
    }
  } catch (error) {
    // If app not installed, open in browser
    await Linking.openURL(redirectUrl);
  }
}
```

**Flutter Implementation:**
```dart
import 'package:url_launcher/url_launcher.dart';

Future<void> handleEWalletPayment(Map paymentDetails) async {
  final deeplinkUrl = paymentDetails['deeplinkUrl'];
  final redirectUrl = paymentDetails['redirectUrl'];

  try {
    if (await canLaunch(deeplinkUrl)) {
      // Open e-wallet app directly
      await launch(deeplinkUrl);
    } else {
      // Fallback to web
      await launch(redirectUrl);
    }
  } catch (e) {
    // Fallback to web
    await launch(redirectUrl);
  }
}
```

---

### 2. Virtual Account (Bank Transfer)

**Backend Response:**
```json
{
  "paymentDetails": {
    "paymentType": "bank_transfer",
    "vaNumber": "80777123456789",
    "bank": "BCA",
    "expiryTime": "2024-11-12 23:59:59"
  }
}
```

**Mobile Implementation:**
```typescript
// Show VA number in app with copy button
function VirtualAccountScreen({ vaNumber, bank, expiryTime }) {
  const copyToClipboard = () => {
    Clipboard.setString(vaNumber);
    Alert.alert('Success', 'VA number copied!');
  };

  return (
    <View>
      <Text style={styles.title}>Transfer ke {bank}</Text>
      <View style={styles.vaContainer}>
        <Text style={styles.vaNumber}>{vaNumber}</Text>
        <TouchableOpacity onPress={copyToClipboard}>
          <Icon name="copy" />
        </TouchableOpacity>
      </View>
      <Text>Berlaku sampai: {expiryTime}</Text>

      <Instructions>
        <Text>1. Buka mobile banking {bank}</Text>
        <Text>2. Pilih Transfer ke Virtual Account</Text>
        <Text>3. Masukkan nomor: {vaNumber}</Text>
        <Text>4. Konfirmasi pembayaran</Text>
      </Instructions>
    </View>
  );
}
```

---

### 3. QRIS

**Backend Response:**
```json
{
  "paymentDetails": {
    "paymentType": "qris",
    "qrCodeUrl": "https://api.midtrans.com/v2/qris/...",
    "expiryTime": "2024-11-10 15:30:00"
  }
}
```

**Mobile Implementation:**
```typescript
import FastImage from 'react-native-fast-image';

function QRISPaymentScreen({ qrCodeUrl, expiryTime }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>

      <FastImage
        source={{ uri: qrCodeUrl }}
        style={styles.qrCode}
        resizeMode="contain"
      />

      <Text style={styles.instruction}>
        Scan dengan aplikasi e-wallet yang mendukung QRIS:
      </Text>
      <View style={styles.walletLogos}>
        <Image source={require('./gopay-logo.png')} />
        <Image source={require('./ovo-logo.png')} />
        <Image source={require('./dana-logo.png')} />
        <Image source={require('./shopeepay-logo.png')} />
      </View>

      <CountdownTimer expiryTime={expiryTime} />
    </View>
  );
}
```

---

### 4. Convenience Store (Alfamart/Indomaret)

**Backend Response:**
```json
{
  "paymentDetails": {
    "paymentType": "cstore",
    "paymentCode": "1234567890123",
    "store": "alfamart",
    "expiryTime": "2024-11-12 23:59:59"
  }
}
```

**Mobile Implementation:**
```typescript
function ConvenienceStoreScreen({ paymentCode, store, expiryTime }) {
  const copyCode = () => {
    Clipboard.setString(paymentCode);
    Alert.alert('Success', 'Payment code copied!');
  };

  return (
    <View>
      <Image
        source={store === 'alfamart'
          ? require('./alfamart-logo.png')
          : require('./indomaret-logo.png')
        }
      />

      <View style={styles.codeContainer}>
        <Text style={styles.code}>{paymentCode}</Text>
        <TouchableOpacity onPress={copyCode}>
          <Icon name="copy" />
        </TouchableOpacity>
      </View>

      <Instructions>
        <Text>1. Datang ke {store} terdekat</Text>
        <Text>2. Tunjukkan kode pembayaran ke kasir</Text>
        <Text>3. Bayar sejumlah yang tertera</Text>
        <Text>4. Simpan struk sebagai bukti</Text>
      </Instructions>

      {/* Optional: Show map to nearest store */}
      <Button onPress={showNearestStore}>
        Cari {store} Terdekat
      </Button>
    </View>
  );
}
```

---

## Handling Payment Status Updates

### Polling Method (Simple)

```typescript
// Check payment status every 5 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await checkPaymentStatus(transactionId);

    if (status === 'SUCCESS') {
      clearInterval(interval);
      navigation.navigate('PaymentSuccess');
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      clearInterval(interval);
      navigation.navigate('PaymentFailed');
    }
  }, 5000);

  return () => clearInterval(interval);
}, [transactionId]);
```

### Firebase Push Notification (Recommended) ⭐

```typescript
// Backend sends push notification when payment status changes
import messaging from '@react-native-firebase/messaging';

// Listen for payment status updates
messaging().onMessage(async (remoteMessage) => {
  if (remoteMessage.data?.type === 'payment_status') {
    const { status, orderId } = remoteMessage.data;

    if (status === 'SUCCESS') {
      navigation.navigate('PaymentSuccess', { orderId });
    }
  }
});
```

---

## Best Practices

### ✅ DO:

1. **Always use Core API for mobile apps**
2. **Provide deeplink for e-wallets**
3. **Show clear instructions for VA/QRIS/CStore**
4. **Implement copy to clipboard functionality**
5. **Show countdown timer for payment expiry**
6. **Use push notifications for status updates**
7. **Handle app background/foreground states**
8. **Implement retry mechanism for failed API calls**

### ❌ DON'T:

1. **Don't use Snap API with WebView** (bad UX)
2. **Don't force users to screenshot payment codes**
3. **Don't hide payment expiry time**
4. **Don't forget to handle timeout/expired payments**
5. **Don't ignore deep linking failures**

---

## Error Handling

```typescript
async function createPayment(paymentData) {
  try {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!result.success) {
      // Handle specific errors
      switch (result.error) {
        case 'MINIMUM_PAYMENT':
          Alert.alert('Error', `Minimum pembayaran Rp ${result.minimum}`);
          break;
        case 'MAXIMUM_PAYMENT':
          Alert.alert('Error', `Maximum pembayaran Rp ${result.maximum}`);
          break;
        case 'PAYMENT_METHOD_INACTIVE':
          Alert.alert('Error', 'Metode pembayaran tidak tersedia');
          break;
        default:
          Alert.alert('Error', result.message);
      }
      return null;
    }

    return result.data;
  } catch (error) {
    Alert.alert('Error', 'Gagal membuat pembayaran. Coba lagi.');
    return null;
  }
}
```

---

## Complete Mobile Flow Example

```typescript
// 1. User selects payment method
function PaymentMethodSelection() {
  return (
    <ScrollView>
      <PaymentMethodCard
        name="GoPay"
        icon={gopayIcon}
        onPress={() => handlePayment('gopay')}
      />
      <PaymentMethodCard
        name="QRIS"
        icon={qrisIcon}
        onPress={() => handlePayment('qris')}
      />
      {/* ... other methods */}
    </ScrollView>
  );
}

// 2. Create payment
async function handlePayment(paymentMethodId) {
  const loading = showLoading();

  try {
    const result = await createPayment({
      carServices: selectedServices,
      workshopId: workshop.id,
      paymentMethodId: paymentMethodId,
      // ... other fields
    });

    if (!result) {
      loading.hide();
      return;
    }

    loading.hide();

    // 3. Navigate to payment instructions based on payment type
    const { paymentDetails } = result;

    switch (paymentDetails.paymentType) {
      case 'gopay':
      case 'shopeepay':
      case 'dana':
        // Open e-wallet app
        await handleEWalletPayment(paymentDetails);
        // Navigate to waiting screen
        navigation.navigate('PaymentWaiting', { transactionId });
        break;

      case 'bank_transfer':
        // Show VA number
        navigation.navigate('VirtualAccountScreen', paymentDetails);
        break;

      case 'qris':
        // Show QR code
        navigation.navigate('QRISScreen', paymentDetails);
        break;

      case 'cstore':
        // Show payment code
        navigation.navigate('CStoreScreen', paymentDetails);
        break;
    }
  } catch (error) {
    loading.hide();
    Alert.alert('Error', 'Gagal membuat pembayaran');
  }
}

// 4. Waiting/Monitoring screen
function PaymentWaitingScreen({ transactionId }) {
  useEffect(() => {
    // Start polling or listen to push notifications
    const unsubscribe = listenToPaymentStatus(transactionId, (status) => {
      if (status === 'SUCCESS') {
        navigation.replace('PaymentSuccess');
      } else if (status === 'FAILED') {
        navigation.replace('PaymentFailed');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text>Menunggu pembayaran...</Text>
      <Text>Silakan selesaikan pembayaran di aplikasi {walletName}</Text>

      <Button onPress={() => navigation.goBack()}>
        Batalkan
      </Button>
    </View>
  );
}
```

---

## Testing Checklist

### E-Wallet Testing
- [ ] Deeplink opens correct e-wallet app
- [ ] Fallback to web if app not installed
- [ ] Handle user cancellation
- [ ] Handle payment timeout
- [ ] Test on both iOS and Android

### Virtual Account Testing
- [ ] VA number displays correctly
- [ ] Copy to clipboard works
- [ ] Instructions are clear
- [ ] Expiry timer works
- [ ] Test with different banks

### QRIS Testing
- [ ] QR code displays correctly
- [ ] QR code is scannable
- [ ] Expiry timer works
- [ ] Test with multiple e-wallet apps

### General Testing
- [ ] Network error handling
- [ ] App background/foreground handling
- [ ] Push notification delivery
- [ ] Payment status updates correctly
- [ ] UI responsive on different screen sizes

---

## Summary

**KESIMPULAN UNTUK MOBILE APP:**

✅ **GUNAKAN**: `createOrderWithMidtrans` (Core API)
- Native experience
- Better UX
- Direct deeplink
- Full control

❌ **JANGAN GUNAKAN**: `createOrderWithSnap` (Snap API)
- WebView required
- Worse UX
- Browser-based
- Tidak optimal untuk mobile

**Implementasi Core API Anda sudah benar dan optimal untuk mobile app!** 🎉
